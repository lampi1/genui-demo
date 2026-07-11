"use client";

import { useEffect, useRef, useState } from "react";

type Visual = { flipped: boolean; settled: boolean; noTransition: boolean };

/**
 * Controlled 3D flip that stays SHARP: once the turn completes it drops every
 * 3D transform (`settled`) so the browser re-rasterizes the text crisply —
 * rotated preserve-3d layers otherwise stay blurry. Unflipping restores the
 * 3D state without transition for one frame, then animates back.
 */
export function FlipScene({
  flipped,
  front,
  back,
  className = "",
  faceClassName = "",
  backFaceClassName = "",
}: {
  flipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  faceClassName?: string;
  backFaceClassName?: string;
}) {
  const [visual, setVisual] = useState<Visual>({
    flipped: false,
    settled: false,
    noTransition: false,
  });
  const target = useRef(flipped);

  useEffect(() => {
    target.current = flipped;
  }, [flipped]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setVisual((current) => {
        if (flipped && !current.flipped) {
          return { flipped: true, settled: false, noTransition: false };
        }
        if (!flipped && current.flipped) {
          if (current.settled) {
            // Re-enter 3D silently; the next frame animates the way back.
            requestAnimationFrame(() =>
              requestAnimationFrame(() =>
                setVisual({ flipped: false, settled: false, noTransition: false }),
              ),
            );
            return { flipped: true, settled: false, noTransition: true };
          }
          return { flipped: false, settled: false, noTransition: false };
        }
        return current;
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [flipped]);

  return (
    <div
      className={`flip-scene ${visual.flipped ? "flipped" : ""} ${
        visual.settled ? "settled" : ""
      } ${visual.noTransition ? "no-flip-transition" : ""} ${className}`}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget) return;
        if (target.current && visual.flipped && !visual.settled) {
          setVisual((current) => ({ ...current, settled: true }));
        }
      }}
    >
      <div className={`glass flip-face ${faceClassName}`}>{front}</div>
      <div className={`glass flip-face flip-face-back ${faceClassName} ${backFaceClassName}`}>
        {back}
      </div>
    </div>
  );
}
