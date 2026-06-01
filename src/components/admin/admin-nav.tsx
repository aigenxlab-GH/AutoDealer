"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Inbox,
  ExternalLink,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Inventory", icon: LayoutDashboard },
  { href: "/admin/dashboard/new", label: "Add Vehicle", icon: PlusCircle },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
];

export function AdminNav({ email }: { email?: string }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-brand-foreground">
          <Car className="size-5" />
        </span>
        <div className="leading-none">
          <p className="text-sm font-bold">{siteConfig.shortName}</p>
          <p className="text-[11px] text-muted-foreground">Admin Desk</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-brand text-brand-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="space-y-1 border-t px-3 py-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ExternalLink className="size-4" />
          View Site
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
        {email && (
          <p className="truncate px-3 pt-1 text-[11px] text-muted-foreground">
            {email}
          </p>
        )}
      </div>
    </div>
  );
}
