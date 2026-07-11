/**
 * Positioning shell for every generated block: the focus-frame corners (the
 * "being composed" signature) and breathing room. Deliberately quiet — no
 * badges, no labels, nothing technical between the visitor and the UI.
 */
export function GeneratedBlock({ children }: { children: React.ReactNode }) {
  return <div className="frame relative pt-2">{children}</div>;
}
