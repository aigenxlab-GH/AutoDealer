// Standard reducing-balance EMI math.

export interface EmiParams {
  /** Loan principal in rupees (price minus down payment). */
  principal: number;
  /** Annual interest rate as a percentage, e.g. 9.5 */
  annualRatePct: number;
  /** Loan tenure in months. */
  tenureMonths: number;
}

export interface EmiResult {
  /** Monthly instalment (rounded rupees). */
  emi: number;
  /** Total amount payable over the tenure. */
  totalPayable: number;
  /** Total interest component. */
  totalInterest: number;
  principal: number;
}

/**
 * EMI = P·r·(1+r)^n / ((1+r)^n − 1), where r is the monthly rate.
 * Falls back to simple division when the rate is 0.
 */
export function calculateEmi({
  principal,
  annualRatePct,
  tenureMonths,
}: EmiParams): EmiResult {
  const p = Math.max(0, principal);
  const n = Math.max(1, Math.round(tenureMonths));

  if (annualRatePct <= 0) {
    const emi = Math.round(p / n);
    return { emi, totalPayable: emi * n, totalInterest: 0, principal: p };
  }

  const r = annualRatePct / 12 / 100;
  const factor = Math.pow(1 + r, n);
  const emi = Math.round((p * r * factor) / (factor - 1));
  const totalPayable = emi * n;

  return {
    emi,
    totalPayable,
    totalInterest: Math.max(0, totalPayable - p),
    principal: p,
  };
}
