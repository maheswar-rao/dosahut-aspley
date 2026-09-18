-- =============================================================================
-- Dosa Hut Aspley — VIP Club
-- Standalone table-creation script
--
-- Creates the five tables the VIP Club application needs, from scratch, on a
-- clean Neon PostgreSQL database.
--
-- SCOPE: this script is entirely self-contained. It has NO relationship to and
-- NO dependency on the bronze.pos_customers data warehouse tables — it neither
-- reads from them, writes to them, nor references them. The VIP Club owns these
-- five tables and nothing else.
--
-- Everything runs inside one transaction, so a failure anywhere leaves the
-- database untouched rather than half-built. Every statement is guarded with
-- IF NOT EXISTS, so running it a second time creates nothing twice and changes
-- no existing data.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. vip_members
--    One row per person. `phone` is the natural key the other tables point at,
--    so it carries the UNIQUE constraint rather than `id`.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vip_members (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    -- Normalised Australian E.164, e.g. +61412345678. Every write normalises
    -- before inserting, or the same person registers twice under two spellings.
    phone         VARCHAR(20) UNIQUE NOT NULL,
    -- Nullable on purpose: customers loaded in from the existing contact list
    -- have a phone and a name but no email address.
    email         VARCHAR(255),
    suburb        VARCHAR(255),
    source        VARCHAR(100) DEFAULT 'vip_join',
    vip_member    BOOLEAN DEFAULT TRUE,
    visit_count   INT DEFAULT 1,

    -- Branch attribution
    first_branch  VARCHAR(100) DEFAULT 'aspley',
    home_branch   VARCHAR(100) DEFAULT 'aspley',
    last_branch   VARCHAR(100) DEFAULT 'aspley',

    -- Unix milliseconds, matching the format the existing customer records use.
    -- Deliberately not a timestamptz.
    last_seen_at  BIGINT,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. vip_rewards
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
-- 3. vip_branch_visits
--    Per-member, per-branch counter. The UNIQUE pair lets the application
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
-- 4. vip_wa_logs
--    WhatsApp send queue, for WATI. Nothing is sent while the WhatsApp Business
--    Profile is inactive, but every attempt is recorded here so there is a
--    backlog to work through on the day it is switched on.
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
-- 5. vip_otp_codes
--    Verification codes. The request that issues a code and the request that
--    checks it run on different serverless instances, so the code has to
--    outlive the process that made it. Only the SHA-256 hash is stored — the
--    code itself never reaches the database.
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
-- Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_members_phone ON vip_members(phone);
CREATE INDEX IF NOT EXISTS idx_rewards_code  ON vip_rewards(reward_code);
CREATE INDEX IF NOT EXISTS idx_rewards_phone ON vip_rewards(member_phone);
CREATE INDEX IF NOT EXISTS idx_otp_phone     ON vip_otp_codes(phone);

-- -----------------------------------------------------------------------------
-- One welcome reward per member, enforced by the database
--
-- Two taps arriving at the same moment both pass an application-level check and
-- both write a reward — the same person walks out with two gifts. This partial
-- unique index makes PostgreSQL refuse the second one outright.
--
-- Scoped to the welcome reward types, so promotional rewards of other types can
-- still be issued to the same member later.
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_rewards_one_welcome_per_member
    ON vip_rewards (member_phone)
    WHERE type IN ('10_percent_off', 'mango_lassi', 'free_gulab_jamun', '5_dollar_off');

COMMIT;
