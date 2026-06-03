import type {
  FuelType,
  Transmission,
  VehicleFilters,
  VehicleSort,
  VehicleType,
} from "@/lib/types";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const SORTS: VehicleSort[] = [
  "newest",
  "price-asc",
  "price-desc",
  "year-desc",
  "kms-asc",
];
const FUELS: FuelType[] = ["petrol", "diesel", "petrol-cng", "electric", "hybrid"];
const TRANSMISSIONS: Transmission[] = ["manual", "automatic"];

function first(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s !== "all" && s !== "" ? s : undefined;
}

function num(v: string | string[] | undefined): number | undefined {
  const s = first(v);
  if (s == null) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

/** Parse URL search params into a typed VehicleFilters for a given category. */
export function parseVehicleFilters(
  sp: RawSearchParams,
  type: VehicleType,
): VehicleFilters {
  const fuel = first(sp.fuel) as FuelType | undefined;
  const transmission = first(sp.transmission) as Transmission | undefined;
  const sort = first(sp.sort) as VehicleSort | undefined;

  return {
    type,
    search: first(sp.q),
    make: first(sp.make),
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    minYear: num(sp.minYear),
    maxYear: num(sp.maxYear),
    maxKms: num(sp.maxKms),
    fuelType: type === "car" && fuel && FUELS.includes(fuel) ? fuel : undefined,
    transmission:
      type === "car" && transmission && TRANSMISSIONS.includes(transmission)
        ? transmission
        : undefined,
    sort: sort && SORTS.includes(sort) ? sort : "newest",
    includeSold: false,
  };
}

/** Count of active (user-set) filters, for the mobile "Filters (n)" badge. */
export function countActiveFilters(f: VehicleFilters): number {
  let n = 0;
  if (f.search) n++;
  if (f.make) n++;
  if (f.fuelType) n++;
  if (f.transmission) n++;
  if (f.minPrice != null || f.maxPrice != null) n++;
  if (f.minYear != null || f.maxYear != null) n++;
  if (f.maxKms != null) n++;
  return n;
}
