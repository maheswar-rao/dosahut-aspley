import { ReactNode } from "react";
import { cx } from "@/lib/cx";

// The gradient "reward name" badge — used for the tiles in "What Could You
// Win?" and for the winning label on the scratch-card reveal. Shared here so
// the two places that need it can't drift out of sync with each other, the
// way <PrimaryGlowButton>'s PRIMARY_GLOW_CLASSES already does for CTAs.
type Size = "sm" | "lg";

const base =
  "rounded-full bg-gradient-to-r from-orange-500 to-orange-600 font-bold leading-snug text-cream-0";

const sizes: Record<Size, string> = {
  sm: "px-3 py-1 text-sm whitespace-nowrap shadow-[0_6px_14px_-6px_rgba(217,78,29,0.6)]",
  // text-3xl unconditionally — the winning-label text this replaces was
  // always text-3xl, at every viewport width, not just sm+.
  lg: "px-4 py-1.5 font-display text-3xl shadow-[0_10px_20px_-8px_rgba(217,78,29,0.65)]",
};

export function RewardPill({
  children,
  size = "sm",
  className = "",
}: {
  children: ReactNode;
  size?: Size;
  className?: string;
}) {
  return <span className={cx(base, sizes[size], className)}>{children}</span>;
}
