import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import * as schema from "./schema";

/**
 * Two drivers, one Drizzle API.
 *
 *   DATABASE_URL set    -> postgres-js against Neon PostgreSQL (AWS Sydney).
 *   DATABASE_URL unset  -> PGlite, real Postgres compiled to WASM, stored in
 *                          .pglite/. No server to install, no daemon to run.
 *
 * Switching is an env var, not a code change. Everything above this file —
 * repo.ts included — is driver-agnostic.
 */

/**
 * Bootstrap DDL for the local PGlite database. Kept byte-for-byte in step
 * with the deployed Neon schema so local runs cannot pass against a shape
 * production does not have. Against a real DATABASE_URL this never executes.
 */
const CREATE_TABLE_SQL = `
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
`;

type Db =
  | ReturnType<typeof drizzlePg<typeof schema>>
  | ReturnType<typeof drizzlePglite<typeof schema>>;

// Cached on globalThis so Next.js hot reloads don't open a new PGlite instance
// (or a new connection pool) on every edit, and so a warm serverless instance
// reuses its pool across invocations instead of exhausting Neon's limit.
const globalForDb = globalThis as unknown as { vipDb?: Promise<Db> };

/**
 * libpq understands connection-string parameters that postgres-js does not.
 * Anything it does not recognise is forwarded to the server as a startup
 * parameter, and Postgres rejects the connection for the ones that are not
 * real settings — Neon's own copyable string ships `channel_binding=require`,
 * which fails exactly this way. TLS is unaffected: `sslmode` is handled
 * separately and the connection stays encrypted.
 */
const LIBPQ_ONLY_PARAMS = [
  "channel_binding",
  "gssencmode",
  "krbsrvname",
  "sslnegotiation",
  "sslcert",
  "sslkey",
  "sslcrl",
  "sslcompression",
  "passfile",
  "service",
];

function stripLibpqOnlyParams(url: string): string {
  try {
    const parsed = new URL(url);
    for (const param of LIBPQ_ONLY_PARAMS) parsed.searchParams.delete(param);
    return parsed.toString();
  } catch {
    // Not a URL we can parse — hand it through untouched rather than mangle it.
    return url;
  }
}

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL?.trim();

  if (url) {
    const postgres = (await import("postgres")).default;

    // A local Postgres will not have TLS; Neon requires it.
    const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    // Neon's pooled endpoint runs PgBouncer in transaction mode, which cannot
    // hold prepared statements across a connection. Direct endpoints can.
    const isPooled = url.includes("-pooler.");

    const client = postgres(stripLibpqOnlyParams(url), {
      ssl: isLocal ? false : "require",
      prepare: !isPooled,
      // Each serverless instance keeps its own pool; small is correct here.
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    return drizzlePg(client, { schema });
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const client = new PGlite(process.env.PGLITE_DIR ?? "./.pglite");
  await client.exec(CREATE_TABLE_SQL);
  return drizzlePglite(client, { schema });
}

export function getDb(): Promise<Db> {
  globalForDb.vipDb ??= connect();
  return globalForDb.vipDb;
}

export const isMockDb = () => !process.env.DATABASE_URL?.trim();
