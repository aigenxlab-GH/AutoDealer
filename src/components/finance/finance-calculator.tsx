"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Calculator, IndianRupee, MessageCircle, TrendingDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { calculateEmi } from "@/lib/emi";
import { formatPriceFull, formatPriceShort } from "@/lib/format";
import { siteConfig } from "@/config/site";

// ── Finance companies ────────────────────────────────────────────────────────
const COMPANIES = [
  {
    id: "sbi",
    name: "SBI Car Loan",
    shortName: "SBI",
    rate: 8.85,
    rateDisplay: "8.85% p.a.*",
    maxTenureYears: 7,
    processingFee: "0.50% (min ₹3,000)",
    highlights: ["Lowest rates for used cars", "No prepayment penalty", "Simple documentation"],
    color: "#1a56db",
    badge: "Most Popular",
  },
  {
    id: "hdfc",
    name: "HDFC Bank",
    shortName: "HDFC",
    rate: 9.40,
    rateDisplay: "9.40% p.a.*",
    maxTenureYears: 7,
    processingFee: "₹3,000 – ₹5,000",
    highlights: ["30-min approval decision", "Minimal documentation", "Doorstep service available"],
    color: "#00558f",
    badge: "Fastest Approval",
  },
  {
    id: "bajaj",
    name: "Bajaj Finance",
    shortName: "Bajaj",
    rate: 10.99,
    rateDisplay: "10.99% p.a.*",
    maxTenureYears: 5,
    processingFee: "Up to 3.54%",
    highlights: ["Pre-approved offers", "High LTV ratio", "Flexible repayment options"],
    color: "#e67e00",
    badge: "Flexible Terms",
  },
] as const;

const TENURES = [12, 24, 36, 48, 60, 72, 84];

function n(v: number | readonly number[]) {
  return Array.isArray(v) ? (v as number[])[0] : (v as number);
}

export function FinanceCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState(800000);
  const [downPayment, setDownPayment] = useState(200000);
  const [tenureMonths, setTenureMonths] = useState(60);

  const principal = Math.max(0, vehiclePrice - downPayment);

  const results = useMemo(
    () =>
      COMPANIES.map((c) => ({
        ...c,
        ...calculateEmi({ principal, annualRatePct: c.rate, tenureMonths }),
      })),
    [principal, tenureMonths],
  );

  const minEmi = Math.min(...results.map((r) => r.emi));

  function waUrl(company: (typeof COMPANIES)[number]) {
    const msg = `Hi! I want to apply for a car loan through ${company.name}.\n\nVehicle Price: ${formatPriceShort(vehiclePrice)}\nDown Payment: ${formatPriceShort(downPayment)}\nLoan Amount: ${formatPriceShort(principal)}\nTenure: ${tenureMonths} months\nExpected EMI: ${formatPriceFull(calculateEmi({ principal, annualRatePct: company.rate, tenureMonths }).emi)}/mo @ ${company.rateDisplay}\n\nPlease help me proceed.`;
    return `https://wa.me/${siteConfig.dealer.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10">
        <div className="mb-1 h-px w-8" style={{ background: "linear-gradient(90deg,#c9973a,#f0c96a)" }} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#c9973a" }}>
          Car Finance
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
          Easy EMI for your next car
        </h1>
        <p className="mt-2 max-w-xl text-[15px] text-white/40">
          Compare monthly EMI across SBI, HDFC &amp; Bajaj Finance. Adjust loan details
          and apply instantly on WhatsApp — we&rsquo;ll help you get approved fast.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* ── CALCULATOR PANEL ── */}
        <div
          className="rounded-2xl p-6 lg:col-span-2"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, transparent 60%), #14161b",
            border: "1px solid rgba(201,151,58,0.18)",
            boxShadow: "0 0 40px rgba(201,151,58,0.05)",
          }}
        >
          <div className="mb-6 flex items-center gap-2">
            <Calculator className="size-5" style={{ color: "#c9973a" }} />
            <h2 className="text-base font-semibold text-white/80">Loan Calculator</h2>
          </div>

          <div className="space-y-8">
            {/* Vehicle price */}
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <label className="text-sm text-white/50">Vehicle Price</label>
                <span
                  className="text-sm font-semibold"
                  style={{
                    background: "linear-gradient(90deg,#c9973a,#f0c96a)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {formatPriceShort(vehiclePrice)}
                </span>
              </div>
              <Slider
                value={[vehiclePrice]}
                min={100000}
                max={3000000}
                step={25000}
                onValueChange={(v) => {
                  const val = n(v);
                  setVehiclePrice(val);
                  if (downPayment > val * 0.8) setDownPayment(Math.round(val * 0.2));
                }}
              />
              <div className="mt-1.5 flex justify-between text-[11px] text-white/20">
                <span>₹1 Lakh</span><span>₹30 Lakh</span>
              </div>
            </div>

            {/* Down payment */}
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <label className="text-sm text-white/50">Down Payment</label>
                <span className="text-sm font-semibold text-white/70">
                  {formatPriceShort(downPayment)}{" "}
                  <span className="text-[11px] font-normal text-white/30">
                    ({Math.round((downPayment / vehiclePrice) * 100)}%)
                  </span>
                </span>
              </div>
              <Slider
                value={[downPayment]}
                min={0}
                max={Math.round(vehiclePrice * 0.8)}
                step={10000}
                onValueChange={(v) => setDownPayment(n(v))}
              />
              <div className="mt-1.5 flex justify-between text-[11px] text-white/20">
                <span>₹0</span>
                <span>{formatPriceShort(Math.round(vehiclePrice * 0.8))}</span>
              </div>
            </div>

            {/* Tenure */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm text-white/50">Loan Tenure</label>
                <span className="text-sm font-semibold text-white/70">{tenureMonths} months</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TENURES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTenureMonths(t)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                    style={
                      tenureMonths === t
                        ? { background: "#c9973a", color: "#1a0f00" }
                        : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }
                    }
                  >
                    {t === 12 ? "1 yr" : t === 84 ? "7 yr" : `${t / 12} yr`}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary box */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: "rgba(201,151,58,0.06)", border: "1px solid rgba(201,151,58,0.14)" }}
            >
              <div className="flex items-center gap-1.5">
                <IndianRupee className="size-3.5" style={{ color: "#c9973a" }} />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/35">
                  Loan Summary
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-y-3 text-sm">
                {[
                  ["Vehicle Price", formatPriceShort(vehiclePrice)],
                  ["Down Payment", formatPriceShort(downPayment)],
                  ["Loan Amount", formatPriceShort(principal)],
                  ["Tenure", `${tenureMonths} months`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[11px] text-white/30">{label}</dt>
                    <dd className="font-semibold text-white/75">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* ── COMPANY CARDS ── */}
        <div className="space-y-4 lg:col-span-3">
          {results.map((r) => {
            const isBest = r.emi === minEmi;
            return (
              <div
                key={r.id}
                className="rounded-2xl p-5 transition-all duration-300"
                style={{
                  background: isBest
                    ? "linear-gradient(145deg, rgba(201,151,58,0.07) 0%, transparent 50%), #14161b"
                    : "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, transparent 60%), #14161b",
                  border: isBest
                    ? "1px solid rgba(201,151,58,0.35)"
                    : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: isBest ? "0 0 40px rgba(201,151,58,0.07)" : undefined,
                }}
              >
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Bank logo placeholder */}
                    <div
                      className="flex size-12 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold text-white"
                      style={{ background: r.color }}
                    >
                      {r.shortName}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white/85">{r.name}</span>
                        {isBest ? (
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                            style={{ background: "linear-gradient(90deg,#c9973a,#f0c96a)", color: "#1a0f00" }}
                          >
                            ✦ Best EMI
                          </span>
                        ) : (
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
                          >
                            {r.badge}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs">
                        <span style={{ color: "#c9973a" }}>{r.rateDisplay}</span>
                        <span className="text-white/25">·</span>
                        <span className="text-white/35">Up to {r.maxTenureYears} years</span>
                      </div>
                    </div>
                  </div>

                  {/* EMI amount */}
                  <div className="text-right">
                    <div
                      className="text-2xl font-semibold leading-none"
                      style={{
                        fontFamily: "var(--font-heading)",
                        background: "linear-gradient(90deg,#c9973a,#f0c96a)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {formatPriceFull(r.emi)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-white/30">per month</div>
                  </div>
                </div>

                {/* Breakdown */}
                <div
                  className="mt-4 grid grid-cols-3 gap-4 border-t pt-4"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  {[
                    ["Total Payable", formatPriceShort(r.totalPayable)],
                    ["Total Interest", formatPriceShort(r.totalInterest)],
                    ["Processing Fee", r.processingFee],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-[11px] text-white/30">{label}</div>
                      <div className="mt-0.5 text-sm font-medium text-white/60">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Feature chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.highlights.map((h) => (
                    <span
                      key={h}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-white/40"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <BadgeCheck className="size-3" style={{ color: "#c9973a" }} />
                      {h}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-5">
                  <a
                    href={waUrl(r)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95"
                    style={{ boxShadow: "0 4px 16px rgba(37,211,102,0.25)" }}
                  >
                    <MessageCircle className="size-4" />
                    Apply via WhatsApp — {r.name}
                  </a>
                </div>
              </div>
            );
          })}

          <p className="px-1 text-[11px] text-white/20">
            * Interest rates are indicative and vary based on credit score, vehicle age, loan-to-value ratio,
            and individual bank policy. EMI calculated using reducing-balance method. Final rates are at the
            discretion of the respective bank/NBFC.
          </p>
        </div>
      </div>

      {/* Bottom help CTA */}
      <div
        className="mt-12 flex flex-col items-center justify-between gap-5 rounded-2xl px-8 py-8 sm:flex-row"
        style={{
          background: "linear-gradient(135deg, rgba(201,151,58,0.07) 0%, transparent 50%), #14161b",
          border: "1px solid rgba(201,151,58,0.18)",
        }}
      >
        <div>
          <div className="flex items-center gap-2 text-white/80">
            <TrendingDown className="size-5" style={{ color: "#c9973a" }} />
            <h2 className="text-lg font-semibold">Not sure which loan is right for you?</h2>
          </div>
          <p className="mt-1 text-sm text-white/35">
            Our team compares all options and gets you the best rate — completely free.
          </p>
        </div>
        <a
          href={`https://wa.me/${siteConfig.dealer.whatsappNumber}?text=${encodeURIComponent("Hi! I need help choosing the best car loan. Please advise on the right finance plan for my budget.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          style={{ boxShadow: "0 4px 20px rgba(37,211,102,0.3)" }}
        >
          <MessageCircle className="size-4" /> Talk to our finance team
        </a>
      </div>
    </div>
  );
}
