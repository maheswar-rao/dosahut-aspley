import { rewardByType } from "@/lib/vip/gifts";
import { findByPhone, findWelcomeReward, issueWelcomeReward } from "@/lib/vip/repo";
import { readSession } from "@/lib/vip/session";

const shape = (
  reward: { rewardCode: string; staffCode: string | null; type: string },
) => ({
  code: reward.rewardCode,
  staffCode: reward.staffCode,
  ...(rewardByType(reward.type) ?? { type: reward.type, label: reward.type, detail: "" }),
});

/** Current scratch-card state for the verified browser. */
export async function GET() {
  const session = await readSession();
  if (!session) {
    return Response.json(
      { error: "Please verify your mobile first." },
      { status: 401 },
    );
  }

  const member = await findByPhone(session.phone);
  if (!member) {
    return Response.json({ error: "Member not found." }, { status: 404 });
  }

  const existing = await findWelcomeReward(session.phone);
  return Response.json({
    name: member.name,
    canScratch: existing === null,
    reward: existing ? shape(existing) : null,
  });
}

/** Scratch it. Idempotent: a second POST returns the reward already issued. */
export async function POST() {
  const session = await readSession();
  if (!session) {
    return Response.json(
      { error: "Please verify your mobile first." },
      { status: 401 },
    );
  }

  const member = await findByPhone(session.phone);
  if (!member) {
    return Response.json({ error: "Member not found." }, { status: 404 });
  }

  // The partial unique index on vip_rewards does the enforcing: a second
  // request writes nothing and gets back the reward that won the race.
  const outcome = await issueWelcomeReward(session.phone);
  if (!outcome) {
    return Response.json(
      { error: "We could not issue your reward. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({
    status: outcome.status,
    name: member.name,
    reward: shape(outcome.reward),
  });
}
