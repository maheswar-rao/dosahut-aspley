type IconProps = {
  className?: string;
  size?: number;
};

export function ArrowRightIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRightIcon({ className, size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MenuIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export function PinIcon({ className, size = 18, color = "currentColor" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 22s7-7.58 7-12.5A7 7 0 0 0 5 9.5C5 14.42 12 22 12 22Z"
        stroke={color}
        strokeWidth={1.8}
      />
      <circle cx="12" cy="9.5" r="2.4" stroke={color} strokeWidth={1.8} />
    </svg>
  );
}

export function PhoneIcon({ className, size = 18, color = "currentColor" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 5c0-1 1-2 2-2h2l2 5-2 1.5a11 11 0 0 0 5.5 5.5L15 13l5 2v2c0 1-1 2-2 2C10.5 19 5 13.5 5 6Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClockIcon({ className, size = 17, color = "currentColor" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.6} />
      <path d="M12 7v5l3.5 2" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

export function LeafIcon({ className, size = 24, color = "currentColor" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 21c9 0 13-5 15-14-9 0-14 4-15 14Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path d="M4 21c0-5 2-8 6-10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

export function FlameIcon({ className, size = 24, color = "currentColor" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2c3 3.5 5 7 5 10a5 5 0 0 1-10 0c0-1.4.6-2.7 1.4-3.8.3 1 1 1.6 1.8 1.6-.4-3 .6-5.6 1.8-7.8Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UtensilsIcon({ className, size = 24, color = "currentColor" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 3v9M6 3c-1.5 0-2.5 1.3-2.5 3S4.5 9 6 9M6 12v9M18 3v18M14 3s-1 1-1 4 1 4 1 4"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DeviceIcon({ className, size = 24, color = "currentColor" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth={1.8} />
      <path d="M9 8h6M9 12h6M9 16h3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

export function FacebookIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function InstagramIcon({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth={1.7} />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={1.7} />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function SearchIcon({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={1.9} />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" />
    </svg>
  );
}
