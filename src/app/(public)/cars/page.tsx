import type { Metadata } from "next";
import { CatalogContent } from "@/components/catalog/catalog-content";
import type { RawSearchParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Used Cars for Sale",
  description:
    "Browse certified, fully-inspected used cars with transparent pricing and verified history.",
};

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  return <CatalogContent type="car" searchParams={sp} />;
}
