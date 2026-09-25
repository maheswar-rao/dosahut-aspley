import {
  formatBrisbane,
  redeemReward,
  sanitiseRewardCode,
  verifyStaffPin,
} from "@/lib/vip/redeem";

const REASONS: Record<string, string> = {
  not_found: "No reward found with that code. Check it and try again.",
  already_redeemed: "This reward has already been redeemed.",
  expired: "This reward has expired.",
};

/**
 * Staff redemption. Not part of the customer flow and not linked anywhere —
 * the branch PIN is the only thing guarding it, so it is checked before the
 * code is even looked at, and a wrong PIN is never told whether the code was
 * real.
 */
export async function POST(request: Request) {
  let body: { rewardCode?: unknown; pin?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid request body." }, { status: 400 });
  }

  const pin = typeof body.pin === "string" ? body.pin.trim() : "";
  const code = sanitiseRewardCode(
    typeof body.rewardCode === "string" ? body.rewardCode : "",
  );

  if (!/^\d{4}$/.test(pin)) {
    return Response.json(
      { message: "Enter the 4-digit branch PIN." },
      { status: 400 },
    );
  }

  // verifyStaffPin throws in production when STAFF_PIN is unset. That is
  // deliberate — a 500 that pages someone beats silently accepting anything.
  let pinOk: boolean;
  try {
    pinOk = verifyStaffPin(pin);
  } catch (error) {
    console.error("[vip/redeem]", error);
    return Response.json(
      { message: "Redemption is not configured. Please tell the manager." },
      { status: 500 },
    );
  }

  if (!pinOk) {
    return Response.json({ message: "That PIN is not correct." }, { status: 401 });
  }

  if (code.length < 4) {
    return Response.json(
      { message: "Enter the reward code from the customer's screen." },
      { status: 400 },
    );
  }

  const result = await redeemReward(code);

  if (!result.ok) {
    return Response.json(
      { message: REASONS[result.reason] ?? REASONS.not_found },
      { status: 409 },
    );
  }

  return Response.json({
    ok: true,
    label: result.label,
    detail: result.detail,
    rewardCode: result.rewardCode,
    redeemedAt: formatBrisbane(result.redeemedAt),
  });
}
