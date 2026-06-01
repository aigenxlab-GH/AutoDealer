import Link from "next/link";
import { Car, Clock, Mail, MapPin, Phone } from "lucide-react";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from "@/components/icons/social";
import { siteConfig } from "@/config/site";

export function Footer() {
  const { dealer, social } = siteConfig;
  return (
    <footer className="border-t border-border/60 bg-brand text-brand-foreground">
      {/* Gold top rule */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/10">
              <Car className="size-4" />
            </span>
            <span className="font-heading text-base font-semibold">{siteConfig.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/60">
            {siteConfig.description}
          </p>
        </div>

        {/* Explore */}
        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-white/40">
            Explore
          </h3>
          <ul className="space-y-2.5 text-sm text-white/70">
            {[
              { href: "/cars", label: "Used Cars" },
              { href: "/bikes", label: "Used Bikes" },
              { href: "/shortlist", label: "My Shortlist" },
              { href: "/about", label: "About Us" },
              { href: "/contact", label: "Contact" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-white/40">
            Visit Us
          </h3>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold/80" />
              <a
                href={dealer.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                {dealer.addressLine},<br />
                {dealer.city}, {dealer.state} — {dealer.pincode}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Phone className="size-4 shrink-0 text-gold/80" />
              <a href={`tel:${dealer.phoneDisplay}`} className="hover:text-white">
                {dealer.phoneDisplay}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="size-4 shrink-0 text-gold/80" />
              <a href={`mailto:${dealer.email}`} className="hover:text-white">
                {dealer.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="size-4 shrink-0 text-gold/80" />
              <span>{dealer.openHours}</span>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-white/40">
            Follow Us
          </h3>
          <div className="flex gap-3">
            {[
              { href: social.instagram, Icon: InstagramIcon, label: "Instagram" },
              { href: social.facebook, Icon: FacebookIcon, label: "Facebook" },
              { href: social.youtube, Icon: YoutubeIcon, label: "YouTube" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-lg border border-white/15 bg-white/8 text-white/70 transition-colors hover:border-gold/40 hover:bg-white/15 hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-[12px] text-white/40 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p>Established {dealer.establishedYear} · Certified Pre-Owned Specialist</p>
        </div>
      </div>
    </footer>
  );
}
