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
      className="dark-card group relative flex flex-col overflow-hidden rounded-2xl shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0c0d10]">
        <VehicleImage
          src={vehicle.primaryImageUrl}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          fill
          vehicleType={vehicle.type}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ filter: "brightness(0.88) saturate(0.95)" }}
        />
        {/* Atmospheric gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#14161b] via-transparent to-transparent opacity-80" />

        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          {vehicle.isFeatured && !vehicle.isSold && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{
                background: "linear-gradient(90deg,#c9973a,#f0c96a)",
                color: "#1a0f00",
                boxShadow: "0 2px 12px rgba(201,151,58,0.45)",
              }}
            >
              ✦ Featured
            </span>
          )}
          {vehicle.isSold && (
            <Badge variant="destructive" className="shadow-sm">Sold</Badge>
          )}
        </div>

        <ShortlistButton
          vehicleId={vehicle.id}
          className="absolute right-2.5 top-2.5 border border-white/10 bg-black/40 backdrop-blur-sm"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug tracking-tight text-white/90">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        {vehicle.variant && (
          <p className="mt-0.5 line-clamp-1 text-xs text-white/35">
            {vehicle.variant}
          </p>
        )}

        {/* Spec pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pills.map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center rounded-full border border-white/8 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/50"
            >
              {pill}
            </span>
          ))}
        </div>

        {/* Price row */}
        <div className="mt-auto flex items-end justify-between pt-3">
          {/* Shimmer gold price */}
          <span
            className="text-xl font-semibold"
            style={{
              fontFamily: "var(--font-heading)",
              background: "linear-gradient(90deg, #c9973a 0%, #f0c96a 50%, #c9973a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {formatPriceShort(vehicle.price)}
          </span>
          {vehicle.registrationCity && (
            <span className="flex items-center gap-1 text-[11px] text-white/30">
              <MapPin className="size-3" />
              {vehicle.registrationCity}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
