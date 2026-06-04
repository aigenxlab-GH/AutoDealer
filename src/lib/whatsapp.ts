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
/** @param number  E.164 without '+' — falls back to siteConfig if empty */
function waNumber(number?: string): string {
  return number || siteConfig.dealer.whatsappNumber;
}

export function buildEnquiryWhatsAppUrl(vehicle: Vehicle, name: string, number?: string): string {
  const text = `Hi! I am interested in the ${vehicleTitle(vehicle)} listed on your website. My name is ${name.trim()}. Is it still available?`;
  return `${WA_BASE}/${waNumber(number)}?text=${encodeURIComponent(text)}`;
}

/** Generic "chat with us" link. */
export function buildGeneralWhatsAppUrl(message?: string, number?: string): string {
  const text =
    message ??
    `Hi ${siteConfig.dealer.name}! I'd like to know more about your vehicles.`;
  return `${WA_BASE}/${waNumber(number)}?text=${encodeURIComponent(text)}`;
}

/** Context-aware URL — message varies based on current page. */
export function buildContextWhatsAppUrl(pathname: string, number?: string): string {
  const dealer = siteConfig.dealer.name;
  let text: string;

  if (pathname.startsWith("/car/")) {
    text = `Hi ${dealer}! I found a car listing on your website and I'm interested. Can you share more details?`;
  } else if (pathname.startsWith("/bike/")) {
    text = `Hi ${dealer}! I found a bike listing on your website and I'm interested. Can you share more details?`;
  } else if (pathname === "/cars") {
    text = `Hi ${dealer}! I visited your website and I'm looking for a used car. Can you help me find the right one?`;
  } else if (pathname === "/bikes") {
    text = `Hi ${dealer}! I visited your website and I'm looking for a used bike. Can you help me find the right one?`;
  } else if (pathname === "/finance") {
    text = `Hi ${dealer}! I'm interested in vehicle financing options. Can you share more details?`;
  } else if (pathname === "/contact") {
    text = `Hi ${dealer}! I have a general enquiry. Can you help me?`;
  } else {
    text = `Hi ${dealer}! I visited your website and would like to know more about your vehicles.`;
  }

  return `${WA_BASE}/${waNumber(number)}?text=${encodeURIComponent(text)}`;
}
