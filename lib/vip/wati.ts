import { maskMobile } from "./mobile";
import { queueWhatsApp } from "./repo";

/**
 * WATI delivery — PAUSED.
 *
 * The business WhatsApp profile is not active yet, so nothing is sent. Every
 * attempt still writes a 'queued' row into vip_wa_logs, so when the profile
 * goes live there is a backlog to flush rather than a hole in the history.
 *
 * To switch it back on: restore the send call below, set WATI_API_ENDPOINT,
 * WATI_BEARER_TOKEN and WATI_TEMPLATE_NAME, and move the log row to 'sent'.
 * Nothing above this module needs to change.
 */
export type SendResult =
  | { ok: true; delivered: boolean; queued: boolean; channel: "email" | "whatsapp"; sentTo: string }
  | { ok: false; error: string };

export async function sendOtp(
  phone: string,
  code: string,
  opts: { memberExists: boolean },
): Promise<SendResult> {
  // The log row references vip_members(phone), so it can only be written once
  // the member exists — a brand-new registration queues after the insert.
  if (opts.memberExists) {
    try {
      await queueWhatsApp(phone);
    } catch (error) {
      // A failed log must not cost the customer their registration.
      console.error(`[WATI] could not queue log for ${phone}:`, error);
    }
  }

  if (process.env.NODE_ENV === "production") {
    // Never print a live code into platform logs.
    console.log(`[WATI paused] queued OTP for ${phone}, nothing sent`);
  } else {
    console.log(`[WATI paused] OTP for ${phone} is ${code}`);
  }

  return {
    ok: true,
    delivered: false,
    queued: opts.memberExists,
    channel: "whatsapp",
    sentTo: maskMobile(phone),
  };
}
