import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  BRANCH,
  vipBranchVisits,
  vipMembers,
  vipRewards,
  vipWaLogs,
  type VipMember,
  type VipReward,
} from "./schema";
import {
  WELCOME_REWARD_TYPES,
  makeRewardCode,
  makeStaffCode,
  pickReward,
  rewardByType,
  type Reward,
} from "./gifts";

/**
 * The only module that touches Drizzle directly. Routes, validation and the
 * frontend all go through here.
 */

export async function findByPhone(phone: string): Promise<VipMember | null> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(vipMembers)
    .where(eq(vipMembers.phone, phone))
    .limit(1);
  return row ?? null;
}

/**
 * A known member coming back: count the visit, move the clock, and note the
 * branch. Done in one statement so concurrent visits cannot lose a count the
 * way a read-modify-write would.
 */
export async function recordReturnVisit(phone: string): Promise<VipMember | null> {
  const db = await getDb();
  const now = Date.now();
  const [row] = await db
    .update(vipMembers)
    .set({
      visitCount: sql`COALESCE(${vipMembers.visitCount}, 0) + 1`,
      lastSeenAt: now,
      lastBranch: BRANCH,
      updatedAt: new Date(),
    })
    .where(eq(vipMembers.phone, phone))
    .returning();
  return row ?? null;
}

/** Per-branch counter. Upsert, so the first visit to a branch creates the row. */
export async function touchBranchVisit(phone: string): Promise<void> {
  const db = await getDb();
  await db
    .insert(vipBranchVisits)
    .values({ memberPhone: phone, branchName: BRANCH, visitCount: 1 })
    .onConflictDoUpdate({
      target: [vipBranchVisits.memberPhone, vipBranchVisits.branchName],
      set: {
        visitCount: sql`COALESCE(${vipBranchVisits.visitCount}, 0) + 1`,
        lastVisitAt: new Date(),
      },
    });
}

/**
 * Records that a WhatsApp message was wanted. Nothing is sent while the
 * business profile is inactive — the row is the backlog, so the day WATI is
 * switched on there is a queue to flush rather than a gap in the history.
 */
export async function queueWhatsApp(phone: string): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  await db.insert(vipWaLogs).values({
    memberPhone: phone,
    attempts: 1,
    status: "queued",
    queuedAt: now,
    lastAttemptAt: now,
  });
}

export async function findWelcomeReward(
  phone: string,
): Promise<VipReward | null> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(vipRewards)
    .where(
      and(
        eq(vipRewards.memberPhone, phone),
        inArray(vipRewards.type, WELCOME_REWARD_TYPES),
      ),
    )
    .limit(1);
  return row ?? null;
}

export type IssueOutcome =
  | { status: "issued"; reward: VipReward; catalogue: Reward }
  | { status: "already_claimed"; reward: VipReward; catalogue: Reward | null };

/**
 * Issues the one welcome reward a member ever gets.
 *
 * `onConflictDoNothing` leans on the partial unique index over
 * vip_rewards(member_phone) for the welcome types: if a concurrent request
 * already wrote one, this insert quietly writes nothing and we hand back the
 * reward that won. The guarantee lives in the database, not in a check above
 * it, so it holds even if a caller forgets to look first.
 */
export async function issueWelcomeReward(
  phone: string,
): Promise<IssueOutcome | null> {
  const db = await getDb();
  const reward = pickReward();

  const [row] = await db
    .insert(vipRewards)
    .values({
      memberPhone: phone,
      rewardCode: makeRewardCode(reward),
      staffCode: makeStaffCode(),
      type: reward.type,
      status: "issued",
      issuedAt: Date.now(),
    })
    .onConflictDoNothing()
    .returning();

  if (row) return { status: "issued", reward: row, catalogue: reward };

  const existing = await findWelcomeReward(phone);
  if (!existing) return null;
  return {
    status: "already_claimed",
    reward: existing,
    catalogue: rewardByType(existing.type) ?? null,
  };
}

export type RegisterOutcome =
  | { isExisting: true; member: VipMember; reward: VipReward | null }
  | { isExisting: false; member: VipMember; reward: VipReward; catalogue: Reward };

/**
 * The whole decision, in one place, at verification time.
 *
 * Whether someone is new is settled by the UNIQUE constraint on phone rather
 * than by a prior read, and the welcome reward is written in the same
 * transaction as the member — so a member can never exist without the reward
 * they were promised, and two verifications arriving together cannot both
 * create a member or both issue a reward.
 */
export async function registerOrReturn(
  name: string,
  phone: string,
  email: string | null,
): Promise<RegisterOutcome> {
  const db = await getDb();
  const now = Date.now();

  const created = await db.transaction(async (tx) => {
    const [member] = await tx
      .insert(vipMembers)
      .values({
        name,
        phone,
        email,
        source: "vip_join",
        vipMember: true,
        visitCount: 1,
        firstBranch: BRANCH,
        homeBranch: BRANCH,
        lastBranch: BRANCH,
        lastSeenAt: now,
      })
      .onConflictDoNothing({ target: vipMembers.phone })
      .returning();

    if (!member) return null;

    const pick = pickReward();
    const [reward] = await tx
      .insert(vipRewards)
      .values({
        memberPhone: phone,
        rewardCode: makeRewardCode(pick),
        staffCode: makeStaffCode(),
        type: pick.type,
        status: "issued",
        issuedAt: now,
      })
      .onConflictDoNothing()
      .returning();

    return reward ? { member, reward, catalogue: pick } : null;
  });

  if (created) {
    return { isExisting: false, ...created };
  }

  // Already known: count the visit instead of issuing anything.
  const member = (await recordReturnVisit(phone)) ?? (await findByPhone(phone));
  if (!member) {
    throw new Error(`registerOrReturn: no member row for ${phone}`);
  }
  return {
    isExisting: true,
    member,
    reward: await findWelcomeReward(phone),
  };
}

