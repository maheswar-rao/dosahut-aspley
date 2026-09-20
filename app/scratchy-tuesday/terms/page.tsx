import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import {
  SCRATCHY_TUESDAY_LOSE_MESSAGE,
  SCRATCHY_TUESDAY_LOSE_WEIGHT,
  SCRATCHY_TUESDAY_REWARDS,
  SITE,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions — Scratchy Tuesday",
  description: "Terms and conditions for Dosa Hut Sunshine Coast's Scratchy Tuesday promotion.",
  alternates: { canonical: "/scratchy-tuesday/terms" },
  robots: { index: false, follow: false },
};

export default function ScratchyTuesdayTermsPage() {
  return (
    <LegalPage
      eyebrow="Dosa Hut Sunshine Coast · Scratchy Tuesday"
      title="Terms & Conditions"
      lastUpdated="September 2026"
    >
      <section className="flex flex-col gap-3">
        <h2>1. Eligibility</h2>
        <p>
          Scratchy Tuesday is open to customers dining in at Dosa Hut
          Sunshine Coast (5 Lutana Street, Buddina QLD 4575) on a Tuesday
          who spend $40 or more per table, aged 18 and over, with a valid
          Australian mobile number capable of receiving WhatsApp messages.
          Participation is free.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>2. Your Scratch Card Odds &amp; Rewards</h2>
        <p>
          Staff provide one QR code per qualifying table, which opens a
          scratch card for that table. Scratching the card reveals one
          outcome, selected at random. Out of every 100 scratches,{" "}
          {100 - SCRATCHY_TUESDAY_LOSE_WEIGHT} reveal a genuine reward and{" "}
          {SCRATCHY_TUESDAY_LOSE_WEIGHT} reveal &ldquo;{SCRATCHY_TUESDAY_LOSE_MESSAGE}&rdquo;
          — no reward for that scratch. The current reward pool, and each
          reward&rsquo;s approximate share of the 100 scratches, is:
        </p>
        <ul>
          {SCRATCHY_TUESDAY_REWARDS.map((reward) => (
            <li key={reward.name}>
              {reward.name} — {reward.weight} in 100
            </li>
          ))}
        </ul>
        <p>
          The exact odds and reward pool may change from week to week
          without notice.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>3. Redeeming Your Reward</h2>
        <p>
          If your scratch reveals a reward, it is valid only for the dine-in
          visit during which you scratched your card. Show the revealed
          reward on your device screen to a staff member before the end of
          that visit — there is no separate reward code to present. Rewards
          cannot be banked, redeemed on a future visit, exchanged for cash,
          or transferred to another person. Free-item rewards are subject to
          availability and may be substituted with a reward of equal or
          greater value at staff&rsquo;s discretion if unavailable. If your
          scratch reveals &ldquo;{SCRATCHY_TUESDAY_LOSE_MESSAGE}&rdquo;, there is
          nothing to redeem for that visit.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>4. One Scratch Per Table, Per Tuesday</h2>
        <p>
          QR access is provided by staff only to tables that meet the $40+
          spend requirement. Each mobile number may reveal one scratch card
          per Tuesday; submitting the same number again on the same Tuesday
          will not issue an additional reward. A mobile number that has
          already played on a given Tuesday is welcome to play again on a
          future Tuesday, provided the table qualifies again.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>5. WhatsApp &amp; Email Communications</h2>
        <p>
          Providing your WhatsApp number and email address is required to
          take part in Scratchy Tuesday. By joining, you agree to receive
          promotional offers, event invitations, and seasonal announcements
          from Dosa Hut Sunshine Coast via WhatsApp and email. Reply STOP to
          any WhatsApp message to unsubscribe, or use the unsubscribe link
          in any marketing email. Message and email frequency varies.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>6. Fraud &amp; Misuse</h2>
        <p>
          Any attempt to submit false details, fabricate a qualifying spend,
          or otherwise misuse the scratch card mechanic may result in the
          reward being declined and refusal of service.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>7. Modifications</h2>
        <p>
          Dosa Hut Sunshine Coast reserves the right to modify, suspend, or
          end Scratchy Tuesday, or change the reward pool, at any time
          without prior notice.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>8. Contact</h2>
        <p>
          For questions about Scratchy Tuesday, contact Dosa Hut Sunshine
          Coast on{" "}
          <a href={SITE.phoneHref} className="font-semibold underline underline-offset-2">
            {SITE.phoneDisplay}
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
