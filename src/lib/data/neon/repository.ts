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
import type {
  CatalogRepository,
  FinanceCompanyRepository,
  LeadRepository,
  VehicleRepository,
} from "@/lib/data/repository";
import { getNeonPool } from "@/lib/neon/client";
import { seedFinanceCompanies } from "@/lib/data/mock/finance-companies";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function query<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
  const pool = getNeonPool();
  const result = await pool.query(sql, params);
  return result.rows as T[];
}

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

class NeonVehicleRepository implements VehicleRepository {
  async list(filters: VehicleFilters = {}): Promise<Vehicle[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (filters.type)           { conditions.push(`type = $${i++}`);          params.push(filters.type); }
    if (!filters.includeSold)   { conditions.push(`is_sold = $${i++}`);       params.push(false); }
    if (filters.make)           { conditions.push(`make = $${i++}`);          params.push(filters.make); }
    if (filters.minPrice != null){ conditions.push(`price >= $${i++}`);       params.push(filters.minPrice); }
    if (filters.maxPrice != null){ conditions.push(`price <= $${i++}`);       params.push(filters.maxPrice); }
    if (filters.minYear != null) { conditions.push(`year >= $${i++}`);        params.push(filters.minYear); }
    if (filters.maxYear != null) { conditions.push(`year <= $${i++}`);        params.push(filters.maxYear); }
    if (filters.maxKms != null)  { conditions.push(`kms_driven <= $${i++}`);  params.push(filters.maxKms); }
    if (filters.fuelType)        { conditions.push(`fuel_type = $${i++}`);    params.push(filters.fuelType); }
    if (filters.transmission)    { conditions.push(`transmission = $${i++}`); params.push(filters.transmission); }
    if (filters.search) {
      const s = `%${filters.search.replace(/[%_]/g, "")}%`;
      conditions.push(`(make ILIKE $${i} OR model ILIKE $${i} OR variant ILIKE $${i})`);
      params.push(s); i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderMap: Record<string, string> = {
      "price-asc": "price ASC", "price-desc": "price DESC",
      "year-desc": "year DESC", "kms-asc": "kms_driven ASC", "newest": "created_at DESC",
    };
    const order = orderMap[filters.sort ?? ""] ?? "created_at DESC";

    const rows = await query(`SELECT * FROM vehicles ${where} ORDER BY ${order}`, params);
    return rows.map(toVehicle);
  }

  async getById(id: string): Promise<Vehicle | null> {
    const rows = await query(`SELECT * FROM vehicles WHERE id = $1`, [id]);
    return rows[0] ? toVehicle(rows[0]) : null;
  }

  async getFeatured(limit = 6): Promise<Vehicle[]> {
    const rows = await query(
      `SELECT * FROM vehicles WHERE is_sold = false AND is_featured = true ORDER BY created_at DESC LIMIT $1`,
      [limit],
    );
    if (rows.length) return rows.map(toVehicle);
    const fallback = await query(
      `SELECT * FROM vehicles WHERE is_sold = false ORDER BY created_at DESC LIMIT $1`,
      [limit],
    );
    return fallback.map(toVehicle);
  }

  async getSimilar(vehicle: Vehicle, limit = 4): Promise<Vehicle[]> {
    const margin = vehicle.price * 0.35;
    const rows = await query(
      `SELECT * FROM vehicles
       WHERE is_sold = false AND id != $1
         AND (make = $2 OR body_type = $3 OR ABS(price - $4) <= $5)
       ORDER BY ABS(price - $4)
       LIMIT $6`,
      [vehicle.id, vehicle.make, vehicle.bodyType ?? null, vehicle.price, margin, limit],
    );
    return rows.map(toVehicle);
  }

  async create(input: VehicleInput): Promise<Vehicle> {
    const rows = await query(
      `INSERT INTO vehicles
         (type, make, model, variant, year, price, kms_driven, owners,
          fuel_type, transmission, engine_cc, mileage, color, body_type,
          registration_number, registration_city, insurance_valid_till,
          description, images, primary_image_url, is_sold, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
       RETURNING *`,
      [
        input.type, input.make, input.model, input.variant ?? null,
        input.year, input.price, input.kmsDriven, input.owners,
        input.fuelType ?? null, input.transmission ?? null, input.engineCc ?? null,
        input.mileage ?? null, input.color ?? null, input.bodyType ?? null,
        input.registrationNumber ?? null, input.registrationCity ?? null,
        input.insuranceValidTill ?? null, input.description ?? null,
        JSON.stringify(input.images), input.primaryImageUrl,
        input.isSold, input.isFeatured,
      ],
    );
    return toVehicle(rows[0]);
  }

  async update(id: string, input: Partial<VehicleInput>): Promise<Vehicle | null> {
    const colMap: [keyof VehicleInput, string][] = [
      ["type","type"], ["make","make"], ["model","model"], ["variant","variant"],
      ["year","year"], ["price","price"], ["kmsDriven","kms_driven"],
      ["owners","owners"], ["fuelType","fuel_type"], ["transmission","transmission"],
      ["engineCc","engine_cc"], ["mileage","mileage"], ["color","color"],
      ["bodyType","body_type"], ["registrationNumber","registration_number"],
      ["registrationCity","registration_city"], ["insuranceValidTill","insurance_valid_till"],
      ["description","description"], ["images","images"],
      ["primaryImageUrl","primary_image_url"], ["isSold","is_sold"], ["isFeatured","is_featured"],
    ];

    const sets: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    for (const [key, col] of colMap) {
      if (key in input) {
        const val = input[key];
        sets.push(`${col} = $${i++}`);
        params.push(key === "images" ? JSON.stringify(val) : (val === "" ? null : val ?? null));
      }
    }
    if (!sets.length) return this.getById(id);

    params.push(id);
    const rows = await query(
      `UPDATE vehicles SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
      params,
    );
    return rows[0] ? toVehicle(rows[0]) : null;
  }

  async remove(id: string): Promise<boolean> {
    await query(`DELETE FROM vehicles WHERE id = $1`, [id]);
    return true;
  }

  async incrementViews(id: string): Promise<void> {
    await query(`UPDATE vehicles SET views = views + 1 WHERE id = $1::uuid`, [id]);
  }

  async distinctMakes(type?: VehicleType): Promise<string[]> {
    const rows = type
      ? await query(`SELECT DISTINCT make FROM vehicles WHERE type = $1 ORDER BY make`, [type])
      : await query(`SELECT DISTINCT make FROM vehicles ORDER BY make`);
    return rows.map((r: any) => r.make as string);
  }
}

class NeonLeadRepository implements LeadRepository {
  async list(): Promise<Lead[]> {
    const rows = await query(`SELECT * FROM leads ORDER BY created_at DESC`);
    return rows.map(toLead);
  }

  async create(input: LeadInput): Promise<Lead> {
    const rows = await query(
      `INSERT INTO leads (vehicle_id, customer_name, customer_phone, status)
       VALUES ($1, $2, $3, 'new') RETURNING *`,
      [input.vehicleId, input.customerName, input.customerPhone],
    );
    return toLead(rows[0]);
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead | null> {
    const rows = await query(
      `UPDATE leads SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id],
    );
    return rows[0] ? toLead(rows[0]) : null;
  }

  async countByVehicle(): Promise<Record<string, number>> {
    const rows = await query(
      `SELECT vehicle_id, COUNT(*)::int AS cnt FROM leads GROUP BY vehicle_id`,
    );
    return rows.reduce<Record<string, number>>((acc, r: any) => {
      acc[r.vehicle_id] = r.cnt;
      return acc;
    }, {});
  }
}

// Finance companies are kept as seed data (no DB table needed for now)
class NeonFinanceCompanyRepository implements FinanceCompanyRepository {
  private data = [...seedFinanceCompanies];

  async list(activeOnly = false): Promise<FinanceCompany[]> {
    const result = activeOnly ? this.data.filter((c) => c.isActive) : [...this.data];
    return result.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getById(id: string): Promise<FinanceCompany | null> {
    return this.data.find((c) => c.id === id) ?? null;
  }

  async create(input: FinanceCompanyInput): Promise<FinanceCompany> {
    const company: FinanceCompany = {
      ...input,
      id: `fc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.push(company);
    return company;
  }

  async update(id: string, input: Partial<FinanceCompanyInput>): Promise<FinanceCompany | null> {
    const idx = this.data.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data[idx] = { ...this.data[idx], ...input };
    return this.data[idx];
  }

  async remove(id: string): Promise<boolean> {
    const idx = this.data.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.splice(idx, 1);
    return true;
  }
}

class NeonCatalogRepository implements CatalogRepository {
  async listMakes(type?: VehicleType): Promise<VehicleMake[]> {
    const rows = type
      ? await query(`SELECT * FROM vehicle_makes WHERE type = $1 ORDER BY name`, [type])
      : await query(`SELECT * FROM vehicle_makes ORDER BY name`);
    return rows.map((r: any) => ({ id: r.id, name: r.name, type: r.type, createdAt: r.created_at }));
  }

  async createMake(input: VehicleMakeInput): Promise<VehicleMake> {
    const rows = await query(
      `INSERT INTO vehicle_makes (name, type) VALUES ($1, $2)
       ON CONFLICT (name, type) DO UPDATE SET name = EXCLUDED.name
       RETURNING *`,
      [input.name, input.type],
    );
    const r = rows[0];
    return { id: r.id, name: r.name, type: r.type, createdAt: r.created_at };
  }

  async deleteMake(id: string): Promise<boolean> {
    await query(`DELETE FROM vehicle_makes WHERE id = $1`, [id]);
    return true;
  }

  async listModels(makeId?: string): Promise<VehicleModel[]> {
    const rows = makeId
      ? await query(
          `SELECT m.*, mk.name AS make_name FROM vehicle_models m
           JOIN vehicle_makes mk ON mk.id = m.make_id
           WHERE m.make_id = $1 ORDER BY m.name`,
          [makeId],
        )
      : await query(
          `SELECT m.*, mk.name AS make_name FROM vehicle_models m
           JOIN vehicle_makes mk ON mk.id = m.make_id ORDER BY m.name`,
        );
    return rows.map((r: any) => ({
      id: r.id, makeId: r.make_id, makeName: r.make_name,
      name: r.name, createdAt: r.created_at,
    }));
  }

  async createModel(input: VehicleModelInput): Promise<VehicleModel> {
    const rows = await query(
      `INSERT INTO vehicle_models (make_id, name) VALUES ($1, $2)
       ON CONFLICT (make_id, name) DO UPDATE SET name = EXCLUDED.name
       RETURNING *`,
      [input.makeId, input.name],
    );
    const r = rows[0];
    const makeRows = await query(`SELECT name FROM vehicle_makes WHERE id = $1`, [input.makeId]);
    return {
      id: r.id, makeId: r.make_id, makeName: makeRows[0]?.name ?? "",
      name: r.name, createdAt: r.created_at,
    };
  }

  async deleteModel(id: string): Promise<boolean> {
    await query(`DELETE FROM vehicle_models WHERE id = $1`, [id]);
    return true;
  }

  async listVariants(modelId?: string): Promise<VehicleVariant[]> {
    const rows = modelId
      ? await query(
          `SELECT v.*, m.name AS model_name, mk.name AS make_name
           FROM vehicle_variants v
           JOIN vehicle_models m ON m.id = v.model_id
           JOIN vehicle_makes mk ON mk.id = m.make_id
           WHERE v.model_id = $1 ORDER BY v.name`,
          [modelId],
        )
      : await query(
          `SELECT v.*, m.name AS model_name, mk.name AS make_name
           FROM vehicle_variants v
           JOIN vehicle_models m ON m.id = v.model_id
           JOIN vehicle_makes mk ON mk.id = m.make_id ORDER BY v.name`,
        );
    return rows.map((r: any) => ({
      id: r.id, modelId: r.model_id, modelName: r.model_name,
      makeName: r.make_name, name: r.name, createdAt: r.created_at,
    }));
  }

  async createVariant(input: VehicleVariantInput): Promise<VehicleVariant> {
    const rows = await query(
      `INSERT INTO vehicle_variants (model_id, name) VALUES ($1, $2)
       ON CONFLICT (model_id, name) DO UPDATE SET name = EXCLUDED.name
       RETURNING *`,
      [input.modelId, input.name],
    );
    const r = rows[0];
    const modelRows = await query(
      `SELECT m.name AS model_name, mk.name AS make_name
       FROM vehicle_models m JOIN vehicle_makes mk ON mk.id = m.make_id
       WHERE m.id = $1`,
      [input.modelId],
    );
    return {
      id: r.id, modelId: r.model_id,
      modelName: modelRows[0]?.model_name ?? "",
      makeName: modelRows[0]?.make_name ?? "",
      name: r.name, createdAt: r.created_at,
    };
  }

  async deleteVariant(id: string): Promise<boolean> {
    await query(`DELETE FROM vehicle_variants WHERE id = $1`, [id]);
    return true;
  }
}

export const neonVehicleRepository = new NeonVehicleRepository();
export const neonLeadRepository = new NeonLeadRepository();
export const neonFinanceCompanyRepository = new NeonFinanceCompanyRepository();
export const neonCatalogRepository = new NeonCatalogRepository();
