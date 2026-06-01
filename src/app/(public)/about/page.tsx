import type { Metadata } from "next";
import { BadgeCheck, Handshake, ShieldCheck, Users } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${siteConfig.name}, a certified pre-owned car and bike dealer in ${siteConfig.dealer.city}.`,
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust First",
    desc: "Honest condition reports and transparent pricing on every vehicle.",
  },
  {
    icon: BadgeCheck,
    title: "Quality Assured",
    desc: "Each vehicle passes a rigorous multi-point inspection before listing.",
  },
  {
    icon: Handshake,
    title: "Fair Deals",
    desc: "No pressure, no hidden charges — just the right vehicle at the right price.",
  },
  {
    icon: Users,
    title: "Customer Care",
    desc: "Personal assistance over WhatsApp, from first enquiry to final handover.",
  },
];

export default function AboutPage() {
  const years = new Date().getFullYear() - siteConfig.dealer.establishedYear;
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">
        About Us
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {siteConfig.name}
      </h1>
      <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
        For over {years} years, {siteConfig.name} has helped buyers in{" "}
        {siteConfig.dealer.city} find reliable, fairly-priced used cars and
        bikes. What began as a small family-run garage in{" "}
        {siteConfig.dealer.establishedYear} has grown into one of the city’s most
        trusted certified pre-owned showrooms — built entirely on word of mouth
        and repeat customers.
      </p>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        We hand-pick every vehicle, inspect it thoroughly, and stand behind it.
        No inflated prices, no hidden surprises — just a straightforward way to
        buy your next vehicle with confidence.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {VALUES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex gap-4 rounded-xl border bg-card p-6 shadow-sm"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Icon className="size-6" />
            </span>
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
