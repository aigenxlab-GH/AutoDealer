import { siteConfig } from "@/config/site";
import type { Vehicle } from "@/lib/types";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** schema.org Car/Motorcycle markup for a vehicle detail page. */
export function VehicleJsonLd({ vehicle }: { vehicle: Vehicle }) {
  const base = siteConfig.url.replace(/\/$/, "");
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": vehicle.type === "car" ? "Car" : "Motorcycle",
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    url: `${base}/${vehicle.type}/${vehicle.id}`,
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    color: vehicle.color,
    image: vehicle.images,
    description: vehicle.description,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.kmsDriven,
      unitCode: "KMT",
    },
    numberOfPreviousOwners: vehicle.owners,
    itemCondition: "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: vehicle.price,
      itemCondition: "https://schema.org/UsedCondition",
      availability: vehicle.isSold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      seller: { "@type": "AutoDealer", name: siteConfig.name },
    },
  };

  if (vehicle.type === "car") {
    if (vehicle.fuelType) data.fuelType = vehicle.fuelType;
    if (vehicle.transmission) data.vehicleTransmission = vehicle.transmission;
  } else if (vehicle.engineCc) {
    data.vehicleEngine = {
      "@type": "EngineSpecification",
      engineDisplacement: {
        "@type": "QuantitativeValue",
        value: vehicle.engineCc,
        unitCode: "CMQ",
      },
    };
  }

  return <JsonLd data={data} />;
}

/** schema.org AutoDealer markup for the dealership (homepage). */
export function DealerJsonLd() {
  const d = siteConfig.dealer;
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: d.phoneDisplay,
    email: d.email,
    foundingDate: String(d.establishedYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: d.addressLine,
      addressLocality: d.city,
      addressRegion: d.state,
      postalCode: d.pincode,
      addressCountry: "IN",
    },
  };
  return <JsonLd data={data} />;
}
