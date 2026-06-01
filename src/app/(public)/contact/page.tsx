import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Visit or message ${siteConfig.name} in ${siteConfig.dealer.city}.`,
};

export default function ContactPage() {
  const { dealer } = siteConfig;
  const rows = [
    {
      icon: MapPin,
      label: "Showroom",
      value: `${dealer.addressLine}, ${dealer.city}, ${dealer.state} - ${dealer.pincode}`,
      href: dealer.mapsUrl,
    },
    { icon: Phone, label: "Phone", value: dealer.phoneDisplay, href: `tel:${dealer.phoneDisplay}` },
    { icon: Mail, label: "Email", value: dealer.email, href: `mailto:${dealer.email}` },
    { icon: Clock, label: "Open Hours", value: dealer.openHours },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">
        Get in touch
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Contact {siteConfig.name}
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Have a question about a vehicle or want to book a visit? Reach out — we
        respond fastest on WhatsApp.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="space-y-5">
          {rows.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon className="size-5" />
              </span>
              <div>
                <div className="text-sm font-semibold">{label}</div>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">{value}</p>
                )}
              </div>
            </div>
          ))}

          <a
            href={buildGeneralWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-fit bg-[#25D366] text-white hover:bg-[#25D366]/90",
            )}
          >
            <MessageCircle className="size-5" /> Message on WhatsApp
          </a>
        </div>

        <div className="overflow-hidden rounded-xl border shadow-sm">
          <iframe
            title="Showroom location"
            className="h-full min-h-72 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              `${dealer.addressLine}, ${dealer.city}`,
            )}&output=embed`}
          />
        </div>
      </div>
    </div>
  );
}
