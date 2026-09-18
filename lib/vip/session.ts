import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * A signed cookie proving "this browser completed the OTP for member N".
 * Without it, /api/vip/scratch-card would hand a gift to anyone who POSTs a
 * mobile number.
 */
export const SESSION_COOKIE = "dh_vip";
const MAX_AGE_SECONDS = 60 * 60; // an hour is plenty to scratch a card

const secret = () =>
  process.env.VIP_SESSION_SECRET?.trim() || "dev-only-insecure-secret";

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

export async function createSession(memberId: number, phone: string) {
  const payload = `${memberId}.${phone}.${Date.now() + MAX_AGE_SECONDS * 1000}`;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readSession(): Promise<{
  memberId: number;
  phone: string;
} | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [id, phone, expiry, signature] = parts;

  const expected = Buffer.from(sign(`${id}.${phone}.${expiry}`));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }
  if (Number(expiry) < Date.now()) return null;

  return { memberId: Number(id), phone };
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
