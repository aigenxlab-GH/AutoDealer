import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  ChevronRight,
  Fuel,
  Gauge,
  MapPin,
  Settings2,
  User,
} from "lucide-react";
import { vehicleRepository } from "@/lib/data";
import type { Vehicle, VehicleType } from "@/lib/types";
import { VehicleGallery } from "@/components/vehicle-gallery";
import { SpecTable } from "@/components/spec-table";
import { EmiCalculator } from "@/components/emi-calculator";
import { ShareButton } from "@/components/share-button";
import { ShortlistButton } from "@/components/shortlist-button";
import { VehicleGrid } from "@/components/vehicle-grid";
import { SectionHeading } from "@/components/section-heading";
import { EnquiryModalHost } from "@/components/enquiry/enquiry-modal";
import { EnquireButton, StickyEnquireBar } from "@/components/enquiry/enquiry-cta";
import { VehicleJsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { formatKms, formatPriceFull } from "@/lib/format";
import { capitalize, ownerLabel } from "@/lib/vehicle-display";
import { vehicleTitle } from "@/lib/whatsapp";

export const revalidate = 300;

function isVehicleType(t: string): t is VehicleType {
  return t === "car" || t === "bike";
}

async function loadVehicle(type: string, id: string): Promise<Vehicle | null> {
  if (!isVehicleType(type)) return null;
  const vehicle = await vehicleRepository.getById(id);
  if (!vehicle || vehicle.type !== type) return null;
  return vehicle;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}): Promise<Metadata> {
  const { type, id } = await params;
  const vehicle = await loadVehicle(type, id);
  if (!vehicle) return { title: "Vehicle not found" };

  const title = `${vehicleTitle(vehicle)} — ${formatPriceFull(vehicle.price)}`;
  const description =
    vehicle.description ??
    `${vehicleTitle(vehicle)} for sale at ${siteConfig.name}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: vehicle.primaryImageUrl }],
    },
  };
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;

  const vehicle = await loadVehicle(type, id);
  if (!vehicle) notFound();

  await vehicleRepository.incrementViews(vehicle.id);
  const similar = await vehicleRepository.getSimilar(vehicle, 4);

  const highlights = [
    { icon: Calendar, label: "Year", value: String(vehicle.year) },
    { icon: Gauge, label: "KMs Driven", value: formatKms(vehicle.kmsDriven) },
    vehicle.type === "car"
      ? {
          icon: Fuel,
          label: "Fuel",
          value: capitalize(vehicle.fuelType ?? "—"),
        }
      : {
          icon: Settings2,
          label: "Engine",
          value: vehicle.engineCc ? `${vehicle.engineCc} cc` : "—",
        },
    { icon: User, label: "Ownership", value: ownerLabel(vehicle.owners) },
  ];

  const catalogHref = `/${vehicle.type}s`;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-12">
      <VehicleJsonLd vehicle={vehicle} />
      {/* Breadcrumb */}
      <nav className="mb-4 flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href={catalogHref} className="hover:text-foreground">
          {vehicle.type === "car" ? "Cars" : "Bikes"}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground min-w-0">{vehicleTitle(vehicle)}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-8 lg:col-span-2">
          <VehicleGallery
            images={vehicle.images}
            alt={vehicleTitle(vehicle)}
            vehicleType={vehicle.type}
            vehicleId={vehicle.id}
            isSold={vehicle.isSold}
          />

          {vehicle.description && (
            <section>
              <h2 className="text-lg font-semibold">Overview</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {vehicle.description}
              </p>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold">Specifications</h2>
            <div className="mt-3">
              <SpecTable vehicle={vehicle} />
            </div>
          </section>

          <section className="lg:hidden">
            <EmiCalculator price={vehicle.price} />
          </section>
        </div>

        {/* Right column (summary) */}
        <div className="lg:col-span-1">
          <div className="space-y-5 lg:sticky lg:top-20">
            <div className="rounded-2xl p-5" style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, transparent 60%), #14161b", border: "1px solid rgba(201,151,58,0.18)", boxShadow: "0 0 40px rgba(201,151,58,0.06)" }}>
              <div className="flex flex-wrap items-center gap-2">
                {vehicle.isFeatured && !vehicle.isSold && (
                  <Badge className="bg-gold text-gold-foreground hover:bg-gold">
                    ✦ Featured
                  </Badge>
                )}
                {vehicle.isSold && <Badge variant="destructive">Sold</Badge>}
                <Badge variant="secondary">
                  {vehicle.type === "car" ? "Car" : "Bike"}
                </Badge>
              </div>

              {/* h1 auto-serif via CSS */}
              <h1 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-white/90">
                {vehicleTitle(vehicle)}
              </h1>
              {vehicle.variant && (
                <p className="text-sm text-muted-foreground">{vehicle.variant}</p>
              )}

              <p className="font-heading mt-3 text-3xl font-semibold"
                style={{ background: "linear-gradient(90deg,#c9973a,#f0c96a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {formatPriceFull(vehicle.price)}
              </p>
              {vehicle.registrationCity && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" /> {vehicle.registrationCity}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                {highlights.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border/60 bg-secondary/50 p-3"
                  >
                    <Icon className="size-4 text-brand" />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {label}
                    </p>
                    <p className="text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              {!vehicle.isSold ? (
                <div className="mt-5 space-y-2">
                  <EnquireButton className="w-full" />
                  <div className="grid grid-cols-2 gap-2">
                    <ShortlistButton
                      vehicleId={vehicle.id}
                      variant="full"
                      className="w-full"
                    />
                    <ShareButton
                      title={vehicleTitle(vehicle)}
                      text={`Check out this ${vehicleTitle(vehicle)} at ${siteConfig.name}`}
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-5 rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
                  This vehicle has been sold. Browse similar options below.
                </p>
              )}
            </div>

            <div className="hidden lg:block">
              <EmiCalculator price={vehicle.price} />
            </div>
          </div>
        </div>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="mt-14">
          <SectionHeading
            title="Similar Vehicles"
            subtitle="You might also be interested in these"
            href={catalogHref}
          />
          <VehicleGrid vehicles={similar} />
        </section>
      )}

      {/* Lead flow */}
      <EnquiryModalHost vehicle={vehicle} />
      {!vehicle.isSold && <StickyEnquireBar vehicle={vehicle} />}
    </div>
  );
}
