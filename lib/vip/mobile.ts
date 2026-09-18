/**
 * Australian mobiles, since the branch is Aspley. Accepts 04xx xxx xxx,
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
