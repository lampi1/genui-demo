"use client";

import { useState } from "react";
import type { ComparisonInput } from "@/lib/genui-tools";
import { FlipScene } from "@/components/flip-scene";

const COLUMN_ACCENTS = [
  { bar: "from-violet-500 to-violet-300", index: "text-acc-violet", ring: "ring-acc-violet/40" },
  { bar: "from-cyan-500 to-cyan-300", index: "text-acc-cyan", ring: "ring-acc-cyan/40" },
  { bar: "from-rose-500 to-rose-300", index: "text-acc-rose", ring: "ring-acc-rose/40" },
] as const;

export function Comparison({ title, columns }: ComparisonInput) {
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <section className="enter space-y-3">
      {title && (
        <h3 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h3>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {columns.map((column, i) => {
          const look = COLUMN_ACCENTS[i % COLUMN_ACCENTS.length];
          const isFlipped = flipped === i;
          const dimmed = flipped !== null && !isFlipped;
          return (
            <button
              key={i}
              type="button"
              aria-pressed={isFlipped}
              aria-label={
                isFlipped ? `${column.title} — hide points` : `${column.title} — show points`
              }
              onClick={() => setFlipped(isFlipped ? null : i)}
              // No scale on the flipped column: fractional scaling rasterizes
              // the back face's text blurry. The ring + dimming carry the focus.
              className={`enter text-left transition-[opacity,filter] duration-300 [perspective:1200px] ${
                dimmed ? "opacity-50 saturate-50" : ""
              }`}
              style={{ "--stagger": i + 1 } as React.CSSProperties}
            >
              <FlipScene
                flipped={isFlipped}
                className="h-full"
                faceClassName="flex h-full flex-col overflow-hidden"
                backFaceClassName={`ring-1 ${look.ring}`}
                front={
                  <>
                    <div
                      aria-hidden
                      className={`h-[3px] w-full shrink-0 bg-gradient-to-r ${look.bar}`}
                    />
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <span
                        className={`font-mono text-3xl font-semibold tracking-tight ${look.index}`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h4 className="mt-2 text-base font-semibold leading-snug">
                        {column.title}
                      </h4>
                      <p className="mt-auto pt-4 text-xs text-muted">
                        {column.points.length} points · Tap to reveal
                      </p>
                    </div>
                  </>
                }
                back={
                  <>
                    <div
                      aria-hidden
                      className={`h-[3px] w-full shrink-0 bg-gradient-to-r ${look.bar}`}
                    />
                    <div className="flex-1 p-4 sm:p-5">
                      <div className="flex items-baseline gap-2">
                        <span className={`font-mono text-[11px] font-semibold ${look.index}`}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h4 className="text-sm font-semibold">{column.title}</h4>
                      </div>
                      <ul className="mt-3 space-y-2.5">
                        {column.points.map((point, j) => (
                          <li
                            key={j}
                            className={`flex gap-2.5 text-sm leading-relaxed text-foreground/90 ${
                              isFlipped ? "enter" : ""
                            }`}
                            style={{ "--stagger": j } as React.CSSProperties}
                          >
                            <span
                              aria-hidden
                              className={`mt-[9px] h-px w-3 shrink-0 bg-gradient-to-r ${look.bar}`}
                            />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                }
              />
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted/60">Tap a column to flip it.</p>
    </section>
  );
}
