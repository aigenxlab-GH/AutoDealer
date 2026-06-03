"use server";

import { revalidatePath } from "next/cache";
import { vehicleRepository, leadRepository, financeCompanyRepository, catalogRepository, settingsRepository } from "@/lib/data";
import { getAdminSession } from "@/lib/auth-server";
import type { FinanceCompanyInput, LeadStatus, VehicleMakeInput, VehicleModelInput, VehicleVariantInput, VehicleInput } from "@/lib/types";
import type { ShopSettings } from "@/lib/data/repository";

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

// ── Finance company actions ──────────────────────────────────────────────────

export interface SaveFinanceCompanyResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function validateFinance(input: FinanceCompanyInput): string | null {
  if (!input.name?.trim()) return "Company name is required.";
  if (!input.shortName?.trim()) return "Short name is required.";
  if (!input.interestRate || input.interestRate <= 0 || input.interestRate > 40)
    return "Enter a valid interest rate (0.1% – 40%).";
  if (!input.maxTenureYears || input.maxTenureYears < 1)
    return "Max tenure must be at least 1 year.";
  return null;
}

export async function saveFinanceCompanyAction(
  input: FinanceCompanyInput,
  id?: string,
): Promise<SaveFinanceCompanyResult> {
  await requireAdmin();
  const error = validateFinance(input);
  if (error) return { ok: false, error };

  if (id) {
    const updated = await financeCompanyRepository.update(id, input);
    if (!updated) return { ok: false, error: "Finance company not found." };
    revalidatePath("/admin/finance");
    revalidatePath("/finance");
    return { ok: true, id: updated.id };
  }

  const created = await financeCompanyRepository.create(input);
  revalidatePath("/admin/finance");
  revalidatePath("/finance");
  return { ok: true, id: created.id };
}

export async function deleteFinanceCompanyAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const ok = await financeCompanyRepository.remove(id);
  revalidatePath("/admin/finance");
  revalidatePath("/finance");
  return { ok };
}

export async function toggleFinanceCompanyAction(
  id: string,
  isActive: boolean,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const updated = await financeCompanyRepository.update(id, { isActive });
  revalidatePath("/admin/finance");
  revalidatePath("/finance");
  return { ok: !!updated };
}

// ── Catalog actions ──────────────────────────────────────────────────────────

export async function createMakeAction(input: VehicleMakeInput): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (!input.name?.trim()) return { ok: false, error: "Name is required." };
  await catalogRepository.createMake({ ...input, name: input.name.trim() });
  revalidatePath("/admin/catalog");
  return { ok: true };
}

export async function updateMakeAction(id: string, name: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (!name.trim()) return { ok: false, error: "Name is required." };
  const updated = await catalogRepository.updateMake(id, name.trim());
  revalidatePath("/admin/catalog");
  return { ok: !!updated };
}

export async function deleteMakeAction(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const result = await catalogRepository.deleteMake(id);
  if (result.ok) revalidatePath("/admin/catalog");
  return { ok: result.ok, error: result.reason };
}

export async function createModelAction(input: VehicleModelInput): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (!input.name?.trim()) return { ok: false, error: "Name is required." };
  if (!input.makeId) return { ok: false, error: "Make is required." };
  await catalogRepository.createModel({ ...input, name: input.name.trim() });
  revalidatePath("/admin/catalog");
  return { ok: true };
}

export async function updateModelAction(id: string, name: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (!name.trim()) return { ok: false, error: "Name is required." };
  const updated = await catalogRepository.updateModel(id, name.trim());
  revalidatePath("/admin/catalog");
  return { ok: !!updated };
}

export async function deleteModelAction(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const result = await catalogRepository.deleteModel(id);
  if (result.ok) revalidatePath("/admin/catalog");
  return { ok: result.ok, error: result.reason };
}

export async function createVariantAction(input: VehicleVariantInput): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (!input.name?.trim()) return { ok: false, error: "Name is required." };
  if (!input.modelId) return { ok: false, error: "Model is required." };
  await catalogRepository.createVariant({ ...input, name: input.name.trim() });
  revalidatePath("/admin/catalog");
  return { ok: true };
}

export async function updateVariantAction(id: string, name: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (!name.trim()) return { ok: false, error: "Name is required." };
  const updated = await catalogRepository.updateVariant(id, name.trim());
  revalidatePath("/admin/catalog");
  return { ok: !!updated };
}

export async function deleteVariantAction(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const ok = await catalogRepository.deleteVariant(id);
  revalidatePath("/admin/catalog");
  return { ok };
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getShopSettingsAction(): Promise<ShopSettings> {
  await requireAdmin();
  return settingsRepository.getShopSettings();
}

export async function saveShopSettingsAction(data: ShopSettings): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  try {
    await settingsRepository.saveShopSettings(data);
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

