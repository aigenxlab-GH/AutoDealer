import type { Metadata } from "next";
import { CatalogContent } from "@/components/catalog/catalog-content";
import type { RawSearchParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Used Bikes for Sale",
  description:
    "Browse certified, well-maintained used bikes and scooters with transparent pricing.",
};

export default async function BikesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  return <CatalogContent type="bike" searchParams={sp} />;
}
