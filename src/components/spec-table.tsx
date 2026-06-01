import type { Vehicle } from "@/lib/types";
import { formatDate, formatKms, formatNumberIN } from "@/lib/format";
import { capitalize, ownerLabel } from "@/lib/vehicle-display";

function buildSpecs(v: Vehicle): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [
    { label: "Make", value: v.make },
    { label: "Model", value: v.model },
  ];
  if (v.variant) rows.push({ label: "Variant", value: v.variant });
  rows.push({ label: "Year", value: String(v.year) });
  rows.push({ label: "Kilometres", value: formatKms(v.kmsDriven) });
  rows.push({ label: "Ownership", value: ownerLabel(v.owners) });

  if (v.type === "car") {
    if (v.fuelType) rows.push({ label: "Fuel Type", value: capitalize(v.fuelType) });
    if (v.transmission)
      rows.push({ label: "Transmission", value: capitalize(v.transmission) });
  } else {
    if (v.engineCc) rows.push({ label: "Engine", value: `${v.engineCc} cc` });
  }

  if (v.mileage)
    rows.push({
      label: "Mileage",
      value: `${v.mileage} ${v.type === "car" ? "km/l" : "kmpl"}`,
    });
  if (v.bodyType) rows.push({ label: "Body Type", value: v.bodyType });
  if (v.color) rows.push({ label: "Colour", value: v.color });
  if (v.registrationCity)
    rows.push({ label: "Registration City", value: v.registrationCity });
  if (v.registrationNumber)
    rows.push({ label: "Registration No.", value: v.registrationNumber });
  if (v.insuranceValidTill)
    rows.push({
      label: "Insurance Valid Till",
      value: formatDate(v.insuranceValidTill),
    });
  rows.push({ label: "Listing Views", value: formatNumberIN(v.views) });

  return rows;
}

export function SpecTable({ vehicle }: { vehicle: Vehicle }) {
  const specs = buildSpecs(vehicle);
  return (
    <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
      {specs.map((row) => (
        <div
          key={row.label}
          className="flex justify-between gap-4 border-b py-2.5 text-sm"
        >
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="text-right font-medium">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
