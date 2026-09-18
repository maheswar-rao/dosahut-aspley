const ITEMS = [
  "PART OF THE DOSA HUT FAMILY",
  "25+ LOCATIONS ACROSS AUSTRALIA",
  "NOW SERVING ASPLEY",
];

export function TrustStrip() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-1 bg-orange-500 px-6 py-4 text-center md:h-[60px] md:flex-row md:gap-3.5 md:py-0">
      {ITEMS.map((item, i) => (
        <span key={item} className="flex items-center gap-3.5">
          <span className="text-sm font-bold tracking-[0.06em] text-cream-0 md:text-[15.5px] md:tracking-[0.08em]">
            {item}
          </span>
          {i < ITEMS.length - 1 && (
            <span className="hidden h-1.5 w-1.5 rounded-full bg-cream-0/70 md:inline-block" />
          )}
        </span>
      ))}
    </div>
  );
}
