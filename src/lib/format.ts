// Indian-locale formatting helpers (₹, lakh/crore grouping, kilometres).

const inr = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const ONE_LAKH = 100_000;
const ONE_CRORE = 10_000_000;

/** Trim trailing zeros from a fixed-decimal string: "6.80" -> "6.8", "6.00" -> "6". */
function trim(n: number, digits = 2): string {
  return parseFloat(n.toFixed(digits)).toString();
}

/**
 * Short, human price: ₹6.85 Lakh / ₹1.68 Crore / ₹72,000.
 * Used on cards and headings.
 */
export function formatPriceShort(amount: number): string {
  if (amount >= ONE_CRORE) return `₹${trim(amount / ONE_CRORE)} Cr`;
  if (amount >= ONE_LAKH) return `₹${trim(amount / ONE_LAKH)} Lakh`;
  return `₹${inr.format(amount)}`;
}

/** Exact price with Indian digit grouping: ₹6,85,000. */
export function formatPriceFull(amount: number): string {
  return `₹${inr.format(amount)}`;
}

/** "28,400 km" */
export function formatKms(kms: number): string {
  return `${inr.format(kms)} km`;
}

/** Generic Indian-grouped integer. */
export function formatNumberIN(value: number): string {
  return inr.format(value);
}

/** "12 Jun 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Relative-ish short date for tables: "12 Jun 2026, 3:45 PM" */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
