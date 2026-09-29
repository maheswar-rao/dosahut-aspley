/**
 * Which branch this deployment is.
 *
 * Every VIP row is scoped by branch, and the database is shared, so getting
 * this wrong does not fail loudly — it silently reads and writes another
 * restaurant's members and rewards. That is the failure this module exists to
 * make impossible.
 *
 * Three rules follow from that:
 *
 *  1. The value comes from the environment, never from a constant in the
 *     source. A deployment's identity belongs to the deployment.
 *  2. It is validated against a closed list. A typo like "asplay" must be an
 *     error, not a third branch that quietly accumulates orphaned rows.
 *  3. In production a missing or unrecognised value throws. There is no
 *     fallback, because a fallback here means writing real customer data to
 *     the wrong restaurant.
 *
 * The check runs when a branch is *used*, not when this module is imported.
 * Throwing at import time would fail `next build`, which evaluates modules
 * without the runtime environment — turning a misconfiguration into a broken
 * build rather than a clear error on the first request.
 */

/** The branches this codebase knows how to be. */
export const BRANCHES = ["aspley", "sunshine_coast"] as const;

export type Branch = (typeof BRANCHES)[number];

/**
 * Staff-code prefix per branch, e.g. AS-4M2X. Read aloud at the counter, so
 * it says which restaurant issued the reward.
 */
const PREFIXES: Record<Branch, string> = {
  aspley: "AS",
  sunshine_coast: "SC",
};

/**
 * How the branch is written for a customer to read — the badge under the
 * wordmark, not the full trading name. SITE.name carries the full
 * "Dosa Hut <branch>"; this is only the second half.
 */
const LABELS: Record<Branch, string> = {
  aspley: "Aspley",
  sunshine_coast: "Sunshine Coast",
};

/** Used only outside production, and only after warning. */
const DEV_FALLBACK: Branch = "aspley";

const isBranch = (value: string): value is Branch =>
  (BRANCHES as readonly string[]).includes(value);

let warned = false;

function readEnv(): string | undefined {
  // VIP_BRANCH is the documented name. BRANCH is accepted because it is the
  // obvious guess and a deployment that sets it should work rather than
  // silently fall through to the development default.
  const raw = process.env.VIP_BRANCH ?? process.env.BRANCH;
  const trimmed = raw?.trim().toLowerCase();
  return trimmed ? trimmed : undefined;
}

/**
 * The active branch. Throws in production rather than guess.
 */
export function branch(): Branch {
  const value = readEnv();

  if (value && isBranch(value)) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      value
        ? `VIP_BRANCH is "${value}", which is not one of: ${BRANCHES.join(", ")}. ` +
          "Refusing to serve VIP requests against an unknown branch."
        : "VIP_BRANCH is not set. Refusing to serve VIP requests without " +
          `knowing which branch this is — set it to one of: ${BRANCHES.join(", ")}.`,
    );
  }

  if (!warned) {
    warned = true;
    console.warn(
      value
        ? `[vip/branch] VIP_BRANCH="${value}" is not recognised; using "${DEV_FALLBACK}" for local development.`
        : `[vip/branch] VIP_BRANCH is unset; using "${DEV_FALLBACK}" for local development.`,
    );
  }
  return DEV_FALLBACK;
}

/** Staff-code prefix for the active branch, e.g. "AS". */
export function branchPrefix(): string {
  return PREFIXES[branch()];
}

/** Display name for the active branch, e.g. "Aspley". Server-side only. */
export function branchLabel(): string {
  return LABELS[branch()];
}

/**
 * Fail fast on a deployment that is misconfigured, without waiting for a
 * customer to hit it. Safe to call from a route; it is the same check
 * `branch()` performs.
 */
export function assertBranchConfigured(): void {
  branch();
}
