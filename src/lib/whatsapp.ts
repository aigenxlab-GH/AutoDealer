import { siteConfig } from "@/config/site";
import type { Vehicle } from "@/lib/types";

const WA_BASE = "https://wa.me";

/** Vehicle headline used in messages and titles: "2021 Maruti Suzuki Swift". */
export function vehicleTitle(v: Vehicle): string {
  return `${v.year} ${v.make} ${v.model}`;
}

/**
 * The PRD's enquiry deep link. Writes the lead first, then redirects here.
 */
export function buildEnquiryWhatsAppUrl(vehicle: Vehicle, name: string): string {
  const text = `Hi! I am interested in the ${vehicleTitle(vehicle)} listed on your website. My name is ${name.trim()}. Is it still available?`;
  return `${WA_BASE}/${siteConfig.dealer.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/** Generic "chat with us" link for the floating button / header. */
export function buildGeneralWhatsAppUrl(message?: string): string {
  const text =
    message ??
    `Hi ${siteConfig.dealer.name}! I'd like to know more about your vehicles.`;
  return `${WA_BASE}/${siteConfig.dealer.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
