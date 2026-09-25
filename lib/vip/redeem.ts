import { createHash, timingSafeEqual } from "node:crypto";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { getDb } from "./db";
import { rewardByType } from "./gifts";
import { BRANCH, vipRewards } from "./schema";

/**
 * Staff-side redemption: the counter marks a customer's welcome gift as used.
 *
 * Two things here are load-bearing and easy to get wrong:
 *
 *  1. The status this table actually uses is 'issued', not 'active'. A query
 *     written against 'active' matches nothing and every redemption fails as
 *     "already redeemed".
 *  2. The lookup columns are reward_code and staff_code. There is no `code`
 *     column.
 */

/** Status a reward carries until it is redeemed. Matches repo.ts. */
const ISSUED = "issued";
const REDEEMED = "redeemed";

/**
 * Expiry note. vip_rewards.expires_at is nullable with no default, and every
 * gift issued so far has NULL in it, because /vip/terms tells customers their
 * gift does not expire. The check below honours an expiry where one is set and
 * ignores the column where it is not, so turning expiry on later is a data
 * decision rather than a code change — but it is also a terms change, and the
 * terms have to move first.
 */

// ---------------------------------------------------------------------------
// PIN
// ---------------------------------------------------------------------------

/**
 * Hashing both sides before comparing does two jobs: it gives timingSafeEqual
 * the equal-length buffers it requires (it throws on a length mismatch, which
 * would itself leak the PIN's length), and it means the comparison time cannot
 * vary with how many leading digits happened to match.
 */
export function verifyStaffPin(input: string): boolean {
  const expected = process.env.STAFF_PIN?.trim();

  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      // Loud, and never a fallback. A default PIN in a repository is a
      // published PIN, and this endpoint writes to customer reward records.
      throw new Error(
        "STAFF_PIN is not set. Refusing to accept redemptions with a " +
          "guessable PIN — set it in the deployment environment.",
      );
    }
    return false;
  }

  const a = createHash("sha256").update(input.trim()).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// Code input
// ---------------------------------------------------------------------------

/**
 * Codes are `PREFIX-TOKEN`, e.g. LASSI-HKTLMN or SC-4M2X.
 *
 * Two different rules apply to the two halves, and conflating them corrupts
 * valid codes:
 *
 *  - PREFIX is a word (TENOFF, FIVEOFF, LASSI, JAMUN, SC). None contains a
 *    digit, so a 0 or a 1 there can only be a misread O or I and is folded
 *    back. Stripping those characters instead — as an earlier version did —
 *    broke every TENOFF, FIVEOFF and LASSI code, because those words contain
 *    O and I legitimately.
 *  - TOKEN comes from the alphabet in gifts.ts, which already excludes I, O,
 *    0 and 1 precisely so it survives being read aloud. It is left exactly as
 *    typed: there is no unambiguous character to map a stray one to, and
 *    guessing would turn a typo into a different valid code.
 */
export function sanitiseRewardCode(input: string): string {
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const cut = cleaned.lastIndexOf("-");
  if (cut < 0) return cleaned.slice(0, 100);
  const prefix = cleaned.slice(0, cut).replace(/0/g, "O").replace(/1/g, "I");
  return `${prefix}-${cleaned.slice(cut + 1)}`.slice(0, 100);
}

// ---------------------------------------------------------------------------
// Redemption
// ---------------------------------------------------------------------------

export type RedeemResult =
  | {
      ok: true;
      label: string;
      detail: string;
      rewardCode: string;
      redeemedAt: number;
    }
  | { ok: false; reason: "not_found" | "already_redeemed" | "expired" };

/**
 * One conditional UPDATE decides everything.
 *
 * A SELECT-then-UPDATE would let two tills both read 'issued' in the same
 * millisecond and both write 'redeemed', handing out one gift twice. Here the
 * status test is inside the UPDATE's WHERE clause, so the database serialises
 * the two writers: the first matches a row and gets it back, the second
 * matches nothing. With one or two counter devices this is rare, but "rare"
 * and "cannot happen" are different guarantees and only one of them is worth
 * having.
 *
 * The follow-up SELECT runs only to tell the staff member WHY nothing matched.
 * It cannot reintroduce the race, because the UPDATE has already decided.
 */
export async function redeemReward(code: string): Promise<RedeemResult> {
  const db = await getDb();
  const now = Date.now();

  const [claimed] = await db
    .update(vipRewards)
    .set({ status: REDEEMED, redeemedAt: now, redeemedBy: BRANCH })
    .where(
      and(
        or(eq(vipRewards.rewardCode, code), eq(vipRewards.staffCode, code)),
        eq(vipRewards.status, ISSUED),
        or(isNull(vipRewards.expiresAt), gt(vipRewards.expiresAt, new Date())),
      ),
    )
    .returning();

  if (claimed) {
    const catalogue = rewardByType(claimed.type);
    return {
      ok: true,
      label: catalogue?.label ?? claimed.type,
      detail: catalogue?.detail ?? "",
      rewardCode: claimed.rewardCode,
      redeemedAt: claimed.redeemedAt ?? now,
    };
  }

  const [existing] = await db
    .select()
    .from(vipRewards)
    .where(or(eq(vipRewards.rewardCode, code), eq(vipRewards.staffCode, code)))
    .limit(1);

  if (!existing) return { ok: false, reason: "not_found" };
  if (existing.status === REDEEMED) {
    return { ok: false, reason: "already_redeemed" };
  }
  if (existing.expiresAt && existing.expiresAt.getTime() <= now) {
    return { ok: false, reason: "expired" };
  }
  // Some other status the counter cannot act on — treat it as spent rather
  // than tell a customer their gift is fine when the record says otherwise.
  return { ok: false, reason: "already_redeemed" };
}

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

/**
 * Brisbane, always. The server may sit in UTC and a staff phone may be set to
 * anything at all; a redemption time that does not match the clock on the wall
 * is worse than no time.
 */
export function formatBrisbane(epochMs: number): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(epochMs));
}
