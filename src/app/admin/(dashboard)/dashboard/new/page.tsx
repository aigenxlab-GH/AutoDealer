import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { catalogRepository } from "@/lib/data";

export const metadata: Metadata = {
  title: "Add Vehicle",
  robots: { index: false },
};

export default async function NewVehiclePage() {
  const [makes, models, variants] = await Promise.all([
    catalogRepository.listMakes(),
    catalogRepository.listModels(),
    catalogRepository.listVariants(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to inventory
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Add Vehicle</h1>
      </div>
      <VehicleForm makes={makes} models={models} variants={variants} />
    </div>
  );
}
