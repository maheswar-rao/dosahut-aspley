/**
 * Why someone should hand over their number. Sits between the sign-up form and
 * the prize list, which is where the hesitation actually happens.
 */
const BENEFITS = [
  {
    icon: "🎁",
    title: "Instant Scratch Reward",
    body: "Get a free welcome gift or instant discount right after joining.",
  },
  {
    icon: "🔥",
    title: "Exclusive Member Deals",
    body: "Direct updates on limited-time discounts and festive offers.",
  },
  {
    icon: "📱",
    title: "VIP Priority",
    body: "Be the first to hear about special chef specials and weekend events.",
  },
];

export default function VipBenefits() {
  return (
    // Narrow as the form on a phone; wide enough for three columns from the
    // small breakpoint up, so the cards never squeeze into unreadable slivers.
    <section
      aria-labelledby="vip-benefits-heading"
      className="mx-auto w-full max-w-md sm:max-w-3xl"
    >
      <h2
        id="vip-benefits-heading"
        className="text-center font-heading text-sm uppercase tracking-widest text-maroon-900"
      >
        Why join the VIP Club
      </h2>

      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {BENEFITS.map((benefit) => (
          <li
            key={benefit.title}
            className="rounded-2xl border border-maroon-900/10 bg-maroon-900/[0.04] px-5 py-5"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/12 text-lg"
            >
              {benefit.icon}
            </span>
            <h3 className="mt-3 font-heading text-base uppercase tracking-wide text-maroon-900">
              {benefit.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
              {benefit.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
