"use client";

import { useEffect, useId, useState } from "react";
import { useCountUp } from "./stats";

type GaugeItem = { label: string; value: number; suffix?: string };

const R = 40;
const CIRCUMFERENCE = 2 * Math.PI * R;
/** 270° dial: the missing quarter sits at the bottom like a speedometer. */
const TRACK = CIRCUMFERENCE * 0.75;

/** Radial dials that sweep to their value while the number counts up. */
export function Gauge({ items }: { items: GaugeItem[] }) {
  return (
    <div className="glass enter flex flex-wrap items-start justify-evenly gap-x-2 gap-y-4 p-5 sm:p-6">
      {items.map((item, i) => (
        <Dial key={i} item={item} index={i} />
      ))}
    </div>
  );
}

function Dial({ item, index }: { item: GaugeItem; index: number }) {
  const value = Math.max(0, Math.min(100, item.value));
  const { display, done } = useCountUp(value, index * 180);
  const gradientId = useId();
  // The arc starts collapsed and sweeps open one frame after mount; reduced
  // motion lands it instantly (.gauge-sweep drops its transition in CSS).
  const [swept, setSwept] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => setSwept(true)),
    );
    return () => cancelAnimationFrame(frame);
  }, []);
  const fill = swept ? TRACK * (value / 100) : 0;

  return (
    <figure className="flex min-w-28 flex-col items-center gap-1">
      <div className="relative">
        {/* rotate(135°) parks the dasharray start at the dial's bottom-left */}
        <svg width="104" height="104" viewBox="0 0 104 104" className="rotate-[135deg]">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--grad-1)" />
              <stop offset="100%" stopColor="var(--grad-2)" />
            </linearGradient>
          </defs>
          <circle
            cx="52"
            cy="52"
            r={R}
            fill="none"
            stroke="var(--edge)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${TRACK} ${CIRCUMFERENCE - TRACK}`}
          />
          <circle
            cx="52"
            cy="52"
            r={R}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${fill} ${CIRCUMFERENCE - fill}`}
            className="gauge-sweep"
            style={{ "--stagger": index } as React.CSSProperties}
          >
            <title>{`${item.label}: ${value}${item.suffix ?? ""}`}</title>
          </circle>
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-lg font-semibold tabular-nums tracking-tight ${
            done ? "stat-land" : ""
          }`}
        >
          {display}
          {item.suffix && <span className="ml-0.5 text-xs text-muted">{item.suffix}</span>}
        </span>
      </div>
      <figcaption className="max-w-32 truncate text-xs text-muted" title={item.label}>
        {item.label}
      </figcaption>
    </figure>
  );
}
