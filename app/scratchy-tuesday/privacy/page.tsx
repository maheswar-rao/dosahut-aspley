import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — Scratchy Tuesday",
  description: "How Dosa Hut Sunshine Coast handles your information for the Scratchy Tuesday promotion.",
  alternates: { canonical: "/scratchy-tuesday/privacy" },
  robots: { index: false, follow: false },
};

export default function ScratchyTuesdayPrivacyPage() {
  return (
    <LegalPage
      eyebrow="Dosa Hut Sunshine Coast · Scratchy Tuesday"
      title="Privacy Policy"
      lastUpdated="September 2026"
    >
      <section className="flex flex-col gap-3">
        <h2>1. Information We Collect</h2>
        <p>
          When you play Scratchy Tuesday, we collect your name, Australian
          mobile number (WhatsApp), home suburb, and email address. This
          information is given voluntarily by you through the registration
          form before your scratch card unlocks.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Unlock and display your scratch card reward for that visit</li>
          <li>Check that a mobile number hasn&rsquo;t already played on the same Tuesday</li>
          <li>
            Send you offers, promotions, and news via WhatsApp and email, as
            you agree to when you join
          </li>
        </ul>
        <p>
          Your reward is revealed directly on the scratch card page — we
          don&rsquo;t send reward codes by WhatsApp, email, or any other
          channel.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>3. How We Store Your Information</h2>
        <p>
          Your information is stored securely in a database hosted in
          Australia, with access restricted to authorised Dosa Hut Sunshine
          Coast staff.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>4. WhatsApp &amp; Email Communications</h2>
        <p>
          Joining Scratchy Tuesday includes agreeing to receive WhatsApp
          messages and emails from Dosa Hut Sunshine Coast containing
          offers, promotions, and event announcements. You can withdraw
          this consent at any time by replying STOP to a WhatsApp message
          or using the unsubscribe link in an email — we&rsquo;ll honour
          opt-out requests promptly, even though it was part of joining.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>5. Sharing Your Information</h2>
        <p>
          We do not sell, rent, or trade your personal information to third
          parties. We may share it with our messaging service provider
          solely to deliver WhatsApp or email messages on our behalf, under
          confidentiality obligations.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Request access to the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your information from our records</li>
          <li>Withdraw your marketing consent at any time</li>
        </ul>
        <p>To exercise any of these rights, contact us using the details below.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>7. Contact</h2>
        <p>
          For privacy questions, contact Dosa Hut Sunshine Coast on{" "}
          <a href={SITE.phoneHref} className="font-semibold underline underline-offset-2">
            {SITE.phoneDisplay}
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
