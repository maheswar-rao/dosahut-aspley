"use client";

import { formatLocalMobile, toLocalMobile } from "@/lib/vip/mobile";

/**
 * Australian mobile input.
 *
 * The +61 is a fixed badge rather than something to type: the branch is on the
 * Sunshine Coast and every member is an Australian mobile, so the country code
 * is never a choice. Showing it also explains what the stored number will look
 * like, which is the format staff see on the redemption screen.
 *
 * Whatever is typed or pasted — 0412 345 678, 412345678, +61 412 345 678 — is
 * reduced to the same nine local digits as it goes in, so the value handed to
 * the parent is already unambiguous. lib/vip/mobile.ts still normalises again
 * on the server; this only saves the customer from wondering whether the zero
 * belongs next to the +61.
 */
export default function PhoneInput({
  id = "vip-mobile",
  value,
  onChange,
  className = "",
  required,
}: {
  id?: string;
  /** The local part, digits only, e.g. 412345678. */
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}) {
  return (
    <div
      className={`flex items-stretch overflow-hidden rounded-xl border border-cream-200 bg-cream-0 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/30 ${className}`}
    >
      <span
        id={`${id}-prefix`}
        className="flex shrink-0 items-center border-r border-cream-200 bg-cream-100 px-3.5 font-medium text-base text-ink-700"
      >
        +61
      </span>
      <input
        id={id}
        // text-base is 16px: anything smaller makes iOS Safari zoom the page
        // on focus, which on a phone reads as the layout breaking.
        className="w-full bg-transparent px-4 py-3 text-base outline-none"
        value={formatLocalMobile(value)}
        onChange={(event) => onChange(toLocalMobile(event.target.value))}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="412 345 678"
        aria-describedby={`${id}-prefix`}
        required={required}
      />
    </div>
  );
}
