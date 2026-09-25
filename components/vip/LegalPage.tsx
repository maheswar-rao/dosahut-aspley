import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";

export type LegalSection = {
  heading: string;
  /** Each entry is one paragraph. Lists are passed as `bullets` instead. */
  body?: string[];
  bullets?: string[];
};

/**
 * Shared shell for the VIP Club's Terms and Privacy pages.
 *
 * Both open in a new tab from the consent checkbox, so each has to stand on
 * its own: the same lockup, its own heading, and a numbered SECTIONS array
 * rendered here rather than repeated in both files.
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-dvh bg-cream-50">
      <header className="bg-maroon-900 px-5 py-8 text-center text-cream-0">
        <BrandLockup className="mx-auto" />
        <h1 className="font-display mt-6 text-3xl leading-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-xs tracking-widest text-cream-200 uppercase">
          Last updated {updated}
        </p>
      </header>

      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <p className="text-base leading-relaxed text-ink-600">{intro}</p>

        <ol className="mt-8 space-y-8">
          {sections.map((section, i) => (
            <li key={section.heading}>
              <h2 className="font-heading text-base tracking-wide text-maroon-900 uppercase">
                <span className="text-orange-500">{i + 1}.</span>{" "}
                {section.heading}
              </h2>
              {section.body?.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="mt-2.5 text-[15px] leading-relaxed text-ink-600"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-2.5 space-y-1.5">
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet.slice(0, 40)}
                      className="flex gap-2.5 text-[15px] leading-relaxed text-ink-600"
                    >
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-orange-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-10 border-t border-maroon-900/10 pt-6">
          <Link
            href="/vip"
            className="font-heading inline-flex min-h-[44px] items-center text-sm tracking-wide text-maroon-700 uppercase underline underline-offset-4 hover:text-orange-500"
          >
            Back to the VIP Club
          </Link>
        </div>
      </div>
    </main>
  );
}

export default LegalPage;
