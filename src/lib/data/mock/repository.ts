import type {
  Lead,
  LeadInput,
  LeadStatus,
  Vehicle,
  VehicleFilters,
  VehicleInput,
  VehicleSort,
  VehicleType,
} from "@/lib/types";
import type { LeadRepository, VehicleRepository } from "@/lib/data/repository";
import { seedVehicles } from "./vehicles";
import { seedLeads } from "./leads";

// In-memory store kept on globalThis so it survives Next.js dev HMR reloads
// within a single server process. Lost on full restart — fine for mock mode.
interface MockStore {
  vehicles: Vehicle[];
  leads: Lead[];
}

const globalForMock = globalThis as unknown as { __mockStore?: MockStore };

const store: MockStore =
  globalForMock.__mockStore ??
  (globalForMock.__mockStore = {
    vehicles: seedVehicles.map((v) => ({ ...v, images: [...v.images] })),
    leads: seedLeads.map((l) => ({ ...l })),
  });

const clone = <T>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

function applySort(list: Vehicle[], sort: VehicleSort = "newest"): Vehicle[] {
  const sorted = [...list];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "year-desc":
      return sorted.sort((a, b) => b.year - a.year);
    case "kms-asc":
      return sorted.sort((a, b) => a.kmsDriven - b.kmsDriven);
    case "newest":
    default:
      return sorted.sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      );
  }
}

function matches(v: Vehicle, f: VehicleFilters): boolean {
  if (f.type && v.type !== f.type) return false;
  if (!f.includeSold && v.isSold) return false;
  if (f.make && v.make !== f.make) return false;
  if (f.minPrice != null && v.price < f.minPrice) return false;
  if (f.maxPrice != null && v.price > f.maxPrice) return false;
  if (f.minYear != null && v.year < f.minYear) return false;
  if (f.maxYear != null && v.year > f.maxYear) return false;
  if (f.maxKms != null && v.kmsDriven > f.maxKms) return false;
  if (f.fuelType && v.fuelType !== f.fuelType) return false;
  if (f.transmission && v.transmission !== f.transmission) return false;
  if (f.search) {
    const q = f.search.toLowerCase();
    const hay = `${v.make} ${v.model} ${v.variant ?? ""} ${v.bodyType ?? ""} ${
      v.color ?? ""
    }`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

class MockVehicleRepository implements VehicleRepository {
  async list(filters: VehicleFilters = {}): Promise<Vehicle[]> {
    const filtered = store.vehicles.filter((v) => matches(v, filters));
    return clone(applySort(filtered, filters.sort));
  }

  async getById(id: string): Promise<Vehicle | null> {
    const found = store.vehicles.find((v) => v.id === id);
    return found ? clone(found) : null;
  }

  async getFeatured(limit = 6): Promise<Vehicle[]> {
    const featured = store.vehicles.filter((v) => v.isFeatured && !v.isSold);
    const pool = featured.length
      ? featured
      : store.vehicles.filter((v) => !v.isSold);
    return clone(applySort(pool, "newest").slice(0, limit));
  }

  async getSimilar(vehicle: Vehicle, limit = 4): Promise<Vehicle[]> {
    const similar = store.vehicles
      .filter(
        (v) =>
          v.id !== vehicle.id &&
          !v.isSold &&
          v.type === vehicle.type &&
          (v.make === vehicle.make ||
            v.bodyType === vehicle.bodyType ||
            Math.abs(v.price - vehicle.price) <= vehicle.price * 0.35),
      )
      .sort(
        (a, b) =>
          Math.abs(a.price - vehicle.price) - Math.abs(b.price - vehicle.price),
      );
    return clone(similar.slice(0, limit));
  }

  async create(input: VehicleInput): Promise<Vehicle> {
    const vehicle: Vehicle = {
      ...input,
      id: crypto.randomUUID(),
      views: 0,
      createdAt: new Date().toISOString(),
    };
    store.vehicles.unshift(vehicle);
    return clone(vehicle);
  }

  async update(
    id: string,
    input: Partial<VehicleInput>,
  ): Promise<Vehicle | null> {
    const idx = store.vehicles.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    store.vehicles[idx] = { ...store.vehicles[idx], ...input };
    return clone(store.vehicles[idx]);
  }

  async remove(id: string): Promise<boolean> {
    const before = store.vehicles.length;
    store.vehicles = store.vehicles.filter((v) => v.id !== id);
    return store.vehicles.length < before;
  }

  async incrementViews(id: string): Promise<void> {
    const v = store.vehicles.find((x) => x.id === id);
    if (v) v.views += 1;
  }

  async distinctMakes(type?: VehicleType): Promise<string[]> {
    const makes = new Set(
      store.vehicles
        .filter((v) => (type ? v.type === type : true))
        .map((v) => v.make),
    );
    return [...makes].sort();
  }
}

class MockLeadRepository implements LeadRepository {
  async list(): Promise<Lead[]> {
    return clone(
      [...store.leads].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      ),
    );
  }

  async create(input: LeadInput): Promise<Lead> {
    const lead: Lead = {
      ...input,
      id: crypto.randomUUID(),
      status: "new",
      createdAt: new Date().toISOString(),
    };
    store.leads.unshift(lead);
    return clone(lead);
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead | null> {
    const lead = store.leads.find((l) => l.id === id);
    if (!lead) return null;
    lead.status = status;
    return clone(lead);
  }

  async countByVehicle(): Promise<Record<string, number>> {
    return store.leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.vehicleId] = (acc[l.vehicleId] ?? 0) + 1;
      return acc;
    }, {});
  }
}

export const mockVehicleRepository = new MockVehicleRepository();
export const mockLeadRepository = new MockLeadRepository();
