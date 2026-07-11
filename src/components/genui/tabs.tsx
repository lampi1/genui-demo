"use client";

import { useState } from "react";

type TabsProps = {
  tabs: { label: string; content: string }[];
};

export function Tabs({ tabs }: TabsProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="glass enter overflow-hidden">
      <div
        role="tablist"
        className="flex flex-wrap gap-1 border-b border-ink/[0.06] px-2 pt-2"
      >
        {tabs.map((tab, i) => {
          const isActive = active === i;
          return (
            <button
              key={i}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              className={`relative min-w-0 flex-1 truncate rounded-t-lg px-3 py-2.5 text-center text-sm transition-colors sm:flex-none sm:px-4 sm:text-left ${
                isActive
                  ? "text-foreground"
                  : "text-muted hover:bg-ink/[0.04] hover:text-foreground/80"
              }`}
            >
              {tab.label}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-violet-400 via-cyan-300 to-rose-300"
                />
              )}
            </button>
          );
        })}
      </div>
      <p key={active} className="enter px-5 py-4 text-sm leading-relaxed text-foreground/90">
        {tabs[active]?.content}
      </p>
    </div>
  );
}
