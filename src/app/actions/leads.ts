"use server";

import { leadRepository } from "@/lib/data";
import { isValidIndianPhone, normalizeIndianPhone } from "@/lib/phone";
import type { LeadInput } from "@/lib/types";

export interface CreateLeadResult {
  ok: boolean;
  error?: string;
  leadId?: string;
}

/**
 * Persists an enquiry lead linked to a vehicle (PRD step 2). The client then
 * redirects the user to WhatsApp (PRD step 3).
 */
export async function createLeadAction(
  input: LeadInput,
): Promise<CreateLeadResult> {
  const name = input.customerName?.trim();
  if (!name || name.length < 2) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!isValidIndianPhone(input.customerPhone)) {
    return { ok: false, error: "Please enter a valid 10-digit mobile number." };
  }
  if (!input.vehicleId) {
    return { ok: false, error: "Missing vehicle reference." };
  }

  const lead = await leadRepository.create({
    vehicleId: input.vehicleId,
    customerName: name,
    customerPhone: normalizeIndianPhone(input.customerPhone) ?? input.customerPhone,
  });

  return { ok: true, leadId: lead.id };
}
