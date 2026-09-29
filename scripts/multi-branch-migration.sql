-- =============================================================================
-- Multi-branch separation — shared Neon database
--
-- Moves member identity from `phone` to the pair `(phone, home_branch)`, so the
-- same mobile number can hold a separate membership at each branch, each with
-- its own welcome gift.
--
-- Run ONCE against the shared database, in this order. Wrapped in a
-- transaction: if any step fails nothing is applied.
--
-- READ FIRST
-- ----------
-- Dropping the UNIQUE on vip_members(phone) is not optional and not cosmetic:
-- three tables have foreign keys pointing at that column, and PostgreSQL will
-- not let a foreign key reference a column set that is not unique. The old
-- keys therefore have to come off before the constraint does, and go back on
-- afterwards against the new pair. Attempting only the ALTER in step 2 fails
-- with "there is no unique constraint matching given keys for referenced
-- table".
--
-- Step 1 backfills branch_name on the child tables. It assumes every existing
-- row belongs to the branch named in :branch. If the database ALREADY holds
-- rows from more than one branch, stop — that backfill would mislabel them,
-- and the correct mapping has to come from vip_members.home_branch instead.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Branch columns on the child tables
--
-- Added with a default so existing rows get a value, then backfilled from the
-- member they belong to rather than from the default, so a database that
-- already holds several branches is labelled correctly.
-- -----------------------------------------------------------------------------
ALTER TABLE vip_rewards       ADD COLUMN IF NOT EXISTS branch_name VARCHAR(100);
ALTER TABLE vip_wa_logs       ADD COLUMN IF NOT EXISTS branch_name VARCHAR(100);
ALTER TABLE vip_otp_codes     ADD COLUMN IF NOT EXISTS branch_name VARCHAR(100);
-- vip_branch_visits already carries branch_name.

UPDATE vip_rewards r
   SET branch_name = m.home_branch
  FROM vip_members m
 WHERE r.member_phone = m.phone
   AND r.branch_name IS NULL;

UPDATE vip_wa_logs w
   SET branch_name = m.home_branch
  FROM vip_members m
 WHERE w.member_phone = m.phone
   AND w.branch_name IS NULL;

-- Codes are issued before the member exists, so there is nothing to join to.
-- These are short-lived rows; the current branch is the only sane label.
UPDATE vip_otp_codes SET branch_name = 'aspley' WHERE branch_name IS NULL;

-- Any reward or log whose member was already deleted has no branch to inherit.
UPDATE vip_rewards SET branch_name = 'aspley' WHERE branch_name IS NULL;
UPDATE vip_wa_logs SET branch_name = 'aspley' WHERE branch_name IS NULL;

ALTER TABLE vip_rewards   ALTER COLUMN branch_name SET NOT NULL;
ALTER TABLE vip_wa_logs   ALTER COLUMN branch_name SET NOT NULL;
ALTER TABLE vip_otp_codes ALTER COLUMN branch_name SET NOT NULL;

ALTER TABLE vip_rewards   ALTER COLUMN branch_name SET DEFAULT 'aspley';
ALTER TABLE vip_wa_logs   ALTER COLUMN branch_name SET DEFAULT 'aspley';
ALTER TABLE vip_otp_codes ALTER COLUMN branch_name SET DEFAULT 'aspley';

-- -----------------------------------------------------------------------------
-- 2. Swap member identity from phone to (phone, home_branch)
--
-- The three foreign keys must be dropped first — see the note at the top.
-- Names are the PostgreSQL defaults created by the original script; the DO
-- block tolerates a database where they were named differently or are already
-- gone.
-- -----------------------------------------------------------------------------
DO $$
DECLARE c RECORD;
BEGIN
    FOR c IN
        SELECT conrelid::regclass AS tbl, conname
          FROM pg_constraint
         WHERE contype = 'f'
           AND confrelid = 'vip_members'::regclass
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', c.tbl, c.conname);
    END LOOP;
END $$;

-- home_branch must be NOT NULL before it can carry half of a unique key that
-- means anything: two NULLs are not equal to each other in SQL, so a nullable
-- column would let duplicates straight through.
UPDATE vip_members SET home_branch = 'aspley' WHERE home_branch IS NULL;
ALTER TABLE vip_members ALTER COLUMN home_branch SET NOT NULL;
ALTER TABLE vip_members ALTER COLUMN home_branch SET DEFAULT 'aspley';

DO $$
DECLARE c RECORD;
BEGIN
    FOR c IN
        SELECT conname FROM pg_constraint
         WHERE conrelid = 'vip_members'::regclass
           AND contype = 'u'
           AND pg_get_constraintdef(oid) = 'UNIQUE (phone)'
    LOOP
        EXECUTE format('ALTER TABLE vip_members DROP CONSTRAINT %I', c.conname);
    END LOOP;
END $$;

ALTER TABLE vip_members
    ADD CONSTRAINT vip_members_phone_home_branch_key UNIQUE (phone, home_branch);

-- -----------------------------------------------------------------------------
-- 3. Composite foreign keys
-- -----------------------------------------------------------------------------
ALTER TABLE vip_rewards       ALTER COLUMN member_phone SET NOT NULL;
ALTER TABLE vip_branch_visits ALTER COLUMN member_phone SET NOT NULL;
ALTER TABLE vip_wa_logs       ALTER COLUMN member_phone SET NOT NULL;

ALTER TABLE vip_rewards
    ADD CONSTRAINT vip_rewards_member_fk
    FOREIGN KEY (member_phone, branch_name)
    REFERENCES vip_members(phone, home_branch) ON DELETE CASCADE;

ALTER TABLE vip_branch_visits
    ADD CONSTRAINT vip_branch_visits_member_fk
    FOREIGN KEY (member_phone, branch_name)
    REFERENCES vip_members(phone, home_branch) ON DELETE CASCADE;

ALTER TABLE vip_wa_logs
    ADD CONSTRAINT vip_wa_logs_member_fk
    FOREIGN KEY (member_phone, branch_name)
    REFERENCES vip_members(phone, home_branch) ON DELETE CASCADE;

-- -----------------------------------------------------------------------------
-- 4. Indexes
--
-- The welcome-gift guarantee becomes per branch. Left on member_phone alone it
-- would mean a customer who claimed a gift at one branch could never claim one
-- at another — which is exactly the behaviour this migration exists to end.
-- -----------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_rewards_one_welcome_per_member;
CREATE UNIQUE INDEX idx_rewards_one_welcome_per_member
    ON vip_rewards (member_phone, branch_name)
    WHERE type IN ('10_percent_off', 'mango_lassi', 'free_gulab_jamun', '5_dollar_off');

DROP INDEX IF EXISTS idx_rewards_phone;
CREATE INDEX idx_rewards_phone ON vip_rewards (member_phone, branch_name);

DROP INDEX IF EXISTS idx_otp_phone;
CREATE INDEX idx_otp_phone ON vip_otp_codes (phone, branch_name);

COMMIT;

-- =============================================================================
-- Verify
-- =============================================================================
-- SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint
--  WHERE conrelid = 'vip_members'::regclass AND contype IN ('p','u');
--   -> expect UNIQUE (phone, home_branch)
--
-- SELECT conrelid::regclass::text, pg_get_constraintdef(oid)
--   FROM pg_constraint
--  WHERE contype = 'f' AND confrelid = 'vip_members'::regclass;
--   -> expect three rows, each FOREIGN KEY (member_phone, branch_name)
-- =============================================================================
