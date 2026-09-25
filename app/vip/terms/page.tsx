import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/vip/LegalPage";
import { REWARDS } from "@/lib/vip/gifts";
import { SITE } from "@/lib/site";
import { privacyContact } from "@/lib/vip/contact";

export const metadata: Metadata = {
  title: `VIP Club Terms & Conditions | ${SITE.name}`,
  description: `Terms and conditions for the ${SITE.name} VIP Club, including welcome gifts, redemption and membership.`,
};

/**
 * Terms for the Aspley VIP Club.
 *
 * Written against what the code actually does, and nothing else:
 *
 *  - The reward list is rendered from REWARDS in lib/vip/gifts.ts, so this
 *    page cannot advertise a gift the system is unable to issue.
 *  - No activation delay and no expiry are promised, because vip_rewards has
 *    no field for either and nothing enforces them. Section 5 says so plainly
 *    rather than staying silent.
 *  - Email is named as the only channel that currently carries anything.
 *    There is no SMS integration in this repository, so SMS is not mentioned
 *    as a channel; WhatsApp is described as not yet active, which is what
 *    lib/vip/wati.ts does.
 */
const SECTIONS: LegalSection[] = [
  {
    heading: "Who these terms are between",
    body: [
      `These terms apply to the VIP Club operated by ${SITE.name} at ${SITE.addressFull}. "We" and "us" mean that restaurant. "You" means the person joining.`,
      "By joining the VIP Club you accept these terms. If you do not accept them, do not complete the join form.",
    ],
  },
  {
    heading: "Joining",
    body: [
      "Membership is open to individuals with an Australian mobile number. You must give your name, your mobile number and an email address, and tick the box agreeing to receive promotional offers from us.",
      "Your mobile number identifies your membership. One membership is held per mobile number, and the system will not create a second one for a number it already holds.",
      "We send a 6-digit verification code to your email address to confirm it is yours. The code is valid for five minutes, you may enter it up to five times, and a replacement cannot be requested within 30 seconds of the last one.",
    ],
  },
  {
    heading: "The welcome gift",
    body: [
      "A new member receives one welcome gift, drawn by us at the moment your code is verified and revealed to you by the scratch card. The gift is already decided and recorded before you scratch — scratching shows you what you have, it does not decide it.",
      "The gift is drawn at random from the following pool. Gifts are not equally likely, and you cannot choose which one you receive.",
    ],
    bullets: REWARDS.map((reward) => `${reward.label} — ${reward.detail}`),
  },
  {
    heading: "One gift per mobile number",
    body: [
      "One welcome gift is issued per mobile number, ever. This is enforced by the database rather than by a check in the app: a second welcome gift for a number that already holds one cannot be written, including by two requests arriving at the same moment.",
      "Returning members are recognised by their mobile number and are not issued a further welcome gift.",
    ],
  },
  {
    heading: "No expiry and no activation delay",
    body: [
      "We do not apply an activation waiting period, and your welcome gift does not carry an expiry date. We say this explicitly because we hold no record of either: the system stores when a gift was issued and when it was redeemed, and nothing else about timing.",
      "If we introduce an expiry in future it will apply only to gifts issued after we publish the change, and these terms will be updated first.",
    ],
  },
  {
    heading: "Redeeming your gift",
    bullets: [
      `Redemption is in person at ${SITE.name}. Show the code on your screen to the staff member serving you.`,
      "A gift may be redeemed once. Staff mark it as used at the counter, and a gift already marked used cannot be redeemed again.",
      "Gifts are not transferable and hold no cash value. They cannot be exchanged for cash, credit or another gift.",
      "Unless the gift itself says otherwise, one gift may be used per visit and gifts cannot be combined with each other.",
      "Conditions attached to a specific gift — such as a minimum spend or the requirement to order a main course — are shown with that gift and apply in full.",
    ],
  },
  {
    heading: "Promotional messages and withdrawing consent",
    body: [
      "By joining you agree to receive promotional offers from us. We currently send these by email. WhatsApp is not active for this branch, and we do not operate an SMS channel.",
      "You may withdraw consent at any time by telling us — call the restaurant or speak to staff in person using the contact details in section 10. Withdrawing consent stops promotional messages. It does not cancel a gift you already hold.",
    ],
  },
  {
    heading: "Ending your membership",
    body: [
      "You may ask us to close your membership at any time using the contact details in section 10. Closing it forfeits any gift you have not redeemed.",
      "We may close a membership that is being misused — for example, attempts to obtain more than one welcome gift, or use of a mobile number that is not yours.",
    ],
  },
  {
    heading: "Changes to the VIP Club",
    body: [
      "We may change the gift pool, these terms, or end the VIP Club. Changes take effect when published on this page, and a gift already issued to you is honoured under the terms that applied when it was issued.",
    ],
  },
  {
    heading: "Contact and governing law",
    body: [
      `Questions about these terms: ${privacyContact()}.`,
      "These terms are governed by the laws of Queensland, Australia, and the courts of Brisbane, Queensland have jurisdiction. Nothing here limits any right you have under the Australian Consumer Law.",
    ],
  },
];

export default function VipTermsPage() {
  return (
    <LegalPage
      title="VIP Club Terms & Conditions"
      updated="25 September 2026"
      intro={`These terms cover the ${SITE.name} VIP Club — how you join, what the welcome gift is, and how it can be used. They describe how the programme actually operates; where we do not do something, we say so rather than leave it open.`}
      sections={SECTIONS}
    />
  );
}
