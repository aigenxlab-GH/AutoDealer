import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";
import { settingsRepository } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Visit or message ${siteConfig.name} in ${siteConfig.dealer.city}.`,
};

export default async function ContactPage() {
  const settings = await settingsRepository.getShopSettings();
  const { dealer } = siteConfig;
  const mapsLink = settings.mapsLink || dealer.mapsUrl;
  const rows = [
    { icon: MapPin, label: "Showroom", value: `${settings.addressLine || dealer.addressLine}, ${settings.city || dealer.city}, ${settings.state || dealer.state} - ${settings.pincode || dealer.pincode}`, href: mapsLink },
    { icon: Phone, label: "Phone", value: settings.phone1 || dealer.phoneDisplay, href: `tel:${(settings.phone1 || dealer.phoneDisplay).replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: dealer.email, href: `mailto:${dealer.email}` },
    { icon: Clock, label: "Open Hours", value: dealer.openHours },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-1 h-px w-8" style={{ background: "linear-gradient(90deg,#c9973a,#f0c96a)" }} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#c9973a" }}>
        Get in touch
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
        Contact {siteConfig.name}
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] text-white/45">
        Have a question about a vehicle or want to book a visit? Reach out — we respond fastest on WhatsApp.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          {rows.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex gap-4">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(201,151,58,0.12)", color: "#c9973a" }}
              >
                <Icon className="size-5" />
              </span>
              <div>
                <div className="text-sm font-semibold text-white/70">{label}</div>
                {href ? (
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer" className="text-sm text-white/40 hover:text-white/80 transition-colors">
                    {value}
                  </a>
                ) : (
                  <p className="text-sm text-white/40">{value}</p>
                )}
              </div>
            </div>
          ))}

          <a
            href={buildGeneralWhatsAppUrl(undefined, settings.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
            style={{ boxShadow: "0 4px 24px rgba(37,211,102,0.3)" }}
          >
            <MessageCircle className="size-5" /> Message on WhatsApp
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <iframe
            title="Showroom location"
            className="h-full min-h-72 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${dealer.addressLine}, ${dealer.city}`)}&output=embed`}
            style={{ filter: "invert(90%) hue-rotate(180deg)" }}
          />
        </div>
      </div>
    </div>
  );
}
