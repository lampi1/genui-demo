"use client";

import { useEffect, useRef } from "react";

/** Pointer-tracking 3D tilt. Inert under prefers-reduced-motion and on touch. */
export function Tilt({
  children,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** e.g. while a flip card is turned — stacking 3D contexts blurs text */
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const element = ref.current;
    if (!element || disabled || event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.setProperty("--rx", `${(-y * 5).toFixed(2)}deg`);
    element.style.setProperty("--ry", `${(x * 7).toFixed(2)}deg`);
    element.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
    element.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
  }

  function reset() {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--rx", "0deg");
    element.style.setProperty("--ry", "0deg");
  }

  useEffect(() => {
    if (disabled) reset();
  });

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={`tilt ${className}`}
      // While disabled (card flipped) drop the 3D context entirely — even an
      // identity perspective keeps the content on a rasterized layer.
      style={disabled ? { transform: "none" } : undefined}
    >
      {children}
      <div aria-hidden className="spotlight" />
      <div aria-hidden className="beam" />
    </div>
  );
}
