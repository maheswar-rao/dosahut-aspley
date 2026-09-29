import {
  bigint,
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Branch scoping.
 *
 * Every branch writes into the SAME database, so the branch is part of a
 * member's identity rather than a label on it: the same mobile number can hold
 * one membership at each branch, each with its own welcome gift. That is why
 * vip_members is unique on (phone, home_branch) and not on phone alone, and
 * why every child table carries the branch and joins back on the pair.
 *
 * The active branch is NOT a constant here. It comes from the environment via
 * lib/vip/branch.ts, so one build can be deployed as either restaurant and a
 * missing or unknown value fails loudly instead of writing to the wrong one.
 * Reading or writing by phone WITHOUT the branch crosses into another
 * branch's data — see lib/vip/repo.ts, where every query is scoped.
 */

export const vipMembers = pgTable(
  "vip_members",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    /**
     * AU E.164, e.g. +61400000012. See lib/vip/mobile.ts — uniqueness only
     * means "one person" because every write is normalised through there
     * first.
     *
     * NOT unique on its own: uniqueness is the (phone, home_branch) pair
     * below, so the same number can be a member at more than one branch.
     */
    phone: varchar("phone", { length: 20 }).notNull(),
    /** Nullable: customers migrated in from the existing contact list arrive
     *  with phone and name only. Requiring one here would lock them out. */
    email: varchar("email", { length: 255 }),
    suburb: varchar("suburb", { length: 255 }),
    source: varchar("source", { length: 100 }).default("vip_join"),
    vipMember: boolean("vip_member").default(true),
    visitCount: integer("visit_count").default(1),

    /** Always written explicitly by lib/vip/repo.ts — see the note above. */
    firstBranch: varchar("first_branch", { length: 100 }),
    homeBranch: varchar("home_branch", { length: 100 }),
    lastBranch: varchar("last_branch", { length: 100 }),

    /** Unix milliseconds, matching the existing records this table was
     *  normalised from. Not a timestamptz — do not "fix" it in isolation. */
    lastSeenAt: bigint("last_seen_at", { mode: "number" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("idx_members_phone").on(t.phone),
    /**
     * The identity of a membership. Every child table's foreign key points at
     * this pair, so it also has to exist for those keys to be creatable at
     * all — Postgres will not reference a column set that is not unique.
     */
    uniqueIndex("vip_members_phone_home_branch_key").on(t.phone, t.homeBranch),
  ],
);

export const vipRewards = pgTable(
  "vip_rewards",
  {
    id: serial("id").primaryKey(),
    memberPhone: varchar("member_phone", { length: 20 }).notNull(),
    /** Which branch's membership this reward belongs to. Half of the foreign
     *  key below; a reward cannot float free of the branch that issued it. */
    branchName: varchar("branch_name", { length: 100 }).notNull(),
    /** What the customer shows in store, e.g. LASSI-HKTLMI. */
    rewardCode: varchar("reward_code", { length: 100 }).notNull().unique(),
    /** What staff key in to mark it redeemed. */
    staffCode: varchar("staff_code", { length: 100 }),
    type: varchar("type", { length: 100 }).notNull(),
    status: varchar("status", { length: 50 }).default("issued"),

    issuedAt: bigint("issued_at", { mode: "number" }).notNull(),
    /**
     * Nullable, and with no default, on purpose. The published terms at
     * /vip/terms state that welcome gifts do not expire, so every gift issued
     * so far has no expiry and must keep none. The column exists so an expiry
     * CAN be set per reward if the business later decides to run one — and
     * redemption already honours it — but switching it on for new gifts means
     * updating those terms first. See the note in lib/vip/redeem.ts.
     */
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    redeemedAt: bigint("redeemed_at", { mode: "number" }),
    redeemedBy: varchar("redeemed_by", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("idx_rewards_code").on(t.rewardCode),
    index("idx_rewards_phone").on(t.memberPhone, t.branchName),
    foreignKey({
      columns: [t.memberPhone, t.branchName],
      foreignColumns: [vipMembers.phone, vipMembers.homeBranch],
      name: "vip_rewards_member_fk",
    }).onDelete("cascade"),
  ],
);

export const vipBranchVisits = pgTable(
  "vip_branch_visits",
  {
    id: serial("id").primaryKey(),
    memberPhone: varchar("member_phone", { length: 20 }).notNull(),
    /** Doubles as the branch half of the foreign key. In a per-branch
     *  membership model a member belongs to exactly one branch, so the branch
     *  visited and the branch they are a member of are the same value. */
    branchName: varchar("branch_name", { length: 100 }).notNull(),
    visitCount: integer("visit_count").default(1),
    lastVisitAt: timestamp("last_visit_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    uniqueIndex("vip_branch_visits_member_phone_branch_name_key").on(
      t.memberPhone,
      t.branchName,
    ),
    foreignKey({
      columns: [t.memberPhone, t.branchName],
      foreignColumns: [vipMembers.phone, vipMembers.homeBranch],
      name: "vip_branch_visits_member_fk",
    }).onDelete("cascade"),
  ],
);

/** Kept for WATI. Nothing is sent while the business profile is inactive, but
 *  every attempt is queued here so the backlog is ready to flush on the day
 *  it is switched on. */
export const vipWaLogs = pgTable(
  "vip_wa_logs",
  {
  id: serial("id").primaryKey(),
  memberPhone: varchar("member_phone", { length: 20 }).notNull(),
  /** Branch half of the foreign key below. */
  branchName: varchar("branch_name", { length: 100 }).notNull(),
  attempts: integer("attempts").default(1),
  status: varchar("status", { length: 50 }).default("queued"),
  queuedAt: bigint("queued_at", { mode: "number" }),
  lastAttemptAt: bigint("last_attempt_at", { mode: "number" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    foreignKey({
      columns: [t.memberPhone, t.branchName],
      foreignColumns: [vipMembers.phone, vipMembers.homeBranch],
      name: "vip_wa_logs_member_fk",
    }).onDelete("cascade"),
  ],
);

/**
 * NOT part of the four tables in the brief — added because verification cannot
 * work without it. On Vercel the request that issues a code and the request
 * that verifies it land on different instances, so the code has to outlive the
 * process. Only the hash is stored; the code itself never reaches the database.
 */
export const vipOtpCodes = pgTable(
  "vip_otp_codes",
  {
    id: serial("id").primaryKey(),
    phone: varchar("phone", { length: 20 }).notNull(),
    /**
     * Scoped by branch even though a code is short-lived. Issuing clears the
     * phone's earlier rows, so without this a second branch sending a code to
     * the same number would delete the first branch's pending code and lock
     * that customer out mid-signup. No foreign key: a code is issued before
     * the member exists.
     */
    branchName: varchar("branch_name", { length: 100 }).notNull(),
    otpHash: varchar("otp_hash", { length: 255 }).notNull(),
    attempts: integer("attempts").default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("idx_otp_phone").on(t.phone, t.branchName)],
);

export type VipMember = typeof vipMembers.$inferSelect;
export type VipReward = typeof vipRewards.$inferSelect;
export type VipOtpCode = typeof vipOtpCodes.$inferSelect;
