import type { Metadata } from "next";
import { BadgeCheck, Handshake, ShieldCheck, Users } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${siteConfig.name}, a certified pre-owned car and bike dealer in ${siteConfig.dealer.city}.`,
};

const VALUES = [
  { icon: ShieldCheck, title: "Trust First", desc: "Honest condition reports and transparent pricing on every vehicle." },
  { icon: BadgeCheck, title: "Quality Assured", desc: "Each vehicle passes a rigorous multi-point inspection before listing." },
  { icon: Handshake, title: "Fair Deals", desc: "No pressure, no hidden charges — just the right vehicle at the right price." },
  { icon: Users, title: "Customer Care", desc: "Personal assistance over WhatsApp, from first enquiry to final handover." },
];

export default function AboutPage() {
  const years = new Date().getFullYear() - siteConfig.dealer.establishedYear;
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Gold rule + eyebrow */}
      <div className="mb-1 h-px w-8" style={{ background: "linear-gradient(90deg,#c9973a,#f0c96a)" }} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#c9973a" }}>
        About Us
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
        {siteConfig.name}
      </h1>
      <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-white/50">
        For over {years} years, {siteConfig.name} has helped buyers in{" "}
        {siteConfig.dealer.city} find reliable, fairly-priced used cars and bikes.
        What began as a small family-run garage in {siteConfig.dealer.establishedYear} has
        grown into one of the city&rsquo;s most trusted certified pre-owned showrooms —
        built entirely on word of mouth and repeat customers.
      </p>
      <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/40">
        We hand-pick every vehicle, inspect it thoroughly, and stand behind it.
        No inflated prices, no hidden surprises — just a straightforward way to buy your
        next vehicle with confidence.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {VALUES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex gap-4 rounded-2xl p-6 transition-all duration-300"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, transparent 60%), #14161b",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span
              className="flex size-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "rgba(201,151,58,0.12)", color: "#c9973a" }}
            >
              <Icon className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold text-white/85">{title}</h2>
              <p className="mt-1 text-sm text-white/40">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
