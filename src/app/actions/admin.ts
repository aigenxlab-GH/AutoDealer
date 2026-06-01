"use server";

import { revalidatePath } from "next/cache";
import { vehicleRepository, leadRepository } from "@/lib/data";
import { getAdminSession } from "@/lib/auth-server";
import type { LeadStatus, VehicleInput } from "@/lib/types";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
}

function revalidatePublic(vehicleType?: "car" | "bike", id?: string) {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/leads");
  revalidatePath("/cars");
  revalidatePath("/bikes");
  revalidatePath("/");
  if (vehicleType && id) revalidatePath(`/${vehicleType}/${id}`);
}

export interface SaveVehicleResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function validate(input: VehicleInput): string | null {
  if (!input.make?.trim() || !input.model?.trim())
    return "Make and model are required.";
  if (!input.year || input.year < 1980 || input.year > new Date().getFullYear() + 1)
    return "Please enter a valid year.";
  if (!input.price || input.price <= 0) return "Please enter a valid price.";
  if (input.kmsDriven == null || input.kmsDriven < 0)
    return "Please enter valid kilometres.";
  if (!input.images?.length) return "Add at least one image.";
  if (!input.primaryImageUrl) return "Select a primary image.";
  if (input.type === "bike" && !input.engineCc)
    return "Engine CC is required for bikes.";
  return null;
}

export async function saveVehicleAction(
  input: VehicleInput,
  id?: string,
): Promise<SaveVehicleResult> {
  await requireAdmin();
  const error = validate(input);
  if (error) return { ok: false, error };

  if (id) {
    const updated = await vehicleRepository.update(id, input);
    if (!updated) return { ok: false, error: "Vehicle not found." };
    revalidatePublic(updated.type, updated.id);
    return { ok: true, id: updated.id };
  }

  const created = await vehicleRepository.create(input);
  revalidatePublic(created.type, created.id);
  return { ok: true, id: created.id };
}

export async function deleteVehicleAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const ok = await vehicleRepository.remove(id);
  revalidatePublic();
  return { ok };
}

export async function setSoldAction(
  id: string,
  isSold: boolean,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const updated = await vehicleRepository.update(id, { isSold });
  if (updated) revalidatePublic(updated.type, updated.id);
  return { ok: !!updated };
}

export async function updateLeadStatusAction(
  id: string,
  status: LeadStatus,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const updated = await leadRepository.updateStatus(id, status);
  revalidatePath("/admin/leads");
  return { ok: !!updated };
}
