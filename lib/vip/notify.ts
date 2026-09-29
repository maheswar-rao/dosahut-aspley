import { isWatiConfigured, sendOtp as sendViaWhatsApp } from "./wati";
import { sendOtp as sendViaEmail } from "./resend-otp";

/**
 * Chooses the channel that carries the verification code.
 *
 * WhatsApp the moment WATI credentials exist in the environment, email
 * otherwise. Deciding here, at call time, is what makes WhatsApp activation a
 * deployment step rather than a development one: the day the credentials are
 * added to Vercel, the next registration goes out over WhatsApp with no code
 * change, no migration and no backlog to clear.
 *
 * Both senders return the same SendResult, and `channel` / `sentTo` come from
 * whichever one ran — so the screen can never name a destination the code did
 * not go to.
 */
export type SendResult =
  | {
      ok: true;
      delivered: boolean;
      /** Deprecated: nothing is ever held back for later delivery. */
      queued?: boolean;
      channel: "email" | "whatsapp";
      sentTo: string;
    }
  | { ok: false; error: string };

export type NotifyChannel = "email" | "whatsapp";

/* There is deliberately no exported "which channel would we use" helper. The
   only honest answer to "how was this code delivered" is the channel the send
   actually returned, which travels with the request; anything re-derived from
   the environment later describes the next send, not this one. */

export async function sendVerificationCode(params: {
  phone: string;
  code: string;
  email: string;
  name: string;
  /**
   * vip_wa_logs.member_phone has a foreign key to vip_members, so a delivery
   * can only be logged once the member row exists. False during registration,
   * where the member is created later, at verification.
   */
  memberExists?: boolean;
}): Promise<SendResult> {
  const { phone, code, email, name, memberExists = false } = params;

  if (isWatiConfigured()) {
    const result = await sendViaWhatsApp(phone, code, { memberExists });
    // A WhatsApp failure is not the end of the attempt: if we hold an email
    // address, the customer still gets their code rather than a dead end.
    if (result.ok || !email) return result;
    console.error(
      `[notify] WhatsApp failed (${result.error}) — falling back to email.`,
    );
  }

  return sendViaEmail(phone, code, { email, name });
}
