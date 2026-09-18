import { randomBytes } from "node:crypto";

/**
 * The welcome rewards a new member can scratch. `type` is what goes in
 * vip_rewards.type; the rest is what the customer and the counter staff see.
 *
 * Still placeholder wording pending the owner's sign-off — the codes are what
 * the database and any redemption tooling key off, so those should not change
 * casually once members hold them.
 */
export type Reward = {
  type: string;
  /** Prefix for the customer-facing code, e.g. LASSI-HKTLMI. */
  prefix: string;
  label: string;
  detail: string;
  weight: number;
};

export const REWARDS: Reward[] = [
  {
    type: "10_percent_off",
    prefix: "TENOFF",
    label: "10% off your next order",
    detail: "Valid on dine-in and takeaway at Dosa Hut Aspley.",
    weight: 40,
  },
  {
    type: "mango_lassi",
    prefix: "LASSI",
    label: "Free Mango Lassi",
    detail: "One complimentary lassi with any main course.",
    weight: 25,
  },
  {
    type: "free_gulab_jamun",
    prefix: "JAMUN",
    label: "Free Gulab Jamun",
    detail: "A sweet finish on the house with any main course.",
    weight: 25,
  },
  {
    type: "5_dollar_off",
    prefix: "FIVEOFF",
    label: "$5 off your next order",
    detail: "On orders over $30, dine-in or takeaway.",
    weight: 10,
  },
];

/** Every welcome reward type. Used by the one-per-member database index. */
export const WELCOME_REWARD_TYPES = REWARDS.map((r) => r.type);

export const rewardByType = (type: string) =>
  REWARDS.find((r) => r.type === type);

export function pickReward(): Reward {
  const total = REWARDS.reduce((sum, r) => sum + r.weight, 0);
  let roll = Math.random() * total;
  for (const reward of REWARDS) {
    roll -= reward.weight;
    if (roll <= 0) return reward;
  }
  return REWARDS[0];
}

/** Crockford-ish alphabet: no I, O, 0 or 1, so codes survive being read aloud. */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function randomToken(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/** e.g. LASSI-HKTLMI — what the customer shows at the counter. */
export const makeRewardCode = (reward: Reward) =>
  `${reward.prefix}-${randomToken(6)}`;

/** e.g. SC-4M2X — what staff key in to mark it redeemed. */
export const makeStaffCode = () => `SC-${randomToken(4)}`;
