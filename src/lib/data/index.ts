import type { LeadRepository, VehicleRepository } from "./repository";
import {
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
} {
  switch (source) {
    case "neon":
      return {
        vehicles: neonVehicleRepository,
        leads: neonLeadRepository,
        finance: neonFinanceCompanyRepository,
      };
    case "supabase":
      return {
        vehicles: supabaseVehicleRepository,
        leads: supabaseLeadRepository,
        finance: mockFinanceCompanyRepository,
      };
    case "mock":
    default:
      return {
        vehicles: mockVehicleRepository,
        leads: mockLeadRepository,
        finance: mockFinanceCompanyRepository,
      };
  }
}

const repos = resolve();

export const vehicleRepository = repos.vehicles;
export const leadRepository = repos.leads;
export const financeCompanyRepository = repos.finance;

export type { VehicleRepository, LeadRepository, FinanceCompanyRepository } from "./repository";
