import type { LeadRepository, VehicleRepository } from "./repository";
import { mockLeadRepository, mockVehicleRepository } from "./mock/repository";
import {
  supabaseLeadRepository,
  supabaseVehicleRepository,
} from "./supabase/repository";

// Selects the active backend. Defaults to "mock" so the app runs with zero
// external accounts; set DATA_SOURCE=supabase (with Supabase env vars) for prod.
const source = process.env.DATA_SOURCE ?? "mock";

function resolve(): {
  vehicles: VehicleRepository;
  leads: LeadRepository;
} {
  switch (source) {
    case "supabase":
      return {
        vehicles: supabaseVehicleRepository,
        leads: supabaseLeadRepository,
      };
    case "mock":
    default:
      return { vehicles: mockVehicleRepository, leads: mockLeadRepository };
  }
}

const repos = resolve();

export const vehicleRepository = repos.vehicles;
export const leadRepository = repos.leads;

export type { VehicleRepository, LeadRepository } from "./repository";
