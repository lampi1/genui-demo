"use client";

import { useEffect, useState } from "react";

type Stat = { value: number; label: string; prefix?: string; suffix?: string };

/**
 * Count-up with a show-off landing: tiles start one after the other,
 * decelerate like an odometer running out of breath (ease-out-expo), then
 * land with a spring pop and a brief glow. `done` drives the landing CSS.
 */
function useCountUp(target: number, delayMs: number, durationMs = 1500) {
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);

  // No mount guard: StrictMode runs effects twice (mount → cleanup → mount)
  // and a guard would leave the second, surviving run stuck at zero.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const decimals = Number.isInteger(target) ? 0 : 1;
    const start = performance.now() + delayMs;
    let frame: number;
    const tick = (now: number) => {
      if (reduceMotion) {
        setDisplay(target);
        setDone(true);
        return;
      }
      const progress = Math.min(Math.max(now - start, 0) / durationMs, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Number((target * eased).toFixed(decimals)));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setDone(true);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, delayMs, durationMs]);

  return { display, done };
}

function StatTile({ stat, index }: { stat: Stat; index: number }) {
  const { display, done } = useCountUp(stat.value, index * 180);

  return (
    <div
      className="glass enter flex flex-col items-center gap-1 px-4 py-5 text-center"
      style={{ "--stagger": index } as React.CSSProperties}
    >
      <span
        className={`gradient-text text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl ${
          done ? "stat-land" : ""
        }`}
      >
        {stat.prefix}
        {display.toLocaleString("en-US")}
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
