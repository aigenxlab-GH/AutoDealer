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
