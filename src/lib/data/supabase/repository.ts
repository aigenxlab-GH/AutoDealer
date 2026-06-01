import type {
  Lead,
  LeadInput,
  LeadStatus,
  Vehicle,
  VehicleFilters,
  VehicleInput,
  VehicleType,
} from "@/lib/types";
import type { LeadRepository, VehicleRepository } from "@/lib/data/repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/* eslint-disable @typescript-eslint/no-explicit-any */

const TABLE_VEHICLES = "vehicles";
const TABLE_LEADS = "leads";

function toVehicle(r: any): Vehicle {
  return {
    id: r.id,
    type: r.type,
    make: r.make,
    model: r.model,
    variant: r.variant ?? undefined,
    year: r.year,
    price: Number(r.price),
    kmsDriven: r.kms_driven,
    owners: r.owners,
    fuelType: r.fuel_type ?? undefined,
    transmission: r.transmission ?? undefined,
    engineCc: r.engine_cc ?? undefined,
    mileage: r.mileage != null ? Number(r.mileage) : undefined,
    color: r.color ?? undefined,
    bodyType: r.body_type ?? undefined,
    registrationNumber: r.registration_number ?? undefined,
    registrationCity: r.registration_city ?? undefined,
    insuranceValidTill: r.insurance_valid_till ?? undefined,
    description: r.description ?? undefined,
    images: r.images ?? [],
    primaryImageUrl: r.primary_image_url,
    isSold: r.is_sold,
    isFeatured: r.is_featured,
    views: r.views,
    createdAt: r.created_at,
  };
}

function toRow(v: Partial<VehicleInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  const map: [keyof VehicleInput, string][] = [
    ["type", "type"],
    ["make", "make"],
    ["model", "model"],
    ["variant", "variant"],
    ["year", "year"],
    ["price", "price"],
    ["kmsDriven", "kms_driven"],
    ["owners", "owners"],
    ["fuelType", "fuel_type"],
    ["transmission", "transmission"],
    ["engineCc", "engine_cc"],
    ["mileage", "mileage"],
    ["color", "color"],
    ["bodyType", "body_type"],
    ["registrationNumber", "registration_number"],
    ["registrationCity", "registration_city"],
    ["insuranceValidTill", "insurance_valid_till"],
    ["description", "description"],
    ["images", "images"],
    ["primaryImageUrl", "primary_image_url"],
    ["isSold", "is_sold"],
    ["isFeatured", "is_featured"],
  ];
  for (const [key, col] of map) {
    if (v[key] !== undefined) row[col] = v[key] === "" ? null : v[key];
  }
  return row;
}

function toLead(r: any): Lead {
  return {
    id: r.id,
    vehicleId: r.vehicle_id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    status: r.status,
    createdAt: r.created_at,
  };
}

class SupabaseVehicleRepository implements VehicleRepository {
  async list(filters: VehicleFilters = {}): Promise<Vehicle[]> {
    const db = getSupabaseAdmin();
    let q = db.from(TABLE_VEHICLES).select("*");

    if (filters.type) q = q.eq("type", filters.type);
    if (!filters.includeSold) q = q.eq("is_sold", false);
    if (filters.make) q = q.eq("make", filters.make);
    if (filters.minPrice != null) q = q.gte("price", filters.minPrice);
    if (filters.maxPrice != null) q = q.lte("price", filters.maxPrice);
    if (filters.minYear != null) q = q.gte("year", filters.minYear);
    if (filters.maxYear != null) q = q.lte("year", filters.maxYear);
    if (filters.maxKms != null) q = q.lte("kms_driven", filters.maxKms);
    if (filters.fuelType) q = q.eq("fuel_type", filters.fuelType);
    if (filters.transmission) q = q.eq("transmission", filters.transmission);
    if (filters.search) {
      const s = filters.search.replace(/[%,]/g, "");
      q = q.or(`make.ilike.%${s}%,model.ilike.%${s}%,variant.ilike.%${s}%`);
    }

    switch (filters.sort) {
      case "price-asc":
        q = q.order("price", { ascending: true });
        break;
      case "price-desc":
        q = q.order("price", { ascending: false });
        break;
      case "year-desc":
        q = q.order("year", { ascending: false });
        break;
      case "kms-asc":
        q = q.order("kms_driven", { ascending: true });
        break;
      default:
        q = q.order("created_at", { ascending: false });
    }

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(toVehicle);
  }

  async getById(id: string): Promise<Vehicle | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from(TABLE_VEHICLES)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? toVehicle(data) : null;
  }

  async getFeatured(limit = 6): Promise<Vehicle[]> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from(TABLE_VEHICLES)
      .select("*")
      .eq("is_sold", false)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    if (data && data.length) return data.map(toVehicle);
    // Fallback: newest active vehicles.
    return (await this.list({ includeSold: false })).slice(0, limit);
  }

  async getSimilar(vehicle: Vehicle, limit = 4): Promise<Vehicle[]> {
    const pool = await this.list({ type: vehicle.type, includeSold: false });
    return pool
      .filter((v) => v.id !== vehicle.id)
      .filter(
        (v) =>
          v.make === vehicle.make ||
          v.bodyType === vehicle.bodyType ||
          Math.abs(v.price - vehicle.price) <= vehicle.price * 0.35,
      )
      .sort(
        (a, b) =>
          Math.abs(a.price - vehicle.price) - Math.abs(b.price - vehicle.price),
      )
      .slice(0, limit);
  }

  async create(input: VehicleInput): Promise<Vehicle> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from(TABLE_VEHICLES)
      .insert(toRow(input))
      .select("*")
      .single();
    if (error) throw error;
    return toVehicle(data);
  }

  async update(id: string, input: Partial<VehicleInput>): Promise<Vehicle | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from(TABLE_VEHICLES)
      .update(toRow(input))
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? toVehicle(data) : null;
  }

  async remove(id: string): Promise<boolean> {
    const db = getSupabaseAdmin();
    const { error } = await db.from(TABLE_VEHICLES).delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  async incrementViews(id: string): Promise<void> {
    const db = getSupabaseAdmin();
    await db.rpc("increment_vehicle_views", { vehicle: id });
  }

  async distinctMakes(type?: VehicleType): Promise<string[]> {
    const db = getSupabaseAdmin();
    let q = db.from(TABLE_VEHICLES).select("make");
    if (type) q = q.eq("type", type);
    const { data, error } = await q;
    if (error) throw error;
    return [...new Set((data ?? []).map((r: any) => r.make as string))].sort();
  }
}

class SupabaseLeadRepository implements LeadRepository {
  async list(): Promise<Lead[]> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from(TABLE_LEADS)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toLead);
  }

  async create(input: LeadInput): Promise<Lead> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from(TABLE_LEADS)
      .insert({
        vehicle_id: input.vehicleId,
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        status: "new",
      })
      .select("*")
      .single();
    if (error) throw error;
    return toLead(data);
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead | null> {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from(TABLE_LEADS)
      .update({ status })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? toLead(data) : null;
  }

  async countByVehicle(): Promise<Record<string, number>> {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from(TABLE_LEADS).select("vehicle_id");
    if (error) throw error;
    return (data ?? []).reduce<Record<string, number>>((acc, r: any) => {
      acc[r.vehicle_id] = (acc[r.vehicle_id] ?? 0) + 1;
      return acc;
    }, {});
  }
}

export const supabaseVehicleRepository = new SupabaseVehicleRepository();
export const supabaseLeadRepository = new SupabaseLeadRepository();
