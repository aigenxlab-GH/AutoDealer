import type { Vehicle } from "@/lib/types";
import { VehicleCard } from "@/components/vehicle-card";

export function VehicleGrid({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {vehicles.map((v) => (
        <VehicleCard key={v.id} vehicle={v} />
      ))}
    </div>
  );
}
