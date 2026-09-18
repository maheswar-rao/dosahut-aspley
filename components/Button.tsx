import Link from "next/link";
import { ReactNode } from "react";

// Primary orange CTAs live in <PrimaryGlowButton>; this component covers the
// secondary, outlined actions.
type Variant = "outline" | "outline-dark";
type Size = "md" | "lg";

const base =
  "inline-flex min-h-[44px] max-w-full items-center justify-center gap-2.5 rounded-full font-bold leading-none tracking-wide transition-colors";

const variants: Record<Variant, string> = {
  outline:
    "bg-transparent text-cream-50 border border-cream-50/50 hover:border-cream-50",
  "outline-dark":
    "bg-transparent text-maroon-800 border border-maroon-800/25 hover:border-maroon-800",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-3 text-base sm:px-6 sm:py-3.5 sm:text-lg lg:px-7",
  lg: "px-5 py-3 text-lg sm:px-7 sm:py-3.5 sm:text-xl lg:px-9",
};

export function Button({
  href,
  variant = "outline-dark",
  size = "lg",
  children,
  className = "",
  external = true,
  full = false,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  external?: boolean;
  full?: boolean;
}) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${full ? "w-full" : ""} ${className}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
