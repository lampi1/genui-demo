"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GenUIActionsContext } from "@/components/genui-actions";
import { RATE_MAX_INTERACTIONS, RATE_WINDOW_MS } from "@/lib/rate-limit";
import { CONTACT_PROMPT, HERO_SUGGESTIONS, SUGGESTION_PROMPTS } from "@/lib/suggestions";
import { LoadingStatus } from "./loading-status";
import { Message } from "./message";
import { QuotaRing } from "./quota-ring";
import { RateLimitNotice, RetryNotice } from "./retry-notice";

// Client-side mirror of the server's per-IP budget (15 interactions per
// rolling 15 minutes): timestamps in localStorage feed the quota ring.
const INTERACTIONS_KEY = "genui-interactions";

function recentInteractions(times: number[]): number[] {
  const now = Date.now();
  return times.filter((at) => now - at < RATE_WINDOW_MS);
}

function readStoredInteractions(): number[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(INTERACTIONS_KEY) ?? "[]",
    );
    return Array.isArray(stored)
      ? recentInteractions(stored.filter((at) => typeof at === "number"))
      : [];
  } catch {
    return [];
  }
}

export function Chat() {
  // Throttled re-renders keep the word-by-word reveal smooth instead of chunky.
  const { messages, sendMessage, status, regenerate, error } = useChat({
    experimental_throttle: 45,
  });
  // The status pill stays up until something REAL is on screen — no skeletons.
  const lastMessage = messages[messages.length - 1];
  const composing =
    status === "submitted" ||
    (status === "streaming" &&
      lastMessage?.role === "assistant" &&
      !lastMessage.parts.some(
        (part) =>
          (part.type === "text" && part.text.trim() !== "") ||
          (part.type.startsWith("tool-") &&
            (part as { state?: string }).state === "output-available"),
      ));

  // The server forwards Google's own retry delay as "RATE_LIMITED:<seconds>".
  const rateLimitedFor =
    status === "error" && error?.message.startsWith("RATE_LIMITED:")
      ? Number(error.message.split(":")[1]) || 60
      : null;
  const [input, setInput] = useState("");
  const [heroPhase, setHeroPhase] = useState<"idle" | "leaving" | "gone">("idle");
  const [asked, setAsked] = useState<string[]>([]);
  const [interactions, setInteractions] = useState<number[]>([]);
  const lastUserIdRef = useRef<string | null>(null);
  const conversationStarted = messages.length > 0;
  // Suggestions stay within reach for the whole conversation: the rail above
  // the composer rotates through whatever hasn't been asked yet, with the
  // contact question pinned last — it's the page's only credit.
  const unasked = SUGGESTION_PROMPTS.filter(
    (suggestion) => !asked.includes(suggestion),
  );
  const railSuggestions = [
    ...unasked.filter((suggestion) => suggestion !== CONTACT_PROMPT).slice(0, 2),
    ...(unasked.includes(CONTACT_PROMPT) ? [CONTACT_PROMPT] : []),
  ];

  // ChatGPT-style scroll: a sent message rises to the top of the viewport and
  // the answer composes below it — no forced follow to the bottom. It waits
  // for the hero to fully dissolve: scrolling while the hero still holds
  // space made the very first message land with a visible jolt.
  useEffect(() => {
    if (heroPhase !== "gone") return;
    const lastUser = [...messages]
      .reverse()
      .find(
        (message) =>
          message.role === "user" &&
          !(message.metadata as { hidden?: boolean } | undefined)?.hidden,
      );
    if (lastUser && lastUser.id !== lastUserIdRef.current) {
      lastUserIdRef.current = lastUser.id;
      document
        .getElementById(`msg-${lastUser.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [messages, heroPhase]);

  const [clock, setClock] = useState(0);
  const spentBudget =
    recentInteractions(interactions).length >= RATE_MAX_INTERACTIONS;
  const oldestInteraction = recentInteractions(interactions)[0];
  const refillSeconds =
    spentBudget && clock > 0
      ? Math.max(1, Math.ceil((oldestInteraction + RATE_WINDOW_MS - clock) / 1000))
      : 0;

  // Hydrate the interaction budget after mount (localStorage is client-only)
  // and re-prune so the ring refills as the window rolls — every second
  // while the budget is spent (a live countdown), lazily otherwise. `clock`
  // is the render-safe "now" the countdown reads.
  useEffect(() => {
    const sync = () => {
      setClock(Date.now());
      setInteractions((current) => recentInteractions(current));
    };
    const frame = requestAnimationFrame(() => {
      setInteractions(readStoredInteractions());
      setClock(Date.now());
    });
    const timer = setInterval(sync, spentBudget ? 1_000 : 30_000);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(timer);
    };
  }, [spentBudget]);

  function submit(text: string, options?: { hidden?: boolean }) {
    const trimmed = text.trim();
    if (!trimmed || status === "submitted" || status === "streaming") return;
    // Budget spent: the composer shows the refill countdown; nothing sends.
    if (spentBudget) return;
    if (heroPhase === "idle") setHeroPhase("leaving");
    setAsked((previous) => [...previous, trimmed]);
    setInteractions((previous) => {
      const next = [...recentInteractions(previous), Date.now()];
      try {
        localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(next));
      } catch {
        // Private mode: the ring simply resets on reload.
      }
      return next;
    });
    // Hidden messages (form answers) reach the model but never the screen.
    void sendMessage({ text: trimmed, metadata: options?.hidden ? { hidden: true } : undefined });
    setInput("");
  }

  // Generated components (forms, error retries) act back into the chat.
  // Stable identity via ref so deep components never re-render for it.
  const actionsRef = useRef({ submit, regenerate });
  useEffect(() => {
    actionsRef.current = { submit, regenerate };
  });
  const actions = useMemo(
    () => ({
      submit: (text: string, options?: { hidden?: boolean }) =>
        actionsRef.current.submit(text, options),
      regenerate: () => void actionsRef.current.regenerate(),
    }),
    [],
  );

  return (
    <GenUIActionsContext.Provider value={actions}>
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 sm:px-6">
      {/* Hero / empty state — dissolves when the conversation starts */}
      {heroPhase !== "gone" && (
        <section
          className={`flex flex-1 flex-col items-center justify-center gap-8 py-16 text-center ${
            heroPhase === "leaving" ? "exit" : ""
          }`}
          onAnimationEnd={() => heroPhase === "leaving" && setHeroPhase("gone")}
        >
          <div className="space-y-4">
            <h1 className="enter text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              This page has <span className="gradient-text sheen">no interface</span>.
            </h1>
            <p
              className="enter text-balance text-lg text-muted sm:text-xl"
              style={{ "--stagger": 1 } as React.CSSProperties}
            >
              It generates one as we talk.
            </p>
            <p
              className="enter text-balance text-sm text-muted/70"
              style={{ "--stagger": 2 } as React.CSSProperties}
            >
              Walls of text are over — answers arrive as interfaces you can touch.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {HERO_SUGGESTIONS.map((suggestion, i) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => submit(suggestion)}
                className="enter glass px-4 py-2 text-sm text-foreground/90 transition-colors hover:bg-ink/[0.08] active:scale-[0.98]"
                style={{ "--stagger": i + 2 } as React.CSSProperties}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Conversation */}
      {conversationStarted && (
        <div className="flex-1 space-y-6 pb-40 pt-6">
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              streaming={
                (status === "streaming" || status === "submitted") &&
                message.id === lastMessage?.id
              }
            />
          ))}
          {composing && <LoadingStatus />}
          {status === "error" &&
            (rateLimitedFor !== null ? (
              <RateLimitNotice key={error?.message} seconds={rateLimitedFor} />
            ) : (
              <RetryNotice
                message={
                  error?.message.startsWith("Invalid ui spec")
                    ? "The AI drew outside the lines — one tap and it colors inside them."
                    : "The generator lost its train of thought mid-interface."
                }
                actionLabel="Try again"
              />
            ))}
          {/* Runway so the freshest message can always reach the top */}
          <div aria-hidden className="h-[55dvh]" />
        </div>
      )}

      {/* Composer — fixed, mobile-first */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(input);
        }}
        className="composer-veil fixed inset-x-0 bottom-0 z-10 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6"
      >
        {spentBudget ? (
          <p className="mx-auto mb-2.5 w-full max-w-3xl px-4 text-xs text-muted sm:px-6">
            Interaction budget spent — the ring refills in{" "}
            <span className="font-mono tabular-nums text-foreground/80">
              {Math.floor(refillSeconds / 60)}:
              {String(refillSeconds % 60).padStart(2, "0")}
            </span>
            . Nothing personal: free tier.
          </p>
        ) : (
          conversationStarted &&
          railSuggestions.length > 0 && (
            <div className="chip-rail mx-auto mb-2 flex w-full max-w-3xl gap-3 px-4 sm:px-6">
              {railSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => submit(suggestion)}
                  className="glass enter shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs text-muted transition-colors hover:bg-ink/[0.08] hover:text-foreground active:scale-[0.97]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )
        )}
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <div className="relative min-w-0">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about generative UI…"
              aria-label="Message"
              className="glass w-full py-3 pl-4 pr-14 text-[15px] outline-none placeholder:text-muted/70 focus:border-ink/25"
            />
            {/* Send button, hugged by the free-tier quota ring */}
            <div className="absolute right-1.5 top-1/2 h-9 w-9 -translate-y-1/2">
              <button
                type="submit"
                aria-label="Send"
                disabled={
                  !input.trim() ||
                  spentBudget ||
                  status === "submitted" ||
                  status === "streaming"
                }
                className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-violet-500/90 to-cyan-400/90 text-white shadow-[0_0_18px_-6px_rgba(103,232,249,0.8)] transition-all hover:scale-105 active:scale-95 disabled:opacity-35 disabled:shadow-none disabled:hover:scale-100"
              >
                <svg
                  aria-hidden
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5m0 0l-6 6m6-6l6 6" />
                </svg>
              </button>
              <QuotaRing
                used={recentInteractions(interactions).length}
                cap={RATE_MAX_INTERACTIONS}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
    </GenUIActionsContext.Provider>
  );
}
