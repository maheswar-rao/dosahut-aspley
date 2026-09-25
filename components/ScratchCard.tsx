"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Confetti } from "./Confetti";
import { RewardPill } from "./RewardPill";

// How long the confetti burst plays before it's torn down.
const CONFETTI_MS = 3200;

// Once this fraction of the foil is scratched away, the rest clears
// automatically — nobody should have to scrape every last pixel by hand.
const REVEAL_THRESHOLD = 0.5;
// Sampling every pixel to measure scratched-away area is unnecessary and
// slow; a stride keeps the check cheap without losing accuracy.
const SAMPLE_STRIDE = 4 * 8;
const BRUSH_RADIUS = 26;

export type Outcome = { label: string; isWin: boolean };

/**
 * A scratch-off card: the outcome sits underneath a foil layer drawn on a
 * canvas, which the visitor scratches away with a finger or the mouse.
 *
 * The outcome itself is decided server-side (see
 * app/api/scratchy-tuesday/play) and handed in as a prop — this component is
 * purely the reveal mechanic, it doesn't pick or persist anything.
 */
export function ScratchCard({ outcome }: { outcome: Outcome }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScratchingRef = useRef(false);
  const revealedRef = useRef(false);

  const [revealed, setRevealed] = useState(false);
  const [justRevealed, setJustRevealed] = useState(false);

  const markRevealed = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
    // A confetti burst for a non-winning card would read as mocking, not
    // celebratory — only fire it for an actual win.
    if (outcome.isWin) {
      setJustRevealed(true);
      setTimeout(() => setJustRevealed(false), CONFETTI_MS);
    }
  }, [outcome.isWin]);

  // Paint the foil layer once on mount.
  useEffect(() => {
    if (revealed) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    function draw() {
      const rect = container!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx!.globalCompositeOperation = "source-over";
      const gradient = ctx!.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, "#f79473");
      gradient.addColorStop(1, "#d94e1d");
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, rect.width, rect.height);

      ctx!.fillStyle = "rgba(255, 253, 250, 0.92)";
      ctx!.font = "700 18px Oswald, sans-serif";
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillText("SCRATCH HERE", rect.width / 2, rect.height / 2 - 12);
      ctx!.font = "600 13px Nunito, sans-serif";
      ctx!.fillText("swipe to reveal your reward", rect.width / 2, rect.height / 2 + 14);
    }

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [revealed]);

  function pointFromEvent(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function scratchAt(x: number, y: number) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    measureProgress(ctx, canvas);
  }

  function measureProgress(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    if (canvas.width === 0 || canvas.height === 0) return;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    let sampled = 0;
    for (let i = 3; i < data.length; i += SAMPLE_STRIDE) {
      sampled++;
      if (data[i] === 0) cleared++;
    }
    if (sampled > 0 && cleared / sampled > REVEAL_THRESHOLD) {
      markRevealed();
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (revealedRef.current) return;
    isScratchingRef.current = true;
    const { x, y } = pointFromEvent(e);
    scratchAt(x, y);
  }
  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isScratchingRef.current || revealedRef.current) return;
    const { x, y } = pointFromEvent(e);
    scratchAt(x, y);
  }
  function stopScratching() {
    isScratchingRef.current = false;
  }

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-3xl border border-orange-500/25 bg-cream-0 shadow-[0_28px_60px_-24px_rgba(58,13,13,0.55)]"
    >
      {/* The outcome, always present underneath — the canvas foil on top is
          what actually hides it until scratched. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
        {outcome.isWin ? (
          <>
            <span aria-hidden className="text-3xl">
              🎉
            </span>
            <span className="text-sm font-bold tracking-[0.18em] text-orange-500 uppercase">
              Congratulations, you won
            </span>
            <RewardPill size="lg">{outcome.label}</RewardPill>
          </>
        ) : (
          <>
            <span aria-hidden className="text-3xl">
              🙂
            </span>
            <span className="font-display text-3xl leading-snug font-bold text-maroon-900">
              {outcome.label}
            </span>
            <span className="text-base leading-snug text-ink-600">
              No reward this time — come back next Tuesday for another go.
            </span>
          </>
        )}
      </div>

      {!revealed && (
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Scratch card — scratch to reveal your Scratchy Tuesday outcome"
          className="absolute inset-0 h-full w-full cursor-pointer touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopScratching}
          onPointerLeave={stopScratching}
          onPointerCancel={stopScratching}
        />
      )}

      <Confetti active={justRevealed} />
    </div>
  );
}
