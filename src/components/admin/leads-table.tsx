"use client";

import { useMemo, useState, useTransition } from "react";
import { Download, Phone, Search } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import type { Lead, LeadStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { updateLeadStatusAction } from "@/app/actions/admin";

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "closed"];

const statusStyles: Record<LeadStatus, string> = {
  new: "text-blue-600",
  contacted: "text-amber-600",
  closed: "text-emerald-600",
};

function toCsv(leads: Lead[], titles: Record<string, string>): string {
  const header = ["Name", "Phone", "Vehicle", "Status", "Date"];
  const rows = leads.map((l) => [
    l.customerName,
    l.customerPhone,
    titles[l.vehicleId] ?? l.vehicleId,
    l.status,
    new Date(l.createdAt).toISOString(),
  ]);
  return [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export function LeadsTable({
  leads,
  vehicleTitles,
}: {
  leads: Lead[];
  vehicleTitles: Record<string, string>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      `${l.customerName} ${l.customerPhone} ${vehicleTitles[l.vehicleId] ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [leads, query, vehicleTitles]);

  function setStatus(lead: Lead, status: LeadStatus) {
    startTransition(async () => {
      await updateLeadStatusAction(lead.id, status);
      toast.success("Lead updated");
      router.refresh();
    });
  }

  function exportCsv() {
    const blob = new Blob([toCsv(filtered, vehicleTitles)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads…"
            className="h-9 pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="h-9"
        >
          <Download className="size-4" /> Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Vehicle</th>
              <th className="p-3 font-medium">Received</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 text-right font-medium">Contact</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => {
              const digits = lead.customerPhone.replace(/[^\d]/g, "");
              return (
                <tr key={lead.id} className="border-b last:border-0">
                  <td className="p-3">
                    <p className="font-medium">{lead.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.customerPhone}
                    </p>
                  </td>
                  <td className="p-3">
                    {vehicleTitles[lead.vehicleId] ?? (
                      <span className="text-muted-foreground">Removed listing</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap p-3 text-muted-foreground">
                    {formatDateTime(lead.createdAt)}
                  </td>
                  <td className="p-3">
                    <Select
                      value={lead.status}
                      onValueChange={(v) => setStatus(lead, v as LeadStatus)}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-8 w-32 capitalize",
                          statusStyles[lead.status],
                        )}
                        disabled={pending}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`tel:${lead.customerPhone}`}
                        className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Call"
                      >
                        <Phone className="size-4" />
                      </a>
                      <a
                        href={`https://wa.me/${digits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-8 items-center justify-center rounded-md text-[#25D366] hover:bg-accent"
                        title="WhatsApp"
                      >
                        <WhatsAppIcon className="size-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-sm text-muted-foreground"
                >
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
