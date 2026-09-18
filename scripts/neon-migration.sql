-- =============================================================================
-- Dosa Hut Aspley — VIP Club
-- Neon PostgreSQL schema
--
-- Safe to run more than once: every statement is IF NOT EXISTS, so re-running
-- creates nothing twice and drops nothing. No existing data is touched.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Members
--    One row per person. `phone` is the natural key every other table points
--    at, so it carries the UNIQUE constraint rather than `id`.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vip_members (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    -- Normalised AU E.164, e.g. +61412345678. Every write must normalise
    -- first, or the same person registers twice under two spellings.
    phone         VARCHAR(20) UNIQUE NOT NULL,
    -- Nullable on purpose. Customers migrated in from the existing contact
    -- list arrive with phone and name only; requiring an email here would
    -- make them impossible to load.
    email         VARCHAR(255),
    suburb        VARCHAR(255),
    source        VARCHAR(100) DEFAULT 'vip_join',
    vip_member    BOOLEAN DEFAULT TRUE,
    visit_count   INT DEFAULT 1,

    -- Branch attribution
    first_branch  VARCHAR(100) DEFAULT 'aspley',
    home_branch   VARCHAR(100) DEFAULT 'aspley',
    last_branch   VARCHAR(100) DEFAULT 'aspley',

    -- Unix milliseconds, matching the records this table was normalised from.
    -- Deliberately not a timestamptz; do not change one without the other.
    last_seen_at  BIGINT,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. Rewards
--    Issue and redemption history. `reward_code` is what the customer shows at
--    the counter; `staff_code` is what staff key in to mark it redeemed.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vip_rewards (
    id           SERIAL PRIMARY KEY,
    member_phone VARCHAR(20) REFERENCES vip_members(phone) ON DELETE CASCADE,
    reward_code  VARCHAR(100) UNIQUE NOT NULL,
    staff_code   VARCHAR(100),
    -- 'mango_lassi' | '10_percent_off' | 'free_gulab_jamun' | '5_dollar_off'
    type         VARCHAR(100) NOT NULL,
    -- 'issued' | 'redeemed' | 'expired'
    status       VARCHAR(50) DEFAULT 'issued',

    issued_at    BIGINT NOT NULL,
    redeemed_at  BIGINT,
    redeemed_by  VARCHAR(100),
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. Branch visits
--    Per-member, per-branch counter. The UNIQUE pair is what lets the app
--    upsert a visit in one statement instead of read-then-write.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vip_branch_visits (
    id            SERIAL PRIMARY KEY,
    member_phone  VARCHAR(20) REFERENCES vip_members(phone) ON DELETE CASCADE,
    branch_name   VARCHAR(100) NOT NULL,
    visit_count   INT DEFAULT 1,
    last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vip_branch_visits_member_branch_key UNIQUE (member_phone, branch_name)
);

-- -----------------------------------------------------------------------------
-- 4. WhatsApp log
--    Kept for WATI. Nothing is sent while the business profile is inactive,
--    but every attempt is queued here so there is a backlog to flush on the
--    day it is switched on.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vip_wa_logs (
    id              SERIAL PRIMARY KEY,
    member_phone    VARCHAR(20) REFERENCES vip_members(phone) ON DELETE CASCADE,
    attempts        INT DEFAULT 1,
    -- 'queued' | 'sent' | 'failed'
    status          VARCHAR(50) DEFAULT 'queued',
    queued_at       BIGINT,
    last_attempt_at BIGINT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 5. Verification codes
--    NOT in the original four tables — the application cannot verify without
--    it. On serverless the request that issues a code and the request that
--    checks it run on different instances, so the code has to outlive the
--    process. Only the SHA-256 hash is stored; the code itself never lands in
--    the database.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vip_otp_codes (
    id         SERIAL PRIMARY KEY,
    phone      VARCHAR(20) NOT NULL,
    otp_hash   VARCHAR(255) NOT NULL,
    attempts   INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- Column repairs for databases created by an earlier version of this script
--
-- CREATE TABLE IF NOT EXISTS skips a table that already exists, so column
-- changes have to be made explicitly. Both statements below are safe to run
-- against a table that is already correct.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    ALTER TABLE vip_members ADD COLUMN IF NOT EXISTS email VARCHAR(255);

    -- An earlier revision made email NOT NULL. That blocks the pre-loaded
    -- customers, who have no email address, so drop the constraint if it is
    -- still there. Harmless when it is not.
    ALTER TABLE vip_members ALTER COLUMN email DROP NOT NULL;
END $$;

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

-- Redundant in practice: UNIQUE on vip_members.phone already builds an index.
-- Kept because it was specified, and it costs only disk.
CREATE INDEX IF NOT EXISTS idx_members_phone ON vip_members(phone);

-- Likewise redundant against the UNIQUE on reward_code.
CREATE INDEX IF NOT EXISTS idx_rewards_code  ON vip_rewards(reward_code);

-- This one earns its keep: looking a member's rewards up by phone.
CREATE INDEX IF NOT EXISTS idx_rewards_phone ON vip_rewards(member_phone);

-- Newest-code-first lookups during verification.
CREATE INDEX IF NOT EXISTS idx_otp_phone     ON vip_otp_codes(phone);

-- -----------------------------------------------------------------------------
-- The one-welcome-reward-per-member guarantee
--
-- Without this, two taps arriving together both pass an application-level
-- check and both write a reward — the same person walks out with two gifts.
-- A partial unique index makes the database refuse the second one outright.
--
-- Scoped to the welcome reward types, so later promotional rewards of other
-- types can still be issued to the same member freely.
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_rewards_one_welcome_per_member
    ON vip_rewards (member_phone)
    WHERE type IN ('10_percent_off', 'mango_lassi', 'free_gulab_jamun', '5_dollar_off');

COMMIT;
