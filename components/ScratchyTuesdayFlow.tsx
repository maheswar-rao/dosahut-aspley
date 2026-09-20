"use client";

import { useState } from "react";
import Image from "next/image";
import { ScratchCard, type Outcome } from "./ScratchCard";
import { PrimaryGlowButton } from "./PrimaryGlowButton";
import { RewardPill } from "./RewardPill";
import { SuburbAutocomplete } from "./SuburbAutocomplete";
import { cx } from "@/lib/cx";
import { EMAIL_REGEX, isValidAuMobileNational } from "@/lib/scratchy-tuesday";
import {
  ChaiCupIcon,
  GiftBoxIcon,
  GulabJamunIcon,
  IdlyIcon,
  MangoLassiIcon,
  MasalaDosaIcon,
  SamosaIcon,
  SoftDrinkIcon,
  StarIcon,
} from "./RewardIcons";
import { SCRATCHY_TUESDAY_REWARDS } from "@/lib/site";

// The reward pool is a short, fixed list now (not an open-ended placeholder
// set), so each one gets its own exact icon rather than a keyword guess.
const REWARD_ICONS: Record<string, (className: string) => React.ReactNode> = {
  "Masala Dosa": (c) => <MasalaDosaIcon className={c} />,
  "Mango Lassi": (c) => <MangoLassiIcon className={c} />,
  Chai: (c) => <ChaiCupIcon className={c} />,
  "Soft Drink": (c) => <SoftDrinkIcon className={c} />,
  Samosa: (c) => <SamosaIcon className={c} />,
  "Gulab Jamun": (c) => <GulabJamunIcon className={c} />,
  Idly: (c) => <IdlyIcon className={c} />,
};

function RewardIcon({ reward, className }: { reward: string; className: string }) {
  const render = REWARD_ICONS[reward];
  return render ? render(className) : <GiftBoxIcon className={className} />;
}

type Stage = "form" | "scratch";

type Details = {
  name: string;
  // National digits only, no leading 0 — e.g. "412345678" — the "+61" is
  // fixed UI chrome, not something the customer types.
  whatsapp: string;
  suburb: string;
  email: string;
};

const EMPTY_DETAILS: Details = {
  name: "",
  whatsapp: "",
  suburb: "",
  email: "",
};

const inputClass =
  "rounded-lg border border-maroon-800/20 bg-cream-0 px-4 py-2.5 text-base text-ink-900 outline-none focus:border-orange-500 lg:px-5 lg:py-3.5 lg:text-lg";
const inputWrapperClass =
  "flex items-center rounded-lg border border-maroon-800/20 bg-cream-0 focus-within:border-orange-500";
const errorClass = "border-red-500";

// Pairs a field's base styling with the red error outline, so the "which
// base class + when to redden it" association lives in one place instead
// of being re-typed at every input.
function fieldClass(base: string, invalid: boolean) {
  return cx(base, invalid && errorClass);
}

/**
 * The Scratchy Tuesday experience: one page explaining the offer with the
 * details form built right into it (no separate click-through step), then
 * the scratch card itself once the form is submitted.
 *
 * The outcome is decided server-side (app/api/scratchy-tuesday/play), keyed
 * by phone number plus today's date in Firestore — so re-submitting the
 * same WhatsApp number on the same Tuesday re-serves the same outcome
 * instead of rolling a fresh one.
 */
export function ScratchyTuesdayFlow() {
  const [stage, setStage] = useState<Stage>("form");
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  // Only turns on once the customer has tried to submit, so an untouched
  // field isn't shown as an error before they've had a chance to fill it in.
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const nameInvalid = attemptedSubmit && !details.name.trim();
  const suburbInvalid = attemptedSubmit && !details.suburb.trim();
  const whatsappInvalid = attemptedSubmit && !isValidAuMobileNational(details.whatsapp);
  const emailInvalid =
    attemptedSubmit && (!details.email.trim() || !EMAIL_REGEX.test(details.email.trim()));
  const termsInvalid = attemptedSubmit && !agreedToTerms;

  // A plain onClick rather than a <form onSubmit>: PrimaryGlowButton's
  // no-href variant always renders type="button", so it wouldn't trigger a
  // native form submission anyway.
  async function handleSubmitDetails() {
    setAttemptedSubmit(true);
    if (!details.name.trim() || !details.suburb.trim() || !details.email.trim()) {
      setFormError("Please fill in all the required fields.");
      return;
    }
    if (!EMAIL_REGEX.test(details.email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!isValidAuMobileNational(details.whatsapp)) {
      setFormError("Please enter a valid Australian mobile number.");
      return;
    }
    if (!agreedToTerms) {
      setFormError("Please agree to the Terms & Conditions and Privacy Policy to continue.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/scratchy-tuesday/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          whatsapp: `+61${details.whatsapp}`,
          termsAccepted: agreedToTerms,
        }),
      });
      let data: { error?: string; outcome?: Outcome; alreadyPlayed?: boolean };
      try {
        data = await response.json();
      } catch {
        setFormError("Something went wrong on our end. Please try again in a moment.");
        return;
      }
      if (!response.ok) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      if (
        !data.outcome ||
        typeof data.outcome.label !== "string" ||
        typeof data.outcome.isWin !== "boolean"
      ) {
        setFormError("Something went wrong on our end. Please try again in a moment.");
        return;
      }
      setOutcome(data.outcome);
      setAlreadyPlayed(data.alreadyPlayed === true);
      setStage("scratch");
    } catch {
      setFormError("Couldn't reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (stage === "form") {
    return (
      <div className="flex w-full flex-col items-center">
        {/* Full-bleed macro hero — one dish, shot close, filling the frame,
            rather than a wide zoomed-out spread of many dishes. */}
        <div className="relative flex min-h-[28rem] w-full items-center justify-center overflow-hidden sm:min-h-[34rem]">
          <Image
            src="/images/dish-butter-chicken.jpg"
            alt="A close-up bowl of creamy butter chicken"
            fill
            priority
            sizes="100vw"
            className="scale-125 object-cover"
            style={{ objectPosition: "50% 40%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-maroon-950/85 via-maroon-950/55 to-maroon-950/95" />

          <div className="relative flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="text-sm font-bold tracking-[0.2em] text-peach-400 uppercase">
              Dosa Hut Sunshine Coast
            </span>
            <h1 className="font-display text-5xl leading-snug font-bold text-cream-0 drop-shadow-sm sm:text-6xl">
              Scratchy Tuesday
            </h1>
            <span className="hero-badge-pulse rounded-full border border-cream-0/40 bg-cream-0/10 px-4 py-1.5 text-sm font-bold tracking-wide text-cream-0 uppercase backdrop-blur-sm">
              Every Tuesday · Dine In. Scan. Scratch. Win.
            </span>
            <p className="max-w-md text-lg leading-relaxed text-cream-50/85">
              Dine in on a Tuesday, spend $40 or more per table, and our
              staff will hand you a QR code for a free scratch card — with
              great odds of winning a treat like mango lassi, samosas, or a
              masala dosa.
            </p>
          </div>
        </div>

        {/* The rest of the page rides up over the hero photo in a rounded
            sheet, so the scroll reads as one continuous surface instead of
            a hard cut between sections. */}
        <div className="relative -mt-10 flex w-full flex-col items-center gap-12 rounded-t-[2.5rem] bg-gradient-to-b from-cream-50 via-cream-100 to-cream-200 px-5 pt-12 pb-12 sm:-mt-14 sm:rounded-t-[3rem] sm:px-8">
          {/* What's up for grabs. A dark card here read oddly stacked right
              under the dark hero — this stays light, matching the sheet
              it sits on, with the gold icon badges doing the "special
              reward" work instead of a dark backdrop. Wider than the rest
              of the page's content (max-w-6xl, not max-w-2xl) so all seven
              rewards can spread across the full width on a desktop screen
              instead of huddling in a narrow column. */}
          <div className="relative w-full max-w-6xl rounded-[28px] border border-orange-500/20 bg-cream-0 px-6 py-10 shadow-[0_20px_45px_-28px_rgba(87,11,11,0.3)] sm:px-10">
            <div className="relative flex flex-col items-center gap-2 text-center">
              <span className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-orange-600 uppercase">
                <StarIcon className="h-3 w-3" />
                What Could You Win?
                <StarIcon className="h-3 w-3" />
              </span>
              <span className="font-display text-3xl font-bold text-maroon-900 sm:text-4xl">
                Great Odds, Great Prizes
              </span>
            </div>

            {/* flex-wrap + justify-center rather than CSS grid: a grid
                leaves a dangling, left-aligned last row whenever the reward
                count doesn't divide evenly into the column count, while
                justify-center on a wrapped flex line centers it instead.
                Each tile gets a real min-width floor (enough for the widest
                current reward-name pill, whitespace-nowrap so it never
                splits mid-word) plus a max-width so a lone tile in an
                incomplete row doesn't stretch oversized — the browser then
                wraps to however many columns actually fit at any viewport
                width or reward count, with no breakpoint-specific arithmetic
                to re-derive if either changes. */}
            <div className="relative mt-8 flex w-full flex-wrap justify-center gap-3">
              {SCRATCHY_TUESDAY_REWARDS.map((reward) => (
                <div
                  key={reward.name}
                  className="flex min-w-[136px] max-w-[200px] flex-1 flex-col items-center gap-2.5 rounded-2xl border border-orange-500/20 bg-cream-50 p-4 text-center"
                >
                  <RewardIcon reward={reward.name} className="h-14 w-14 text-maroon-800" />
                  <RewardPill>{reward.name}</RewardPill>
                </div>
              ))}
            </div>
          </div>

          {/* Details form — built right into this same page rather than a
              separate click-through step. Wider on larger screens (up from
              max-w-md) so it doesn't look shrunk-to-mobile-size on a PC. */}
          <div className="flex w-full max-w-md flex-col items-center gap-6 sm:max-w-xl lg:max-w-2xl">
            <div className="flex flex-col items-center gap-2 text-center">
              <GiftBoxIcon className="h-12 w-12" />
              <h2 className="font-display text-4xl font-bold text-maroon-900">
                Almost there
              </h2>
              <p className="text-base leading-relaxed text-ink-600">
                A few details before your card unlocks — we&rsquo;ll use
                these to run Scratchy Tuesday and to send you offers from
                Dosa Hut Sunshine Coast.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 rounded-3xl border border-orange-500/20 bg-cream-0/90 p-6 text-left shadow-[0_20px_45px_-28px_rgba(87,11,11,0.35)] sm:p-8 lg:p-10">
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-maroon-800">Name *</span>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={details.name}
                    onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
                    className={fieldClass(inputClass, nameInvalid)}
                    placeholder="Your name"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-maroon-800">Home Suburb *</span>
                  <SuburbAutocomplete
                    value={details.suburb}
                    onChange={(suburb) => setDetails((d) => ({ ...d, suburb }))}
                    className={fieldClass(inputClass, suburbInvalid)}
                    placeholder="Buddina"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-maroon-800">
                    WhatsApp Number *
                  </span>
                  <div className={fieldClass(inputWrapperClass, whatsappInvalid)}>
                    {/* Scratchy Tuesday is a dine-in promo for this one
                        Sunshine Coast restaurant, so the country code is
                        fixed to Australia rather than a picker. */}
                    <span className="pl-4 text-base whitespace-nowrap text-ink-600 select-none lg:pl-5 lg:text-lg">
                      🇦🇺 +61
                    </span>
                    <span aria-hidden className="h-6 w-px shrink-0 bg-maroon-800/15" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      required
                      autoComplete="tel-national"
                      value={details.whatsapp}
                      onChange={(e) => {
                        // People naturally paste their number in whatever
                        // form they have it saved — with the country code
                        // ("61412345678"/"+61412345678"), with the local
                        // leading 0 ("0412345678"), or as just the bare
                        // national number — even though this field is only
                        // the part after the fixed "+61" prefix. Strip
                        // whichever redundant prefix is present rather than
                        // blindly truncating from the end.
                        let digits = e.target.value.replace(/\D/g, "");
                        if (digits.startsWith("61") && digits.length > 9) {
                          digits = digits.slice(2);
                        }
                        if (digits.startsWith("0")) digits = digits.slice(1);
                        setDetails((d) => ({ ...d, whatsapp: digits.slice(0, 9) }));
                      }}
                      className="w-full bg-transparent px-2 py-2.5 text-base text-ink-900 outline-none lg:py-3.5 lg:text-lg"
                      placeholder="4XX XXX XXX"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-maroon-800">Email *</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={details.email}
                    onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))}
                    className={fieldClass(inputClass, emailInvalid)}
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              <label className="flex items-start gap-2.5 text-sm text-ink-600">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className={cx(
                    "mt-0.5 h-4 w-4 shrink-0 accent-orange-500",
                    termsInvalid && "outline outline-2 outline-offset-2 outline-red-500",
                  )}
                />
                <span className={termsInvalid ? "text-red-600" : undefined}>
                  By joining, I agree to receive promotional messages from Dosa
                  Hut Sunshine Coast on WhatsApp and accept the{" "}
                  <a
                    href="/scratchy-tuesday/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline underline-offset-2 hover:text-maroon-800"
                  >
                    Terms &amp; Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/scratchy-tuesday/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline underline-offset-2 hover:text-maroon-800"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {formError && (
                <p className="text-sm font-semibold text-orange-600">{formError}</p>
              )}

              <PrimaryGlowButton
                onClick={handleSubmitDetails}
                full
                className="mt-2"
                disabled={submitting}
              >
                {submitting ? "One moment…" : "Reveal My Reward"}
              </PrimaryGlowButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!outcome) return null;

  return (
    <div className="flex w-full flex-col items-center gap-6 bg-gradient-to-b from-cream-50 via-cream-100 to-cream-200 px-5 py-14">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-display text-4xl font-bold text-maroon-900">
          {details.name.trim()
            ? `Thank you, ${details.name.trim().split(" ")[0]}. Here is your Scratchy Tuesday reward.`
            : "Here is your Scratchy Tuesday reward."}
        </h1>
        <p className="max-w-sm text-lg leading-relaxed text-ink-600">
          Please scratch the card below to reveal your outcome. If you win,
          kindly show this screen to a member of our staff to claim it.
        </p>
        {alreadyPlayed && (
          <p className="max-w-sm rounded-xl border border-orange-500/25 bg-orange-50 px-4 py-2 text-sm font-semibold text-maroon-800">
            You&rsquo;ve already played Scratchy Tuesday today — here&rsquo;s your result again.
          </p>
        )}
      </div>
      <ScratchCard outcome={outcome} />
    </div>
  );
}
