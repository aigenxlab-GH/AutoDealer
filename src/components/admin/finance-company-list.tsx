"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { FinanceCompany } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  deleteFinanceCompanyAction,
  toggleFinanceCompanyAction,
} from "@/app/actions/admin";

export function FinanceCompanyList({
  companies,
}: {
  companies: FinanceCompany[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle(c: FinanceCompany) {
    startTransition(async () => {
      await toggleFinanceCompanyAction(c.id, !c.isActive);
      toast.success(c.isActive ? "Hidden from Finance page" : "Visible on Finance page");
      router.refresh();
    });
  }

  function remove(c: FinanceCompany) {
    if (!confirm(`Delete "${c.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteFinanceCompanyAction(c.id);
      toast.success(`${c.name} deleted`);
      router.refresh();
    });
  }

  if (companies.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl py-16 text-center"
        style={{ background: "#14161b", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <p className="text-sm text-white/40">No finance companies yet.</p>
        <Link
          href="/admin/finance/new"
          className={cn(buttonVariants(), "mt-4")}
        >
          Add your first company
        </Link>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <table className="w-full text-sm">
        <thead style={{ background: "#0f1014", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <tr>
            {["Company", "Rate", "Max Tenure", "Highlights", "Status", "Actions"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-white/30"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {companies.map((c, i) => (
            <tr
              key={c.id}
              style={{
                background: i % 2 === 0 ? "#14161b" : "#131518",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {/* Company */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ background: c.color }}
                  >
                    {c.shortName}
                  </div>
                  <div>
                    <p className="font-medium text-white/80">{c.name}</p>
                    {c.badge && (
                      <p className="text-[11px] text-white/30">{c.badge}</p>
                    )}
                  </div>
                </div>
              </td>

              {/* Rate */}
              <td className="px-4 py-3">
                <span
                  className="text-sm font-semibold"
                  style={{
                    background: "linear-gradient(90deg,#c9973a,#f0c96a)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {c.interestRate.toFixed(2)}% p.a.
                </span>
              </td>

              {/* Tenure */}
              <td className="px-4 py-3 text-white/50">
                {c.maxTenureYears} years
              </td>

              {/* Highlights */}
              <td className="px-4 py-3">
                <ul className="space-y-0.5">
                  {c.highlights.slice(0, 2).map((h) => (
                    <li key={h} className="text-[12px] text-white/35">
                      · {h}
                    </li>
                  ))}
                  {c.highlights.length > 2 && (
                    <li className="text-[11px] text-white/25">
                      +{c.highlights.length - 2} more
                    </li>
                  )}
                </ul>
              </td>

              {/* Active toggle */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={c.isActive}
                    onCheckedChange={() => toggle(c)}
                    disabled={pending}
                  />
                  <span className={`text-xs ${c.isActive ? "text-emerald-400" : "text-white/30"}`}>
                    {c.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/finance/${c.id}/edit`}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "text-white/40 hover:text-white",
                    )}
                    title="Edit"
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => remove(c)}
                    title="Delete"
                    className="text-destructive/60 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
