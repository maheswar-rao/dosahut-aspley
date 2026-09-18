"use client";

import { useEffect, useState } from "react";

/**
 * True when the visitor has asked for reduced motion (iOS Settings →
 * Accessibility → Motion, or the OS equivalent).
 *
 * Use it to stop motion that happens *on its own* — auto-advancing slides, the
 * hero orbit. Never use it to disable a control: a tap, swipe or arrow press
 * must always move the slider, reduced motion or not.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    function update() {
      setReduced(query.matches);
    }
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}
