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
        {/* Gold rule above title */}
        <div className={`mb-2.5 h-px w-10 bg-gold ${centred ? "mx-auto" : ""}`} />
        {/* h2 picks up global serif via CSS */}
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {href && !centred && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          {linkLabel} <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
