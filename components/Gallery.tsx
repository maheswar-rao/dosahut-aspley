"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { GALLERY_PHOTOS } from "@/lib/gallery";
import { CloseIcon } from "./Icons";

// One desktop row to begin with, and one more per click. Revealing all
// fifty-six at once is four rows on a desktop but twenty-eight on a phone,
// which buries the Location section under a scroll nobody asked for.
const INITIAL_COUNT = 4;
const ROW_STEP = 4;

export function Gallery() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const shown = GALLERY_PHOTOS.slice(0, visibleCount);
  const remaining = GALLERY_PHOTOS.length - visibleCount;

  const step = useCallback((delta: number) => {
    setLightbox((current) =>
      current === null
        ? current
        : (current + delta + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length,
    );
  }, []);

  // Same overlay contract as MenuSearch: Escape closes, the page behind stops
  // scrolling, and both are undone on unmount so a closed lightbox never
  // leaves the body locked.
  useEffect(() => {
    if (lightbox === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [lightbox, step]);

  const active = lightbox === null ? null : GALLERY_PHOTOS[lightbox];

  return (
    <section
      id="photos"
      className="relative flex w-full justify-center overflow-hidden bg-cream-50 px-5 py-12 md:px-16 md:py-20"
    >
      {/* A warm wash off the top edge, so the section lifts away from the solid
          maroon Catering banner immediately above it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#F8E1D3] to-transparent"
      />

      <div className="relative flex w-full max-w-[1200px] flex-col items-center gap-6 md:gap-9">
        <div className="flex max-w-[620px] flex-col items-center gap-3 text-center md:gap-4">
          <span className="text-sm font-bold tracking-[0.16em] text-orange-500 uppercase md:text-[15px] md:tracking-[0.18em]">
            Photos
          </span>
          <h2 className="font-display text-3xl leading-snug font-bold text-maroon-800 sm:text-4xl lg:text-5xl">
            Straight From Our Kitchen
          </h2>
          <p className="text-base text-ink-600 md:text-lg">
            {GALLERY_PHOTOS.length} shots of the dosas, biryanis, curries and
            tandoori plates we serve in Aspley.
          </p>
        </div>

        <ul className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {shown.map((photo, i) => (
            <li key={photo.src}>
              <button
                type="button"
                onClick={() => setLightbox(i)}
                aria-label={`View ${photo.label} larger`}
                className="group relative block aspect-square w-full cursor-pointer overflow-hidden rounded-2xl border border-maroon-800/12 bg-cream-100 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              >
                <Image
                  src={photo.src}
                  alt={photo.label}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                {/* Caption rides on a maroon scrim so it stays readable over a
                    bright plate as well as a dark one. */}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-maroon-950/85 to-transparent px-3 pt-8 pb-2.5 text-left text-[13px] leading-snug font-bold text-cream-0 md:text-sm">
                  {photo.label}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {remaining > 0 && (
          <button
            type="button"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + ROW_STEP, GALLERY_PHOTOS.length),
              )
            }
            className="font-heading min-h-[44px] rounded-full border border-maroon-800/25 px-7 py-3 text-base font-bold tracking-wider text-maroon-700 uppercase transition-colors hover:border-orange-500 hover:text-orange-500"
          >
            See more
            <span className="ml-2 font-normal normal-case text-ink-600">
              {remaining} left
            </span>
          </button>
        )}
      </div>

      {active && lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.label}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-maroon-950/95 px-4 py-6 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close photo"
            className="absolute top-4 right-4 flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-full border border-cream-0/30 text-cream-0 transition-colors hover:bg-cream-0/10"
          >
            <CloseIcon size={18} />
          </button>

          {/* Stop the backdrop's close handler firing when the picture itself
              or an arrow is clicked. */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-[min(90vw,60rem)] flex-1 items-center justify-center"
          >
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-0 z-10 flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-full border border-cream-0/30 bg-maroon-950/60 text-2xl leading-none text-cream-0 transition-colors hover:bg-cream-0/15 sm:-left-14"
            >
              &#8249;
            </button>

            <Image
              key={active.src}
              src={active.src}
              alt={active.label}
              width={1200}
              height={1200}
              sizes="(max-width: 1024px) 90vw, 60rem"
              className="max-h-[75vh] w-auto rounded-2xl object-contain"
            />

            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-0 z-10 flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-full border border-cream-0/30 bg-maroon-950/60 text-2xl leading-none text-cream-0 transition-colors hover:bg-cream-0/15 sm:-right-14"
            >
              &#8250;
            </button>
          </div>

          <p className="font-display shrink-0 text-center text-xl font-semibold text-cream-0 md:text-2xl">
            {active.label}
            <span className="mt-1 block text-sm font-normal tracking-wide text-cream-50/60">
              {lightbox + 1} of {GALLERY_PHOTOS.length}
            </span>
          </p>
        </div>
      )}
    </section>
  );
}
