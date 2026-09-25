import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/vip/LegalPage";
import { SITE } from "@/lib/site";
import { privacyContact } from "@/lib/vip/contact";

export const metadata: Metadata = {
  title: `VIP Club Privacy Policy | ${SITE.name}`,
  description: `How ${SITE.name} collects, uses and stores personal information for the VIP Club.`,
};

/**
 * Privacy policy for the Aspley VIP Club.
 *
 * Describes the data the code actually handles and nothing more. In
 * particular:
 *
 *  - The only third parties named are the ones the code calls: Resend for
 *    email delivery and Neon for database hosting. There is no analytics,
 *    tag manager or advertising pixel anywhere in this site, so none is
 *    claimed or disclaimed vaguely — section 6 states it outright.
 *  - Retention is described as it is implemented: expired OTP rows are swept
 *    automatically, member and reward records are kept until someone asks us
 *    to remove them. There is no automatic member deletion, so none is
 *    promised.
 *  - Requests are handled by phone or in person because that is what exists.
 *    See PRIVACY_CONTACT below.
 */

/**
 * The published contact point for privacy requests. Set from
 * PRIVACY_CONTACT_EMAIL where one is configured, falling back to the
 * restaurant's phone and street address — see lib/vip/contact.ts.
 */
const PRIVACY_CONTACT = privacyContact();

const SECTIONS: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      `This policy covers personal information collected through the VIP Club operated by ${SITE.name} at ${SITE.addressFull}, in Brisbane, Queensland.`,
      "It applies to the VIP Club sign-up only. It does not cover ordering placed on our ordering platform or on any third-party delivery service, which have their own policies.",
    ],
  },
  {
    heading: "What we collect",
    bullets: [
      "Your name, as you enter it.",
      "Your Australian mobile number, stored in the standard +614XXXXXXXX form so that one person means one record regardless of how you typed it.",
      "Your email address.",
      "Your consent to receive promotional offers, given by ticking the box on the join form.",
      "A record of the welcome gift issued to you: which gift, its code, when it was issued, and if and when it was redeemed.",
      "A count of your visits to this branch, and the branch you joined at.",
    ],
  },
  {
    heading: "What we do not collect",
    body: [
      "We do not collect payment details through the VIP Club. We do not track your browsing. This site runs no analytics, no tag manager and no advertising pixel of any kind, so there is nothing to opt out of and no cookie banner to dismiss.",
      "We do not record your location, and we do not buy or receive lists of personal information about you from anyone else.",
    ],
  },
  {
    heading: "Why we collect it, and your consent",
    body: [
      "We use your name and mobile number to identify your membership and make sure one person receives one welcome gift. We use your email address to send your verification code and, with your consent, promotional offers.",
      "Promotional offers are sent only because you ticked the consent box. You can withdraw that consent at any time — see section 8. Withdrawing it stops promotional messages; it does not remove your membership or a gift you already hold.",
    ],
  },
  {
    heading: "Verification codes",
    body: [
      "When you join we email you a 6-digit code. We never store the code itself — only a SHA-256 hash of it, which cannot be reversed back into the code. The hash is valid for five minutes, permits five attempts, and is deleted as soon as it is used, expires or is replaced.",
    ],
  },
  {
    heading: "Who we share it with",
    body: [
      "We do not sell your personal information, and we do not share it for anyone else's marketing.",
      "Two service providers handle it on our behalf, and only to do the job we ask of them:",
    ],
    bullets: [
      "Resend, which delivers our email. It receives your email address, your first name and the message.",
      "Neon, which hosts our database on Amazon Web Services infrastructure in Sydney, Australia.",
      "We may also disclose information where the law requires it.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "Verification code records are removed automatically once they expire or are used.",
      "Your membership record and the record of your welcome gift are kept for as long as you are a member. We do not delete member records automatically after a period of inactivity — we would rather say so than imply a schedule we do not run. If you want yours removed, ask us and we will remove it.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "You may ask us to tell you what we hold about you, correct anything that is wrong, delete your record, or stop sending you promotional offers.",
      `Requests are handled by our staff rather than through an automated tool, so please contact us directly: ${PRIVACY_CONTACT}. We will confirm your identity before acting on a request about a specific membership.`,
      "Deleting your record forfeits any gift you have not yet redeemed, because the record of the gift is part of what is deleted.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "The VIP Club sets one cookie, named dh_vip, after you verify your code. It proves to our server that this browser completed verification, so that your scratch card can only be opened by you. It is httpOnly, cannot be read by scripts in the page, is signed so it cannot be altered or forged, and it expires after one hour.",
      "This is the only cookie the VIP Club sets. There are no analytics or advertising cookies on this site.",
    ],
  },
  {
    heading: "How we protect it",
    bullets: [
      "Verification codes are stored only as irreversible hashes.",
      "The session cookie is HMAC-signed and rejected if altered; in production it is sent only over HTTPS.",
      "Access to the database is restricted to the application and to staff who need it.",
      "No system is perfectly secure, so we do not claim ours is. If a breach ever affected you, we would notify you and the Office of the Australian Information Commissioner as the Notifiable Data Breaches scheme requires.",
    ],
  },
  {
    heading: "Complaints and changes to this policy",
    body: [
      `If you are unhappy with how we have handled your information, contact us first: ${PRIVACY_CONTACT}. If you are not satisfied with our response, you may complain to the Office of the Australian Information Commissioner at oaic.gov.au.`,
      "We may update this policy. The date at the top of this page shows when it last changed, and the current version always sits at this address.",
    ],
  },
];

export default function VipPrivacyPage() {
  return (
    <LegalPage
      title="VIP Club Privacy Policy"
      updated="25 September 2026"
      intro={`This policy explains what the ${SITE.name} VIP Club collects about you, why, who else handles it, and how to have it corrected or removed. It describes what we actually do — where we do not do something, we say so rather than leave it vague.`}
      sections={SECTIONS}
    />
  );
}
