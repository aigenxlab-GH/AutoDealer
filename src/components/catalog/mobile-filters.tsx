"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterBar, type FilterBarProps } from "./filter-bar";
import { useFilterNav } from "./use-filter-nav";

const FILTER_KEYS = [
  "make",
  "fuel",
  "transmission",
  "minPrice",
  "maxPrice",
  "minYear",
  "maxYear",
  "maxKms",
];

export function MobileFilters(props: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const { searchParams } = useFilterNav();
  const activeCount = FILTER_KEYS.filter((k) => searchParams.has(k)).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" className="h-10 lg:hidden" />
        }
      >
        <SlidersHorizontal className="size-4" />
        Filters
        {activeCount > 0 && (
          <Badge className="ml-1 size-5 justify-center rounded-full p-0 text-[10px]">
            {activeCount}
          </Badge>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto p-5">
        <SheetHeader className="px-0">
          <SheetTitle>Filter {props.type === "car" ? "Cars" : "Bikes"}</SheetTitle>
        </SheetHeader>
        <FilterBar {...props} />
      </SheetContent>
    </Sheet>
  );
}
