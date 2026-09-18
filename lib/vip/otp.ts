import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { desc, eq, lt } from "drizzle-orm";
import { getDb } from "./db";
import { vipOtpCodes } from "./schema";

/**
 * OTP issue and verify, keyed on the normalised phone.
 *
 * Append-style: issuing clears the phone's earlier rows and writes a fresh
 * one, and every read takes the newest by id. Only the SHA-256 hash is stored.
 */
const TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000;

const hash = (phone: string, code: string) =>
  createHash("sha256").update(`${phone}:${code}`).digest("hex");

async function latestFor(phone: string) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(vipOtpCodes)
    .where(eq(vipOtpCodes.phone, phone))
    .orderBy(desc(vipOtpCodes.id))
    .limit(1);
  return row ?? null;
}

async function clearFor(phone: string) {
  const db = await getDb();
  await db.delete(vipOtpCodes).where(eq(vipOtpCodes.phone, phone));
}

export type IssueResult =
  | { ok: true; code: string }
  | { ok: false; retryAfterSeconds: number };

export async function issueOtp(phone: string): Promise<IssueResult> {
  const now = Date.now();

  // Opportunistic housekeeping. A visitor who asks for a code and never comes
  // back leaves a row nothing else would ever clear, so every issue sweeps the
  // expired ones. Cheap, and it keeps the table from growing without bound.
  await purgeExpiredOtps().catch((error) =>
    console.error("[otp] purge failed:", error),
  );
  const existing = await latestFor(phone);

  if (existing?.createdAt) {
    const sinceSent = now - existing.createdAt.getTime();
    if (sinceSent < RESEND_COOLDOWN_MS) {
      return {
        ok: false,
        retryAfterSeconds: Math.ceil((RESEND_COOLDOWN_MS - sinceSent) / 1000),
      };
    }
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");

  await clearFor(phone);
  const db = await getDb();
  await db.insert(vipOtpCodes).values({
    phone,
    otpHash: hash(phone, code),
    attempts: 0,
    expiresAt: new Date(now + TTL_MS),
    createdAt: new Date(now),
  });

  return { ok: true, code };
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "expired" | "mismatch" | "too_many_attempts" };

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<VerifyResult> {
  const entry = await latestFor(phone);

  if (!entry || Date.now() > entry.expiresAt.getTime()) {
    await clearFor(phone);
    return { ok: false, reason: "expired" };
  }

  const attempts = entry.attempts ?? 0;
  if (attempts >= MAX_ATTEMPTS) {
    await clearFor(phone);
    return { ok: false, reason: "too_many_attempts" };
  }

  // Count the attempt before comparing, so a crash mid-verify is not a free retry.
  const db = await getDb();
  await db
    .update(vipOtpCodes)
    .set({ attempts: attempts + 1 })
    .where(eq(vipOtpCodes.id, entry.id));

  const expected = Buffer.from(entry.otpHash);
  const actual = Buffer.from(hash(phone, code));
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, reason: "mismatch" };
  }

  await clearFor(phone);
  return { ok: true };
}

export async function purgeExpiredOtps(): Promise<void> {
  const db = await getDb();
  await db.delete(vipOtpCodes).where(lt(vipOtpCodes.expiresAt, new Date()));
}
