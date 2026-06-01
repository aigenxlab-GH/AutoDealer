import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { VehicleImage } from "@/components/vehicle-image";
import { ShortlistButton } from "@/components/shortlist-button";
import { Badge } from "@/components/ui/badge";
import { formatPriceShort } from "@/lib/format";
import { specPills } from "@/lib/vehicle-display";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const href = `/${vehicle.type}/${vehicle.id}`;
  const pills = specPills(vehicle);

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <VehicleImage
          src={vehicle.primaryImageUrl}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          fill
          vehicleType={vehicle.type}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute left-2 top-2 flex gap-1.5">
          {vehicle.isFeatured && !vehicle.isSold && (
            <Badge className="bg-gold text-gold-foreground hover:bg-gold">
              Featured
            </Badge>
          )}
          {vehicle.isSold && (
            <Badge variant="destructive">Sold</Badge>
          )}
        </div>

        <ShortlistButton
          vehicleId={vehicle.id}
          className="absolute right-2 top-2"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        {vehicle.variant && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {vehicle.variant}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {pills.map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {pill}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between pt-2">
          <span className="text-lg font-bold text-brand">
            {formatPriceShort(vehicle.price)}
          </span>
          {vehicle.registrationCity && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {vehicle.registrationCity}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
