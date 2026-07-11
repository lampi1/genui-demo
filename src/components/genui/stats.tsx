"use client";

import { useEffect, useState } from "react";

type Stat = { value: number; label: string; prefix?: string; suffix?: string };

function useCountUp(target: number, durationMs = 1200) {
  const [display, setDisplay] = useState(0);

  // No mount guard: StrictMode runs effects twice (mount → cleanup → mount)
  // and a guard would leave the second, surviving run stuck at zero.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const decimals = Number.isInteger(target) ? 0 : 1;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      if (reduceMotion) {
        setDisplay(target);
        return;
      }
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Number((target * eased).toFixed(decimals)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return display;
}

function StatTile({ stat, index }: { stat: Stat; index: number }) {
  const value = useCountUp(stat.value);

  return (
    <div
      className="glass enter flex flex-col items-center gap-1 px-4 py-5 text-center"
      style={{ "--stagger": index } as React.CSSProperties}
    >
      <span className="gradient-text text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
        {stat.prefix}
        {value.toLocaleString("en-US")}
        {stat.suffix}
      </span>
      <span className="text-xs text-muted">{stat.label}</span>
    </div>
  );
}

export function Stats({ items }: { items: Stat[] }) {
  return (
    <div
      className="enter grid gap-3"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(8.5rem, 1fr))` }}
    >
      {items.map((stat, i) => (
        <StatTile key={i} stat={stat} index={i} />
      ))}
    </div>
  );
}
