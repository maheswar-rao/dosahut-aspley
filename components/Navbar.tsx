"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronRightIcon, CloseIcon, MenuIcon, PinIcon, SearchIcon } from "./Icons";
import { MenuSearch } from "./MenuSearch";
import { NAV_LINKS, SITE } from "@/lib/site";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Stop the page behind the full-height drawer from scrolling.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="sticky top-0 z-30 w-full bg-maroon-900">
      {/* Mobile, tablet and iPad: logo, hamburger, location, bag. */}
      <div className="flex items-center gap-3 px-5 py-4 md:gap-4 md:px-10 lg:hidden">
        <a href="#top" className="shrink-0">
          <Image
            src="/images/logo.png"
            alt="Dosa Hut logo"
            width={816}
            height={426}
            className="h-14 w-auto md:h-16"
            priority
          />
        </a>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-cream-50 transition-colors hover:text-peach-400"
        >
          <MenuIcon size={24} />
        </button>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="Search the menu"
          className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center text-cream-50 transition-colors hover:text-peach-400"
        >
          <SearchIcon size={20} />
        </button>

        <a
          href="#location"
          className="font-heading flex shrink-0 items-center gap-2 text-[12.5px] font-bold tracking-[0.08em] text-cream-50 uppercase transition-colors hover:text-peach-400 sm:text-sm md:text-base"
        >
          <PinIcon size={18} />
          Aspley
        </a>
      </div>

      {/* Desktop and laptop: logo left, everything else right. */}
      <div className="hidden items-center justify-between px-8 py-4 lg:flex xl:px-16">
        <a href="#top" className="shrink-0">
          <Image
            src="/images/logo.png"
            alt="Dosa Hut logo"
            width={816}
            height={426}
            className="h-20 w-auto"
            priority
          />
        </a>

        <div className="flex items-center gap-6 xl:gap-8">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search the menu"
            className="font-heading flex min-h-[44px] shrink-0 items-center gap-2 text-[17px] font-semibold tracking-wide text-cream-50 uppercase transition-colors hover:text-peach-400"
          >
            <SearchIcon size={19} />
            Search
          </button>
          {/* Plain anchors — no category dropdowns. */}
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-heading text-[17px] font-semibold tracking-wide text-cream-50 uppercase hover:text-peach-400"
            >
              {link.label}
            </a>
          ))}

          <a
            href="#location"
            className="font-heading flex shrink-0 items-center gap-2 text-[17px] font-semibold tracking-wide text-cream-50 uppercase transition-colors hover:text-peach-400"
          >
            <PinIcon size={18} />
            Aspley
          </a>

          <a
            href={SITE.orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-glow font-heading inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-7 py-3.5 text-lg font-bold tracking-wider uppercase"
          >
            ORDER ONLINE
            <ChevronRightIcon size={13} />
          </a>
        </div>
      </div>

      {searchOpen && <MenuSearch onClose={() => setSearchOpen(false)} />}

      {/* Full-height slide-out drawer */}
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Site menu"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-full flex-col bg-cream-0 shadow-2xl transition-transform duration-300 ease-out sm:max-w-sm lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-end border-b border-maroon-800/10 px-5 py-4">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 items-center justify-center text-maroon-900 transition-colors hover:text-orange-500"
          >
            <CloseIcon size={22} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto bg-cream-100 px-6 py-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-heading text-3xl font-bold tracking-wide text-maroon-900 uppercase transition-colors hover:text-orange-500 sm:text-4xl"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="shrink-0 px-6 py-6">
          <a
            href={SITE.orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="btn-primary-glow font-heading flex min-h-[44px] w-full max-w-full items-center justify-center rounded-md px-5 py-3 text-lg font-bold tracking-wider uppercase sm:px-7 sm:py-3.5 sm:text-xl"
          >
            Order Now
          </a>
        </div>
      </aside>
    </div>
  );
}
