"use client";

import { useCallback, useEffect, useRef, useState } from "react";
// One sequence for every width this component runs at. A clip hands over just
// before its playable end; the fallback timer is only reached if that never
// happens — a stalled or blocked load — so the hero cannot freeze on a frame.
// Both clips ship exactly as supplied — no re-encode, so no generation loss.
// endTrimMs stops playback that far before the real end instead of cutting the
// file, which is how the closing banner is avoided without touching the asset.
const CLIPS = [
  {
    src: "/videos/Lark20260910-153613.mp4",
    endTrimMs: 2000,
    fallbackMs: 21000,
  },
  { src: "/videos/Lark20260910-153609.mp4", endTrimMs: 0, fallbackMs: 20000 },
];

// A long, gentle dissolve rather than a cut.
const CROSSFADE_MS = 2000;
// How early the next clip starts. Kept short so the outgoing clip plays out
// almost to its final frame; the dissolve then carries on over the top of it.
const HANDOVER_LEAD_MS = 300;
// How long after a clip starts before the next one begins downloading.
const PRELOAD_NEXT_MS = 2500;


/**
 * The hero background at every width: the clips play full-bleed, one after
 * another, looping back to the first.
 */
export function HeroVideo() {
  const [step, setStep] = useState(0);
  // A clip stays fully transparent until it reports that it is actually
  // playing. While it buffers — or if autoplay is refused outright — there is
  // nothing on screen for the browser to paint its start-playback button over,
  // whatever the CSS does. The flag is never cleared: once a clip has played,
  // returning to it should not blank the hero again.
  const [hasPlayed, setHasPlayed] = useState<boolean[]>(() => CLIPS.map(() => false));

  const markPlaying = useCallback((i: number) => {
    setHasPlayed((prev) =>
      prev[i] ? prev : prev.map((played, idx) => (idx === i ? true : played)),
    );
  }, []);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const stepRef = useRef(0);

  // `timeupdate` fires several times a second, so the handover window below
  // can be hit more than once. Without this guard each hit queues another
  // step increment and the sequence skips straight past the next clip.
  const advancedFromRef = useRef(-1);

  const advance = useCallback((from: number) => {
    if (advancedFromRef.current === from) return;
    advancedFromRef.current = from;
    setStep((prev) => (prev + 1) % CLIPS.length);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => advance(step), CLIPS[step].fallbackMs);
    return () => clearTimeout(id);
  }, [step, advance]);

  // Hand over just before the clip ends rather than waiting for `ended`, so
  // the dissolve is already under way as the last frames play out.
  function handleTimeUpdate(
    e: React.SyntheticEvent<HTMLVideoElement>,
    i: number,
  ) {
    if (i !== step) return;
    const v = e.currentTarget;
    if (!v.duration || Number.isNaN(v.duration)) return;
    const playableEnd = v.duration - CLIPS[i].endTrimMs / 1000;
    if (v.currentTime >= playableEnd - HANDOVER_LEAD_MS / 1000) advance(i);
  }

  // Only the visible clip plays. Decoding both at once is what makes a video
  // hero stutter on an older phone.
  useEffect(() => {
    stepRef.current = step;
    const active = refs.current[step];
    if (active) {
      active.currentTime = 0;
      // Autoplay can be refused (a stalled buffer, a browser policy, a data
      // saver). Retrying once the element reports it can play covers the
      // common case where the first attempt simply came too early.
      const attempt = () => active.play().catch(() => {});
      attempt();
      active.addEventListener("canplay", attempt, { once: true });
    }
    // The outgoing clip is left running until the fade is over; pausing it
    // straight away is what makes a cross-fade look like a freeze.
    const pauseId = setTimeout(() => {
      refs.current.forEach((v, i) => {
        if (v && i !== step) v.pause();
      });
    }, CROSSFADE_MS);

    // The next clip is fetched a few seconds in rather than up front, so the
    // first paint competes with one download instead of two — but early
    // enough that it is buffered long before the dissolve needs it.
    const preloadId = setTimeout(() => {
      const next = refs.current[(step + 1) % CLIPS.length];
      if (next && next.preload !== "auto") {
        next.preload = "auto";
        next.load();
      }
    }, PRELOAD_NEXT_MS);

    return () => {
      clearTimeout(pauseId);
      clearTimeout(preloadId);
    };
  }, [step]);

  useEffect(() => {
    refs.current.forEach((v) => {
      if (!v) return;
      // Set on the element as well as in JSX: older iOS Safari reads
      // webkit-playsinline, and the muted *property* is honoured where the
      // attribute alone is sometimes not. defaultMuted is what writes the
      // muted *content attribute*, which is the one the autoplay policy reads.
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "true");
      v.setAttribute("webkit-playsinline", "true");
      v.removeAttribute("controls");
      // Nothing here is castable, and the AirPlay affordance is another
      // control Safari can paint over a decorative background.
      v.disableRemotePlayback = true;
      v.setAttribute("x-webkit-airplay", "deny");
      v.play().catch(() => {});
    });
  }, []);

  // Last resort: iOS Low Power Mode, desktop data savers and strict autoplay
  // settings all refuse the initial play() outright. A gesture satisfies them,
  // so retry silently rather than showing a play button the visitor has to
  // find.
  //
  // The listeners are deliberately not `once`. A single gesture can arrive
  // while playback is still refused — Low Power Mode is the common case — and
  // a one-shot listener is spent on that attempt, leaving nothing to recover
  // on. play() against an already-playing element resolves without doing
  // anything, so re-arming costs nothing.
  //
  // visibilitychange and pageshow matter for Safari specifically: it pauses
  // media in a backgrounded tab, and restores pages from the back/forward
  // cache in a paused state, in both cases without firing anything the
  // sequencing effect above would hear.
  useEffect(() => {
    function retry() {
      const v = refs.current[stepRef.current];
      if (!v || (!v.paused && !v.ended)) return;
      v.muted = true;
      v.play().catch(() => {});
    }
    function onVisible() {
      if (document.visibilityState === "visible") retry();
    }
    const passive = { passive: true } as const;
    window.addEventListener("touchstart", retry, passive);
    window.addEventListener("scroll", retry, passive);
    window.addEventListener("pointerdown", retry, passive);
    window.addEventListener("keydown", retry);
    window.addEventListener("pageshow", retry);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("touchstart", retry);
      window.removeEventListener("scroll", retry);
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("keydown", retry);
      window.removeEventListener("pageshow", retry);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="relative z-0 h-full w-full overflow-hidden bg-maroon-950"
    >
      {CLIPS.map(({ src }, i) => (
        <video
          key={src}
          ref={(el) => {
            refs.current[i] = el;
          }}
          src={src}
          autoPlay
          muted
          playsInline
          // Present in the served HTML, not only after hydration: older iOS
          // Safari reads this attribute when it first parses the element.
          {...{ "webkit-playsinline": "true" }}
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          {...{ "x-webkit-airplay": "deny" }}
          tabIndex={-1}
          preload={i === 0 ? "auto" : "none"}
          onPlaying={() => markPlaying(i)}
          onEnded={() => advance(i)}
          onTimeUpdate={(e) => handleTimeUpdate(e, i)}
          className={`pointer-events-none transform-gpu absolute inset-0 h-full w-full object-cover transition-opacity duration-[2000ms] ease-in-out will-change-[opacity] ${
            i === step && hasPlayed[i] ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
