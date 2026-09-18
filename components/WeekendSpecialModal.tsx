"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type MouseEvent } from "react";
import Image from "next/image";
import { CloseIcon } from "./Icons";
import { DISHES, SITE } from "@/lib/site";

// Real menu item — Fri–Sun is also this restaurant's actual longer trading
// window (see HOURS in lib/site.ts), so "weekend only" reflects a real
// pattern rather than an invented promotion. No discount/strikethrough price
// is shown since there is no real weekend discount in the menu data.
const FEATURED_DISH = DISHES.find((d) => d.name === "Chicken Dum Biryani")!;

const HOVER_CAPABLE_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeToHoverCapability(callback: () => void) {
  const mq = window.matchMedia(HOVER_CAPABLE_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getHoverCapableSnapshot() {
  return window.matchMedia(HOVER_CAPABLE_QUERY).matches;
}

function getHoverCapableServerSnapshot() {
  return false;
}

export function WeekendSpecialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [entered, setEntered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const tiltEnabled = useSyncExternalStore(
    subscribeToHoverCapability,
    getHoverCapableSnapshot,
    getHoverCapableServerSnapshot,
  );
  const imageWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setEntered(true));
    return () => {
      cancelAnimationFrame(id);
      setEntered(false);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!tiltEnabled) return;
    const el = imageWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -12, y: px * 12 });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-white/12 bg-maroon-950 shadow-[0_0_120px_40px_rgba(241,90,39,0.3)] transition-all duration-300 sm:max-w-lg"
          style={{
            transform: entered ? "scale(1)" : "scale(0.95)",
            opacity: entered ? 1 : 0,
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close weekend special"
            className="absolute top-4 right-4 z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/30 text-cream-0 transition-colors hover:bg-black/50"
          >
            <CloseIcon size={16} />
          </button>

          <div className="flex flex-col items-center gap-5 overflow-y-auto px-5 pt-8 pb-6 text-center sm:px-7 sm:pt-9 sm:pb-8">
            <span className="text-sm font-bold tracking-[0.22em] text-peach-400 uppercase">
              Chef&rsquo;s Weekend Secret
            </span>

            <div
              ref={imageWrapRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative aspect-square w-40 max-h-[220px] max-w-[220px] sm:w-56"
              style={{ perspective: "800px" }}
            >
              <div
                className="relative h-full w-full overflow-hidden rounded-full border-2 border-orange-500/40 shadow-[0_25px_45px_-10px_rgba(0,0,0,0.85)] transition-transform duration-150 ease-out"
                style={{
                  transform: tiltEnabled ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : "none",
                }}
              >
                <Image
                  src={FEATURED_DISH.image!}
                  alt={FEATURED_DISH.alt ?? FEATURED_DISH.name}
                  fill
                  sizes="(min-width: 640px) 224px, 160px"
                  className="h-full w-full object-cover"
                />
              </div>

              <span
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-cream-0 uppercase whitespace-nowrap"
                style={{ animation: "pulse-glow 1.8s ease-in-out infinite" }}
              >
                Limited Portions Only
              </span>
            </div>

            <div className="mt-2 flex flex-col items-center gap-2">
              <h2 className="font-display text-3xl leading-snug font-bold text-cream-0 sm:text-4xl">{FEATURED_DISH.name}</h2>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full border border-white/20 px-3 py-1 text-[11.5px] font-bold tracking-wide text-cream-50/90 uppercase">
                  Fri &ndash; Sun Only
                </span>
                <span className="rounded-full border border-white/20 px-3 py-1 text-[11.5px] font-bold tracking-wide text-cream-50/90 uppercase">
                  Chef Special
                </span>
              </div>

              <span className="mt-1 font-display text-3xl font-bold text-orange-400 sm:text-4xl">{FEATURED_DISH.price}</span>
            </div>

            <a
              href={SITE.orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-glow group relative mt-2 flex min-h-[44px] w-full max-w-full shrink-0 items-center justify-center overflow-hidden rounded-full px-5 py-3 text-lg font-bold tracking-wider uppercase sm:px-7 sm:py-3.5 sm:text-xl"
            >
              <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 transition-transform duration-700 ease-out group-hover:translate-x-[350%]" />
              ORDER ONLINE
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
