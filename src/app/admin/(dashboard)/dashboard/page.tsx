import type { Metadata } from "next";
import Link from "next/link";
import { Car, CheckCircle2, Inbox, PlusCircle, Tag } from "lucide-react";
import { vehicleRepository, leadRepository } from "@/lib/data";
import { InventoryTable } from "@/components/admin/inventory-table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Inventory",
  robots: { index: false },
};

export default async function AdminDashboardPage() {
  const [vehicles, leadCounts, leads] = await Promise.all([
    vehicleRepository.list({ includeSold: true, sort: "newest" }),
    leadRepository.countByVehicle(),
    leadRepository.list(),
  ]);

  const active = vehicles.filter((v) => !v.isSold).length;
  const sold = vehicles.length - active;

  const stats = [
    { label: "Total Vehicles", value: vehicles.length, icon: Car },
    { label: "Active", value: active, icon: CheckCircle2 },
    { label: "Sold", value: sold, icon: Tag },
    { label: "Total Leads", value: leads.length, icon: Inbox },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage your vehicle listings and track enquiries.
          </p>
        </div>
        <Link
          href="/admin/dashboard/new"
          className={cn(buttonVariants(), "shrink-0")}
        >
          <PlusCircle className="size-4" /> Add Vehicle
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className="size-4 text-brand" />
            </div>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <InventoryTable vehicles={vehicles} leadCounts={leadCounts} />
    </div>
  );
}
