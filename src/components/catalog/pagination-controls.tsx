"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PageSize } from "@/lib/search-params";

interface PaginationControlsProps {
  total: number;
  page: number;
  pageSize: PageSize;
}

const SIZE_LABELS: Record<PageSize, string> = {
  20: "20",
  50: "50",
  0: "All",
};

export function PaginationControls({ total, page, pageSize }: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function buildUrl(updates: Record<string, string | number>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => params.set(k, String(v)));
    return `${pathname}?${params.toString()}`;
  }

  function setPageSize(size: PageSize) {
    router.push(buildUrl({ pageSize: size, page: 1 }));
  }

  function goTo(p: number) {
    router.push(buildUrl({ page: p }));
  }

  const totalPages = pageSize === 0 ? 1 : Math.ceil(total / pageSize);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const start = pageSize === 0 ? 1 : (page - 1) * pageSize + 1;
  const end = pageSize === 0 ? total : Math.min(page * pageSize, total);

  return (
    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      {/* Result info + page size */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          {total === 0 ? "0 results" : `${start}–${end} of ${total}`}
        </span>
        <span className="text-muted-foreground/40">|</span>
        <span>Show:</span>
        <div className="flex gap-1">
          {([20, 50, 0] as PageSize[]).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setPageSize(size)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                pageSize === size
                  ? "bg-brand text-brand-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {SIZE_LABELS[size]}
            </button>
          ))}
        </div>
      </div>

      {/* Page navigation — hidden when showing All or single page */}
      {pageSize !== 0 && totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={!hasPrev}
            className="flex size-8 items-center justify-center rounded-md border text-sm transition-colors hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | "…")[]>((acc, p, i, arr) => {
              if (i > 0 && typeof arr[i - 1] === "number" && (arr[i - 1] as number) !== p - 1)
                acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goTo(p as number)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors",
                    page === p
                      ? "bg-brand text-brand-foreground"
                      : "hover:bg-muted text-muted-foreground",
                  )}
                >
                  {p}
                </button>
              )
            )}

          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={!hasNext}
            className="flex size-8 items-center justify-center rounded-md border text-sm transition-colors hover:bg-muted disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
