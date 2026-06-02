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
  VehicleType,
  VehicleVariant,
  VehicleVariantInput,
} from "@/lib/types";

/**
 * Storage-agnostic contract for inventory. The UI only ever talks to this
 * interface, so swapping the mock store for Supabase (Phase 7) needs no
 * changes in pages/components.
 */
export interface VehicleRepository {
  list(filters?: VehicleFilters): Promise<Vehicle[]>;
  getById(id: string): Promise<Vehicle | null>;
  getFeatured(limit?: number): Promise<Vehicle[]>;
  getSimilar(vehicle: Vehicle, limit?: number): Promise<Vehicle[]>;
  create(input: VehicleInput): Promise<Vehicle>;
  update(id: string, input: Partial<VehicleInput>): Promise<Vehicle | null>;
  remove(id: string): Promise<boolean>;
  incrementViews(id: string): Promise<void>;
  /** Distinct makes for filter dropdowns, optionally scoped to a type. */
  distinctMakes(type?: VehicleType): Promise<string[]>;
}

export interface LeadRepository {
  list(): Promise<Lead[]>;
  create(input: LeadInput): Promise<Lead>;
  updateStatus(id: string, status: LeadStatus): Promise<Lead | null>;
  /** Map of vehicleId -> lead count, for the admin analytics column. */
  countByVehicle(): Promise<Record<string, number>>;
}

export interface CatalogRepository {
  clearCatalog(): Promise<void>;
  listMakes(type?: VehicleType): Promise<VehicleMake[]>;
  createMake(input: VehicleMakeInput): Promise<VehicleMake>;
  updateMake(id: string, name: string): Promise<VehicleMake | null>;
  /** Returns false if models are still linked. */
  deleteMake(id: string): Promise<{ ok: boolean; reason?: string }>;

  listModels(makeId?: string): Promise<VehicleModel[]>;
  createModel(input: VehicleModelInput): Promise<VehicleModel>;
  updateModel(id: string, name: string): Promise<VehicleModel | null>;
  /** Returns false if variants are still linked. */
  deleteModel(id: string): Promise<{ ok: boolean; reason?: string }>;

  listVariants(modelId?: string): Promise<VehicleVariant[]>;
  createVariant(input: VehicleVariantInput): Promise<VehicleVariant>;
  updateVariant(id: string, name: string): Promise<VehicleVariant | null>;
  deleteVariant(id: string): Promise<boolean>;
}

export interface FinanceCompanyRepository {
  /** activeOnly=true returns only active companies, sorted by sortOrder. */
  list(activeOnly?: boolean): Promise<FinanceCompany[]>;
  getById(id: string): Promise<FinanceCompany | null>;
  create(input: FinanceCompanyInput): Promise<FinanceCompany>;
  update(id: string, input: Partial<FinanceCompanyInput>): Promise<FinanceCompany | null>;
  remove(id: string): Promise<boolean>;
}
