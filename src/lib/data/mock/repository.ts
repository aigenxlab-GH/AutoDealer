import type {
  FinanceCompany,
  FinanceCompanyInput,
  Lead,
  LeadInput,
  LeadStatus,
  Vehicle,
  VehicleFilters,
  VehicleInput,
  VehicleMake,
  VehicleMakeInput,
  VehicleModel,
  VehicleModelInput,
  VehicleSort,
  VehicleType,
  VehicleVariant,
  VehicleVariantInput,
} from "@/lib/types";
import type { CatalogRepository, FinanceCompanyRepository, LeadRepository, SettingsRepository, ShopSettings, VehicleRepository } from "@/lib/data/repository";
import { seedVehicles } from "./vehicles";
import { seedLeads } from "./leads";
import { seedFinanceCompanies } from "./finance-companies";

// In-memory store kept on globalThis so it survives Next.js dev HMR reloads
// within a single server process. Lost on full restart — fine for mock mode.
interface MockStore {
  vehicles: Vehicle[];
  leads: Lead[];
  financeCompanies: FinanceCompany[];
  makes: VehicleMake[];
  models: VehicleModel[];
  variants: VehicleVariant[];
  settings: Record<string, string>;
}

const globalForMock = globalThis as unknown as { __mockStore?: MockStore };

if (!globalForMock.__mockStore) {
  globalForMock.__mockStore = {
    vehicles: seedVehicles.map((v) => ({ ...v, images: [...v.images] })),
    leads: seedLeads.map((l) => ({ ...l })),
    financeCompanies: seedFinanceCompanies.map((f) => ({ ...f })),
    makes: [],
    models: [],
    variants: [],
    settings: {},
  };
}

const store = globalForMock.__mockStore;

// Patch fields added after the store was first created (HMR with stale globalThis)
if (!store.makes) store.makes = [];
if (!store.models) store.models = [];
if (!store.variants) store.variants = [];
if (!store.settings) store.settings = {};

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

class MockFinanceCompanyRepository implements FinanceCompanyRepository {
  async list(activeOnly = false): Promise<FinanceCompany[]> {
    const result = activeOnly
      ? store.financeCompanies.filter((f) => f.isActive)
      : [...store.financeCompanies];
    return clone(result.sort((a, b) => a.sortOrder - b.sortOrder));
  }

  async getById(id: string): Promise<FinanceCompany | null> {
    const found = store.financeCompanies.find((f) => f.id === id);
    return found ? clone(found) : null;
  }

  async create(input: FinanceCompanyInput): Promise<FinanceCompany> {
    const maxOrder = store.financeCompanies.reduce(
      (m, f) => Math.max(m, f.sortOrder),
      0,
    );
    const company: FinanceCompany = {
      ...input,
      id: crypto.randomUUID(),
      sortOrder: input.sortOrder ?? maxOrder + 1,
      createdAt: new Date().toISOString(),
    };
    store.financeCompanies.push(company);
    return clone(company);
  }

  async update(
    id: string,
    input: Partial<FinanceCompanyInput>,
  ): Promise<FinanceCompany | null> {
    const idx = store.financeCompanies.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    store.financeCompanies[idx] = { ...store.financeCompanies[idx], ...input };
    return clone(store.financeCompanies[idx]);
  }

  async remove(id: string): Promise<boolean> {
    const before = store.financeCompanies.length;
    store.financeCompanies = store.financeCompanies.filter((f) => f.id !== id);
    return store.financeCompanies.length < before;
  }
}

export const mockVehicleRepository = new MockVehicleRepository();
export const mockLeadRepository = new MockLeadRepository();
export const mockFinanceCompanyRepository = new MockFinanceCompanyRepository();

class MockCatalogRepository implements CatalogRepository {
  async listMakes(type?: VehicleType): Promise<VehicleMake[]> {
    const result = type ? store.makes.filter((m) => m.type === type) : [...store.makes];
    return clone(result.sort((a, b) => a.name.localeCompare(b.name)));
  }

  async createMake(input: VehicleMakeInput): Promise<VehicleMake> {
    const make: VehicleMake = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    store.makes.push(make);
    return clone(make);
  }

  async updateMake(id: string, name: string): Promise<VehicleMake | null> {
    const make = store.makes.find((m) => m.id === id);
    if (!make) return null;
    make.name = name;
    store.models.filter((m) => m.makeId === id).forEach((m) => (m.makeName = name));
    store.variants.filter((v) => store.models.find((m) => m.id === v.modelId && m.makeId === id)).forEach((v) => (v.makeName = name));
    return clone(make);
  }

  async deleteMake(id: string): Promise<{ ok: boolean; reason?: string }> {
    const linked = store.models.filter((m) => m.makeId === id).length;
    if (linked > 0) return { ok: false, reason: `Remove the ${linked} model${linked > 1 ? "s" : ""} under this make first.` };
    store.makes = store.makes.filter((m) => m.id !== id);
    return { ok: true };
  }

  async listModels(makeId?: string): Promise<VehicleModel[]> {
    const result = makeId ? store.models.filter((m) => m.makeId === makeId) : [...store.models];
    return clone(result.sort((a, b) => a.name.localeCompare(b.name)));
  }

  async createModel(input: VehicleModelInput): Promise<VehicleModel> {
    const make = store.makes.find((m) => m.id === input.makeId);
    const model: VehicleModel = { ...input, makeName: make?.name ?? "", id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    store.models.push(model);
    return clone(model);
  }

  async updateModel(id: string, name: string): Promise<VehicleModel | null> {
    const model = store.models.find((m) => m.id === id);
    if (!model) return null;
    model.name = name;
    store.variants.filter((v) => v.modelId === id).forEach((v) => (v.modelName = name));
    return clone(model);
  }

  async deleteModel(id: string): Promise<{ ok: boolean; reason?: string }> {
    const linked = store.variants.filter((v) => v.modelId === id).length;
    if (linked > 0) return { ok: false, reason: `Remove the ${linked} variant${linked > 1 ? "s" : ""} under this model first.` };
    store.models = store.models.filter((m) => m.id !== id);
    return { ok: true };
  }

  async listVariants(modelId?: string): Promise<VehicleVariant[]> {
    const result = modelId ? store.variants.filter((v) => v.modelId === modelId) : [...store.variants];
    return clone(result.sort((a, b) => a.name.localeCompare(b.name)));
  }

  async createVariant(input: VehicleVariantInput): Promise<VehicleVariant> {
    const model = store.models.find((m) => m.id === input.modelId);
    const variant: VehicleVariant = { ...input, modelName: model?.name ?? "", makeName: model?.makeName ?? "", id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    store.variants.push(variant);
    return clone(variant);
  }

  async updateVariant(id: string, name: string): Promise<VehicleVariant | null> {
    const variant = store.variants.find((v) => v.id === id);
    if (!variant) return null;
    variant.name = name;
    return clone(variant);
  }

  async deleteVariant(id: string): Promise<boolean> {
    const before = store.variants.length;
    store.variants = store.variants.filter((v) => v.id !== id);
    return store.variants.length < before;
  }
}

export const mockCatalogRepository = new MockCatalogRepository();

class MockSettingsRepository implements SettingsRepository {
  async getShopSettings(): Promise<ShopSettings> {
    const s = store.settings;
    return {
      mapsLink:    s["maps_link"]    ?? "",
      mapsEmbed:   s["maps_embed"]   ?? "",
      addressLine: s["address_line"] ?? "",
      city:        s["city"]         ?? "",
      state:       s["state"]        ?? "",
      pincode:     s["pincode"]      ?? "",
      openHours:   s["open_hours"]   ?? "",
      phone1:      s["phone_1"]      ?? "",
      phone2:      s["phone_2"]      ?? "",
      phone3:      s["phone_3"]      ?? "",
      phone4:      s["phone_4"]      ?? "",
    };
  }
  async saveShopSettings(data: ShopSettings): Promise<void> {
    store.settings["maps_link"]    = data.mapsLink;
    store.settings["maps_embed"]   = data.mapsEmbed;
    store.settings["address_line"] = data.addressLine;
    store.settings["city"]         = data.city;
    store.settings["state"]        = data.state;
    store.settings["pincode"]      = data.pincode;
    store.settings["open_hours"]   = data.openHours;
    store.settings["phone_1"]      = data.phone1;
    store.settings["phone_2"]      = data.phone2;
    store.settings["phone_3"]      = data.phone3;
    store.settings["phone_4"]      = data.phone4;
  }
}

export const mockSettingsRepository = new MockSettingsRepository();
