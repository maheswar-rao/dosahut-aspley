import { REWARDS } from "@/lib/vip/gifts";

/**
 * The welcome gifts on offer, as cards.
 *
 * Still driven entirely by REWARDS in lib/vip/gifts.ts — the same array the
 * scratch card draws from — so what a visitor is shown here cannot drift from
 * what they can actually win. Only presentation lives in this file: the icon
 * and the running order, both keyed by reward `type` rather than by label, so
 * renaming a reward for the owner's sign-off does not silently drop its icon.
 *
 * Deliberately a server component. lib/vip/gifts.ts imports node:crypto for
 * code generation, so marking this "use client" would drag that into the
 * browser bundle and fail the build.
 */
const ICONS: Record<string, string> = {
  mango_lassi: "🥭",
  "10_percent_off": "🏷️",
  free_gulab_jamun: "🍩",
  "5_dollar_off": "💰",
};

/** Display order, independent of the draw weights in gifts.ts. */
const ORDER = ["mango_lassi", "10_percent_off", "free_gulab_jamun", "5_dollar_off"];

const ordered = [...REWARDS].sort(
  (a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type),
);

export function VipRewardCards() {
  return (
    <section
      aria-labelledby="vip-rewards-heading"
      className="mx-auto w-full max-w-md sm:max-w-3xl lg:max-w-5xl"
    >
      <h2
        id="vip-rewards-heading"
        className="font-heading text-center text-sm tracking-widest text-maroon-900 uppercase"
      >
        What you could win
      </h2>

      <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {ordered.map((reward) => (
          <li
            key={reward.type}
            className="flex flex-col items-center rounded-2xl border border-maroon-900/10 bg-cream-0 px-5 py-6 text-center shadow-sm transition-shadow hover:shadow-md"
          >
            <span
              aria-hidden
              className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/12 text-2xl"
            >
              {ICONS[reward.type] ?? "🎁"}
            </span>

            <h3 className="font-display mt-4 text-xl leading-snug font-bold text-maroon-900">
              {reward.label}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
              {reward.detail}
            </p>

            {/* mt-auto on the wrapper, not the pill: the pill keeps its own
                even padding while the card pushes it to the bottom edge,
                whatever the copy above does to the card's height. */}
            <div className="mt-auto pt-4">
              <span className="font-heading inline-flex items-center gap-1.5 rounded-full bg-maroon-900 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-cream-0 uppercase">
                <span aria-hidden>✦</span> Instant Scratch Reward
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Placeholder prizes pending owner sign-off (Girish, 2026-09-14). */}
      <p className="mt-5 text-center text-xs text-ink-600">
        Offers subject to confirmation. One welcome gift per mobile number.
      </p>
    </section>
  );
}

export default VipRewardCards;
