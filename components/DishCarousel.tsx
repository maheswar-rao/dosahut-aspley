"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronRightIcon } from "./Icons";
import type { Dish } from "@/lib/site";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useSwipe } from "@/lib/use-swipe";

const DISPLAY_MS = 3400;
// The ambient cross-fade is slow on purpose. A tap is not ambient, though: at
// 2.4s a visitor who presses an arrow sees nothing move for a beat and reads
// the button as broken, so manual input gets a snappy transition instead.
const TRANSITION_MS = 2400;
const MANUAL_TRANSITION_MS = 320;

export function DishCarousel({ dishes, orderUrl }: { dishes: Dish[]; orderUrl: string }) {
  const count = dishes.length;
  const prefersReducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // True while the last slide change came from an arrow or a swipe.
  const [manualNav, setManualNav] = useState(false);
  const swipe = useSwipe((direction) => {
    setManualNav(true);
    setIndex((i) => (i + direction + count) % count);
  });

  // Reduced motion stops the auto-advance only. The arrows and swipe below
  // keep working exactly as they do for everyone else.
  useEffect(() => {
    if (paused || prefersReducedMotion || count < 2) return;
    const id = setTimeout(() => {
      setManualNav(false);
      setIndex((i) => (i + 1) % count);
    }, DISPLAY_MS);
    return () => clearTimeout(id);
  }, [index, paused, prefersReducedMotion, count]);

  const dish = dishes[index];

  function go(delta: number) {
    setIndex((i) => (i + delta + count) % count);
  }

  const lastTouchNavRef = useRef(0);

  function navigate(delta: number, e: React.SyntheticEvent) {
    // The arrows sit inside the swipe surface; without this a tap would also
    // register as the start of a gesture and could reach the card underneath.
    e.stopPropagation();
    if (e.type === "touchend") {
      e.preventDefault();
      lastTouchNavRef.current = Date.now();
    } else if (Date.now() - lastTouchNavRef.current < 700) {
      return;
    }
    // The container's own touchend never fires once propagation stops, so the
    // pause it set on touchstart is released here instead of sticking on.
    setPaused(false);
    setManualNav(true);
    go(delta);
  }

  function openOrder() {
    // iOS synthesises a click at the end of a drag; a swipe is not a request
    // to open the ordering site.
    if (swipe.didSwipe()) return;
    window.open(orderUrl, "_blank", "noopener,noreferrer");
  }

  if (count === 0) return null;

  return (
    <div className="w-full max-w-[1200px]">
      <div
        className="relative mx-auto h-[260px] w-full overflow-hidden sm:h-[300px] md:h-[360px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => {
          // A touch pauses the timer so the slide the visitor swiped to stays
          // put; touchend hands it back rather than leaving it frozen, which
          // is what a synthesised mouseenter would do on iOS.
          setPaused(true);
          swipe.onTouchStart(e);
        }}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={(e) => {
          swipe.onTouchEnd(e);
          setPaused(false);
        }}
        style={{ touchAction: "pan-y" }}
      >
        {dishes.map((d, i) => {
          let diff = i - index;
          diff = ((diff % count) + count) % count;
          if (diff > count / 2) diff -= count;

          const isCurrent = diff === 0;
          const isSide = Math.abs(diff) === 1;
          const translate = diff * 56;
          const scale = isCurrent ? 1 : isSide ? 0.78 : 0.62;
          const opacity = isCurrent ? 1 : 0;

          return (
            <div
              key={d.name}
              role={isCurrent ? "link" : undefined}
              tabIndex={isCurrent ? 0 : -1}
              onClick={isCurrent ? openOrder : undefined}
              onKeyDown={
                isCurrent
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") openOrder();
                    }
                  : undefined
              }
              aria-label={isCurrent ? `Order ${d.name} online` : undefined}
              aria-hidden={!isCurrent}
              className={`transform-gpu absolute inset-y-0 left-1/2 flex w-[68%] max-w-[460px] items-center justify-center transition-all ease-in-out will-change-[transform,opacity] sm:w-[52%] ${
                isCurrent ? "cursor-pointer" : ""
              }`}
              style={{
                transform: `translateX(calc(-50% + ${translate}%)) scale(${scale})`,
                WebkitTransform: `translateX(calc(-50% + ${translate}%)) scale(${scale})`,
                opacity,
                transitionDuration: `${manualNav ? MANUAL_TRANSITION_MS : TRANSITION_MS}ms`,
                zIndex: isCurrent ? 3 : isSide ? 2 : 1,
                pointerEvents: isCurrent ? "auto" : "none",
              }}
            >
              <div className="group relative h-full w-full overflow-hidden rounded-[26px] shadow-[0_28px_60px_-24px_rgba(58,13,13,0.45)]">
                {d.image ? (
                  <Image
                    src={d.image}
                    alt={d.alt ?? d.name}
                    fill
                    sizes="(max-width: 768px) 90vw, 560px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-maroon-800 to-maroon-900">
                    <span className="font-display px-6 text-center text-4xl font-semibold text-cream-50/90 md:text-5xl">
                      {d.name}
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-maroon-950/75 via-maroon-950/5 to-transparent" />
              </div>
            </div>
          );
        })}

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous dish"
              onClick={(e) => navigate(-1, e)}
              onTouchEnd={(e) => navigate(-1, e)}
              className="absolute top-1/2 left-1 z-40 flex h-11 min-h-[44px] w-11 min-w-[44px] -translate-y-1/2 cursor-pointer touch-manipulation items-center justify-center rounded-full border border-maroon-800/15 bg-cream-0/90 text-maroon-800 shadow-sm backdrop-blur-sm transition-colors select-none hover:bg-cream-0 sm:left-3"
            >
              <ChevronRightIcon size={15} className="rotate-180" />
            </button>
            <button
              type="button"
              aria-label="Next dish"
              onClick={(e) => navigate(1, e)}
              onTouchEnd={(e) => navigate(1, e)}
              className="absolute top-1/2 right-1 z-40 flex h-11 min-h-[44px] w-11 min-w-[44px] -translate-y-1/2 cursor-pointer touch-manipulation items-center justify-center rounded-full border border-maroon-800/15 bg-cream-0/90 text-maroon-800 shadow-sm backdrop-blur-sm transition-colors select-none hover:bg-cream-0 sm:right-3"
            >
              <ChevronRightIcon size={15} />
            </button>
          </>
        )}
      </div>

      <div key={dish.name} className="dish-info-enter mt-6 flex flex-col items-center gap-1.5 text-center">
        <span className="text-[12.5px] font-bold tracking-[0.16em] text-orange-500 uppercase">
          {dish.category}
        </span>
        <span className="font-display text-2xl font-bold sm:text-3xl lg:text-4xl leading-snug text-ink-900">
          {dish.name}
        </span>
        <span className="text-xl font-bold text-maroon-800 md:text-2xl">{dish.price}</span>
      </div>

      {count > 1 && (
        <div className="hidden mx-auto mt-4 flex w-full max-w-[220px] items-center gap-3">
          <span className="font-heading shrink-0 text-[12.5px] font-semibold tracking-wide text-ink-600 tabular-nums">
            {String(index + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
          </span>
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-maroon-800/10">
            <div
              key={`${dish.name}-${index}`}
              className="h-full w-full origin-left rounded-full bg-orange-500"
              style={{ animation: paused ? "none" : `dish-progress ${DISPLAY_MS}ms linear forwards` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
