import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Car,
  Bike,
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
    desc: "Every vehicle comes with documented ownership & service records.",
  },
  {
    icon: Wrench,
    title: "200-Point Inspection",
    desc: "Thoroughly checked by certified technicians before listing.",
  },
  {
    icon: Banknote,
    title: "Easy Finance",
    desc: "Quick loan assistance with attractive interest rates.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Pricing",
    desc: "No hidden charges. The price you see is the price you pay.",
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

export default async function HomePage() {
  const [featured, cars, bikes] = await Promise.all([
    vehicleRepository.getFeatured(8),
    vehicleRepository.list({ type: "car" }),
    vehicleRepository.list({ type: "bike" }),
  ]);

  const yearsActive = new Date().getFullYear() - siteConfig.dealer.establishedYear;

  return (
    <>
      <DealerJsonLd />
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand text-brand-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_0%,rgba(255,255,255,0.12),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              <Star className="size-3.5 fill-gold text-gold" />
              Trusted since {siteConfig.dealer.establishedYear} ·{" "}
              {siteConfig.dealer.city}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Find your next{" "}
              <span className="text-gold">car or bike</span>, the trusted way.
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
              {siteConfig.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/cars"
                className={cn(buttonVariants({ size: "lg", variant: "secondary" }))}
              >
                <Car className="size-5" /> Browse Cars
              </Link>
              <Link
                href="/bikes"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-gold text-gold-foreground hover:bg-gold/90",
                )}
              >
                <Bike className="size-5" /> Browse Bikes
              </Link>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              <div>
                <dt className="text-2xl font-bold sm:text-3xl">{cars.length}+</dt>
                <dd className="text-sm text-white/70">Quality Cars</dd>
              </div>
              <div>
                <dt className="text-2xl font-bold sm:text-3xl">
                  {bikes.length}+
                </dt>
                <dd className="text-sm text-white/70">Premium Bikes</dd>
              </div>
              <div>
                <dt className="text-2xl font-bold sm:text-3xl">
                  {yearsActive}+
                </dt>
                <dd className="text-sm text-white/70">Years of Trust</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* USP / trust bar */}
      <section className="border-b bg-secondary/30">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-px overflow-hidden px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {USPS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3 p-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category nav */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <CategoryCard
            href="/cars"
            label="Used Cars"
            count={cars.length}
            icon={<Car className="size-7" />}
            blurb="Hatchbacks, sedans, SUVs & more — inspected and ready to drive."
          />
          <CategoryCard
            href="/bikes"
            label="Used Bikes"
            count={bikes.length}
            icon={<Bike className="size-7" />}
            blurb="Commuters, cruisers & sportbikes from trusted brands."
          />
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <SectionHeading
          title="Featured Listings"
          subtitle="Hand-picked vehicles our customers love"
          href="/cars"
          linkLabel="View all"
        />
        <VehicleGrid vehicles={featured} />
      </section>

      {/* Testimonials */}
      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="What our customers say"
            subtitle="Real experiences from happy buyers"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-xl border bg-card p-6 shadow-sm"
              >
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm text-muted-foreground">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-5">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.vehicle}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-brand px-8 py-12 text-center text-brand-foreground sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Can’t find what you’re looking for?
            </h2>
            <p className="mt-2 text-white/80">
              Tell us your budget and preference — we’ll find the perfect match.
            </p>
          </div>
          <a
            href={buildGeneralWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-[#25D366] text-white hover:bg-[#25D366]/90",
            )}
          >
            <MessageCircle className="size-5" /> Chat with us
          </a>
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
      className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border bg-card p-7 shadow-sm transition-all hover:shadow-md"
    >
      <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
        {icon}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold">{label}</h3>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count} available
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
      </div>
      <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-brand" />
    </Link>
  );
}
