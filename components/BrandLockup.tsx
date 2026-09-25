import Image from "next/image";

/**
 * The Dosa Hut wordmark with the branch badge beneath it.
 *
 * Two logo assets ship in this repo and they are not interchangeable:
 *
 *   logo.png                  the full Aspley lockup, branch ribbon already
 *                             set by the designer. Used by the Navbar.
 *   logo-source-dh-star.png   the same wordmark with NO branch ribbon.
 *
 * This component composes the second one with an HTML badge, so the branch
 * name is a string in the codebase rather than baked into a PNG. Rendering
 * logo.png here instead would print the branch name twice.
 *
 * The numbers below are measured off logo-source-dh-star.png itself, not
 * carried over from the other asset — the two have different padding, so a
 * percentage that is correct on one is wrong on the other. In the master, the
 * white "INDIAN MULTI CUISINE" ribbon starts 4.86% in from the left and runs
 * 77.83% of the image width; the badge is matched to that span so the two
 * ribbons stack as one block. Centring the badge instead would read as shifted
 * right, because the star finial overhangs the right edge and drags the
 * geometric centre away from the wordmark.
 */
const RIBBON_LEFT = "4.86%";
const RIBBON_WIDTH = "77.83%";

/** The one place the branch name is set for the lockup. */
const BRANCH_BADGE = "Aspley";

export function BrandLockup({ className = "" }: { className?: string }) {
  return (
    // items-stretch, not items-center: the column takes the image's width, so
    // the badge's percentages below resolve against the lockup rather than
    // against its own text.
    <div className={`inline-flex flex-col items-stretch ${className}`}>
      <Image
        src="/images/logo-source-dh-star.png"
        alt="Dosa Hut — Indian Multi Cuisine"
        width={3866}
        height={1796}
        priority
        // Explicit height, auto width. The badge is a percentage of this
        // element, so the lockup has to settle at its final size in one pass
        // or the badge would resize after paint.
        className="h-16 w-auto sm:h-20"
      />

      {/* The master leaves 11.97% of its height empty below the ribbon — about
          8px at h-16 and 10px at h-20. The negative margin eats that and
          leaves the ~3px gap the designer's own baked ribbon sits at. */}
      <span
        aria-hidden
        style={{ marginLeft: RIBBON_LEFT, width: RIBBON_WIDTH }}
        className="font-heading -mt-[5px] block bg-orange-500 py-[0.28em] text-center text-[0.7rem] leading-none font-bold tracking-[0.3em] text-cream-0 uppercase italic sm:-mt-[7px] sm:text-[0.82rem]"
      >
        {BRANCH_BADGE}
      </span>

      {/* The badge is decorative — the branch name is already in the heading
          and the page title — but the wordmark alone is not the full brand
          name, so the accessible name is assembled here. */}
      <span className="sr-only">Dosa Hut {BRANCH_BADGE}</span>
    </div>
  );
}

export default BrandLockup;
