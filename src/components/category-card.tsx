"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CategoryCard({
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
      className="dark-card group flex items-center gap-5 rounded-2xl px-6 py-5"
    >
      <span
        className="flex size-14 shrink-0 items-center justify-center rounded-xl transition-all duration-300"
        style={{
          background: "rgba(201,151,58,0.1)",
          color: "#c9973a",
          border: "1px solid rgba(201,151,58,0.2)",
        }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="text-lg font-semibold text-white/90">{label}</h3>
          <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-medium text-white/40">
            {count} available
          </span>
        </div>
        <p className="mt-0.5 text-sm text-white/35">{blurb}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-[#c9973a]" />
    </Link>
  );
}
