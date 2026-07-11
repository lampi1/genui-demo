"use client";

/**
 * Interaction-budget ring wrapped AROUND the send button: it fills as the
 * visitor spends their 15-per-15-minutes budget (mirrors the server's
 * per-IP limit) and empties again as the window rolls.
 */
export function QuotaRing({ used, cap }: { used: number; cap: number }) {
  const fraction = Math.min(used / cap, 1);
  const radius = 10.75;
  const circumference = 2 * Math.PI * radius;
  // Theme tokens keep the arc calm on light neu and vivid on dark glass.
  const color =
    fraction < 0.5
      ? "var(--ring-ok)"
      : fraction < 0.8
        ? "var(--ring-warn)"
        : "var(--ring-stop)";

  return (
    <div
      className="pointer-events-none absolute -inset-[3px]"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={cap}
      aria-valuenow={used}
      aria-label={`${Math.max(0, cap - used)} of ${cap} interactions left in this window`}
    >
      <svg viewBox="0 0 24 24" className="h-full w-full -rotate-90">
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          stroke="var(--edge)"
          strokeWidth="1.4"
        />
        <circle
          cx="12"
          cy="12"
          r={radius}
          fill="none"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          className="quota-arc transition-[stroke-dashoffset,stroke] duration-700 ease-out"
          style={{ "--ring-color": color } as React.CSSProperties}
        />
      </svg>
    </div>
  );
}
