"use client";

import { useState } from "react";
import type { TimelineInput } from "@/lib/genui-tools";

export function Timeline({ title, items }: TimelineInput) {
  const [open, setOpen] = useState<number | null>(0);
  const expandable = items.some((item) => item.description);

  return (
    <section className="glass shine enter relative p-5 sm:p-6">
      <div aria-hidden className="card-glow bg-acc-cyan" />
      {title && (
        <h3 className="mb-5 text-base font-semibold tracking-tight sm:text-lg">{title}</h3>
      )}
      <ol>
        {items.map((item, i) => {
          const isOpen = open === i;
          const hasDetail = Boolean(item.description);
          return (
            <li
              key={i}
              className="enter relative flex gap-4 pb-2 last:pb-0"
              style={{ "--stagger": i + 1 } as React.CSSProperties}
            >
              <div className="flex flex-col items-center">
                <span
                  aria-hidden
                  className={`dot-pop mt-2 h-3 w-3 shrink-0 rounded-full bg-gradient-to-br from-violet-400 to-cyan-300 ring-4 transition-all duration-300 ${
                    isOpen
                      ? "scale-125 shadow-[0_0_18px_rgba(103,232,249,0.8)] ring-acc-cyan/20"
                      : "shadow-[0_0_10px_rgba(139,92,246,0.5)] ring-ink/[0.04]"
                  }`}
                />
                {i < items.length - 1 && (
                  <span
                    aria-hidden
                    className="line-draw mt-1.5 w-px flex-1 bg-gradient-to-b from-cyan-300/50 to-violet-400/20"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 pb-3">
                <button
                  type="button"
                  onClick={() => hasDetail && setOpen(isOpen ? null : i)}
                  aria-expanded={hasDetail ? isOpen : undefined}
                  className={`group flex w-full items-start justify-between gap-3 rounded-lg px-2 py-1.5 -mx-2 text-left transition-colors ${
                    hasDetail ? "hover:bg-ink/[0.04]" : "cursor-default"
                  }`}
                >
                  <span className="min-w-0">
                    {item.label && (
                      <span className="mb-1 mr-2 inline-block rounded-full border border-ink/[0.1] bg-ink/[0.04] px-2 py-px font-mono text-[10px] uppercase tracking-wider text-acc-cyan/80">
                        {item.label}
                      </span>
                    )}
                    <span className={`text-sm font-medium ${isOpen ? "gradient-text" : ""}`}>
                      {item.title}
                    </span>
                  </span>
                  {hasDetail && (
                    <span
                      aria-hidden
                      className={`mt-0.5 shrink-0 text-muted transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-acc-cyan" : ""
                      }`}
                    >
                      ⌄
                    </span>
                  )}
                </button>
                {hasDetail && (
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-prose px-0.5 pt-1 text-sm leading-relaxed text-muted">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {expandable && (
        <p className="mt-2 text-[11px] text-muted/60">Tap a step to expand it.</p>
      )}
    </section>
  );
}
