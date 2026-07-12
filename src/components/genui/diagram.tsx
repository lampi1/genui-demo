"use client";

import { useId } from "react";

type DiagramNode = { id: string; label: string };
type DiagramEdge = { from: string; to: string; label?: string };

/** Geometry (viewBox units) — deterministic layered layout. */
const COL_W = 216;
const BOX_W = 168;
const BOX_H = 60;
const ROW_H = 86;
const PAD = 28;

/**
 * Assign each node a layer: roots (no incoming edge) start at 0, every edge
 * pushes its target one layer right. Bounded relaxation survives cycles.
 */
function layerize(nodes: DiagramNode[], edges: DiagramEdge[]): Map<string, number> {
  const layer = new Map<string, number>();
  const hasIncoming = new Set(edges.map((edge) => edge.to));
  for (const node of nodes) layer.set(node.id, hasIncoming.has(node.id) ? 1 : 0);
  for (let pass = 0; pass < nodes.length; pass++) {
    let moved = false;
    for (const edge of edges) {
      const from = layer.get(edge.from) ?? 0;
      const to = layer.get(edge.to) ?? 0;
      if (to <= from && to < nodes.length - 1) {
        layer.set(edge.to, from + 1);
        moved = true;
      }
    }
    if (!moved) break;
  }
  return layer;
}

/**
 * A node-and-edge diagram beyond the linear flow: boxes in computed layers,
 * self-drawing bezier arrows, optional verb pills on the edges.
 */
export function Diagram({
  title,
  nodes,
  edges,
}: {
  title?: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}) {
  const markerId = useId();
  const layers = layerize(nodes, edges);
  const columns = new Map<number, DiagramNode[]>();
  for (const node of nodes) {
    const level = layers.get(node.id) ?? 0;
    columns.set(level, [...(columns.get(level) ?? []), node]);
  }
  const levelCount = Math.max(...columns.keys()) + 1;
  const tallest = Math.max(...[...columns.values()].map((column) => column.length));
  const width = PAD * 2 + levelCount * COL_W - (COL_W - BOX_W);
  const height = PAD * 2 + tallest * ROW_H - (ROW_H - BOX_H);

  // Center each column vertically; remember every box's anchor points.
  const position = new Map<string, { x: number; y: number }>();
  for (const [level, column] of columns) {
    const columnHeight = column.length * ROW_H - (ROW_H - BOX_H);
    const top = (height - columnHeight) / 2;
    column.forEach((node, i) => {
      position.set(node.id, { x: PAD + level * COL_W, y: top + i * ROW_H });
    });
  }

  return (
    <section className="glass enter overflow-x-auto p-4 sm:p-5">
      {title && <h3 className="mb-3 text-sm font-semibold tracking-tight">{title}</h3>}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        style={{ minWidth: Math.min(width, 640) }}
        role="img"
        aria-label={
          title ??
          `Diagram: ${edges.map((edge) => `${edge.from} → ${edge.to}`).join(", ")}`
        }
      >
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 8 4 L 0 8 z" fill="#8b5cf6" />
          </marker>
        </defs>
        {edges.map((edge, i) => {
          const from = position.get(edge.from);
          const to = position.get(edge.to);
          if (!from || !to) return null;
          const x1 = from.x + BOX_W;
          const y1 = from.y + BOX_H / 2;
          const x2 = to.x;
          const y2 = to.y + BOX_H / 2;
          const bend = Math.max(36, (x2 - x1) / 2);
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2 - 2} ${y2}`}
                fill="none"
                stroke="#8b5cf6"
                strokeOpacity="0.6"
                strokeWidth="1.6"
                markerEnd={`url(#${markerId})`}
                pathLength={1}
                className="stroke-draw"
              />
              {edge.label && (
                <foreignObject x={midX - 44} y={midY - 12} width="88" height="24">
                  <div className="flex h-full items-center justify-center">
                    <span className="truncate rounded-full bg-ink/[0.07] px-2 py-0.5 text-[10px] text-muted backdrop-blur-sm">
                      {edge.label}
                    </span>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
        {nodes.map((node, i) => {
          const at = position.get(node.id);
          if (!at) return null;
          return (
            <foreignObject key={node.id} x={at.x} y={at.y} width={BOX_W} height={BOX_H}>
              <div
                className="enter flex h-full items-center justify-center rounded-xl border border-ink/[0.14] bg-ink/[0.04] px-3 text-center text-xs font-medium leading-tight"
                style={{ ["--stagger" as string]: i }}
              >
                <span className="line-clamp-2">{node.label}</span>
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </section>
  );
}
