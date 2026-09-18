import Image from "next/image";
import { STORY_STATS } from "@/lib/site";

export function OurStory() {
  return (
    <section id="our-story" className="flex w-full justify-center px-5 py-10 md:px-16 md:py-16">
      <div className="grid w-full max-w-[1200px] grid-cols-1 items-center gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-12 lg:gap-14">
        <div className="flex flex-col gap-4 md:gap-5">
          <span className="text-sm font-bold tracking-[0.16em] text-orange-500 uppercase md:text-[15px] md:tracking-[0.18em]">
            Our Story
          </span>
          <h2 className="font-display text-3xl leading-snug font-bold sm:text-4xl lg:text-5xl text-maroon-800">
            Authentic Indian Flavours in Aspley
          </h2>
          <p className="text-xl leading-relaxed text-ink-600 lg:text-2xl">
            Founded by Anil Kumar Karpurapu and Praveen Indukuri, Dosa Hut
            started with authentic South Indian staples and has grown into
            Australia&rsquo;s favourite multi-cuisine Indian destination.
          </p>

          <p className="text-xl leading-relaxed text-ink-600 lg:text-2xl">
            Located near Aspley Hypermarket, we bring you 100+ signature dishes
            &mdash; from 90+ varieties of dosas to rich Hyderabadi biryanis
            &mdash; crafted with fresh ingredients and traditional spices.
          </p>

          <div className="mt-2 grid grid-cols-3 gap-4 md:mt-3 md:gap-6">
            {STORY_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="font-display text-4xl font-semibold text-maroon-800 md:text-[46px]">
                  {stat.value}
                </span>
                <span className="text-[15px] leading-snug text-ink-600 md:text-[17px]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="group relative mx-auto h-[320px] w-full overflow-hidden rounded-3xl border border-orange-500/20 shadow-2xl sm:h-[400px] lg:h-[500px] lg:min-h-[480px]">
          <Image
            src="/images/dosa-hut-aspley.webp"
            alt="The Dosa Hut Aspley shopfront at night, its lit Dosa Hut signage above a green hedge wall, timber bench seating and a covered outdoor terrace"
            fill
            sizes="(max-width: 768px) 100vw, 700px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
}
