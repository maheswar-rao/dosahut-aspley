/**
 * Applies the VIP Club schema to whatever DATABASE_URL points at (Neon).
 *
 * Idempotent — every statement is IF NOT EXISTS, so re-running it is safe and
 * it never drops or rewrites existing data. Run with: npm run vip:migrate
 */
import { readFileSync } from "node:fs";
import postgres from "postgres";

// Load .env.local without adding a dependency; Next.js reads it the same way.
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // no .env.local — fall back to the ambient environment
}

const raw = process.env.DATABASE_URL?.trim();
if (!raw) {
  console.error(
    "DATABASE_URL is not set. Put the Neon connection string in .env.local first.",
  );
  process.exit(1);
}

// Same sanitising as lib/vip/db.ts — see the comment there.
const LIBPQ_ONLY = [
  "channel_binding", "gssencmode", "krbsrvname", "sslnegotiation",
  "sslcert", "sslkey", "sslcrl", "sslcompression", "passfile", "service",
];
const parsed = new URL(raw);
for (const p of LIBPQ_ONLY) parsed.searchParams.delete(p);

const isPooled = raw.includes("-pooler.");
const sql = postgres(parsed.toString(), {
  ssl: "require",
  prepare: !isPooled,
  max: 1,
  connect_timeout: 15,
});

console.log(`host     : ${parsed.hostname}`);
console.log(`database : ${parsed.pathname.slice(1)}`);
console.log(`pooled   : ${isPooled}\n`);

try {
  await sql.unsafe(`
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

  // Read the shape back from the server rather than assuming it worked.
  const cols = await sql`
    SELECT table_name, column_name, data_type, character_maximum_length, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name IN ('vip_members','vip_rewards','vip_branch_visits','vip_wa_logs','vip_otp_codes')
    ORDER BY table_name, ordinal_position
  `;
  console.table(
    cols.map((c) => ({
      table: c.table_name,
      column: c.column_name,
      type: c.character_maximum_length
        ? `${c.data_type}(${c.character_maximum_length})`
        : c.data_type,
      nullable: c.is_nullable,
      default: c.column_default?.slice(0, 32) ?? null,
    })),
  );

  for (const t of ['vip_members','vip_rewards','vip_branch_visits','vip_wa_logs','vip_otp_codes']) {
    const [{ count }] = await sql.unsafe(`SELECT count(*)::int FROM ${t}`);
    console.log(`  ${t.padEnd(20)} ${count} rows`);
  }
  console.log("migration OK");
} catch (error) {
  console.error("migration FAILED:", error.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
