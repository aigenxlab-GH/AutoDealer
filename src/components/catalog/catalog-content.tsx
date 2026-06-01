import { vehicleRepository } from "@/lib/data";
import type { VehicleType } from "@/lib/types";
import { VehicleGrid } from "@/components/vehicle-grid";
import { parseVehicleFilters, type RawSearchParams } from "@/lib/search-params";
import { FilterBar } from "./filter-bar";
import { MobileFilters } from "./mobile-filters";
import { SearchInput } from "./search-input";
import { SortSelect } from "./sort-select";
import { EmptyState } from "./empty-state";

const PRICE_STEP = 25_000;
const KMS_STEP = 5_000;

function roundDown(n: number, step: number) {
  return Math.floor(n / step) * step;
}
function roundUp(n: number, step: number) {
  return Math.ceil(n / step) * step;
}

export async function CatalogContent({
  type,
  searchParams,
}: {
  type: VehicleType;
  searchParams: RawSearchParams;
}) {
  const filters = parseVehicleFilters(searchParams, type);

  const [results, allOfType, makes] = await Promise.all([
    vehicleRepository.list(filters),
    vehicleRepository.list({ type, includeSold: false }),
    vehicleRepository.distinctMakes(type),
  ]);

  // Derive slider bounds from the available inventory.
  const prices = allOfType.map((v) => v.price);
  const yearsArr = allOfType.map((v) => v.year);
  const kmsArr = allOfType.map((v) => v.kmsDriven);

  const priceBounds: [number, number] = [
    roundDown(Math.min(...prices, 0), PRICE_STEP),
    roundUp(Math.max(...prices, PRICE_STEP), PRICE_STEP),
  ];
  const yearBounds: [number, number] = [
    Math.min(...yearsArr, new Date().getFullYear()),
    Math.max(...yearsArr, new Date().getFullYear()),
  ];
  const kmsMax = roundUp(Math.max(...kmsArr, KMS_STEP), KMS_STEP);

  const filterProps = { type, makes, priceBounds, yearBounds, kmsMax };
  const label = type === "car" ? "Cars" : "Bikes";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Used {label} in {allOfType[0]?.registrationCity ?? "your city"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {allOfType.length} {label.toLowerCase()} available · certified &
          inspected
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <SearchInput
            placeholder={`Search ${label.toLowerCase()} by make or model…`}
          />
        </div>
        <MobileFilters {...filterProps} />
        <SortSelect />
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl border bg-card p-5">
            <FilterBar {...filterProps} />
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{results.length}</span>{" "}
            result{results.length === 1 ? "" : "s"}
          </p>
          {results.length > 0 ? (
            <VehicleGrid vehicles={results} />
          ) : (
            <EmptyState resetHref={`/${type}s`} />
          )}
        </div>
      </div>
    </div>
  );
}
