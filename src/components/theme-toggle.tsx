"use client";

import { useSyncExternalStore } from "react";

export type Theme = "neu" | "glass";

/** Persisted choice; the layout's inline script applies it before paint. */
export const THEME_KEY = "genui-theme";
const THEME_EVENT = "genui-theme-change";

// The theme lives OUTSIDE React — on <html data-theme> — so the whole page
// re-skins via CSS. These module helpers are the store the component syncs to.
function readTheme(): Theme {
  return document.documentElement.dataset.theme === "glass" ? "glass" : "neu";
}

function subscribeTheme(onChange: () => void): () => void {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

function applyTheme(next: Theme): void {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // Private mode: the choice just won't survive a reload.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

/**
 * The style switch: Neu (light, soft embossed relief — default) vs Glass
 * (dark aurora translucency). One tap re-skins every surface via the
 * data-theme attribute; components only ever speak in tokens.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "neu");

  return (
    <div
      role="group"
      aria-label="Page style"
      className="glass flex items-center gap-0.5 rounded-full p-0.5"
    >
      {(
        [
          { value: "neu", label: "light" },
          { value: "glass", label: "dark" },
        ] as const
      ).map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={theme === option.value}
          onClick={() => applyTheme(option.value)}
          className={`rounded-full px-3 py-1 text-[11px] font-medium capitalize transition-all ${
            theme === option.value
              ? "bg-gradient-to-r from-violet-500/80 to-cyan-500/80 text-white shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
