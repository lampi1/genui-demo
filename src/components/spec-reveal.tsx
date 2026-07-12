"use client";

import { useState } from "react";
import { CodeBlock } from "./genui/code-block";

/**
 * The demo's open hood: every substantial generated block can reveal, on
 * demand, the validated JSON node it was rendered from. Closed by default —
 * the machinery appears only when the visitor asks for it (CH-001).
 */
export function SpecReveal({ node, children }: { node: unknown; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {children}
      <div className="mt-1.5 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-expanded={open}
          className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-foreground/75 transition-all hover:bg-ink/[0.08] hover:text-foreground active:scale-[0.97]"
        >
          <span aria-hidden className="font-mono text-acc-cyan">
            {"{ }"}
          </span>
          {open ? "hide the spec" : "view the spec"}
        </button>
      </div>
      {open && (
        <div className="enter space-y-1.5">
          <CodeBlock language="json" content={JSON.stringify(node, null, 2)} />
          <p className="text-[11px] leading-snug text-muted/70">
            The exact JSON this block was rendered from — composed by the model,
            validated against the allow-list before a single pixel appeared.
          </p>
        </div>
      )}
    </div>
  );
}
