"use client";

import { useMemo, useState } from "react";
import { VISIBLE_MENU_ITEMS, type MenuItem, type SpiceLevel } from "@/lib/menu";
import { DishCard } from "./DishCard";

type DietChoice = "veg" | "non-veg";

const SPICE_ORDER: SpiceLevel[] = ["mild", "medium", "spicy"];

// Cravings are matched against real fields, never invented: each one lists the
// tags and words that actually appear in the dataset for that idea.
const CRAVINGS: { label: string; terms: string[] }[] = [
  { label: "Dosa", terms: ["dosa", "rava_dosa", "uttapam"] },
  { label: "Biryani & Rice", terms: ["biryani", "pulao", "fried_rice", "rice"] },
  { label: "Curry", terms: ["curry", "gravy", "masala"] },
  { label: "Paneer", terms: ["paneer"] },
  { label: "Chicken", terms: ["chicken"] },
  { label: "Goat & Lamb", terms: ["goat", "lamb", "mutton", "keema"] },
  { label: "Seafood", terms: ["seafood", "prawn"] },
  { label: "Egg", terms: ["egg", "omelette"] },
  { label: "Chaat & Snacks", terms: ["chaat", "snack", "street_food"] },
  { label: "Tandoori", terms: ["tandoori", "tandoor", "kebab", "grilled"] },
  { label: "Indo-Chinese", terms: ["indo_chinese", "manchurian", "schezwan", "noodles"] },
  { label: "Creamy", terms: ["creamy", "butter", "malai", "korma"] },
  { label: "Crispy", terms: ["crispy", "fried", "65"] },
];

function haystack(item: MenuItem) {
  return [
    item.name,
    item.category,
    item.description,
    item.dietary_tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function matchesCraving(item: MenuItem, craving: string | null) {
  if (!craving) return true;
  const entry = CRAVINGS.find((c) => c.label === craving);
  if (!entry) return true;
  const hay = haystack(item);
  return entry.terms.some((t) => hay.includes(t));
}

/**
 * The Craving Finder runs on VISIBLE_MENU_ITEMS — every category, including
 * the ones with no showcase tab of their own, minus the dishes flagged
 * `hidden` in lib/menu.ts because they have no photograph yet.
 *
 * The diet filter is absolute: it compares `is_veg` directly and is never
 * relaxed, not even by the fallback below. Spice and craving are preferences
 * and can be widened when a combination has no exact match.
 */
export function FlavorFinder() {
  const [diet, setDiet] = useState<DietChoice | null>(null);
  const [spice, setSpice] = useState<SpiceLevel | null>(null);
  const [craving, setCraving] = useState<string | null>(null);

  // Step 1 is diet, step 2 spice, step 3 the craving. Results appear as soon
  // as a diet and spice are chosen; the craving narrows them further.
  const step = diet === null ? 0 : spice === null ? 1 : 2;

  const dietPool = useMemo(
    () =>
      diet === null
        ? []
        : VISIBLE_MENU_ITEMS.filter((item) =>
            diet === "veg" ? item.is_veg : !item.is_veg,
          ),
    [diet],
  );

  // Only offer spice levels and cravings that this diet actually contains, so
  // no button can lead to an empty screen.
  const spiceOptions = useMemo(
    () => SPICE_ORDER.filter((level) => dietPool.some((i) => i.spice_level === level)),
    [dietPool],
  );

  const cravingOptions = useMemo(
    () =>
      CRAVINGS.filter((c) =>
        dietPool.some(
          (i) =>
            (!spice || i.spice_level === spice) &&
            c.terms.some((t) => haystack(i).includes(t)),
        ),
      ),
    [dietPool, spice],
  );

  const { results, relaxed } = useMemo(() => {
    if (!diet || !spice) return { results: [] as MenuItem[], relaxed: null as string | null };

    const exact = dietPool.filter(
      (i) => i.spice_level === spice && matchesCraving(i, craving),
    );
    if (exact.length) return { results: exact, relaxed: null };

    // Fallback, in order, and never across the diet boundary: drop the
    // craving first, then the spice level.
    const sameSpice = dietPool.filter((i) => i.spice_level === spice);
    if (sameSpice.length) {
      return {
        results: sameSpice,
        relaxed: `Nothing ${spice} matches “${craving}”, so here is everything ${spice} instead.`,
      };
    }
    const sameCraving = dietPool.filter((i) => matchesCraving(i, craving));
    if (sameCraving.length) {
      return {
        results: sameCraving,
        relaxed: `No ${spice} options here, so these are the closest matches at any spice level.`,
      };
    }
    return { results: dietPool, relaxed: "Here is the full selection for your choice." };
  }, [diet, dietPool, spice, craving]);

  function chooseDiet(value: DietChoice) {
    setDiet(value);
    setSpice(null);
    setCraving(null);
  }

  function chooseSpice(level: SpiceLevel) {
    setSpice(level);
    setCraving(null);
  }

  function reset() {
    setDiet(null);
    setSpice(null);
    setCraving(null);
  }

  const pillClass =
    "min-h-[44px] rounded-full border border-maroon-800/20 bg-cream-50 px-6 py-3 text-base font-bold tracking-wide text-maroon-700 uppercase transition-colors hover:border-orange-500 hover:text-orange-500";
  const activePillClass =
    "min-h-[44px] rounded-full border border-orange-500 bg-orange-500 px-6 py-3 text-base font-bold tracking-wide text-cream-0 uppercase transition-colors";

  return (
    <section
      id="craving-finder"
      className="relative flex w-full justify-center overflow-hidden bg-gradient-to-b from-[#FFF8F5] via-[#FDEDE3] to-[#F8E1D3] px-5 py-12 md:px-16 md:py-20"
    >
      {/* Soft dot pattern keeps this section feeling playful and interactive,
          in contrast to the solid dark Catering banner directly below it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: "radial-gradient(rgba(58,13,13,0.10) 1px, transparent 1px)",
          backgroundSize: "1.25rem 1.25rem",
        }}
      />

      <div className="relative flex w-full max-w-[1200px] flex-col items-center gap-6 md:gap-9">
        <div className="mb-10 max-w-[620px] text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight text-maroon-900 md:text-5xl">
            Craving Finder
          </h2>

          <p className="mt-2 text-sm font-bold tracking-widest text-orange-600 uppercase md:text-base">
            Answer a few questions, discover your perfect meal
          </p>

          {/* Reflects the chosen craving once there is one, so the heading keeps
              pace with the filters rather than staying generic. */}
          <h3 className="font-display mt-8 text-2xl font-semibold text-maroon-800 md:text-3xl">
            {craving ? `Discover Your Perfect ${craving}` : "Discover Your Perfect Dish"}
          </h3>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              aria-hidden
              className={`h-2 rounded-full transition-all duration-300 ${
                i <= step ? "w-8 bg-orange-500" : "w-2 bg-maroon-800/15"
              }`}
            />
          ))}
        </div>

        <span className="font-display text-2xl font-bold text-maroon-900 sm:text-3xl lg:text-4xl">
          {step === 0 ? "Veg or Non-Veg?" : step === 1 ? "Spice Level" : "What are you craving?"}
        </span>

        {step === 0 && (
          <div className="flex w-full flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => chooseDiet("veg")} className={pillClass}>
              <span className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="flex h-4 w-4 items-center justify-center rounded-[3px] border border-green-600"
                >
                  <span className="h-2 w-2 rounded-full bg-green-600" />
                </span>
                Vegetarian
              </span>
            </button>
            <button type="button" onClick={() => chooseDiet("non-veg")} className={pillClass}>
              <span className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="flex h-4 w-4 items-center justify-center rounded-[3px] border border-red-600"
                >
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                </span>
                Non-Vegetarian
              </span>
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="flex w-full flex-wrap items-center justify-center gap-3">
            {spiceOptions.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => chooseSpice(level)}
                className={pillClass}
              >
                {level}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex w-full flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setCraving(null)}
              className={craving === null ? activePillClass : pillClass}
            >
              Everything
            </button>
            {cravingOptions.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setCraving(c.label === craving ? null : c.label)}
                className={c.label === craving ? activePillClass : pillClass}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <>
            {relaxed && (
              <p className="max-w-[34rem] text-center text-base leading-relaxed text-ink-600">
                {relaxed}
              </p>
            )}

            <p className="text-sm font-bold tracking-wide text-ink-600 uppercase">
              {results.length} {results.length === 1 ? "dish" : "dishes"}
            </p>

            {/* A snap-scrolling rail at every width, desktop included: a set of
                results can run to twenty-plus dishes, and sideways beats a long
                column on any screen. Card width grows with the viewport so a
                desktop rail shows three or four at a time. */}
            <div className="scrollbar-none -mx-5 flex w-[calc(100%+2.5rem)] snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:-mx-16 md:w-[calc(100%+8rem)] md:px-16">
              {results.map((item) => (
                <div
                  key={item.code}
                  className="w-[85vw] flex-shrink-0 snap-center sm:w-[340px] lg:w-[320px]"
                >
                  <DishCard item={item} />
                </div>
              ))}
            </div>
          </>
        )}

        {step > 0 && (
          <button
            type="button"
            onClick={reset}
            className="min-h-[44px] text-base font-bold tracking-wide text-maroon-700 underline underline-offset-4 hover:text-orange-500"
          >
            Start Over
          </button>
        )}
      </div>
    </section>
  );
}
