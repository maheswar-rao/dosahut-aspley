"use client";

import { useState } from "react";
import ScratchCard from "./ScratchCard";
import { SITE } from "@/lib/site";

type Reward = {
  /** What the customer shows at the counter, e.g. LASSI-HKTLMI. */
  code: string;
  /** What staff key in to mark it redeemed. */
  staffCode: string | null;
  label: string;
  detail: string;
};
type Step = "join" | "otp" | "card" | "returning";

/**
 * Mirrors normaliseMobile() in lib/vip/mobile.ts — 04xx xxx xxx,
 * +614xx xxx xxx, 614xx xxx xxx and the bare 4xx form. Kept in step with it
 * deliberately: the server is still the authority, this only saves a round
 * trip for a number that could never pass there.
 */
const AU_MOBILE = /^(?:\+?61|0)?4\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function VipJoinFlow() {
  const [step, setStep] = useState<Step>("join");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  // Where the code actually went, as reported by the sender.
  const [sentTo, setSentTo] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [reward, setReward] = useState<Reward | null>(null);
  const [welcomeBack, setWelcomeBack] = useState<{ name: string; visitCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function post(url: string, body?: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message ?? data.error ?? "Something went wrong.");
    }
    return data;
  }

  /**
   * One form, then the code. Name, mobile and email are all taken up front.
   *
   * The membership check still runs first and still runs on its own: a number
   * we already hold is recognised without a code being sent, which is what
   * keeps customers migrated in from the contact list — who have no email and
   * no reward row — out of a verification they do not need.
   */
  async function submitJoin(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (trimmedName.length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!AU_MOBILE.test(mobile.replace(/[\s()-]/g, ""))) {
      setError("Please enter a valid Australian mobile number, e.g. 0400 000 000.");
      return;
    }
    if (!EMAIL.test(trimmedEmail) || trimmedEmail.length > 255) {
      setError("Please enter a valid email address, e.g. you@example.com.");
      return;
    }
    if (!consent) {
      setError("Please agree to receive offers so we can send you your gift.");
      return;
    }

    setBusy(true);
    try {
      const known = await post("/api/auth/check-phone", { phone: mobile });
      if (known.isExisting) {
        setWelcomeBack(known.member);
        setStep("returning");
        return;
      }

      const data = await post("/api/auth/send-otp", {
        name: trimmedName,
        phone: mobile,
        email: trimmedEmail,
      });
      setSentTo(data.sentTo ?? data.phoneMasked);
      setDevCode(data.devCode ?? null);
      setStep("otp");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = await post("/api/auth/verify-otp", {
        phone: mobile,
        code,
        name,
        email,
      });
      // The reward is issued at verification, so a new member is already
      // holding theirs — scratching only reveals what is already theirs.
      if (data.isExisting) {
        setStep("returning");
      } else {
        setReward(data.reward);
        setStep("card");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl border border-cream-200 bg-cream-0 px-4 py-3 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";
  const primary =
    "w-full rounded-xl bg-orange-500 px-5 py-3 font-heading text-base uppercase tracking-wide text-cream-0 transition hover:bg-orange-600 disabled:opacity-60";

  return (
    <div className="mx-auto w-full max-w-md">
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-maroon-900/10 px-4 py-3 text-sm text-maroon-900"
        >
          {error}
        </p>
      )}

      {/* One form: name, mobile and email together. Email is required —
          it is the only channel the code goes out on. */}
      {step === "join" && (
        <form onSubmit={submitJoin} noValidate className="space-y-4">
          <div>
            <label htmlFor="vip-name" className="mb-1.5 block text-sm font-semibold">
              Full name
            </label>
            <input
              id="vip-name"
              className={field}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label htmlFor="vip-mobile" className="mb-1.5 block text-sm font-semibold">
              Mobile number
            </label>
            {/* The badge is a label, not a value. normaliseMobile() on the
                server takes 400…, 0400…, +61400… and 61400… alike, so nobody
                is punished for typing the 0 they always type. */}
            <div className="flex items-stretch overflow-hidden rounded-xl border border-cream-200 bg-cream-0 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/30">
              <span
                aria-hidden
                className="flex shrink-0 items-center border-r border-cream-200 bg-cream-100 px-3.5 text-base font-semibold text-ink-600"
              >
                +61
              </span>
              <input
                id="vip-mobile"
                className="w-full bg-transparent px-4 py-3 text-base outline-none"
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="400 000 000"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="vip-email" className="mb-1.5 block text-sm font-semibold">
              Email
            </label>
            <input
              id="vip-email"
              className={field}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
            <p className="mt-1.5 text-xs text-ink-600">
              We send your 6-digit verification code here. Already a member?
              We&rsquo;ll recognise your number and skip it.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-600">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-orange-500"
            />
            {/* Both links open in a new tab on purpose: this form holds
                unsaved state, and navigating away to read the terms would
                throw away everything typed so far. */}
            <span>
              By joining, I agree to receive promotional offers from {SITE.name},
              and I accept the{" "}
              <a
                href="/vip/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-maroon-700 underline underline-offset-2 hover:text-orange-500"
              >
                Terms &amp; Conditions
              </a>{" "}
              and{" "}
              <a
                href="/vip/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-maroon-700 underline underline-offset-2 hover:text-orange-500"
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>

          {/* .btn-primary-glow already carries the CTA gradient and its hover
              lift — the same treatment the landing page uses. */}
          <button
            className="btn-primary-glow font-heading w-full rounded-xl px-5 py-3.5 text-base font-bold tracking-wide uppercase disabled:opacity-60"
            disabled={busy}
          >
            {busy ? "Sending code…" : "Join VIP Club & Scratch Now 🎁"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={submitCode} className="space-y-4">
          <p className="text-sm text-ink-600">
            Enter the 6-digit code we emailed to <strong>{sentTo}</strong>.
          </p>
          {devCode && (
            <p className="rounded-xl bg-orange-500/10 px-4 py-3 text-sm">
              Sending is not switched on yet — your test code is{" "}
              <strong className="font-mono">{devCode}</strong>.
            </p>
          )}
          <input
            className={`${field} text-center font-mono text-2xl tracking-[0.4em]`}
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="6-digit verification code"
            required
          />
          <button className={primary} disabled={busy || code.length !== 6}>
            {busy ? "Verifying…" : "Verify"}
          </button>
          <button
            type="button"
            onClick={() => {
              setCode("");
              setError(null);
              setStep("join");
            }}
            className="block w-full text-center text-sm text-ink-600 underline underline-offset-4"
          >
            Use a different number
          </button>
        </form>
      )}

      {step === "card" && (
        <div className="space-y-4 text-center">
          <h2 className="font-display text-3xl text-maroon-900">
            Welcome to the club, {name.split(" ")[0]}!
          </h2>
          <ScratchCard>
            {reward && (
              <>
                <p className="font-heading text-sm uppercase tracking-widest text-orange-600">
                  Your welcome gift
                </p>
                <p className="mt-2 font-display text-3xl text-maroon-900">
                  {reward.label}
                </p>
                <p className="mt-2 text-sm text-ink-600">{reward.detail}</p>
                <p className="mt-4 inline-block rounded-lg bg-cream-100 px-4 py-2 font-mono text-lg tracking-widest">
                  {reward.code}
                </p>
              </>
            )}
          </ScratchCard>
          <p className="text-xs text-ink-600">
            Show this code in store at {SITE.name} to redeem.
          </p>
        </div>
      )}

      {step === "returning" && (
        <div className="space-y-3 rounded-2xl bg-cream-100 px-6 py-8 text-center">
          <h2 className="font-display text-3xl text-maroon-900">
            You&rsquo;re already a VIP member!
          </h2>
          <p className="text-sm text-ink-600">
            {welcomeBack?.name
              ? `Good to see you again, ${welcomeBack.name.split(" ")[0]}. `
              : "Good to see you again. "}
            {/* Deliberately says nothing about the welcome gift: a customer
                carried over from the existing contact list has no reward on
                record, and telling them theirs was "already claimed" would be
                wrong. */}
            Your membership is already active — watch for member-only offers,
            they land with you first.
          </p>
          {welcomeBack && welcomeBack.visitCount > 1 && (
            <p className="text-xs text-ink-600">
              Visit {welcomeBack.visitCount} at {SITE.name}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
