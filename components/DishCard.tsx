"use client";

import { useState } from "react";
import Image from "next/image";
import type { MenuItem } from "@/lib/menu";
import { SITE } from "@/lib/site";
import { ArrowRightIcon } from "./Icons";

const SPICE_STYLE: Record<MenuItem["spice_level"], string> = {
  mild: "border-green-600/30 bg-green-600/10 text-green-800",
  medium: "border-amber-600/30 bg-amber-500/10 text-amber-800",
  spicy: "border-red-600/30 bg-red-600/10 text-red-700",
};

/**
 * One dish, rendered the same way everywhere it appears.
 *
 * The diet badge is driven straight off `is_veg` — green square for true, red
 * for false — and is never derived from the name or category, which is how
 * dishes get misclassified.
 */
export function DishCard({ item }: { item: MenuItem }) {
  // A path can be present and still fail — a file renamed or removed after the
  // data was written. Falling back on error means a broken URL degrades to the
  // gradient plate instead of a torn-image icon.
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(item.image) && !imageFailed;
  const spice = SPICE_STYLE[item.spice_level] ?? SPICE_STYLE.mild;

  return (
    <article className="relative flex h-full flex-col gap-2.5 rounded-2xl border border-maroon-800/12 bg-cream-0 p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Veg / non-veg mark, top right, in the standard Indian packaging form:
          a coloured dot inside a matching square outline. */}
      <span
        aria-label={item.is_veg ? "Vegetarian" : "Non-vegetarian"}
        title={item.is_veg ? "Vegetarian" : "Non-vegetarian"}
        // z-10 matters: the photo below is position:relative and comes later in
        // the DOM, so without it the image paints straight over this badge.
        // The cream backing keeps the mark readable on top of a photo.
        className={`absolute top-3 right-3 z-10 flex h-5 w-5 items-center justify-center rounded-[4px] border-[1.5px] bg-cream-0 shadow-sm ${
          item.is_veg ? "border-green-600" : "border-red-600"
        }`}
      >
        <span
          aria-hidden
          className={`h-2.5 w-2.5 rounded-full ${item.is_veg ? "bg-green-600" : "bg-red-600"}`}
        />
      </span>

      {/* Photo, or the maroon gradient plate for dishes the kitchen has not
          been photographed yet. Never another dish's picture: a card has to
          show what actually arrives at the table. */}
      {showImage ? (
        <div className="relative -mx-1 -mt-1 h-40 overflow-hidden rounded-xl">
          <Image
            src={item.image as string}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        </div>
      ) : (
        <div className="-mx-1 -mt-1 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-maroon-800 to-maroon-950 px-4 text-center">
          <span className="font-display text-lg leading-snug font-semibold text-cream-50/90">
            {item.name}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1 pr-7">
        <span className="font-heading text-[11px] font-bold tracking-[0.18em] text-orange-600 uppercase">
          {item.code}
        </span>
        <h3 className="font-display text-xl leading-snug font-bold text-maroon-900">
          {item.name}
        </h3>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-maroon-800/15 bg-cream-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-maroon-700 uppercase">
          {item.category}
        </span>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${spice}`}
        >
          {item.spice_level ?? "mild"}
        </span>
      </div>

      {item.description ? (
        <p className="text-sm leading-relaxed text-ink-600">{item.description}</p>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <span className="font-display text-lg font-bold text-maroon-900">
          {item.price ?? "See menu"}
        </span>
        <a
          href={SITE.orderUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Order ${item.name} online`}
          className="btn-primary-glow font-heading inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold tracking-wider uppercase"
        >
          Order Online
          <ArrowRightIcon size={12} />
        </a>
      </div>
    </article>
  );
}
