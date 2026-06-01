import Link from "next/link";
import { Car, Mail, MapPin, Phone, Clock } from "lucide-react";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from "@/components/icons/social";
import { siteConfig } from "@/config/site";

export function Footer() {
  const { dealer, social } = siteConfig;
  return (
    <footer className="mt-auto border-t bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <Car className="size-5" />
            </span>
            <span className="text-base font-bold">{siteConfig.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/cars" className="hover:text-foreground">
                Used Cars
              </Link>
            </li>
            <li>
              <Link href="/bikes" className="hover:text-foreground">
                Used Bikes
              </Link>
            </li>
            <li>
              <Link href="/shortlist" className="hover:text-foreground">
                My Shortlist
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-foreground">
                About Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Visit Us</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <MapPin className="size-4 shrink-0" />
              <span>
                {dealer.addressLine}, {dealer.city}, {dealer.state} -{" "}
                {dealer.pincode}
              </span>
            </li>
            <li className="flex gap-2">
              <Phone className="size-4 shrink-0" />
              <a href={`tel:${dealer.phoneDisplay}`}>{dealer.phoneDisplay}</a>
            </li>
            <li className="flex gap-2">
              <Mail className="size-4 shrink-0" />
              <a href={`mailto:${dealer.email}`}>{dealer.email}</a>
            </li>
            <li className="flex gap-2">
              <Clock className="size-4 shrink-0" />
              <span>{dealer.openHours}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Follow</h3>
          <div className="mt-4 flex gap-3">
            <a
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex size-9 items-center justify-center rounded-full border hover:bg-accent"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href={social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex size-9 items-center justify-center rounded-full border hover:bg-accent"
            >
              <FacebookIcon className="size-4" />
            </a>
            <a
              href={social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex size-9 items-center justify-center rounded-full border hover:bg-accent"
            >
              <YoutubeIcon className="size-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>
            Established {dealer.establishedYear} · Certified Pre-Owned Specialist
          </p>
        </div>
      </div>
    </footer>
  );
}
