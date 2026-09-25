import { SITE } from "@/lib/site";

/**
 * The contact point published on the VIP Club's legal pages.
 *
 * Server-only. PRIVACY_CONTACT_EMAIL is deliberately not NEXT_PUBLIC_, so it
 * is read where the page is rendered and never shipped as a client bundle
 * value — the two legal pages are server components, which is the only place
 * this is used.
 *
 * The email is optional. Without it the phone and street address still make a
 * complete, usable contact point, which is better than publishing a mailbox
 * that turns out not to exist: an unanswered privacy address is worse than no
 * address at all.
 */
export function privacyContact(): string {
  const email = process.env.PRIVACY_CONTACT_EMAIL?.trim();
  const base = `${SITE.name}, ${SITE.addressFull}`;
  return email
    ? `${base} — email ${email} or call ${SITE.phoneDisplay}`
    : `${base}, or call ${SITE.phoneDisplay}`;
}
