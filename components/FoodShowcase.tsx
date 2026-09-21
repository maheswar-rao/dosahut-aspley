"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "./Button";
import { PrimaryGlowButton } from "./PrimaryGlowButton";
import { DishCarousel } from "./DishCarousel";
import { categorySlug, DISHES, DISH_CATEGORIES, SITE } from "@/lib/site";

export function FoodShowcase() {
  const [active, setActive] = useState<(typeof DISH_CATEGORIES)[number]>(DISH_CATEGORIES[0]);
  // `hidden` dishes have no photograph; showing them would put an empty
  // slot next to cards that all carry one.
  const visibleDishes = DISHES.filter(
    (dish) => dish.category === active && !dish.hidden,
  );

  useEffect(() => {
    function applyHash() {
      const hash = window.location.hash.replace("#menu-", "");
      const match = DISH_CATEGORIES.find((category) => categorySlug(category) === hash);
      if (match) {
        setActive(match);
        document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
      }
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  return (
    <section id="menu" className="flex w-full flex-col items-center gap-6 px-5 py-10 md:gap-9 md:px-16 md:py-16">
      <div className="flex max-w-[620px] flex-col items-center gap-3 text-center md:gap-4">
        <h2 className="font-display text-3xl leading-snug font-bold sm:text-4xl lg:text-5xl text-maroon-800">
          Crowd Pleasers
        </h2>
        <p className="text-base font-semibold tracking-wide text-orange-500 uppercase md:text-lg">
          Must-Try Dishes Handpicked for You
        </p>
      </div>

      <div className="flex w-full items-center gap-2.5 overflow-x-auto pb-1 md:w-auto md:flex-wrap md:justify-center md:overflow-visible">
        {DISH_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`shrink-0 rounded-full border px-4.5 py-2.5 text-[15px] font-bold whitespace-nowrap transition-colors md:px-6 md:py-3 md:text-base ${
              category === active
                ? "border-maroon-800 bg-maroon-800 text-cream-50"
                : "border-maroon-800/20 text-maroon-700 hover:border-maroon-800/40"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div key={active} className="category-enter flex w-full justify-center">
        <DishCarousel dishes={visibleDishes} orderUrl={SITE.orderUrl} />
      </div>

      <div className="flex w-full max-w-[1200px] flex-col items-center gap-4 rounded-3xl border border-orange-500/20 bg-gradient-to-r from-[#FBEADD] to-[#F7DFC9] p-5 md:flex-row md:gap-7 md:rounded-[22px] md:px-7.5 md:py-5.5">
        <div className="flex w-full items-center gap-4">
          <div className="relative h-[92px] w-[72px] shrink-0 overflow-hidden rounded-xl shadow-[0_10px_18px_-10px_rgba(58,13,13,0.4)] md:h-[120px] md:w-24">
            <Image
              src="/images/dish-masala-chai.jpg"
              alt="A glass of steaming masala chai"
              fill
              sizes="120px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display text-xl font-semibold text-maroon-800 md:text-[25.5px]">
              Finish With a Cup of Chai
            </span>
            <p className="text-[15px] leading-snug text-ink-600 md:text-[16.5px]">
              Our signature masala chai &mdash; slow-brewed and served hot, the
              way every good meal at Dosa Hut ends.
            </p>
          </div>
        </div>
        <PrimaryGlowButton href={SITE.orderUrl} full className="md:w-auto md:shrink-0">
          ORDER ONLINE
        </PrimaryGlowButton>
      </div>

      <Button href={SITE.menuPdfUrl} variant="outline-dark" size="md" external>
        DOWNLOAD FULL MENU (PDF)
      </Button>
    </section>
  );
}
