// Small, original flat-illustration icons for the rewards showcase — a
// notch more detailed than a line icon or an emoji (multiple shapes, a
// little shading), in the spirit of the polished illustration style used
// on food-delivery marketing pages, drawn from scratch rather than traced
// from anyone else's artwork.

type IconProps = { className?: string };

export function ChaiCupIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <ellipse cx="24" cy="38.5" rx="13" ry="2.2" opacity="0.25" />
      <path d="M14 20h20l-2.1 14.8A4.4 4.4 0 0 1 27.5 38.6h-7a4.4 4.4 0 0 1-4.4-3.8L14 20Z" />
      <path d="M14.6 20h18.8" />
      <path d="M34 23.2c3.8.2 5.8 2.6 5.8 5.3s-2 5.1-5.8 5.3" />
      <path d="M19.5 12.5c0-2.2 2.2-2.2 2.2-4.5M26.5 12.5c0-2.2-2.2-2.2-2.2-4.5" opacity="0.6" />
    </svg>
  );
}

export function GiftBoxIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="9" y="20" width="30" height="18" rx="2" fill="#D9773A" />
      <rect x="9" y="20" width="30" height="6" fill="#B8622A" />
      <rect x="21" y="20" width="6" height="18" fill="#F2B26B" />
      <path
        d="M24 20c-3-6-11-6-9-1s7 1 9 1Zm0 0c3-6 11-6 9-1s-7 1-9 1Z"
        fill="#F2B26B"
      />
    </svg>
  );
}

export function GulabJamunIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* A shallow bowl of syrup with two round jamuns sitting in it — the
          bowl's rim and the two circles are what read as "served sweet"
          rather than two floating balls. */}
      <path d="M8 27c0 6.6 7.2 12 16 12s16-5.4 16-12" />
      <ellipse cx="24" cy="27" rx="16" ry="5.4" />
      <circle cx="19" cy="24.5" r="5.6" fill="currentColor" fillOpacity="0.18" />
      <circle cx="29.5" cy="23" r="6.2" fill="currentColor" fillOpacity="0.28" />
    </svg>
  );
}

export function StarIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden>
      <path d="M10 0 L12 7.5 L20 8.5 L13.5 13 L15.5 20 L10 15.8 L4.5 20 L6.5 13 L0 8.5 L8 7.5 Z" />
    </svg>
  );
}

export function MasalaDosaIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* A long crepe rolled into a tapered crescent on a plate, with a
          spiral drawn into the wide end — the roll shape plus the spiral
          are what make this read as "dosa" rather than any other pastry. */}
      <ellipse cx="24" cy="35" rx="18" ry="3.6" opacity="0.35" />
      <path d="M8 29c0-4.4 3.3-7.6 9-7.6c10 0 22 2.3 22 7.6c0 3.2-3.4 5.2-8 5.2c-13 0-23-1.6-23-5.2Z" />
      <path d="M10.5 29a4.4 4.4 0 0 1 8.8 0" />
      <path d="M12.7 29a2.2 2.2 0 0 1 4.4 0" />
      <path d="M23 26.6c7 .6 13 1.8 13 3.6" opacity="0.6" />
    </svg>
  );
}

export function MangoLassiIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <ellipse cx="24" cy="38.5" rx="11" ry="2.1" opacity="0.25" />
      <path d="M15 17h18l-2.2 19.5A4 4 0 0 1 26.8 40h-5.6a4 4 0 0 1-4-3.5L15 17Z" />
      <path d="M15.6 17h16.8" />
      <path d="M29 9.5c1 2-1 3-1 5" />
      <path d="M28 8.5 L31 32.5" opacity="0.6" />
    </svg>
  );
}

export function SoftDrinkIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <ellipse cx="24" cy="38.5" rx="10" ry="2.1" opacity="0.25" />
      <path d="M16 16h16l-1.8 19a3.6 3.6 0 0 1-3.6 3.2h-5.2a3.6 3.6 0 0 1-3.6-3.2L16 16Z" />
      <path d="M14.5 12.5h19" />
      <path d="M27 8 L29 29" opacity="0.6" />
      <circle cx="20" cy="23" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="23" cy="29" r="0.9" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function SamosaIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <ellipse cx="24" cy="37.5" rx="14" ry="2.3" opacity="0.25" />
      <path d="M24 7 L41 35 L7 35 Z" />
      <path d="M24 7 L34.5 30 M24 7 L13.5 30" opacity="0.5" />
    </svg>
  );
}

export function IdlyIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <ellipse cx="24" cy="35.5" rx="17" ry="2.6" opacity="0.25" />
      <ellipse cx="17.5" cy="28" rx="9" ry="5.8" />
      <ellipse cx="30" cy="26" rx="9" ry="5.8" />
    </svg>
  );
}
