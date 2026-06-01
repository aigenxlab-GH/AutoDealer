import type { Metadata } from "next";
import { vehicleRepository, leadRepository } from "@/lib/data";
import { LeadsTable } from "@/components/admin/leads-table";
import { vehicleTitle } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Leads",
  robots: { index: false },
};

export default async function AdminLeadsPage() {
  const [leads, vehicles] = await Promise.all([
    leadRepository.list(),
    vehicleRepository.list({ includeSold: true }),
  ]);

  const vehicleTitles: Record<string, string> = Object.fromEntries(
    vehicles.map((v) => [v.id, vehicleTitle(v)]),
  );

  const counts = {
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    closed: leads.filter((l) => l.status === "closed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Enquiries captured before customers were routed to WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="New" value={counts.new} className="text-blue-600" />
        <Stat
          label="Contacted"
          value={counts.contacted}
          className="text-amber-600"
        />
        <Stat
          label="Closed"
          value={counts.closed}
          className="text-emerald-600"
        />
      </div>

      <LeadsTable leads={leads} vehicleTitles={vehicleTitles} />
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${className}`}>{value}</p>
    </div>
  );
}
