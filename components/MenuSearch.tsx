"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { searchMenu, MENU_ITEMS } from "@/lib/menu";
import { DishCard } from "./DishCard";
import { CloseIcon } from "./Icons";

/**
 * Persistent menu search. Every dish in lib/menu.ts is reachable from here,
 * including categories with no showcase tab of their own — chaats, omelettes,
 * noodles, fried rice, stuffed naan and the seafood curries.
 */
export function MenuSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchMenu(query), [query]);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream-50">
      <div className="flex w-full items-center gap-3 border-b border-maroon-800/10 bg-cream-0 px-4 py-3 md:px-8">
        <label htmlFor="menu-search" className="sr-only">
          Search the menu
        </label>
        <input
          id="menu-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dishes, codes or ingredients — try “spicy chicken”, “paneer”, “E41”"
          className="min-h-[44px] w-full rounded-full border border-maroon-800/20 bg-cream-50 px-5 text-base text-ink-900 outline-none placeholder:text-ink-600/60 focus:border-orange-500 md:text-lg"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-maroon-800 transition-colors hover:bg-cream-100"
        >
          <CloseIcon size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-8">
        {query.trim() === "" ? (
          <p className="mx-auto max-w-2xl py-10 text-center text-base leading-relaxed text-ink-600">
            Search all {MENU_ITEMS.length} dishes by name, item code, spice level or
            ingredient. Every category is indexed — chaats, tandoori, curries,
            biryanis, Indo-Chinese, noodles, fried rice and breads.
          </p>
        ) : results.length === 0 ? (
          <p className="mx-auto max-w-2xl py-10 text-center text-base leading-relaxed text-ink-600">
            Nothing on the menu matches “{query}”. Try a dish name, an item code
            like <span className="font-bold">E41</span>, or an ingredient.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm font-bold tracking-wide text-ink-600 uppercase">
              {results.length} {results.length === 1 ? "dish" : "dishes"}
            </p>
            {/* Phone and tablet stack the results in one column and scroll
                vertically with the panel; the desktop grid is unchanged. */}
            <div className="flex w-full flex-col gap-4 pb-4 lg:grid lg:grid-cols-3 xl:grid-cols-4">
              {results.map((item) => (
                <div key={item.code} className="w-full">
                  <DishCard item={item} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
