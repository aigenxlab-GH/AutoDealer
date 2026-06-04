"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { calculateEmi } from "@/lib/emi";
import { formatPriceFull, formatPriceShort } from "@/lib/format";

const num = (v: number | readonly number[]) =>
  Array.isArray(v) ? v[0] : (v as number);

export function EmiCalculator({ price }: { price: number }) {
  const [downPayment, setDownPayment] = useState(Math.round(price * 0.2));
  const [rate, setRate] = useState(9.5);
  const [tenure, setTenure] = useState(60);

  const principal = Math.max(0, price - downPayment);
  const result = useMemo(
    () => calculateEmi({ principal, annualRatePct: rate, tenureMonths: tenure }),
    [principal, rate, tenure],
  );

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <Calculator className="size-5 text-brand" />
        <h3 className="font-semibold">EMI Calculator</h3>
      </div>

      <div className="mt-5 rounded-lg bg-brand/5 p-4 text-center">
        <p className="text-xs text-muted-foreground">Your Monthly EMI</p>
        <p className="text-3xl font-bold text-brand">
          {formatPriceFull(result.emi)}
          <span className="text-sm font-normal text-muted-foreground">/mo</span>
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {/* Down Payment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Down Payment</Label>
            <span className="font-medium">{formatPriceShort(downPayment)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Decrease"
              onClick={() => setDownPayment((p) => Math.max(0, p - 5000))}
              className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted text-lg font-bold leading-none hover:bg-accent transition-colors">
              −
            </button>
            <Slider value={[downPayment]} min={0} max={price} step={5000}
              onValueChange={(v) => setDownPayment(num(v))} />
            <button type="button" aria-label="Increase"
              onClick={() => setDownPayment((p) => Math.min(price, p + 5000))}
              className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted text-lg font-bold leading-none hover:bg-accent transition-colors">
              +
            </button>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Interest Rate</Label>
            <span className="font-medium">{rate.toFixed(1)}% p.a.</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Decrease"
              onClick={() => setRate((r) => Math.max(6, parseFloat((r - 0.5).toFixed(1))))}
              className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted text-lg font-bold leading-none hover:bg-accent transition-colors">
              −
            </button>
            <Slider value={[rate]} min={6} max={18} step={0.1}
              onValueChange={(v) => setRate(num(v))} />
            <button type="button" aria-label="Increase"
              onClick={() => setRate((r) => Math.min(18, parseFloat((r + 0.5).toFixed(1))))}
              className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted text-lg font-bold leading-none hover:bg-accent transition-colors">
              +
            </button>
          </div>
        </div>

        {/* Loan Tenure */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Loan Tenure</Label>
            <span className="font-medium">{tenure} months</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Decrease"
              onClick={() => setTenure((t) => Math.max(12, t - 6))}
              className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted text-lg font-bold leading-none hover:bg-accent transition-colors">
              −
            </button>
            <Slider value={[tenure]} min={12} max={84} step={6}
              onValueChange={(v) => setTenure(num(v))} />
            <button type="button" aria-label="Increase"
              onClick={() => setTenure((t) => Math.min(84, t + 6))}
              className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted text-lg font-bold leading-none hover:bg-accent transition-colors">
              +
            </button>
          </div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3 border-t pt-4 text-center">
        <div>
          <dt className="text-xs text-muted-foreground">Loan Amount</dt>
          <dd className="mt-0.5 text-sm font-semibold">
            {formatPriceShort(result.principal)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Total Interest</dt>
          <dd className="mt-0.5 text-sm font-semibold">
            {formatPriceShort(result.totalInterest)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Total Payable</dt>
          <dd className="mt-0.5 text-sm font-semibold">
            {formatPriceShort(result.totalPayable)}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        * Indicative only. Actual rates and EMI may vary by lender and profile.
      </p>
    </div>
  );
}
