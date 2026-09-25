-- ---------------------------------------------------------------------------
-- vip_rewards.expires_at
--
-- Run once against Neon. Safe to re-run: both statements are conditional and
-- neither touches an existing row.
--
-- Nullable, with NO default, on purpose. The published terms at /vip/terms
-- tell customers their welcome gift does not expire, so every gift issued to
-- date must keep a NULL here. Redemption (lib/vip/redeem.ts) honours an expiry
-- where one is set and ignores the column where it is not, so the mechanism is
-- ready without changing what any current gift is worth.
-- ---------------------------------------------------------------------------

BEGIN;

ALTER TABLE vip_rewards
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Redemption filters on (reward_code OR staff_code) AND status, so the lookup
-- is served from the existing idx_rewards_code plus this one.
CREATE INDEX IF NOT EXISTS idx_rewards_staff_code
    ON vip_rewards (staff_code);

COMMIT;

-- ---------------------------------------------------------------------------
-- DO NOT RUN THE BELOW without updating /vip/terms first.
--
-- This is the 30-day expiry the brief asked for. It is left commented because
-- applying it would contradict section 5 of the published terms ("No expiry
-- and no activation delay") and would retroactively expire gifts that were
-- issued on the promise that they would not. If the business decides to run an
-- expiry, change the terms, then apply this to NEW gifts only by setting
-- expires_at at insert time in repo.ts — not by backfilling.
--
--   ALTER TABLE vip_rewards
--       ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '30 days');
--
-- Backfilling existing rows is deliberately not provided.
-- ---------------------------------------------------------------------------
