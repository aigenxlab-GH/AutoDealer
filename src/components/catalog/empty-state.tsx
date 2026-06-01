import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title = "No vehicles found",
  message = "Try adjusting or clearing your filters to see more results.",
  resetHref,
}: {
  title?: string;
  message?: string;
  resetHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <SearchX className="size-7" />
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {resetHref && (
        <Link
          href={resetHref}
          className={cn(buttonVariants({ variant: "outline" }), "mt-5")}
        >
          Clear filters
        </Link>
      )}
    </div>
  );
}
