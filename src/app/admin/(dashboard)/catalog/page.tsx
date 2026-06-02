import type { Metadata } from "next";
import { catalogRepository } from "@/lib/data";
import { CatalogManager } from "@/components/admin/catalog-manager";

export const metadata: Metadata = {
  title: "Vehicle Catalog",
  robots: { index: false },
};

export default async function AdminCatalogPage() {
  const [makes, models, variants] = await Promise.all([
    catalogRepository.listMakes(),
    catalogRepository.listModels(),
    catalogRepository.listVariants(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white/90">
          Vehicle Catalog
        </h1>
        <p className="text-sm text-white/40">
          Manage makes, models, and variants used when adding vehicles.
        </p>
      </div>
      <CatalogManager makes={makes} models={models} variants={variants} />
    </div>
  );
}
