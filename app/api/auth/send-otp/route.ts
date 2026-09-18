import { isMockDb } from "@/lib/vip/db";
import { isPlausibleEmail, maskMobile, normaliseMobile } from "@/lib/vip/mobile";
import { issueOtp } from "@/lib/vip/otp";
import { findByPhone } from "@/lib/vip/repo";
import { sendOtp } from "@/lib/vip/resend-otp";

/**
 * TEMPORARY: using email OTP via Resend until WhatsApp Business Profile + WATI
 * are approved. Switch back to lib/vip/wati.ts once WATI credentials arrive —
 * change the import below and the `opts` object passed to sendOtp; nothing
 * else in this file moves.
 *
 * Issues a verification code. Deliberately writes no member row — the member
 * is created on verification, so an abandoned form leaves nothing behind.
 */
export async function POST(request: Request) {
  let body: { name?: unknown; phone?: unknown; email?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = normaliseMobile(
    typeof body.phone === "string" ? body.phone : "",
  );

  if (name.length < 2 || name.length > 255) {
    return Response.json(
      { success: false, message: "Please enter your name." },
      { status: 400 },
    );
  }
  if (!phone) {
    return Response.json(
      { success: false, message: "Please enter a valid Australian mobile number." },
      { status: 400 },
    );
  }
  if (!email || !isPlausibleEmail(email)) {
    return Response.json(
      { success: false, message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  // Guard in case this is called out of order. An existing member — including
  // one migrated in from the contact list — never needs a code.
  const alreadyMember = await findByPhone(phone);
  if (alreadyMember) {
    return Response.json(
      {
        success: false,
        isExisting: true,
        message: "You're already a VIP member.",
        member: {
          name: alreadyMember.name,
          visitCount: alreadyMember.visitCount ?? 1,
        },
      },
      { status: 409 },
    );
  }

  const issued = await issueOtp(phone);
  if (!issued.ok) {
    return Response.json(
      {
        success: false,
        message: `Please wait ${issued.retryAfterSeconds}s before requesting another code.`,
      },
      { status: 429 },
    );
  }

  // WATI is paused, but every attempt is queued so there is a backlog to flush
  // when the business profile goes live. vip_wa_logs.member_phone has a foreign
  // key to vip_members, and we only reach here for numbers with no member row,
  // so verify-otp queues it the moment the member exists.

  const sent = await sendOtp(phone, issued.code, { email, name });
  if (!sent.ok) {
    return Response.json(
      { success: false, message: "We could not send your verification code. Please try again." },
      { status: 502 },
    );
  }

  return Response.json({
    success: true,
    message: "OTP sent successfully",
    phone,
    phoneMasked: maskMobile(phone),
    // Where the code actually went, straight from the sender — so the screen
    // and the channel can never disagree.
    channel: sent.channel,
    sentTo: sent.sentTo,
    delivered: sent.delivered,
    // Present only while nothing is really being sent AND the database is the
    // local one, so a deployed instance never returns a live code.
    devCode: !sent.delivered && isMockDb() ? issued.code : undefined,
  });
}
