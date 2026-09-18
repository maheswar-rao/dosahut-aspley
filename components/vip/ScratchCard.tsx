"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Canvas foil over the prize. Erases under the pointer and auto-reveals once
 * enough has been scratched, so nobody is stuck rubbing the last corner.
 *
 * The foil is not motion-gated — scratching is a control, and per the house
 * rule a control must always work. The Reveal button sits alongside it for
 * keyboard users and anyone who would rather not drag.
 */
export default function ScratchCard({
  onRevealed,
  children,
}: {
  onRevealed?: () => void;
  children: React.ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const drawing = useRef(false);

  const reveal = useCallback(() => {
    setRevealed((already) => {
      if (!already) onRevealed?.();
      return true;
    });
  }, [onRevealed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;

    function paintFoil(width: number, height: number, ctx: CanvasRenderingContext2D) {
      // Banded silver rather than one flat fill — the alternating light and
      // dark bands are what make a surface read as metal. Matches the foil on
      // the printed poster, so the card the customer scans for and the card
      // they scratch are the same object.
      const foil = ctx.createLinearGradient(0, 0, width, height);
      foil.addColorStop(0, "#f4f2f0");
      foil.addColorStop(0.16, "#c8c5c1");
      foil.addColorStop(0.32, "#efedea");
      foil.addColorStop(0.48, "#b6b4b1");
      foil.addColorStop(0.64, "#f7f6f4");
      foil.addColorStop(0.8, "#bdbab6");
      foil.addColorStop(1, "#e0ddd9");
      ctx.fillStyle = foil;
      ctx.fillRect(0, 0, width, height);

      // A single diagonal gloss running bottom-left to top-right, the way
      // light catches a real scratch panel when it is tilted.
      const gloss = ctx.createLinearGradient(0, height, width, 0);
      gloss.addColorStop(0, "rgba(255,255,255,0)");
      gloss.addColorStop(0.4, "rgba(255,255,255,0)");
      gloss.addColorStop(0.48, "rgba(255,255,255,0.72)");
      gloss.addColorStop(0.54, "rgba(255,255,255,0.14)");
      gloss.addColorStop(0.6, "rgba(255,255,255,0)");
      gloss.addColorStop(0.84, "rgba(255,255,255,0)");
      gloss.addColorStop(0.89, "rgba(255,255,255,0.36)");
      gloss.addColorStop(0.94, "rgba(255,255,255,0)");
      ctx.fillStyle = gloss;
      ctx.fillRect(0, 0, width, height);

      // Dark ink now the panel is silver — the old white would disappear.
      ctx.font = "600 15px Nunito, system-ui, sans-serif";
      ctx.fillStyle = "rgba(87,11,11,0.78)";
      ctx.textAlign = "center";
      ctx.fillText("Scratch to reveal your gift", width / 2, height / 2);
    }

    /**
     * Size the bitmap to the element. This has to re-run on resize, not just
     * on mount: a phone rotating, or the gift text arriving and changing the
     * card's height, would otherwise leave the bitmap at its old size — the
     * foil stretches and, worse, the pointer coordinates stop lining up with
     * what the visitor is rubbing. Scratch progress is carried across by
     * redrawing the previous bitmap into the new one.
     */
    function resize(previous?: HTMLCanvasElement) {
      const el = canvasRef.current;
      const ctx = el?.getContext("2d");
      if (!el || !ctx) return;

      const ratio = window.devicePixelRatio || 1;
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      el.width = width * ratio;
      el.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      if (previous && previous.width > 0) {
        ctx.drawImage(previous, 0, 0, width, height);
      } else {
        paintFoil(width, height, ctx);
      }
    }

    resize();

    const observer = new ResizeObserver(() => {
      const el = canvasRef.current;
      if (!el || el.width === 0) return;
      // Keep what has already been scratched off, then re-fit it.
      const snapshot = document.createElement("canvas");
      snapshot.width = el.width;
      snapshot.height = el.height;
      snapshot.getContext("2d")?.drawImage(el, 0, 0);
      resize(snapshot);
    });
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [revealed]);

  const scratchAt = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(event.clientX - rect.left, event.clientY - rect.top, 26, 0, Math.PI * 2);
    ctx.fill();

    // Sample every 16th pixel — cheap enough to run on every pointer move.
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 16) {
      total += 1;
      if (data[i] === 0) clear += 1;
    }
    if (total > 0 && clear / total > 0.45) reveal();
  };

  return (
    <div>
      {/* select-none: when the card reveals mid-rub, a finger still moving
          across the prize would otherwise drag a text selection over it. */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-orange-500/60 bg-cream-0 shadow-lg select-none">
        <div className="px-6 py-12 text-center">{children}</div>

        {!revealed && (
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full touch-none"
            onPointerDown={(event) => {
              drawing.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              scratchAt(event);
            }}
            onPointerMove={(event) => drawing.current && scratchAt(event)}
            onPointerUp={() => (drawing.current = false)}
            onPointerLeave={() => (drawing.current = false)}
          />
        )}
      </div>

      {!revealed && (
        <button
          type="button"
          onClick={reveal}
          className="mx-auto mt-3 block rounded-full px-4 py-1.5 text-sm font-semibold text-maroon-900 underline underline-offset-4"
        >
          Reveal without scratching
        </button>
      )}
    </div>
  );
}
