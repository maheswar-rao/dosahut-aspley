"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRightIcon, PinIcon } from "./Icons";
import { SITE } from "@/lib/site";

// A blocked embed is deceptive: the request fails, the frame navigates to the
// browser's own error page, and that error page then fires `load` while
// `error` never fires at all. Trusting `load` is what leaves a blank grey
// panel on screen. So reachability is probed separately — a no-cors request
// rejects when an extension, firewall or offline network blocks the host —
// and the timeout only covers the case where nothing resolves either way.
const LOAD_TIMEOUT_MS = 6000;

export function LocationMap() {
  const [inView, setInView] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [reachable, setReachable] = useState<boolean | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const failed = reachable === false || timedOut;
  const ready = !failed && frameLoaded && reachable === true;
  const loading = !failed && !ready;

  // Mount the iframe only once it is near the viewport, so the embed never
  // competes with above-the-fold work and the timeout below starts counting
  // from the moment loading actually begins.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const controller = new AbortController();
    fetch(SITE.mapEmbedUrl, { mode: "no-cors", signal: controller.signal })
      .then(() => setReachable(true))
      .catch(() => {
        if (!controller.signal.aborted) setReachable(false);
      });
    return () => controller.abort();
  }, [inView]);

  useEffect(() => {
    if (!inView || !loading) return;
    const id = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [inView, loading]);

  return (
    <div
      ref={wrapRef}
      className="relative h-[26.25rem] w-full overflow-hidden rounded-[22px] border border-maroon-800/10 bg-cream-200 shadow-[0_24px_48px_-24px_rgba(58,13,13,0.35)] md:h-[35rem]"
    >
      {inView && !failed && (
        <iframe
          src={SITE.mapEmbedUrl}
          title="Dosa Hut Aspley location map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setFrameLoaded(true)}
          onError={() => setReachable(false)}
          className="absolute inset-0 h-full w-full border-0"
        />
      )}

      {loading && (
        <div
          aria-hidden
          className="absolute inset-0 animate-pulse bg-cream-200"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(58,13,13,0.06) 0 1px, transparent 1px 3.5rem), repeating-linear-gradient(90deg, rgba(58,13,13,0.06) 0 1px, transparent 1px 3.5rem)",
          }}
        >
          <div className="absolute bottom-5 left-5 flex flex-col gap-2">
            <span className="block h-3 w-32 rounded-full bg-maroon-800/10" />
            <span className="block h-3 w-24 rounded-full bg-maroon-800/10" />
          </div>
        </div>
      )}

      {failed && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(58,13,13,0.07) 0 1px, transparent 1px 3.5rem), repeating-linear-gradient(90deg, rgba(58,13,13,0.07) 0 1px, transparent 1px 3.5rem)",
          }}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-0 shadow-[0_10px_24px_-10px_rgba(58,13,13,0.45)]">
            <PinIcon size={24} color="#E8622C" />
          </span>
          <div className="flex flex-col gap-1.5">
            <span className="font-display text-2xl font-bold sm:text-3xl lg:text-4xl text-maroon-900">
              {SITE.name}
            </span>
            <span className="text-base leading-relaxed text-ink-600">
              {SITE.addressLine1}, {SITE.addressLine2}
            </span>
          </div>
          <p className="max-w-[19rem] text-[14.5px] leading-relaxed text-ink-600/80">
            The interactive map couldn&rsquo;t load &mdash; an ad blocker or
            network restriction may be blocking it.
          </p>
          <a
            href={SITE.placeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-maroon-800/25 bg-cream-0 px-5 py-2.5 text-[15px] font-bold tracking-wide text-maroon-800 uppercase transition-colors hover:border-maroon-800"
          >
            Open in Google Maps
            <ChevronRightIcon size={14} />
          </a>
        </div>
      )}
    </div>
  );
}
