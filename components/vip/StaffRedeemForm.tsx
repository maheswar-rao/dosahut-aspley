"use client";

import { useRef, useState } from "react";

type Success = {
  label: string;
  detail: string;
  rewardCode: string;
  redeemedAt: string;
};

/**
 * The counter form.
 *
 * Built for someone holding a phone in one hand with a queue in front of them:
 * every control is at least 48px tall, every input is 16px or larger so iOS
 * Safari does not zoom the page on focus, and the result is a full-width block
 * of colour readable at arm's length rather than a line of text.
 */
export default function StaffRedeemForm() {
  const [pin, setPin] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Success | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  // Mirrors sanitiseRewardCode() on the server. The prefix is a word with no
  // digits, so 0 and 1 there are misread O and I and are folded back. The
  // token is left as typed — its alphabet already excludes the ambiguous
  // characters, so there is nothing safe to map a stray one to.
  const cleanCode = (raw: string) => {
    const cleaned = raw.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    const cut = cleaned.lastIndexOf("-");
    if (cut < 0) return cleaned;
    const prefix = cleaned.slice(0, cut).replace(/0/g, "O").replace(/1/g, "I");
    return `${prefix}-${cleaned.slice(cut + 1)}`;
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!/^\d{4}$/.test(pin)) {
      setError("Enter the 4-digit branch PIN.");
      return;
    }
    if (code.trim().length < 4) {
      setError("Enter the reward code from the customer's screen.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/vip/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, rewardCode: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Something went wrong.");
      setResult(data as Success);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  /** Clears the code only. The PIN stays so the next customer is one field. */
  function redeemAnother() {
    setCode("");
    setResult(null);
    setError(null);
    codeRef.current?.focus();
  }

  const field =
    "w-full rounded-xl border border-cream-200 bg-cream-0 px-4 text-lg outline-none min-h-[48px] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";

  if (result) {
    return (
      <div className="space-y-4">
        <div
          role="status"
          className="rounded-2xl bg-green-700 px-5 py-6 text-center text-cream-0"
        >
          <p className="font-heading text-sm tracking-widest uppercase opacity-90">
            Redeemed
          </p>
          <p className="font-display mt-2 text-3xl leading-tight font-bold">
            {result.label}
          </p>
          {result.detail && (
            <p className="mt-1.5 text-sm opacity-90">{result.detail}</p>
          )}
          <p className="mt-4 font-mono text-lg tracking-widest">
            {result.rewardCode}
          </p>
          <p className="mt-2 text-sm opacity-90">{result.redeemedAt}</p>
        </div>

        <button
          type="button"
          onClick={redeemAnother}
          className="font-heading min-h-[48px] w-full rounded-xl bg-maroon-900 px-5 text-base font-bold tracking-wide text-cream-0 uppercase transition hover:bg-maroon-800"
        >
          Redeem another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {error && (
        <p
          role="alert"
          className="rounded-2xl bg-red-700 px-5 py-4 text-center text-base font-semibold text-cream-0"
        >
          {error}
        </p>
      )}

      <div>
        <label htmlFor="staff-pin" className="mb-1.5 block text-sm font-semibold">
          Branch PIN
        </label>
        <input
          id="staff-pin"
          className={`${field} font-mono tracking-[0.4em]`}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          placeholder="••••"
          required
        />
      </div>

      <div>
        <label htmlFor="staff-code" className="mb-1.5 block text-sm font-semibold">
          Reward code
        </label>
        <input
          id="staff-code"
          ref={codeRef}
          className={`${field} font-mono tracking-wider`}
          value={code}
          onChange={(e) => setCode(cleanCode(e.target.value))}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="LASSI-HKTLMN"
          required
        />
        <p className="mt-1.5 text-xs text-ink-600">
          The customer&rsquo;s code or the staff code — either works.
        </p>
      </div>

      <button
        className="font-heading min-h-[48px] w-full rounded-xl bg-orange-500 px-5 text-base font-bold tracking-wide text-cream-0 uppercase transition hover:bg-orange-600 disabled:opacity-60"
        disabled={busy}
      >
        {busy ? "Checking…" : "Redeem"}
      </button>
    </form>
  );
}
