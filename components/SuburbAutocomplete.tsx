"use client";

import { useId, useMemo, useRef, useState } from "react";
import { QLD_SUBURBS, QLD_SUBURBS_LOWER } from "@/lib/qld-suburbs";
import { cx } from "@/lib/cx";

const MAX_SUGGESTIONS = 6;

/**
 * A text input with a dropdown of matching Queensland suburbs suggested as
 * the customer types — "starts with" matches first, then "contains"
 * matches, so typing "spring" surfaces Springfield/Springwood before
 * Kedron falls in via a mid-word match. Fully keyboard-operable (Arrow
 * keys + Enter + Escape), matching the combobox/listbox ARIA roles it
 * declares.
 */
export function SuburbAutocomplete({
  value,
  onChange,
  className,
  placeholder,
  autoComplete = "address-level2",
}: {
  value: string;
  onChange: (value: string) => void;
  className: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return [];

    const startsWith: string[] = [];
    const contains: string[] = [];
    for (let i = 0; i < QLD_SUBURBS.length; i++) {
      const lower = QLD_SUBURBS_LOWER[i];
      if (lower.startsWith(query)) {
        startsWith.push(QLD_SUBURBS[i]);
        if (startsWith.length >= MAX_SUGGESTIONS) break;
      } else if (contains.length < MAX_SUGGESTIONS && lower.includes(query)) {
        contains.push(QLD_SUBURBS[i]);
      }
    }
    return [...startsWith, ...contains].slice(0, MAX_SUGGESTIONS);
  }, [value]);

  const showDropdown = open && suggestions.length > 0;
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  // The single place that closes the dropdown — every close path (Escape,
  // blur, click-outside, selecting an option) goes through this so `open`
  // and `activeIndex` can't drift out of sync with each other again.
  function closeDropdown() {
    setOpen(false);
    setActiveIndex(-1);
  }

  function selectSuburb(suburb: string) {
    onChange(suburb);
    closeDropdown();
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(e) => {
        // A click on a suggestion button fires mousedown-preventDefault
        // first (below), which keeps focus on the input — so a real blur
        // here only happens for an actual focus change (Tab, clicking
        // something else entirely), and relatedTarget still inside this
        // container (moving focus to a suggestion via some other means)
        // shouldn't close it either.
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          closeDropdown();
        }
      }}
    >
      <input
        type="text"
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            closeDropdown();
            return;
          }
          if (!showDropdown) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            // From "nothing highlighted" (-1), ArrowUp stays at "nothing
            // highlighted" rather than jumping to the first item — only
            // ArrowDown should be the one to enter the list from outside it.
            setActiveIndex((i) => (i <= 0 ? -1 : i - 1));
          } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            selectSuburb(suggestions[activeIndex]);
          }
        }}
        className={cx("w-full", className)}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
      />
      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-maroon-800/20 bg-cream-0 py-1.5 text-left shadow-[0_16px_32px_-16px_rgba(58,13,13,0.4)]"
        >
          {suggestions.map((suburb, index) => (
            <li key={suburb} id={optionId(index)} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectSuburb(suburb)}
                className={cx(
                  "block w-full px-4 py-2 text-left text-base text-ink-900",
                  index === activeIndex && "bg-orange-50",
                )}
              >
                {suburb}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
