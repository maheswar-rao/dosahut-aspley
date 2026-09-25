import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ScratchyTuesdayFlow } from "@/components/ScratchyTuesdayFlow";
import { Footer } from "@/components/Footer";

// QR-only: reachable by anyone with the direct link, but not linked from the
// site's own navigation, and kept out of search results since it isn't a
// page for organic visitors to land on.
export const metadata: Metadata = {
  title: "Scratchy Tuesday",
  description:
    "Scratch your card and reveal your Scratchy Tuesday reward at Dosa Hut Sunshine Coast.",
  alternates: { canonical: "/scratchy-tuesday" },
  robots: { index: false, follow: false },
};

export default function ScratchyTuesdayPage() {
  return (
    // Brand proportions match the live site and the campaign creative: a
    // maroon header band (matching the real navbar) carries the logo — its
    // "INDIAN MULTI CUISINE" ribbon is opaque white and disappears against
    // any light background — while a cream ground carries the rest of the
    // page, with maroon and orange as accents rather than the page's
    // dominant colour.
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-cream-50 via-cream-100 to-cream-200 text-center">
      <div className="flex w-full items-center justify-center bg-maroon-900 px-5 py-5">
        <Link href="/" className="shrink-0">
          <Image
            src="/images/logo.png"
            alt="Dosa Hut logo"
            width={272}
            height={182}
            className="h-16 w-auto md:h-20"
            priority
          />
        </Link>
      </div>

      <div className="flex w-full flex-1 flex-col items-center">
        <ScratchyTuesdayFlow />
      </div>

      <Footer />
    </main>
  );
}
