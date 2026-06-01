// Central dealership configuration. In Phase 7 the WhatsApp number and dealer
// details can move to env / a settings table; for now they live here so the
// whole app runs with zero external config.

export const siteConfig = {
  name: "Sapphire Auto Hub",
  shortName: "Sapphire Auto",
  tagline: "Certified Pre-Owned Cars & Bikes",
  description:
    "No hidden charges, no pressure. Fully inspected used cars and bikes, honestly priced — perfect for first-time buyers and budget-smart shoppers in Bengaluru.",
  // Public site URL (used for SEO / sitemap). Overridden by NEXT_PUBLIC_SITE_URL.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sapphireautohub.example.com",

  dealer: {
    name: "Sapphire Auto Hub",
    // E.164 without the '+' for wa.me deep links. Placeholder Indian number.
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919876543210",
    phoneDisplay: "+91 98765 43210",
    email: "sales@sapphireautohub.example.com",
    addressLine: "12, MG Road, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    mapsUrl: "https://maps.google.com/?q=MG+Road+Indiranagar+Bengaluru",
    establishedYear: 2009,
    openHours: "Mon – Sat, 9:30 AM – 8:00 PM",
  },

  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
  },

  // Image-count limits enforced by the admin media uploader.
  limits: {
    carImages: 8,
    bikeImages: 4,
  },
} as const;

export type SiteConfig = typeof siteConfig;
