import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/** Every branch writes into the same tables, so the branch is always explicit. */
export const BRANCH = "aspley";

export const vipMembers = pgTable(
  "vip_members",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    /** AU E.164, e.g. +61400000012. See lib/vip/mobile.ts — the UNIQUE
     *  constraint only means "one person" because every write is normalised
     *  through there first. */
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    /** Nullable: customers migrated in from the existing contact list arrive
     *  with phone and name only. Requiring one here would lock them out. */
    email: varchar("email", { length: 255 }),
    suburb: varchar("suburb", { length: 255 }),
    source: varchar("source", { length: 100 }).default("vip_join"),
    vipMember: boolean("vip_member").default(true),
    visitCount: integer("visit_count").default(1),

    firstBranch: varchar("first_branch", { length: 100 }).default(BRANCH),
    homeBranch: varchar("home_branch", { length: 100 }).default(BRANCH),
    lastBranch: varchar("last_branch", { length: 100 }).default(BRANCH),

    /** Unix milliseconds, matching the existing records this table was
     *  normalised from. Not a timestamptz — do not "fix" it in isolation. */
    lastSeenAt: bigint("last_seen_at", { mode: "number" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("idx_members_phone").on(t.phone)],
);

export const vipRewards = pgTable(
  "vip_rewards",
  {
    id: serial("id").primaryKey(),
    memberPhone: varchar("member_phone", { length: 20 }).references(
      () => vipMembers.phone,
      { onDelete: "cascade" },
    ),
    /** What the customer shows in store, e.g. LASSI-HKTLMI. */
    rewardCode: varchar("reward_code", { length: 100 }).notNull().unique(),
    /** What staff key in to mark it redeemed. */
    staffCode: varchar("staff_code", { length: 100 }),
    type: varchar("type", { length: 100 }).notNull(),
    status: varchar("status", { length: 50 }).default("issued"),

    issuedAt: bigint("issued_at", { mode: "number" }).notNull(),
    redeemedAt: bigint("redeemed_at", { mode: "number" }),
    redeemedBy: varchar("redeemed_by", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("idx_rewards_code").on(t.rewardCode),
    index("idx_rewards_phone").on(t.memberPhone),
  ],
);

export const vipBranchVisits = pgTable(
  "vip_branch_visits",
  {
    id: serial("id").primaryKey(),
    memberPhone: varchar("member_phone", { length: 20 }).references(
      () => vipMembers.phone,
      { onDelete: "cascade" },
    ),
    branchName: varchar("branch_name", { length: 100 }).notNull(),
    visitCount: integer("visit_count").default(1),
    lastVisitAt: timestamp("last_visit_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    uniqueIndex("vip_branch_visits_member_phone_branch_name_key").on(
      t.memberPhone,
      t.branchName,
    ),
  ],
);

/** Kept for WATI. Nothing is sent while the business profile is inactive, but
 *  every attempt is queued here so the backlog is ready to flush on the day
 *  it is switched on. */
export const vipWaLogs = pgTable("vip_wa_logs", {
  id: serial("id").primaryKey(),
  memberPhone: varchar("member_phone", { length: 20 }).references(
    () => vipMembers.phone,
    { onDelete: "cascade" },
  ),
  attempts: integer("attempts").default(1),
  status: varchar("status", { length: 50 }).default("queued"),
  queuedAt: bigint("queued_at", { mode: "number" }),
  lastAttemptAt: bigint("last_attempt_at", { mode: "number" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

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
    otpHash: varchar("otp_hash", { length: 255 }).notNull(),
    attempts: integer("attempts").default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("idx_otp_phone").on(t.phone)],
);

export type VipMember = typeof vipMembers.$inferSelect;
export type VipReward = typeof vipRewards.$inferSelect;
export type VipOtpCode = typeof vipOtpCodes.$inferSelect;
