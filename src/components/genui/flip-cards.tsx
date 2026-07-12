"use client";

import { useState } from "react";
import { FlipScene } from "@/components/flip-scene";

type Card = { front: string; back: string };

const ACCENT_TEXT = ["text-acc-violet", "text-acc-cyan", "text-acc-rose"] as const;

/**
 * A grid of tap-to-flip cards: fronts tease (a term, a question, a myth),
 * backs pay off. Each card flips independently — the one render_ui block
 * that ACTUALLY flips, so the model may honestly promise it.
 */
export function FlipCards({ cards }: { cards: Card[] }) {
  return (
    <div className="enter grid gap-3 sm:grid-cols-2">
      {cards.map((card, i) => (
        <FlipCard key={i} card={card} index={i} />
      ))}
    </div>
  );
}

function FlipCard({ card, index }: { card: Card; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const accent = ACCENT_TEXT[index % ACCENT_TEXT.length];

  return (
    <button
      type="button"
      onClick={() => setFlipped((previous) => !previous)}
      aria-pressed={flipped}
      aria-label={flipped ? `${card.front} — flip back` : `${card.front} — flip to reveal`}
      className="enter w-full text-left [perspective:1200px]"
      style={{ "--stagger": index } as React.CSSProperties}
    >
      <FlipScene
        flipped={flipped}
        faceClassName="flex min-h-36 flex-col p-5"
        front={
          <>
            <span
              className={`font-mono text-[10px] font-medium uppercase tracking-[0.2em] ${accent}`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mt-2 flex-1 text-base font-semibold leading-snug tracking-tight sm:text-lg">
              {card.front}
            </span>
            <span className="mt-4 flex items-center gap-2 text-xs font-medium text-acc-cyan/90">
              Tap to flip <span aria-hidden>→</span>
            </span>
          </>
        }
        back={
          <>
            <span className="flex-1 text-sm leading-relaxed text-foreground/90">
              {card.back}
            </span>
            <span className="mt-4 text-[11px] text-muted/60">Tap to flip back</span>
          </>
        }
      />
    </button>
  );
}
