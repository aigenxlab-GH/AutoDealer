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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <VehicleImage
          src={vehicle.primaryImageUrl}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          fill
          vehicleType={vehicle.type}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Bottom gradient for legibility */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          {vehicle.isFeatured && !vehicle.isSold && (
            <Badge className="bg-gold/95 text-gold-foreground shadow-sm hover:bg-gold">
              ✦ Featured
            </Badge>
          )}
          {vehicle.isSold && (
            <Badge variant="destructive" className="shadow-sm">Sold</Badge>
          )}
        </div>

        <ShortlistButton
          vehicleId={vehicle.id}
          className="absolute right-2.5 top-2.5"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title — uses global serif h3 */}
        <h3 className="line-clamp-1 text-base font-semibold leading-snug tracking-tight">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        {vehicle.variant && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {vehicle.variant}
          </p>
        )}

        {/* Spec pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pills.map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center rounded-full border border-border/70 bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
            >
              {pill}
            </span>
          ))}
        </div>

        {/* Price row */}
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="font-heading text-xl font-semibold text-brand">
            {formatPriceShort(vehicle.price)}
          </span>
          {vehicle.registrationCity && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="size-3" />
              {vehicle.registrationCity}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
