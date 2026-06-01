import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { vehicleRepository } from "@/lib/data";
import { VehicleForm } from "@/components/admin/vehicle-form";

export const metadata: Metadata = {
  title: "Edit Vehicle",
  robots: { index: false },
};

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await vehicleRepository.getById(id);
  if (!vehicle) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to inventory
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Edit {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
      </div>
      <VehicleForm vehicle={vehicle} />
    </div>
  );
}
