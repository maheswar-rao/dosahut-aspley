"use client";

import { useRef } from "react";

// iOS Safari fires no pointer/drag events a slider can rely on, so horizontal
// gestures are tracked by hand. A swipe counts once it passes the threshold and
// is more horizontal than vertical — otherwise the touch is the visitor
// scrolling the page and must be left alone.
const SWIPE_THRESHOLD_PX = 50;

export type SwipeHandlers = {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
};

/**
 * Returns touch handlers for a horizontal slider, plus `didSwipe`, which stays
 * true through the tap that iOS synthesises at the end of a drag so the caller
 * can suppress a click the visitor never meant to make.
 */
export function useSwipe(onSwipe: (direction: 1 | -1) => void): SwipeHandlers & {
  didSwipe: () => boolean;
} {
  const start = useRef<{ x: number; y: number } | null>(null);
  const delta = useRef({ x: 0, y: 0 });
  const swiped = useRef(false);

  return {
    onTouchStart(e) {
      const touch = e.touches[0];
      start.current = { x: touch.clientX, y: touch.clientY };
      delta.current = { x: 0, y: 0 };
      swiped.current = false;
    },
    onTouchMove(e) {
      if (!start.current) return;
      const touch = e.touches[0];
      delta.current = {
        x: touch.clientX - start.current.x,
        y: touch.clientY - start.current.y,
      };
    },
    onTouchEnd(e) {
      if (!start.current) return;
      // touchend carries no touches[], so fall back to the last move when the
      // changed touch is missing.
      const touch = e.changedTouches[0];
      const dx = touch ? touch.clientX - start.current.x : delta.current.x;
      const dy = touch ? touch.clientY - start.current.y : delta.current.y;
      start.current = null;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) return;
      swiped.current = true;
      onSwipe(dx < 0 ? 1 : -1);
    },
    didSwipe: () => swiped.current,
  };
}
