"use client";

import { useState } from "react";
import ScratchCard from "./ScratchCard";

type Reward = {
  /** What the customer shows at the counter, e.g. LASSI-HKTLMI. */
  code: string;
  /** What staff key in to mark it redeemed. */
  staffCode: string | null;
  label: string;
  detail: string;
};
type Step = "phone" | "details" | "otp" | "card" | "returning";

export default function VipJoinFlow() {
  const [step, setStep] = useState<Step>("phone");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  // Where the code actually went, as reported by whichever channel sent it.
  const [sentTo, setSentTo] = useState("");
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [reward, setReward] = useState<Reward | null>(null);
  const [welcomeBack, setWelcomeBack] = useState<{ name: string; visitCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
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
   * Step one: is this number already ours? Membership is decided by the member
   * table alone, so customers migrated in from the contact list — who have no
   * email and no reward row — are recognised straight away and asked for
   * nothing further.
   */
  async function submitPhone(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = await post("/api/auth/check-phone", { phone: mobile });
      if (data.isExisting) {
        setWelcomeBack(data.member);
        setStep("returning");
      } else {
        setStep("details");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function submitDetails(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = await post("/api/auth/send-otp", {
        name,
        phone: mobile,
        email,
      });
      setSentTo(data.sentTo ?? data.phoneMasked);
      setChannel(data.channel ?? "email");
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

      {/* Step one asks for the number and nothing else, so a member we already
          hold is never made to fill in details we do not need from them. */}
      {step === "phone" && (
        <form onSubmit={submitPhone} className="space-y-4">
          <div>
            <label htmlFor="vip-mobile" className="mb-1.5 block text-sm font-semibold">
              Mobile number
            </label>
            <input
              id="vip-mobile"
              className={field}
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0400 000 000"
              required
            />
            <p className="mt-1.5 text-xs text-ink-600">
              Already a member? We&rsquo;ll recognise your number straight away.
            </p>
          </div>
          <button className={primary} disabled={busy}>
            {busy ? "Checking…" : "Continue"}
          </button>
        </form>
      )}

      {step === "details" && (
        <form onSubmit={submitDetails} className="space-y-4">
          <p className="rounded-xl bg-cream-100 px-4 py-3 text-sm text-ink-600">
            Great news — you&rsquo;re new here. Just two more details and your
            welcome gift is yours.
          </p>
          <div>
            <label htmlFor="vip-name" className="mb-1.5 block text-sm font-semibold">
              Your name
            </label>
            <input
              id="vip-name"
              className={field}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label htmlFor="vip-mobile-confirm" className="mb-1.5 block text-sm font-semibold">
              Mobile number
            </label>
            <input
              id="vip-mobile-confirm"
              className={`${field} bg-cream-100 text-ink-600`}
              value={mobile}
              type="tel"
              readOnly
            />
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
              We will send a 6-digit verification code to your email/phone.
            </p>
          </div>
          <button className={primary} disabled={busy}>
            {busy ? "Sending code…" : "Join the VIP Club"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={submitCode} className="space-y-4">
          <p className="text-sm text-ink-600">
            Enter the 6-digit code we sent to <strong>{sentTo}</strong>
            {channel === "email" ? " by email." : " on WhatsApp."}
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
              setStep("phone");
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
            Show this code in store at Dosa Hut Aspley to redeem.
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
              Visit {welcomeBack.visitCount} at Dosa Hut Aspley.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
