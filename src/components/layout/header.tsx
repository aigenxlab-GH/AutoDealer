"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, Heart, Menu, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { buildGeneralWhatsAppUrl } from "@/lib/whatsapp";
import { useShortlist } from "@/lib/use-shortlist";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/cars", label: "Cars" },
  { href: "/bikes", label: "Bikes" },
  { href: "/finance", label: "Finance" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-sm">
        <Car className="size-4" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>
          {siteConfig.name}
        </span>
        <span className="text-[9px] uppercase tracking-[0.14em] text-white/40">
          {siteConfig.tagline}
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const { count, ready } = useShortlist();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#0c0d10]/95 backdrop-blur">
      {/* Gold hairline accent at top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#c9973a]/50 to-transparent" />

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-foreground",
                isActive(item.href)
                  ? "text-[#c9973a]"
                  : "text-white/55 hover:text-white",
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-3 -bottom-[18px] h-[2px] rounded-full bg-[#c9973a]" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/shortlist"
            aria-label="Shortlist"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "relative size-8",
            )}
          >
            <Heart className="size-4" />
            {ready && count > 0 && (
              <Badge className="absolute -right-0.5 -top-0.5 size-4 justify-center rounded-full p-0 text-[9px]">
                {count}
              </Badge>
            )}
          </Link>

          <a
            href={buildGeneralWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden bg-[#25D366] text-white hover:bg-[#25D366]/90 sm:inline-flex",
            )}
          >
            <MessageCircle className="size-3.5" /> Chat
          </a>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-heading text-base">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-3 flex flex-col gap-0.5 px-2">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                      isActive(item.href) ? "text-brand" : "text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <a
                  href={buildGeneralWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2.5 text-sm font-medium text-white"
                >
                  <MessageCircle className="size-4" /> Chat on WhatsApp
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
