import Link from "next/link";
import { ReactNode } from "react";

/**
 * The single primary call to action for the whole site: the 3D glow treatment
 * from the catering enquiry button, with the shared CTA typography baked in.
 * The visual styling lives in `.btn-primary-glow` (app/globals.css) so the few
 * places that need their own markup — the navbar dropdown trigger, the weekend
 * modal's shine sweep — can share the exact same look.
 */
export const PRIMARY_GLOW_CLASSES =
  "btn-primary-glow inline-flex min-h-[44px] max-w-full items-center justify-center gap-2.5 rounded-full px-5 py-3 text-lg font-bold tracking-wider uppercase sm:px-7 sm:py-3.5 sm:text-xl lg:px-9";

export function PrimaryGlowButton({
  href,
  onClick,
  children,
  className = "",
  external = true,
  full = false,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  external?: boolean;
  full?: boolean;
}) {
  const classes = `${PRIMARY_GLOW_CLASSES} ${full ? "w-full" : ""} ${className}`;

  if (!href) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {children}
      </button>
    );
  }

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
