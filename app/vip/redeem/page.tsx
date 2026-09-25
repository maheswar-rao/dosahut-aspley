import type { Metadata } from "next";
import BrandLockup from "@/components/BrandLockup";
import StaffRedeemForm from "@/components/vip/StaffRedeemForm";
import { SITE } from "@/lib/site";

/**
 * Staff-only. Deliberately not linked from the navbar, the footer or the VIP
 * page — staff reach it by typing the address or from a bookmark on the till.
 * noindex/nofollow keeps it out of search results; it is not a security
 * control, which is what the branch PIN is for.
 */
export const metadata: Metadata = {
  title: `Staff Redemption | ${SITE.name}`,
  robots: { index: false, follow: false },
};

export default function VipRedeemPage() {
  return (
    <main className="min-h-dvh bg-cream-50">
      <header className="bg-maroon-900 px-5 py-8 text-center text-cream-0">
        <BrandLockup className="mx-auto" />
        <h1 className="font-display mt-6 text-3xl leading-tight sm:text-4xl">
          Staff Redemption
        </h1>
        <p className="mt-2 text-sm text-cream-200">
          Mark a customer&rsquo;s VIP welcome gift as used.
        </p>
      </header>

      <div className="mx-auto w-full max-w-md px-5 py-8">
        <StaffRedeemForm />

        <p className="mt-8 text-center text-xs leading-relaxed text-ink-600">
          A gift can be redeemed once. If two tills enter the same code at the
          same moment, only the first is accepted and the second is told it has
          already been used.
        </p>
      </div>
    </main>
  );
}
