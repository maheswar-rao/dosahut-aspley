import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * A signed cookie proving "this browser completed the OTP for member N".
 * Without it, /api/vip/scratch-card would hand a gift to anyone who POSTs a
 * mobile number.
 */
export const SESSION_COOKIE = "dh_vip";
const MAX_AGE_SECONDS = 60 * 60; // an hour is plenty to scratch a card

/**
 * There is no fallback constant here, and there must never be one.
 *
 * This secret is the only thing standing between a stranger and a forged
 * `dh_vip` cookie — and a forged cookie is a free welcome gift from
 * /api/vip/scratch-card. A hardcoded default committed to the repository is a
 * published secret: anyone reading this file could sign their own session
 * against any deployment that forgot the env var.
 *
 * So production throws. Outside production, rather than fall back to a shared
 * string, the process invents one at boot: still unguessable, and sessions
 * simply do not survive a dev-server restart, which is the correct trade for
 * a local machine with no real members on it.
 */
let devSecret: string | null = null;

const secret = () => {
  const configured = process.env.VIP_SESSION_SECRET?.trim();
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "VIP_SESSION_SECRET is not set. Refusing to sign VIP sessions with a " +
        "guessable key — set it in the deployment environment.",
    );
  }

  if (!devSecret) {
    devSecret = randomBytes(32).toString("base64url");
    console.warn(
      "[vip/session] VIP_SESSION_SECRET is unset. Using a random per-process " +
        "secret; sessions will not survive a restart. Set it in .env.local.",
    );
  }
  return devSecret;
};

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
