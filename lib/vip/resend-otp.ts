/**
 * TEMPORARY: using email OTP via Resend until WhatsApp Business Profile + WATI
 * are approved. Switch back to lib/vip/wati.ts once WATI credentials arrive.
 *
 * ---------------------------------------------------------------------------
 * Deliberately mirrors lib/vip/wati.ts — same export name, same positional
 * shape `sendOtp(phone, code, opts)`, same SendResult. Swapping channels is a
 * change of import plus the one `opts` object in app/api/auth/send-otp; no
 * caller logic moves.
 *
 * This module only DELIVERS. Generating the code, hashing it, the 5-minute
 * expiry, the 5-attempt lockout and the 30-second resend cooldown all live in
 * lib/vip/otp.ts and are shared by both channels — nothing here duplicates any
 * of it, so a future switch cannot drift the two apart.
 * ---------------------------------------------------------------------------
 */

/**
 * Same shape lib/vip/wati.ts returns, so callers need no branching.
 *
 * `sentTo` is what the screen shows the customer. It comes from whichever
 * module actually did the sending, so the UI can never claim a destination the
 * code did not go to — the bug this replaced told people to check their phone
 * while the code was landing in their inbox.
 */
export type SendResult =
  | { ok: true; delivered: boolean; queued: boolean; channel: "email" | "whatsapp"; sentTo: string }
  | { ok: false; error: string };

import { maskEmail } from "./mobile";

const TIMEOUT_MS = 10_000;

const MAROON = "#570B0B";
const ORANGE = "#F15A27";
const CREAM = "#FFF7F4";
const INK = "#241512";

function template(firstName: string, code: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${CREAM};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:${CREAM};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;
                    font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        <tr><td style="background:${MAROON};padding:26px 28px;text-align:center;">
          <div style="color:${CREAM};font-size:20px;font-weight:700;letter-spacing:.5px;">
            Dosa Hut Aspley
          </div>
          <div style="color:${ORANGE};font-size:12px;font-weight:700;
                      letter-spacing:3px;text-transform:uppercase;margin-top:6px;">
            VIP Club
          </div>
        </td></tr>

        <tr><td style="padding:30px 28px 8px;">
          <p style="margin:0;color:${INK};font-size:16px;line-height:1.5;">
            Hi ${firstName}, here is your verification code.
          </p>
        </td></tr>

        <tr><td style="padding:12px 28px 4px;" align="center">
          <div style="display:inline-block;background:${CREAM};border:2px dashed ${ORANGE};
                      border-radius:10px;padding:16px 28px;color:${MAROON};
                      font-size:34px;font-weight:700;letter-spacing:10px;
                      font-family:'Courier New',Courier,monospace;">${code}</div>
        </td></tr>

        <tr><td style="padding:14px 28px 30px;">
          <p style="margin:0;color:#5C4A44;font-size:14px;line-height:1.6;text-align:center;">
            This code expires in 5 minutes.<br>
            If you did not ask to join the VIP Club, you can ignore this email.
          </p>
        </td></tr>

        <tr><td style="background:${MAROON};padding:16px 28px;text-align:center;">
          <p style="margin:0;color:${CREAM};font-size:12px;">
            Shop 6 &amp; 7/46 Gayford Street, Aspley QLD 4034 &nbsp;&middot;&nbsp; 0466 977 674
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/**
 * @param phone normalised E.164, used only for logging and the mock line
 * @param code  the code already issued by lib/vip/otp.ts
 * @param opts  where to send it. WATI's version takes `memberExists` here.
 */
export async function sendOtp(
  phone: string,
  code: string,
  opts: { email: string; name: string },
): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM?.trim() || "Dosa Hut VIP <onboarding@resend.dev>";
  const firstName = opts.name.split(" ")[0] || "there";

  if (!key) {
    if (process.env.NODE_ENV === "production") {
      // Never claim a code was sent, and never print one into platform logs.
      console.error("[Resend] Not configured. Set RESEND_API_KEY and RESEND_FROM.");
      return { ok: false, error: "Email sending is not configured." };
    }
    console.log(`[Resend mock] OTP for ${opts.email} (${phone}) is ${code}`);
    return { ok: true, delivered: false, queued: false, channel: "email", sentTo: maskEmail(opts.email) };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.email],
        subject: `${code} is your Dosa Hut VIP code`,
        html: template(firstName, code),
        text:
          `Hi ${firstName},\n\n` +
          `Your Dosa Hut Aspley VIP Club verification code is ${code}.\n` +
          `It expires in 5 minutes.\n\n` +
          `If you did not ask to join, you can ignore this email.`,
      }),
      // A hung request would otherwise hold the invocation open until the
      // platform kills it, with no useful error for the customer.
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[Resend] HTTP ${res.status}: ${detail.slice(0, 300)}`);
      return { ok: false, error: `Resend responded ${res.status}` };
    }

    return { ok: true, delivered: true, queued: false, channel: "email", sentTo: maskEmail(opts.email) };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? `Resend did not respond within ${TIMEOUT_MS / 1000}s`
        : error instanceof Error
          ? error.message
          : "Unknown error contacting Resend";
    console.error(`[Resend] ${message}`);
    return { ok: false, error: message };
  }
}
