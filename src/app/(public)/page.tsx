import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Banknote,
  Bike,
  Car,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import { VehicleGrid } from "@/components/vehicle-grid";
import { CategoryCard } from "@/components/category-card";
import { SectionHeading } from "@/components/section-heading";
import { vehicleRepository, settingsRepository } from "@/lib/data";
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
  const [featured, cars, bikes, shopSettings] = await Promise.all([
    vehicleRepository.getFeatured(8),
    vehicleRepository.list({ type: "car" }),
    vehicleRepository.list({ type: "bike" }),
    settingsRepository.getShopSettings(),
  ]);

  // Fall back to siteConfig values if admin hasn't saved settings yet
  const mapsLink   = shopSettings.mapsLink    || siteConfig.dealer.mapsUrl;
  const address    = shopSettings.addressLine || siteConfig.dealer.addressLine;
  const city       = shopSettings.city        || siteConfig.dealer.city;
  const state      = shopSettings.state       || siteConfig.dealer.state;
  const pincode    = shopSettings.pincode     || siteConfig.dealer.pincode;
  const openHours  = shopSettings.openHours   || siteConfig.dealer.openHours;
  const phones     = [shopSettings.phone1, shopSettings.phone2, shopSettings.phone3, shopSettings.phone4]
    .filter(Boolean) as string[];
  const displayPhones = phones.length ? phones : [siteConfig.dealer.phoneDisplay];

  const yearsActive =
    new Date().getFullYear() - siteConfig.dealer.establishedYear;

  return (
    <>
      <DealerJsonLd />

      {/* ── HERO — dark ambient luxury ──────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: "#0c0d10" }}
      >
        {/* ── Layer 1: warm gold ambient glow (left, behind headline) */}
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, #c9973a 0%, #8b5e1a 35%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* ── Layer 2: cool blue-purple glow (right, behind car) */}
        <div
          className="pointer-events-none absolute -right-20 top-0 h-[500px] w-[500px] rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, #1e3a6e 0%, #0d1f42 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        {/* ── Layer 3: decorative circle outline (like the reference) */}
        <div
          className="pointer-events-none absolute right-[28%] top-[-120px] hidden h-[420px] w-[420px] rounded-full border border-white/5 lg:block"
        />
        <div
          className="pointer-events-none absolute right-[32%] top-[-80px] hidden h-[280px] w-[280px] rounded-full border border-white/[0.04] lg:block"
        />

        {/* ── Layer 4: very subtle film-grain texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-0 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          {/* ── LEFT: headline text ── */}
          <div className="py-14 lg:py-20">
            {/* Eyebrow pill */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-white/60 backdrop-blur-sm">
              <Star className="size-2.5 fill-gold text-gold" />
              Since {siteConfig.dealer.establishedYear} &middot; {siteConfig.dealer.city}
            </span>

            {/* Large display headline — Fraunces serif */}
            <h1
              className="mt-5 text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Certified
              <br />
              <em className="not-italic" style={{ color: "#c9973a" }}>
                Used Cars
              </em>
              <br />
              &amp; Bikes.
            </h1>

            {/* Gold hairline divider */}
            <div className="my-6 h-px w-12" style={{ background: "#c9973a" }} />

            <p className="max-w-sm text-[15px] leading-relaxed text-white/50">
              Honestly priced, fully inspected — no hidden charges, no pressure.
              Perfect for{" "}
              <span className="text-white/80">first-time buyers</span> &amp;{" "}
              <span className="text-white/80">budget-smart shoppers.</span>
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/cars"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15"
              >
                <Car className="size-4" /> Browse Cars
              </Link>
              <Link
                href="/bikes"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "#c9973a", color: "#1a0f00" }}
              >
                <Bike className="size-4" /> Browse Bikes
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 flex gap-8 border-t border-white/8 pt-7">
              {[
                { value: `${cars.length}+`, label: "Cars" },
                { value: `${bikes.length}+`, label: "Bikes" },
                { value: `${yearsActive}+`, label: "Yrs Trusted" },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    className="text-2xl font-semibold"
                    style={{ fontFamily: "var(--font-heading)", color: "#c9973a" }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-widest text-white/30">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: car image — no border-radius, bleeds to edge ── */}
          <div className="relative hidden h-full min-h-[480px] lg:block">
            {/* Full-height image, no rounded corners — blends into dark bg */}
            <Image
              src={HERO_IMG}
              alt="Premium used car"
              fill
              priority
              sizes="50vw"
              className="object-cover object-center"
              style={{ filter: "brightness(0.72) saturate(0.9)" }}
            />

            {/* Left fade — blends image into dark bg */}
            <div
              className="absolute inset-y-0 left-0 w-40"
              style={{
                background: "linear-gradient(to right, #0c0d10, transparent)",
              }}
            />
            {/* Top fade */}
            <div
              className="absolute inset-x-0 top-0 h-24"
              style={{
                background: "linear-gradient(to bottom, #0c0d10, transparent)",
              }}
            />
            {/* Bottom fade */}
            <div
              className="absolute inset-x-0 bottom-0 h-28"
              style={{
                background: "linear-gradient(to top, #0c0d10, transparent)",
              }}
            />

            {/* Warm glow over the car */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                background:
                  "radial-gradient(ellipse at 60% 50%, #c9973a, transparent 60%)",
              }}
            />

            {/* Floating trust badge */}
            <div
              className="absolute bottom-10 left-[-1px] rounded-r-xl border-y border-r px-4 py-3"
              style={{
                background: "rgba(12,13,16,0.85)",
                borderColor: "rgba(201,151,58,0.25)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3 fill-gold text-gold" />
                  ))}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">4.9 / 5.0</div>
                  <div className="text-[10px] text-white/40">200+ happy buyers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────────────────────────── */}
      <section style={{ background: "#0f1014", borderTop: "1px solid rgba(201,151,58,0.12)" }}>
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {USPS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 px-4 py-6"
              style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(201,151,58,0.12)", color: "#c9973a" }}
              >
                <Icon className="size-4" />
              </span>
              <div>
                <h3 className="text-[13px] font-semibold text-white/80">{title}</h3>
                <p className="mt-0.5 text-[12px] leading-relaxed text-white/35">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORY CARDS ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-2 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <CategoryCard href="/cars" label="Used Cars" count={cars.length}
            icon={<Car className="size-6" />}
            blurb="Hatchbacks, sedans, SUVs & more — inspected and ready to drive." />
          <CategoryCard href="/bikes" label="Used Bikes" count={bikes.length}
            icon={<Bike className="size-6" />}
            blurb="Commuters, cruisers & sportbikes from trusted brands." />
        </div>
      </section>

      {/* ── FEATURED ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          title="Featured Listings"
          subtitle="Hand-picked vehicles our customers love"
          href="/cars"
          linkLabel="View all"
        />
        <VehicleGrid vehicles={featured} />
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────── */}
      <section className="py-14" style={{ background: "#0f1014" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="What our customers say" subtitle="Real experiences from verified buyers" centred />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl p-6 transition-all duration-300"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, transparent 60%), #14161b",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex gap-0.5" style={{ color: "#c9973a" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-white/45">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <figcaption className="mt-5 border-t border-white/8 pt-4">
                  <div className="text-sm font-semibold text-white/80">{t.name}</div>
                  <div className="text-xs text-white/30">{t.vehicle}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCATE US ───────────────────────────────────────────────── */}
      <section className="py-14" style={{ background: "#0c0d10" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Visit Our Showroom" subtitle="Come see us in person — we'd love to help you find your perfect vehicle" centred />

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Map embed or placeholder */}
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/5">
              {shopSettings.mapsEmbed ? (
                <iframe
                  src={shopSettings.mapsEmbed}
                  width="100%"
                  height="340"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Shop location"
                />
              ) : (
                <div className="flex h-[340px] flex-col items-center justify-center gap-3 text-white/30">
                  <MapPin className="size-10 opacity-40" />
                  <p className="text-sm">Map not configured yet</p>
                </div>
              )}
            </div>

            {/* Address & contact details */}
            <div className="flex flex-col justify-center gap-5">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "rgba(201,151,58,0.12)", color: "#c9973a" }}>
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white/80">Address</p>
                    <p className="mt-0.5 text-sm text-white/45">
                      {address},<br />
                      {city}, {state} – {pincode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "rgba(201,151,58,0.12)", color: "#c9973a" }}>
                    <Clock className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white/80">Open Hours</p>
                    <p className="mt-0.5 text-sm text-white/45">{openHours}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "rgba(201,151,58,0.12)", color: "#c9973a" }}>
                    <Phone className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white/80">Call Us</p>
                    <div className="mt-0.5 space-y-0.5">
                      {displayPhones.map((ph, i) => (
                        <a key={i} href={`tel:${ph.replace(/\s/g, "")}`}
                          className="block text-sm text-white/45 hover:text-white/70 transition-colors">
                          {ph}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "#c9973a", color: "#1a0f00" }}>
                <Navigation className="size-4" /> Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-2xl px-8 py-10"
          style={{
            background: "linear-gradient(135deg, #1a1400 0%, #0c0d10 50%, #001030 100%)",
            border: "1px solid rgba(201,151,58,0.25)",
            boxShadow: "0 0 60px rgba(201,151,58,0.08), inset 0 1px 0 rgba(201,151,58,0.1)",
          }}
        >
          {/* Glow top-right */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #c9973a, transparent 70%)", filter: "blur(40px)" }} />
          <div className="relative flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
            <div>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                Can&rsquo;t find what you&rsquo;re looking for?
              </h2>
              <p className="mt-1.5 text-sm text-white/45">
                Tell us your budget and preference — we&rsquo;ll source the right vehicle for you.
              </p>
            </div>
            <a href={buildGeneralWhatsAppUrl()} target="_blank" rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{ boxShadow: "0 4px 24px rgba(37,211,102,0.3)" }}>
              <MessageCircle className="size-4" /> Chat with us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

