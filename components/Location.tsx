import { Button } from "./Button";
import { PrimaryGlowButton } from "./PrimaryGlowButton";
import { ChevronRightIcon, ClockIcon, PhoneIcon, PinIcon } from "./Icons";
import { LocationMap } from "./LocationMap";
import { HOURS, SITE } from "@/lib/site";

export function Location() {
  return (
    <section id="location" className="flex w-full justify-center bg-cream-100 px-5 py-10 md:px-16 md:py-16">
      <div className="grid w-full max-w-[1200px] grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14">
        <div className="flex flex-col gap-6 md:gap-6.5">
          <div className="flex flex-col gap-3 md:gap-4">
            <span className="text-sm font-bold tracking-[0.16em] text-orange-500 uppercase md:text-[15px] md:tracking-[0.18em]">
              Visit Us
            </span>
            <h2 className="font-display text-3xl leading-snug font-bold sm:text-4xl lg:text-5xl text-maroon-800">
              Dosa Hut Aspley
            </h2>
          </div>

          <a
            href={SITE.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2.5 md:gap-3.5"
          >
            <PinIcon size={18} color="#E8622C" className="mt-0.5 shrink-0" />
            <span className="text-[17px] leading-relaxed text-ink-900 md:text-[19px]">
              {SITE.addressLine1}, {SITE.addressLine2}
            </span>
          </a>

          <a href={SITE.phoneHref} className="flex items-center gap-2.5 md:gap-3.5">
            <PhoneIcon size={18} color="#E8622C" className="shrink-0" />
            <span className="text-[17px] text-ink-900 md:text-[19px]">{SITE.phoneDisplay}</span>
          </a>

          <div className="rounded-2xl border border-maroon-800/10 bg-cream-0 px-5.5 py-5 md:px-6.5">
            <div className="mb-1.5 flex items-center gap-2.5">
              <ClockIcon size={17} color="#3A0D0D" />
              <span className="text-base font-bold text-maroon-800">Opening Hours</span>
            </div>
            {HOURS.map((row, i) => (
              <div
                key={row.day}
                className={`flex justify-between py-3 text-base ${
                  i < HOURS.length - 1 ? "border-b border-maroon-800/10" : ""
                }`}
              >
                <span className="text-ink-600">{row.day}</span>
                <span className="font-semibold">{row.time}</span>
              </div>
            ))}
          </div>

          <div className="mt-1 flex flex-col gap-3.5 sm:flex-row sm:items-center md:mt-2">
            <Button href={SITE.directionsUrl} variant="outline-dark" size="md" full className="sm:w-auto">
              GET DIRECTIONS
              <ChevronRightIcon size={15} />
            </Button>
            <PrimaryGlowButton href={SITE.orderUrl} full className="sm:w-auto">
              ORDER ONLINE
            </PrimaryGlowButton>
          </div>
        </div>

        <LocationMap />
      </div>
    </section>
  );
}
