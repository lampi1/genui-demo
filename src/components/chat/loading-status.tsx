"use client";

import { useEffect, useState } from "react";

/**
 * ChatGPT-style status while the answer is on its way — in-world and honest
 * about the free tier. Advances through the phrases, stays on the last one.
 */
const PHRASES = [
  "Negotiating with the free tier…",
  "Convincing pixels to hold still…",
  "Asking the model to draw, not talk…",
  "Snapping blocks together…",
  "Inventing an interface that didn't exist a second ago…",
  "Bribing the renderer with clean JSON…",
];

export function LoadingStatus() {
  // Fresh random order per wait, so the pill never feels scripted.
  const [phrases] = useState(() =>
    [...PHRASES].sort(() => Math.random() - 0.5),
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Unhurried on purpose: each line deserves to be read, not glimpsed.
    const timer = setInterval(
      () => setIndex((current) => Math.min(current + 1, phrases.length - 1)),
      2000,
    );
    return () => clearInterval(timer);
  }, [phrases]);

  return (
    <div className="glass enter flex items-center gap-3 px-4 py-3">
      <span
        aria-hidden
        className="badge-dot-pulse h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-violet-400 to-cyan-300"
      />
      <span key={index} className="word-in text-sm text-muted" aria-live="polite">
        {phrases[index]}
      </span>
    </div>
  );
}
