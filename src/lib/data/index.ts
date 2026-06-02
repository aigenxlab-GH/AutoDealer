import type { CatalogRepository, LeadRepository, VehicleRepository } from "./repository";
import {
  mockCatalogRepository,
  mockFinanceCompanyRepository,
  mockLeadRepository,
  mockVehicleRepository,
} from "./mock/repository";
import {
  supabaseLeadRepository,
  supabaseVehicleRepository,
} from "./supabase/repository";
import {
  neonVehicleRepository,
  neonLeadRepository,
  neonFinanceCompanyRepository,
  neonCatalogRepository,
} from "./neon/repository";

// Selects the active backend. Defaults to "mock" so the app runs with zero
// external accounts.
// DATA_SOURCE=neon   → Neon PostgreSQL (recommended for production)
// DATA_SOURCE=supabase → Supabase PostgreSQL
// DATA_SOURCE=mock   → in-memory mock data (default)
const source = process.env.DATA_SOURCE ?? "mock";

function resolve(): {
  vehicles: VehicleRepository;
  leads: LeadRepository;
  finance: import("./repository").FinanceCompanyRepository;
  catalog: CatalogRepository;
} {
  switch (source) {
    case "neon":
      return {
        vehicles: neonVehicleRepository,
        leads: neonLeadRepository,
        finance: neonFinanceCompanyRepository,
        catalog: neonCatalogRepository,
      };
    case "supabase":
      return {
        vehicles: supabaseVehicleRepository,
        leads: supabaseLeadRepository,
        finance: mockFinanceCompanyRepository,
        catalog: mockCatalogRepository,
      };
    case "mock":
    default:
      return {
        vehicles: mockVehicleRepository,
        leads: mockLeadRepository,
        finance: mockFinanceCompanyRepository,
        catalog: mockCatalogRepository,
      };
  }
}

const repos = resolve();

export const vehicleRepository = repos.vehicles;
export const leadRepository = repos.leads;
export const financeCompanyRepository = repos.finance;
export const catalogRepository = repos.catalog;

export type { VehicleRepository, LeadRepository, FinanceCompanyRepository, CatalogRepository } from "./repository";
