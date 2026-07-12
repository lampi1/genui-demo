"use client";

import { useState } from "react";
import { useGenUIActions } from "@/components/genui-actions";

type Branch = { label: string; children?: string[] };

const BRANCH_COLORS = ["#8b5cf6", "#0891b2", "#f43f5e", "#d97706", "#059669", "#6366f1"] as const;

/** Geometry (viewBox units) — deterministic, no DOM measurement needed. */
const W = 720;
const CENTER_X = 96;
const CENTER_W = 150;
const BRANCH_X = 300;
const BRANCH_W = 170;
const LEAF_X = 520;
const LEAF_W = 180;
const LEAF_H = 26;
const PAD_Y = 18;

/**
 * A horizontal mind map: the center concept on the left, branches fanning
 * right with bezier connectors that draw themselves, leaves fanning further.
 * Interactive: tapping a branch focuses it (the rest dims), tapping a leaf
 * asks the chat about it — every leaf is a door to the next generation.
 * Text wraps inside foreignObject boxes, so long labels never overflow.
 */
export function ConceptMap({ center, branches }: { center: string; branches: Branch[] }) {
  const actions = useGenUIActions();
  const [focused, setFocused] = useState<number | null>(null);

  // Each branch row is tall enough for its leaves; rows stack vertically.
  const rowHeights = branches.map((branch) =>
    Math.max(64, (branch.children?.length ?? 0) * (LEAF_H + 8) + 24),
  );
  const height = rowHeights.reduce((sum, h) => sum + h, 0) + PAD_Y * 2;
  const rowTops = rowHeights.reduce<number[]>((acc, h, i) => {
    acc.push(i === 0 ? PAD_Y : acc[i - 1] + rowHeights[i - 1]);
    return acc;
  }, []);
  const centerY = height / 2;

  return (
    <div className="glass enter overflow-x-auto p-4 sm:p-5">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        className="h-auto w-full min-w-[540px]"
        role="img"
        aria-label={`Concept map of ${center}: ${branches.map((b) => b.label).join(", ")}`}
      >
        {branches.map((branch, i) => {
          const branchY = rowTops[i] + rowHeights[i] / 2;
          const color = BRANCH_COLORS[i % BRANCH_COLORS.length];
          const dimmed = focused !== null && focused !== i;
          return (
            <g
              key={i}
              className="transition-[opacity,filter] duration-300"
              style={dimmed ? { opacity: 0.3, filter: "saturate(0.4)" } : undefined}
            >
              {/* center → branch */}
              <path
                d={`M ${CENTER_X + CENTER_W / 2} ${centerY} C ${BRANCH_X - 60} ${centerY}, ${
                  BRANCH_X - 90
                } ${branchY}, ${BRANCH_X - 4} ${branchY}`}
                fill="none"
                stroke={color}
                strokeOpacity="0.55"
                strokeWidth="1.5"
                pathLength={1}
                className="stroke-draw"
              />
              {/* branch → leaves */}
              {(branch.children ?? []).map((_, j) => {
                const leafY = rowTops[i] + 20 + j * (LEAF_H + 8) + LEAF_H / 2;
                return (
                  <path
                    key={j}
                    d={`M ${BRANCH_X + BRANCH_W} ${branchY} C ${LEAF_X - 50} ${branchY}, ${
                      LEAF_X - 60
                    } ${leafY}, ${LEAF_X - 4} ${leafY}`}
                    fill="none"
                    stroke={color}
                    strokeOpacity="0.35"
                    strokeWidth="1.2"
                    pathLength={1}
                    className="stroke-draw"
                  />
                );
              })}
              <foreignObject x={BRANCH_X} y={branchY - 22} width={BRANCH_W} height="44">
                <button
                  type="button"
                  onClick={() => setFocused(focused === i ? null : i)}
                  aria-pressed={focused === i}
                  aria-label={
                    focused === i ? `${branch.label} — release focus` : `${branch.label} — focus`
                  }
                  className="enter flex h-full w-full items-center rounded-xl border px-3 text-left text-xs font-semibold leading-tight transition-transform active:scale-[0.97]"
                  style={{
                    borderColor: `${color}66`,
                    background: `${color}14`,
                    ["--stagger" as string]: i + 1,
                  }}
                >
                  <span className="line-clamp-2">{branch.label}</span>
                </button>
              </foreignObject>
              {(branch.children ?? []).map((leaf, j) => {
                const leafY = rowTops[i] + 20 + j * (LEAF_H + 8);
                return (
                  <foreignObject key={j} x={LEAF_X} y={leafY} width={LEAF_W} height={LEAF_H}>
                    <button
                      type="button"
                      disabled={!actions}
                      onClick={() => actions?.submit(leaf)}
                      aria-label={`Ask about ${leaf}`}
                      title={`Ask about ${leaf}`}
                      className="enter flex h-full w-full items-center rounded-full bg-ink/[0.05] px-2.5 text-left text-[11px] text-foreground/85 transition-colors hover:bg-ink/[0.1] hover:text-acc-cyan active:scale-[0.97] disabled:pointer-events-none"
                      style={{ ["--stagger" as string]: i + j + 2 }}
                    >
                      <span className="truncate">{leaf}</span>
                      <span aria-hidden className="ml-auto pl-1 text-[10px] opacity-60">
                        →
                      </span>
                    </button>
                  </foreignObject>
                );
              })}
            </g>
          );
        })}
        {/* center node last: it sits above every connector */}
        <foreignObject x={CENTER_X - CENTER_W / 2} y={centerY - 26} width={CENTER_W} height="52">
          <button
            type="button"
            onClick={() => setFocused(null)}
            aria-label={`${center} — show every branch`}
            className="enter flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/90 to-cyan-400/90 px-3 text-center text-xs font-semibold leading-tight text-white shadow-[0_0_20px_-6px_rgba(103,232,249,0.7)] transition-transform active:scale-[0.97]"
          >
            <span className="line-clamp-2">{center}</span>
          </button>
        </foreignObject>
      </svg>
      <p className="mt-2 text-[11px] text-muted/70">
        Tap a branch to focus it — tap a leaf to ask the chat about it.
      </p>
    </div>
  );
}
