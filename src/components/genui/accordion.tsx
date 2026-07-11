"use client";

import { useState } from "react";

type AccordionProps = {
  items: { title: string; content: string }[];
};

export function Accordion({ items }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="glass enter divide-y divide-ink/[0.06] overflow-hidden">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="enter" style={{ "--stagger": i } as React.CSSProperties}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-ink/[0.04]"
            >
              <span className={isOpen ? "gradient-text" : ""}>{item.title}</span>
              <span
                aria-hidden
                className={`shrink-0 text-muted transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-acc-cyan" : ""
                }`}
              >
                ⌄
              </span>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed text-muted">
                  {item.content}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
