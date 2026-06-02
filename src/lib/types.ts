// Core domain types. App uses camelCase; the Supabase boundary (Phase 7)
// maps these to/from snake_case columns.

export type VehicleType = "car" | "bike";

export type FuelType = "petrol" | "diesel" | "cng" | "electric" | "hybrid";

export type Transmission = "manual" | "automatic";

export type LeadStatus = "new" | "contacted" | "closed";

export interface Vehicle {
  id: string;
  type: VehicleType;
  make: string;
  model: string;
  variant?: string;
  year: number;
  /** Price in INR (absolute rupees, e.g. 450000). */
  price: number;
  kmsDriven: number;
  owners: number;
  /** Cars (and hybrids). */
  fuelType?: FuelType;
  /** Cars. */
  transmission?: Transmission;
  /** Bikes. */
  engineCc?: number;
  /** Fuel efficiency in km/l (cars) or km/l (bikes). */
  mileage?: number;
  color?: string;
  /** Cars: SUV/Sedan/Hatchback. Bikes: Sport/Cruiser/Commuter/Scooter. */
  bodyType?: string;
  registrationNumber?: string;
  registrationCity?: string;
  /** ISO date string. */
  insuranceValidTill?: string;
  description?: string;
  images: string[];
  primaryImageUrl: string;
  isSold: boolean;
  isFeatured: boolean;
  views: number;
  /** ISO timestamp. */
  createdAt: string;
}

export interface Lead {
  id: string;
  vehicleId: string;
  customerName: string;
  customerPhone: string;
  status: LeadStatus;
  /** ISO timestamp. */
  createdAt: string;
}

/** Payload accepted by the admin listing form (id/derived fields excluded). */
export type VehicleInput = Omit<Vehicle, "id" | "createdAt" | "views">;

/** Payload accepted by the public enquiry form. */
export type LeadInput = Pick<Lead, "vehicleId" | "customerName" | "customerPhone">;

export interface VehicleFilters {
  type?: VehicleType;
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxKms?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  search?: string;
  includeSold?: boolean;
  sort?: VehicleSort;
}

export type VehicleSort =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "year-desc"
  | "kms-asc";

// ── Catalog: Make / Model / Variant ─────────────────────────────────────────

export interface VehicleMake {
  id: string;
  name: string;
  type: VehicleType;
  createdAt: string;
}

export interface VehicleModel {
  id: string;
  makeId: string;
  makeName: string;
  name: string;
  createdAt: string;
}

export interface VehicleVariant {
  id: string;
  modelId: string;
  modelName: string;
  makeName: string;
  name: string;
  createdAt: string;
}

export type VehicleMakeInput = Pick<VehicleMake, "name" | "type">;
export type VehicleModelInput = Pick<VehicleModel, "makeId" | "name">;
export type VehicleVariantInput = Pick<VehicleVariant, "modelId" | "name">;

// ── Finance ──────────────────────────────────────────────────────────────────

export interface FinanceCompany {
  id: string;
  name: string;
  /** Short code shown in the coloured logo badge, e.g. "SBI", "HDFC". */
  shortName: string;
  /** Annual interest rate as a percentage, e.g. 8.85. */
  interestRate: number;
  maxTenureYears: number;
  processingFee: string;
  /** Up to 3 bullet highlights shown as feature chips. */
  highlights: string[];
  /** CSS colour for the logo badge background. */
  color: string;
  /** Short badge label, e.g. "Lowest Rate". */
  badge: string;
  isActive: boolean;
  /** Display order — lower = shown first. */
  sortOrder: number;
  createdAt: string;
}

export type FinanceCompanyInput = Omit<FinanceCompany, "id" | "createdAt">;
