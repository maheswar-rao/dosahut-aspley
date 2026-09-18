import Image from "next/image";
import { FacebookIcon, InstagramIcon } from "./Icons";
import { HOURS, SITE } from "@/lib/site";

const EXPLORE_LINKS = [
  { label: "Menu", href: "#menu" },
  { label: "About Us", href: "#why-us" },
  { label: "Our Story", href: "#our-story" },
];

const SOCIALS = [
  { Icon: FacebookIcon, label: "Facebook", href: SITE.facebookUrl },
  { Icon: InstagramIcon, label: "Instagram", href: SITE.instagramUrl },
];

export function Footer() {
  return (
    <footer className="flex w-full flex-col gap-7 bg-maroon-900 px-5 pt-9 pb-6 md:gap-9 md:px-16 md:pt-14 md:pb-7">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-8 text-center md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10 lg:text-left">
        <div className="flex flex-col items-center gap-4 lg:items-start lg:gap-5">
          <Image
            src="/images/logo.png"
            alt="Dosa Hut logo"
            width={816}
            height={426}
            className="h-16 w-auto md:h-20"
          />
          <p className="max-w-[280px] text-base leading-relaxed text-cream-50/60">
            Authentic Indian &amp; multi-cuisine favourites, freshly made
            for Aspley.
          </p>
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            {SOCIALS.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-50/30 text-cream-50 hover:border-cream-50"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <nav className="flex flex-col items-center gap-3.5 lg:items-start">
          <span className="text-base font-extrabold tracking-[0.1em] text-peach-400 uppercase">
            Explore
          </span>
          {EXPLORE_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="text-base font-medium text-cream-50/70 hover:text-cream-50">
              {link.label}
            </a>
          ))}
        </nav>

        <nav className="flex flex-col items-center gap-3.5 lg:items-start">
          <span className="text-base font-extrabold tracking-[0.1em] text-peach-400 uppercase">
            Order
          </span>
          <a href={SITE.orderUrl} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-cream-50/70 hover:text-cream-50">
            Order Online
          </a>
          <a
            href={SITE.cateringUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-medium text-cream-50/70 hover:text-cream-50"
          >
            Catering
          </a>
          <a
            href={SITE.menuPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-medium text-cream-50/70 hover:text-cream-50"
          >
            Download Full Menu (PDF)
          </a>
        </nav>

        <nav className="flex flex-col items-center gap-3.5 lg:items-start">
          <span className="text-base font-extrabold tracking-[0.1em] text-peach-400 uppercase">
            Visit
          </span>
          <span className="text-base font-medium text-cream-50/70">
            {SITE.addressLine1},
            <br />
            {SITE.addressLine2}
          </span>
          <a href={SITE.phoneHref} className="text-base font-medium text-cream-50/70 hover:text-cream-50">
            {SITE.phoneDisplay}
          </a>
          {/* Trading hours, same source as the Location section so the two
              can never drift apart. */}
          <dl className="flex flex-col gap-1.5 text-center lg:text-left">
            {HOURS.map(({ day, time }) => (
              <div key={day} className="flex flex-col gap-0.5">
                <dt className="text-base font-medium text-cream-50/70">{day}</dt>
                <dd className="text-[15px] text-cream-50/45">{time}</dd>
              </div>
            ))}
          </dl>
          <a href={SITE.directionsUrl} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-cream-50/70 hover:text-cream-50">
            Get Directions
          </a>
        </nav>
      </div>

      <div className="mx-auto h-px w-full max-w-[1200px] bg-cream-50/10" />

      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-3 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <span className="text-[15px] text-cream-50/45">
          &copy; {new Date().getFullYear()} Dosa Hut Multi Cuisine Restaurant. All rights reserved.
        </span>
        <div className="flex items-center justify-center gap-7 lg:justify-start">
          <a
            href={SITE.mainSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] font-medium text-cream-50/70 hover:text-cream-50"
          >
            Dosa Hut Australia
          </a>
          <a
            href={SITE.sitemapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] font-medium text-cream-50/70 hover:text-cream-50"
          >
            Sitemap
          </a>
        </div>
      </div>
    </footer>
  );
}
