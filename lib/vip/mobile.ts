/**
 * Australian mobiles — every branch is in Australia. Accepts 04xx xxx xxx,
 * +614xx xxx xxx and 614xx xxx xxx; stores everything as +614xxxxxxxx so the
 * unique constraint on `mobile` actually means one person, one row.
 */
export function normaliseMobile(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");

  let local: string | null = null;
  if (/^\+614\d{8}$/.test(digits)) local = digits.slice(3);
  else if (/^614\d{8}$/.test(digits)) local = digits.slice(2);
  else if (/^04\d{8}$/.test(digits)) local = digits.slice(1);
  else if (/^4\d{8}$/.test(digits)) local = digits;

  return local ? `+61${local}` : null;
}

/** Good enough to catch typos; real validation is the code we send. */
export const isPlausibleEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 255;

export const maskMobile = (mobile: string) =>
  mobile.length < 4 ? mobile : `${"•".repeat(mobile.length - 3)}${mobile.slice(-3)}`;

/** e.g. ma•••@zenithitservices.com.au — enough to recognise, not to read. */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  const keep = local.length <= 2 ? 1 : 2;
  return `${local.slice(0, keep)}${"•".repeat(Math.max(local.length - keep, 1))}${domain}`;
}

/**
 * Reduce anything a customer types or pastes to the nine local digits after
 * the country code: 0412 345 678, 412345678, +61 412 345 678 and
 * 61412345678 all become "412345678".
 *
 * Deliberately lenient and non-validating — it runs on every keystroke, so it
 * has to leave a half-typed number alone rather than fight the person typing
 * it. normaliseMobile() above is still the authority on whether a number is
 * real, and the server calls it again regardless.
 */
export function toLocalMobile(input: string): string {
  const digits = input.replace(/\D/g, "");
  const local = digits
    .replace(/^61/, "")
    .replace(/^0/, "");
  return local.slice(0, 9);
}

/** Group the local part for display: 412345678 -> "412 345 678". */
export function formatLocalMobile(local: string): string {
  const digits = local.replace(/\D/g, "").slice(0, 9);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)];
  return parts.filter(Boolean).join(" ");
}
