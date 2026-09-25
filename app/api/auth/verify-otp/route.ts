import { rewardByType } from "@/lib/vip/gifts";
import { isPlausibleEmail, normaliseMobile } from "@/lib/vip/mobile";
import { verifyOtp } from "@/lib/vip/otp";
import { queueWhatsApp, registerOrReturn, touchBranchVisit } from "@/lib/vip/repo";
import { createSession } from "@/lib/vip/session";
import type { VipReward } from "@/lib/vip/schema";

/**
 * TEMPORARY: the code being checked here was delivered by email via Resend,
 * not WhatsApp, until the WhatsApp Business Profile + WATI are approved. The
 * checking logic is channel-agnostic (lib/vip/otp.ts), so switching back to
 * lib/vip/wati.ts changes only how the code was sent, never how it is
 * verified — nothing in this file needs to change.
 */
const REASONS: Record<string, string> = {
  expired: "That code has expired. Please request a new one.",
  mismatch: "That code is not correct. Please try again.",
  too_many_attempts: "Too many attempts. Please request a new code.",
};

const shape = (reward: VipReward) => ({
  // Catalogue copy first, then the row's own facts — so the stored type and
  // status always win over anything the catalogue happens to carry.
  ...(rewardByType(reward.type) ?? { label: reward.type, detail: "" }),
  code: reward.rewardCode,
  staffCode: reward.staffCode,
  type: reward.type,
  status: reward.status,
});

export async function POST(request: Request) {
  let body: { phone?: unknown; code?: unknown; name?: unknown; email?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid request body." }, { status: 400 });
  }

  const phone = normaliseMobile(
    typeof body.phone === "string" ? body.phone : "",
  );
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!phone || !/^\d{6}$/.test(code)) {
    return Response.json(
      { message: "Please enter the 6-digit code." },
      { status: 400 },
    );
  }
  if (name.length < 2 || name.length > 255) {
    return Response.json({ message: "Please enter your name." }, { status: 400 });
  }
  // Required by this route, not by the column: vip_members.email is nullable
  // so that members migrated in from the old contact list can exist without
  // one. Anyone joining through this flow must supply a real address.
  if (!email || !isPlausibleEmail(email)) {
    return Response.json(
      { message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const result = await verifyOtp(phone, code);
  if (!result.ok) {
    return Response.json({ message: REASONS[result.reason] }, { status: 400 });
  }

  // Member row and welcome reward are written together, or not at all.
  const outcome = await registerOrReturn(name, phone, email);
  await touchBranchVisit(phone);

  // The member exists now, so the queued WhatsApp row finally has somewhere to
  // hang — this is the first moment the foreign key allows it.
  if (!outcome.isExisting) {
    await queueWhatsApp(phone).catch((error) =>
      console.error(`[wa_logs] could not queue for ${phone}:`, error),
    );
  }

  await createSession(outcome.member.id, outcome.member.phone);

  const member = {
    name: outcome.member.name,
    phone: outcome.member.phone,
    visitCount: outcome.member.visitCount ?? 1,
    homeBranch: outcome.member.homeBranch,
  };

  if (outcome.isExisting) {
    return Response.json({
      isExisting: true,
      member,
      // A returning member keeps whatever they already hold; nothing new.
      reward: outcome.reward ? shape(outcome.reward) : null,
    });
  }

  return Response.json({
    isExisting: false,
    member,
    reward: shape(outcome.reward),
  });
}
