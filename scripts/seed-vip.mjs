/**
 * Seeds the local mock DB with the cases worth testing by hand:
 *   +61400000001  a member who has already claimed their welcome reward
 *   +61400000002  a member registered but holding no reward yet
 * Any other number exercises the brand-new-member path.
 *
 * Schema kept byte-for-byte in step with lib/vip/db.ts, so local runs cannot
 * pass against a shape production does not have. Run with: npm run vip:seed
 */
import { PGlite } from "@electric-sql/pglite";

if (process.env.DATABASE_URL?.trim()) {
  console.error("DATABASE_URL is set — refusing to seed a real database.");
  process.exit(1);
}

const db = new PGlite(process.env.PGLITE_DIR ?? "./.pglite");

await db.exec(`
  CREATE TABLE IF NOT EXISTS vip_members (
      id            SERIAL PRIMARY KEY,
      name          VARCHAR(255) NOT NULL,
      phone         VARCHAR(20) UNIQUE NOT NULL,
      email         VARCHAR(255),
      suburb        VARCHAR(255),
      source        VARCHAR(100) DEFAULT 'vip_join',
      vip_member    BOOLEAN DEFAULT TRUE,
      visit_count   INT DEFAULT 1,
      first_branch  VARCHAR(100) DEFAULT 'aspley',
      home_branch   VARCHAR(100) DEFAULT 'aspley',
      last_branch   VARCHAR(100) DEFAULT 'aspley',
      last_seen_at  BIGINT,
      created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vip_rewards (
      id           SERIAL PRIMARY KEY,
      member_phone VARCHAR(20) REFERENCES vip_members(phone) ON DELETE CASCADE,
      reward_code  VARCHAR(100) UNIQUE NOT NULL,
      staff_code   VARCHAR(100),
      type         VARCHAR(100) NOT NULL,
      status       VARCHAR(50) DEFAULT 'issued',
      issued_at    BIGINT NOT NULL,
      redeemed_at  BIGINT,
      redeemed_by  VARCHAR(100),
      created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vip_branch_visits (
      id            SERIAL PRIMARY KEY,
      member_phone  VARCHAR(20) REFERENCES vip_members(phone) ON DELETE CASCADE,
      branch_name   VARCHAR(100) NOT NULL,
      visit_count   INT DEFAULT 1,
      last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(member_phone, branch_name)
  );

  CREATE TABLE IF NOT EXISTS vip_wa_logs (
      id              SERIAL PRIMARY KEY,
      member_phone    VARCHAR(20) REFERENCES vip_members(phone) ON DELETE CASCADE,
      attempts        INT DEFAULT 1,
      status          VARCHAR(50) DEFAULT 'queued',
      queued_at       BIGINT,
      last_attempt_at BIGINT,
      created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Not one of the four tables in the brief. Verification needs somewhere the
  -- hashed code outlives the request that issued it; on Vercel the issue and
  -- the verify land on different instances.
  CREATE TABLE IF NOT EXISTS vip_otp_codes (
      id         SERIAL PRIMARY KEY,
      phone      VARCHAR(20) NOT NULL,
      otp_hash   VARCHAR(255) NOT NULL,
      attempts   INT DEFAULT 0,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_members_phone ON vip_members(phone);
  CREATE INDEX IF NOT EXISTS idx_rewards_code  ON vip_rewards(reward_code);
  CREATE INDEX IF NOT EXISTS idx_rewards_phone ON vip_rewards(member_phone);
  CREATE INDEX IF NOT EXISTS idx_otp_phone     ON vip_otp_codes(phone);

  -- The one-welcome-reward-per-member guarantee, enforced by the database
  -- rather than by a check in the route. Without it two taps arriving together
  -- both pass the check and both write a reward. Scoped to the welcome types,
  -- so later promotional rewards of other types are unaffected.
  CREATE UNIQUE INDEX IF NOT EXISTS idx_rewards_one_welcome_per_member
      ON vip_rewards(member_phone)
      WHERE type IN ('10_percent_off','mango_lassi','free_gulab_jamun','5_dollar_off');
`);

await db.exec(`
  TRUNCATE vip_rewards, vip_branch_visits, vip_wa_logs, vip_otp_codes RESTART IDENTITY;
  TRUNCATE vip_members RESTART IDENTITY CASCADE;

  INSERT INTO vip_members (name, phone, email, visit_count, last_seen_at)
  VALUES
    ('Existing VIP',    '+61400000001', 'existing@example.com', 3, (EXTRACT(EPOCH FROM now())*1000)::bigint),
    ('Half Registered', '+61400000002', 'half@example.com',     1, (EXTRACT(EPOCH FROM now())*1000)::bigint);

  -- Carried over from the existing customer list: phone and name only, no
  -- email and no reward row. This is the case that used to be misread as a
  -- new member, because the old check looked at vip_rewards.
  INSERT INTO vip_members (name, phone, visit_count, source, last_seen_at)
  VALUES ('Pre-loaded Customer', '+61400555666', 7, 'contact_import',
          (EXTRACT(EPOCH FROM now())*1000)::bigint);

  INSERT INTO vip_rewards (member_phone, reward_code, staff_code, type, issued_at)
  VALUES ('+61400000001', 'TENOFF-K7M2QX', 'SC-9F3K', '10_percent_off',
          (EXTRACT(EPOCH FROM now())*1000)::bigint);

  INSERT INTO vip_branch_visits (member_phone, branch_name, visit_count)
  VALUES ('+61400000001', 'aspley', 3);
`);

const members = await db.query(
  "SELECT id, name, phone, email, visit_count, source FROM vip_members ORDER BY id",
);
console.table(members.rows);
const rewards = await db.query(
  "SELECT member_phone, reward_code, staff_code, type, status FROM vip_rewards ORDER BY id",
);
console.table(rewards.rows);
await db.close();
