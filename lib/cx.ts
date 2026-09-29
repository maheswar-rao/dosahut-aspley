// Minimal class-list joiner shared by Button, PrimaryGlowButton, and
// RewardPill — replaces three independent hand-rolled template-literal
// joins with one place that filters out falsy/empty pieces (so an unused
// `full ? "w-full" : ""` slot doesn't leave a stray double space).
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
