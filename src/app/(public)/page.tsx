import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bike,
  Car,
  MessageCircle,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VehicleGrid } from "@/components/vehicle-grid";
import { SectionHeading } from "@/components/section-heading";
import { vehicleRepository } from "@/lib/data";
import { siteConfig } from "@/config/site";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";
import { DealerJsonLd } from "@/components/json-ld";

export const revalidate = 300;

const USPS = [
  {
    icon: BadgeCheck,
    title: "Verified History",
    desc: "Documented ownership & service records on every vehicle.",
  },
  {
    icon: Wrench,
    title: "200-Point Inspection",
    desc: "Certified technicians check everything before it's listed.",
  },
  {
    icon: Banknote,
    title: "Easy Finance",
    desc: "Quick loan assistance with attractive interest rates.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Pricing",
    desc: "No hidden charges — what you see is what you pay.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Nair",
    text: "Bought a Hyundai Creta and the whole process was smooth. The car was exactly as described and the WhatsApp support was super quick.",
    vehicle: "Hyundai Creta owner",
  },
  {
    name: "Arjun Reddy",
    text: "Transparent pricing and no pushy sales. They helped me with the loan too. Highly recommend for anyone buying a used bike.",
    vehicle: "Royal Enfield owner",
  },
  {
    name: "Sneha Iyer",
    text: "Great selection of well-maintained cars. The inspection report gave me a lot of confidence before purchasing.",
    vehicle: "Maruti Swift owner",
  },
];

// A dramatic car photo for the hero visual (Unsplash)
const HERO_IMG =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85";

export default async function HomePage() {
  const [featured, cars, bikes] = await Promise.all([
    vehicleRepository.getFeatured(8),
    vehicleRepository.list({ type: "car" }),
    vehicleRepository.list({ type: "bike" }),
  ]);

  const yearsActive =
    new Date().getFullYear() - siteConfig.dealer.establishedYear;

  return (
    <>
      <DealerJsonLd />

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand text-brand-foreground">
        {/* Subtle diagonal noise texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAxTDEgME0wIDNMMiAxTTEgNEwzIDJNMiA0TDQgMk00IDNMMyA0IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNCkiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-60" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-16">
          {/* Left — text */}
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Star className="size-3 fill-gold text-gold" />
              Since {siteConfig.dealer.establishedYear} &middot;{" "}
              {siteConfig.dealer.city}
            </span>

            {/* h1 auto-serif from CSS */}
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Certified Used Cars &amp; Bikes,{" "}
              <em className="not-italic text-gold">Honestly Priced.</em>
            </h1>

            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/75">
              No hidden charges, no pressure. Fully inspected vehicles perfect
              for{" "}
              <span className="font-semibold text-white">first-time buyers</span>{" "}
              and{" "}
              <span className="font-semibold text-white">budget-smart shoppers.</span>
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/cars"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "font-medium",
                )}
              >
                <Car className="size-4" /> Browse Cars
              </Link>
              <Link
                href="/bikes"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-gold text-gold-foreground hover:bg-gold/90 font-medium",
                )}
              >
                <Bike className="size-4" /> Browse Bikes
              </Link>
            </div>

            {/* Inline stats */}
            <div className="mt-8 flex gap-8 border-t border-white/10 pt-6">
              {[
                { value: `${cars.length}+`, label: "Cars" },
                { value: `${bikes.length}+`, label: "Bikes" },
                { value: `${yearsActive}+`, label: "Years Trusted" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-heading text-2xl font-semibold">{s.value}</div>
                  <div className="text-xs text-white/60">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — car image (hidden on mobile) */}
          <div className="relative hidden lg:block">
            <div className="relative h-[340px] overflow-hidden rounded-2xl shadow-2xl shadow-black/40">
              <Image
                src={HERO_IMG}
                alt="Premium used car"
                fill
                priority
                sizes="50vw"
                className="object-cover"
              />
              {/* Subtle left-edge blend */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-brand to-transparent" />
            </div>
            {/* Floating trust badge */}
            <div className="absolute -bottom-4 -left-4 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3 fill-gold text-gold" />
                  ))}
                </div>
                <span className="text-xs font-medium">4.9 · 200+ happy buyers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────────────────────────── */}
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border/50 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {USPS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 px-4 py-5 first:pl-0 last:pr-0">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/8 text-brand">
                <Icon className="size-4" />
              </span>
              <div>
                <h3 className="text-[13px] font-semibold">{title}</h3>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORY CARDS ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-2 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <CategoryCard
            href="/cars"
            label="Used Cars"
            count={cars.length}
            icon={<Car className="size-6" />}
            blurb="Hatchbacks, sedans, SUVs & more — inspected and ready to drive."
          />
          <CategoryCard
            href="/bikes"
            label="Used Bikes"
            count={bikes.length}
            icon={<Bike className="size-6" />}
            blurb="Commuters, cruisers & sportbikes from trusted brands."
          />
        </div>
      </section>

      {/* ── FEATURED ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          title="Featured Listings"
          subtitle="Hand-picked vehicles our customers love"
          href="/cars"
          linkLabel="View all"
        />
        <VehicleGrid vehicles={featured} />
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────── */}
      <section className="border-y border-border/50 bg-secondary/40 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="What our customers say"
            subtitle="Real experiences from verified buyers"
            centred
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
              >
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <figcaption className="mt-5 border-t border-border/50 pt-4">
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.vehicle}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-brand px-8 py-10 text-brand-foreground">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.10),transparent_60%)]" />
          <div className="relative flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
            <div>
              {/* h2 auto-serif */}
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Can&rsquo;t find what you&rsquo;re looking for?
              </h2>
              <p className="mt-1.5 text-sm text-white/70">
                Tell us your budget and preference — we&rsquo;ll source the right vehicle for you.
              </p>
            </div>
            <a
              href={buildGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95"
            >
              <MessageCircle className="size-4" /> Chat with us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function CategoryCard({
  href,
  label,
  count,
  icon,
  blurb,
}: {
  href: string;
  label: string;
  count: number;
  icon: React.ReactNode;
  blurb: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-5 rounded-2xl border border-border/70 bg-card px-6 py-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-brand/15 bg-brand/8 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          {/* h3 auto-serif */}
          <h3 className="text-lg font-semibold">{label}</h3>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {count} available
          </span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{blurb}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-brand" />
    </Link>
  );
}
