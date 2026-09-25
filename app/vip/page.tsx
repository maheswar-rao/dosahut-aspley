import type { Metadata } from "next";
import BrandLockup from "@/components/BrandLockup";
import VipBenefits from "@/components/vip/VipBenefits";
import VipJoinFlow from "@/components/vip/VipJoinFlow";
import VipRewardCards from "@/components/vip/VipRewardCards";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Join Aspley VIP Club | ${SITE.name}`,
  description: `Sign up for ${SITE.name} VIP Club to get exclusive rewards, instant gifts, and special offers.`,
};

export default function VipPage() {
  return (
    <main className="min-h-dvh bg-cream-50">
      <section className="bg-maroon-900 px-5 py-10 text-center text-cream-0">
        {/* Visitors arrive here by scanning the in-store poster, so the first
            thing on screen has to be the same mark they just scanned from. */}
        <BrandLockup className="mx-auto" />

        <h1 className="font-display mt-6 text-4xl leading-tight sm:text-5xl">
          Join the VIP Club
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-cream-200">
          Register in seconds, verify your details, and scratch your welcome
          gift. Members hear about specials first.
        </p>
      </section>

      {/* One wrapper for the three stacked blocks below, so their rhythm is
          set once rather than per-section. */}
      <div className="vip-content-wrapper">
        <section className="px-5 py-10">
          <VipJoinFlow />
        </section>

        <section className="px-5 pb-10">
          <VipBenefits />
        </section>

        <section className="px-5 pb-16">
          <VipRewardCards />
        </section>
      </div>
    </main>
  );
}
