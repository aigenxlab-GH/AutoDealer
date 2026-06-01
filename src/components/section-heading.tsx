import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  centred?: boolean;
}

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "View all",
  centred = false,
}: SectionHeadingProps) {
  return (
    <div className={`mb-8 ${centred ? "text-center" : "flex items-end justify-between gap-4"}`}>
      <div className={centred ? "inline-block" : undefined}>
        {/* Gold rule */}
        <div
          className={`mb-3 h-px w-10 ${centred ? "mx-auto" : ""}`}
          style={{ background: "linear-gradient(90deg, #c9973a, #f0c96a)" }}
        />
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 text-sm text-white/40">{subtitle}</p>
        )}
      </div>
      {href && !centred && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-[#c9973a] hover:text-[#f0c96a] transition-colors"
        >
          {linkLabel} <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
