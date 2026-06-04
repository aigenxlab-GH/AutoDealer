import type { Vehicle } from "@/lib/types";
import { formatDate, formatKms } from "@/lib/format";
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
    if (v.fuelType) rows.push({ label: "Fuel Type", value: v.fuelType === "petrol-cng" ? "Petrol & CNG" : capitalize(v.fuelType) });
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
  if (v.type === "car" && v.ncapRating != null)
    rows.push({ label: "Global NCAP Rating", value: `${"★".repeat(v.ncapRating)}${"☆".repeat(5 - v.ncapRating)} (${v.ncapRating}/5)` });

  return rows;
}

export function SpecTable({ vehicle }: { vehicle: Vehicle }) {
  const specs = buildSpecs(vehicle);
  return (
    <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
      {specs.map((row) => (
        <div
          key={row.label}
          className="border-b py-2.5 text-sm"
        >
          {/* Mobile: label on top, value below — no truncation */}
          {/* Desktop (sm+): label left, value right on same line */}
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="text-xs text-muted-foreground sm:text-sm">{row.label}</dt>
            <dd className="font-medium sm:text-right">{row.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
