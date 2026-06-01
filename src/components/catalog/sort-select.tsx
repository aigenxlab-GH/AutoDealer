"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VehicleSort } from "@/lib/types";
import { useFilterNav } from "./use-filter-nav";

const OPTIONS: { value: VehicleSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "year-desc", label: "Year: Newest" },
  { value: "kms-asc", label: "Kilometres: Lowest" },
];

export function SortSelect() {
  const { searchParams, setParams } = useFilterNav();
  const value = (searchParams.get("sort") as VehicleSort) ?? "newest";

  return (
    <Select
      value={value}
      onValueChange={(v) => setParams({ sort: v as string })}
    >
      <SelectTrigger className="h-10 min-w-44" aria-label="Sort vehicles">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
