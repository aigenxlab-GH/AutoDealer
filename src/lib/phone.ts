// Indian mobile number validation / normalisation.

/** Strips spaces, dashes, brackets, and a leading +91 / 91 / 0. */
function digitsOnly(input: string): string {
  let s = input.replace(/[^\d]/g, "");
  if (s.startsWith("91") && s.length === 12) s = s.slice(2);
  else if (s.startsWith("0") && s.length === 11) s = s.slice(1);
  return s;
}

/** A valid Indian mobile is 10 digits starting 6-9. */
export function isValidIndianPhone(input: string): boolean {
  return /^[6-9]\d{9}$/.test(digitsOnly(input));
}

/** Returns E.164 form (+91XXXXXXXXXX) or null if invalid. */
export function normalizeIndianPhone(input: string): string | null {
  const d = digitsOnly(input);
  return isValidIndianPhone(d) ? `+91${d}` : null;
}

/** Bare 10-digit form for wa.me-style use, or null. */
export function tenDigitOrNull(input: string): string | null {
  const d = digitsOnly(input);
  return isValidIndianPhone(d) ? d : null;
}
