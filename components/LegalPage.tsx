import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "./Footer";

/**
 * Shared shell for the Scratchy Tuesday legal pages (Terms & Conditions,
 * Privacy Policy). Deliberately plain on the content itself — a legal page
 * is meant to be read, not sold, so no photography or gold treatment here
 * even though the rest of the promo leans into that. The maroon header
 * band and Footer keep it recognisably part of the same site.
 */
export function LegalPage({
  eyebrow,
  title,
  lastUpdated,
  children,
}: {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-cream-50 via-cream-100 to-cream-200">
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

      <div className="flex w-full flex-1 flex-col items-center px-5 py-14">
        <article className="flex w-full max-w-2xl flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold tracking-[0.2em] text-orange-600 uppercase">
              {eyebrow}
            </span>
            <h1 className="font-display text-4xl font-bold text-maroon-900 sm:text-5xl">
              {title}
            </h1>
            <span className="text-sm text-ink-600/70">Last updated: {lastUpdated}</span>
          </div>

          <div className="flex flex-col gap-8 text-left leading-relaxed text-ink-900 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-maroon-800 [&_li]:ml-5 [&_li]:list-disc [&_p]:text-ink-700 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
            {children}
          </div>

          <Link
            href="/scratchy-tuesday"
            className="text-sm font-semibold text-maroon-800/70 underline underline-offset-4 hover:text-maroon-800"
          >
            ← Back to Scratchy Tuesday
          </Link>
        </article>
      </div>

      <Footer />
    </main>
  );
}
