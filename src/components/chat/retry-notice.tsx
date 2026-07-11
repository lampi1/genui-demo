"use client";

import { useEffect, useState } from "react";
import { useGenUIActions } from "@/components/genui-actions";

/**
 * Graceful failure state: a quiet glass card with a one-tap recompose.
 * Wording stays in-world ("dissolved") — never a technical error.
 */
export function RetryNotice({
  message,
  actionLabel = "Recompose it",
}: {
  message: string;
  actionLabel?: string;
}) {
  const actions = useGenUIActions();

  return (
    <div className="glass enter accent-rose flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
      <p className="flex items-center gap-2.5 text-sm text-foreground/85">
        <span
          aria-hidden
          className="inline-block h-2 w-2 shrink-0 rounded-full bg-acc-rose/90 shadow-[0_0_10px_rgba(251,113,133,0.7)]"
        />
        {message}
      </p>
      {actions && (
        <button
          type="button"
          onClick={() => actions.regenerate()}
          className="rounded-full border border-acc-rose/40 px-3.5 py-1.5 text-xs font-medium text-acc-rose transition-all hover:bg-acc-rose/10 active:scale-95"
        >
          {actionLabel} ↺
        </button>
      )}
    </div>
  );
}

/**
 * Rate-limit state with Google's own retry delay made visible: a live
 * countdown, then the retry button lights up.
 */
export function RateLimitNotice({ seconds }: { seconds: number }) {
  const actions = useGenUIActions();
  const [remaining, setRemaining] = useState(Math.max(1, seconds));
  const ready = remaining <= 0;

  useEffect(() => {
    const timer = setInterval(
      () => setRemaining((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(remaining / 60);
  const secondsLeft = String(remaining % 60).padStart(2, "0");

  return (
    <div className="glass enter flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
      <p className="flex items-center gap-2.5 text-sm text-foreground/85">
        <span
          aria-hidden
          className={`inline-block h-2 w-2 shrink-0 rounded-full ${
            ready
              ? "bg-[var(--success)] shadow-[0_0_10px_color-mix(in_srgb,var(--success)_60%,transparent)]"
              : "badge-dot-pulse bg-[var(--ring-warn)] shadow-[0_0_10px_color-mix(in_srgb,var(--ring-warn)_60%,transparent)]"
          }`}
        />
        {ready
          ? "Break's over — the free tier is back on shift."
          : "The free tier is unionized: it takes its breaks seriously."}
      </p>
      <div className="flex items-center gap-3">
        {!ready && (
          <span
            className="font-mono text-sm tabular-nums text-[var(--ring-warn)]"
            aria-live="polite"
            aria-label={`Retry available in ${remaining} seconds`}
          >
            {minutes}:{secondsLeft}
          </span>
        )}
        {actions && (
          <button
            type="button"
            disabled={!ready}
            onClick={() => actions.regenerate()}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
              ready
                ? "border-[color-mix(in_srgb,var(--success)_50%,transparent)] text-[var(--success)] hover:bg-[color-mix(in_srgb,var(--success)_12%,transparent)]"
                : "border-ink/[0.12] text-muted opacity-50"
            }`}
          >
            Try again ↺
          </button>
        )}
      </div>
    </div>
  );
}
