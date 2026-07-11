"use client";

import { Children, useRef, useState } from "react";

/**
 * Multi-block compositions present one block at a time: swipe on touch, or
 * use the arrows and dots. Native CSS scroll-snap does all the motion work —
 * no drag math, no per-frame re-renders.
 */
export function Carousel({ children }: { children: React.ReactNode }) {
  const slides = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Distance between snap points, measured from the DOM so the CSS gap and
  // padding can change without breaking navigation.
  function step(track: HTMLDivElement): number {
    const first = track.children[0] as HTMLElement | undefined;
    const second = track.children[1] as HTMLElement | undefined;
    if (!first || !second) return track.clientWidth;
    return second.offsetLeft - first.offsetLeft;
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / step(track));
    setActive(Math.max(0, Math.min(slides.length - 1, index)));
  }

  function goTo(index: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * step(track), behavior: "smooth" });
  }

  if (slides.length < 2) return <>{children}</>;

  return (
    <div className="enter">
      <div ref={trackRef} onScroll={onScroll} className="carousel-track">
        {slides.map((slide, i) => (
          <div key={i} className="carousel-slide">
            {slide}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Previous block"
          disabled={active === 0}
          onClick={() => goTo(active - 1)}
          className="glass flex h-7 w-7 items-center justify-center rounded-full text-sm text-muted transition-all hover:text-foreground active:scale-95 disabled:opacity-30"
        >
          ‹
        </button>
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to block ${i + 1}`}
              aria-current={i === active}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active
                  ? "w-5 bg-gradient-to-r from-violet-400 to-cyan-300"
                  : "w-1.5 bg-ink/20 hover:bg-ink/40"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Next block"
          disabled={active === slides.length - 1}
          onClick={() => goTo(active + 1)}
          className="glass flex h-7 w-7 items-center justify-center rounded-full text-sm text-muted transition-all hover:text-foreground active:scale-95 disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </div>
  );
}
