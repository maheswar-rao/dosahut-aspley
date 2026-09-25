"use client";

import { useMemo } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

// Brand palette plus one warm gold — confetti reads as festive but still
// unmistakably Dosa Hut, not generic party-favour colours.
const COLORS = ["#F15A27", "#F79473", "#570B0B", "#FFD966", "#FFFDFA"];

type Particle = {
  key: string;
  left: string;
  delay: string;
  duration: string;
  color: string;
  width: number;
  height: number;
  rotate: number;
  drift: string;
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function fallingParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    key: `fall-${i}`,
    left: `${rand(0, 100)}%`,
    delay: `${rand(0, 0.7)}s`,
    duration: `${rand(2.2, 3.6)}s`,
    color: COLORS[i % COLORS.length],
    width: rand(6, 12),
    height: rand(10, 18),
    rotate: rand(0, 360),
    drift: `${rand(-90, 90)}px`,
  }));
}

// Poppers burst from the two bottom corners — an initial upward kick, out
// toward the middle, before gravity pulls them back down.
function popperParticles(count: number, side: "left" | "right"): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    key: `pop-${side}-${i}`,
    left: side === "left" ? `${rand(-2, 18)}%` : `${rand(82, 102)}%`,
    delay: `${rand(0, 0.25)}s`,
    duration: `${rand(1.5, 2.4)}s`,
    color: COLORS[(i + 2) % COLORS.length],
    width: rand(6, 11),
    height: rand(10, 16),
    rotate: rand(0, 360),
    drift: `${side === "left" ? rand(60, 220) : rand(-220, -60)}px`,
  }));
}

/**
 * A one-shot confetti burst: streamers rain from the top of the screen while
 * two party poppers fire up from the bottom corners. Mount with `active` to
 * fire it; unmount (or flip `active` back to false) once the moment has
 * passed — it doesn't loop or clean up after itself.
 */
export function Confetti({ active }: { active: boolean }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const rain = useMemo(() => fallingParticles(28), []);
  const poppers = useMemo(
    () => [...popperParticles(14, "left"), ...popperParticles(14, "right")],
    [],
  );

  if (!active || prefersReducedMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {rain.map((p) => (
        <span
          key={p.key}
          className="confetti-fall absolute -top-[5%] rounded-[2px]"
          style={
            {
              left: p.left,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              animationDelay: p.delay,
              animationDuration: p.duration,
              "--confetti-drift": p.drift,
              "--confetti-rotate": `${p.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
      {poppers.map((p) => (
        <span
          key={p.key}
          className="confetti-pop absolute -bottom-[5%] rounded-[2px]"
          style={
            {
              left: p.left,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              animationDelay: p.delay,
              animationDuration: p.duration,
              "--confetti-drift": p.drift,
              "--confetti-rotate": `${p.rotate}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
