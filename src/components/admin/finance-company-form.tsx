"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { saveFinanceCompanyAction } from "@/app/actions/admin";
import type { FinanceCompany, FinanceCompanyInput } from "@/lib/types";

const COLOR_PRESETS = [
  "#1a56db", // SBI blue
  "#00558f", // HDFC navy
  "#e67e00", // Bajaj orange
  "#2d7a3a", // SBI green variant
  "#7c3aed", // purple
  "#be123c", // red
  "#0f766e", // teal
  "#b45309", // amber
];

function defaultInput(): FinanceCompanyInput {
  return {
    name: "",
    shortName: "",
    interestRate: 9.0,
    maxTenureYears: 7,
    processingFee: "",
    highlights: ["", "", ""],
    color: "#1a56db",
    badge: "",
    isActive: true,
    sortOrder: 99,
  };
}

function fromCompany(c: FinanceCompany): FinanceCompanyInput {
  // Pad highlights to always have 3 slots in the form
  const h = [...c.highlights];
  while (h.length < 3) h.push("");
  return { ...c, highlights: h };
}

export function FinanceCompanyForm({ company }: { company?: FinanceCompany }) {
  const router = useRouter();
  const [form, setForm] = useState<FinanceCompanyInput>(
    company ? fromCompany(company) : defaultInput(),
  );
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FinanceCompanyInput>(
    key: K,
    value: FinanceCompanyInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setHighlight(index: number, value: string) {
    const next = [...form.highlights];
    next[index] = value;
    set("highlights", next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Strip empty highlight strings before saving
    const cleaned = {
      ...form,
      highlights: form.highlights.filter((h) => h.trim() !== ""),
    };
    const res = await saveFinanceCompanyAction(cleaned, company?.id);
    if (!res.ok) {
      setSubmitting(false);
      toast.error(res.error ?? "Could not save. Please try again.");
      return;
    }
    toast.success(company ? "Finance company updated" : "Finance company added");
    router.push("/admin/finance");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <Section title="Company Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company Name" required>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. SBI Car Loan"
              required
            />
          </Field>
          <Field label="Short Name" hint="Shown in the logo badge (max 5 chars)">
            <Input
              value={form.shortName}
              onChange={(e) => set("shortName", e.target.value.slice(0, 5))}
              placeholder="e.g. SBI"
              required
            />
          </Field>
          <Field label="Badge Label" hint="Short tag, e.g. 'Lowest Rate'">
            <Input
              value={form.badge}
              onChange={(e) => set("badge", e.target.value)}
              placeholder="e.g. Most Popular"
            />
          </Field>
          <Field label="Processing Fee">
            <Input
              value={form.processingFee}
              onChange={(e) => set("processingFee", e.target.value)}
              placeholder="e.g. 0.50% (min ₹3,000)"
            />
          </Field>
        </div>
      </Section>

      {/* Rates */}
      <Section title="Loan Terms">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Interest Rate (% p.a.)" required>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min={1}
                max={40}
                value={form.interestRate}
                onChange={(e) => set("interestRate", parseFloat(e.target.value) || 0)}
                required
              />
              <span className="text-sm text-white/40">% p.a.</span>
            </div>
          </Field>
          <Field label="Max Tenure (years)" required>
            <Input
              type="number"
              min={1}
              max={10}
              value={form.maxTenureYears}
              onChange={(e) => set("maxTenureYears", parseInt(e.target.value) || 1)}
              required
            />
          </Field>
          <Field label="Display Order" hint="Lower number = shown first on Finance page">
            <Input
              type="number"
              min={1}
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", parseInt(e.target.value) || 1)}
            />
          </Field>
        </div>
      </Section>

      {/* Highlights */}
      <Section title="Feature Highlights" subtitle="Up to 3 bullet points shown on the Finance page">
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] text-white/40">
                {i + 1}
              </span>
              <Input
                value={form.highlights[i] ?? ""}
                onChange={(e) => setHighlight(i, e.target.value)}
                placeholder={
                  i === 0
                    ? "e.g. Lowest rates for used cars"
                    : i === 1
                      ? "e.g. No prepayment penalty"
                      : "e.g. Simple documentation"
                }
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Colour */}
      <Section title="Logo Badge Colour">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("color", c)}
                className="size-8 rounded-lg border-2 transition-all"
                style={{
                  background: c,
                  borderColor: form.color === c ? "#f0c96a" : "transparent",
                  boxShadow: form.color === c ? "0 0 0 1px #c9973a" : undefined,
                }}
                title={c}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-lg"
              style={{ background: form.color }}
            />
            <Input
              value={form.color}
              onChange={(e) => set("color", e.target.value)}
              placeholder="#1a56db"
              className="w-32 font-mono text-sm"
            />
            <span className="text-xs text-white/35">HEX colour code</span>
          </div>
        </div>
      </Section>

      {/* Status */}
      <Section title="Visibility">
        <div className="flex items-center justify-between rounded-xl border border-white/8 p-4">
          <div>
            <p className="text-sm font-medium text-white/80">Show on Finance page</p>
            <p className="text-xs text-white/35">
              Only active companies appear in the public EMI calculator.
            </p>
          </div>
          <Switch
            checked={form.isActive}
            onCheckedChange={(v) => set("isActive", v)}
          />
        </div>
      </Section>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/finance")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {company ? "Save Changes" : "Add Finance Company"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, transparent 60%), #14161b",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <h2 className="mb-1 text-sm font-semibold text-white/70">{title}</h2>
      {subtitle && <p className="mb-4 text-xs text-white/35">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/60">
        {label}
        {required && <span className="text-destructive"> *</span>}
        {hint && <span className="ml-1 text-[11px] font-normal text-white/30">— {hint}</span>}
      </Label>
      {children}
    </div>
  );
}
