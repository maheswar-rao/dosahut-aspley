import type { Metadata } from "next";
import Image from "next/image";
import VipBenefits from "@/components/vip/VipBenefits";
import VipJoinFlow from "@/components/vip/VipJoinFlow";
import { REWARDS } from "@/lib/vip/gifts";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "VIP Club — Dosa Hut Aspley",
  description:
    "Join the Dosa Hut Aspley VIP Club. Register in seconds, verify your details and scratch your welcome gift.",
};

export default function VipPage() {
  return (
    <main className="min-h-dvh bg-cream-50">
      <section className="bg-maroon-900 px-5 py-10 text-center text-cream-0">
        {/* Visitors arrive here by scanning the in-store poster, so the first
            thing on screen has to be the same mark they just scanned from.
            The logo replaces what used to be the restaurant's name in text. */}
        <Image
          src="/images/logo.png"
          alt={SITE.name}
          width={816}
          height={426}
          className="mx-auto h-20 w-auto sm:h-24"
          priority
        />
        <h1 className="mt-6 font-display text-4xl leading-tight sm:text-5xl">
          Join the VIP Club
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-cream-200">
          Register in seconds, verify your details, and scratch your welcome
          gift. Members hear about specials first.
        </p>
      </section>

      <section className="px-5 py-10">
        <VipJoinFlow />
      </section>

      <section className="px-5 pb-10">
        <VipBenefits />
      </section>

      <section className="px-5 pb-16">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-cream-100 px-6 py-6">
          <h2 className="font-heading text-sm uppercase tracking-widest text-maroon-900">
            What you could win
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-600">
            {REWARDS.map((reward) => (
              <li key={reward.type}>
                <strong className="text-ink-900">{reward.label}</strong> —{" "}
                {reward.detail}
              </li>
            ))}
          </ul>
          {/* Placeholder prizes pending owner sign-off (Girish, 2026-09-14). */}
          <p className="mt-4 text-xs text-ink-600">
            Offers subject to confirmation. One welcome gift per mobile number.
          </p>
        </div>
      </section>
    </main>
  );
}
