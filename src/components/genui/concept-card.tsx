"use client";

import { useState } from "react";
import type { ConceptInput } from "@/lib/genui-tools";
import { FlipScene } from "@/components/flip-scene";
import { Tilt } from "@/components/tilt";

const ACCENT = {
  violet: { edge: "accent-violet", glow: "bg-acc-violet", text: "text-acc-violet" },
  cyan: { edge: "accent-cyan", glow: "bg-acc-cyan", text: "text-acc-cyan" },
  rose: { edge: "accent-rose", glow: "bg-acc-rose", text: "text-acc-rose" },
} as const;

export function ConceptCard({ title, tagline, points, accent }: ConceptInput) {
  const look = ACCENT[accent ?? "violet"];
  const [flipped, setFlipped] = useState(false);

  return (
    <Tilt disabled={flipped}>
      <button
        type="button"
        onClick={() => setFlipped((previous) => !previous)}
        aria-pressed={flipped}
        aria-label={flipped ? `${title} — hide details` : `${title} — show details`}
        className="enter w-full text-left [perspective:1200px]"
      >
        <FlipScene
          flipped={flipped}
          faceClassName="relative overflow-hidden p-6 sm:p-7"
          front={
            <div className={look.edge ? "" : undefined}>
              <div aria-hidden className={`card-glow ${look.glow}`} />
              <span
                className={`font-mono text-[10px] font-medium uppercase tracking-[0.2em] ${look.text}`}
              >
                Concept
              </span>
              <h3 className="gradient-text mt-2 w-fit text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h3>
              {tagline && (
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
                  {tagline}
                </p>
              )}
              <p className="mt-6 flex items-center gap-2 text-xs font-medium text-acc-cyan/90">
                Tap to explore <span aria-hidden>→</span>
              </p>
            </div>
          }
          back={
            <div>
              <span
                className={`font-mono text-[10px] font-medium uppercase tracking-[0.2em] ${look.text}`}
              >
                The essentials
              </span>
              <ul className="mt-4 space-y-3">
                {points.map((point, i) => (
                  <li
                    key={i}
                    className={`flex gap-3 text-sm leading-relaxed ${flipped ? "enter" : ""}`}
                    style={{ "--stagger": i + 1 } as React.CSSProperties}
                  >
                    <span
                      aria-hidden
                      className="mt-[6px] h-2 w-2 shrink-0 rounded-sm bg-gradient-to-br from-violet-400 to-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.5)]"
                    />
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[11px] text-muted/60">Tap to flip back</p>
            </div>
          }
        />
      </button>
    </Tilt>
  );
}
