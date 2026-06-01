"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { VehicleType } from "@/lib/types";
import { formatKms, formatPriceShort } from "@/lib/format";
import { capitalize } from "@/lib/vehicle-display";
import { useFilterNav } from "./use-filter-nav";

export interface FilterBarProps {
  type: VehicleType;
  makes: string[];
  priceBounds: [number, number];
  yearBounds: [number, number];
  kmsMax: number;
}

const FUELS = ["petrol", "diesel", "cng", "electric", "hybrid"];
const TRANSMISSIONS = ["manual", "automatic"];
const PRICE_STEP = 25_000;
const KMS_STEP = 5_000;

export function FilterBar({
  type,
  makes,
  priceBounds,
  yearBounds,
  kmsMax,
}: FilterBarProps) {
  const { searchParams, setParams, clearAll } = useFilterNav();

  const make = searchParams.get("make") ?? "all";
  const fuel = searchParams.get("fuel") ?? "all";
  const transmission = searchParams.get("transmission") ?? "all";

  // Range controls keep local state for smooth dragging; URL updates on commit.
  const [price, setPrice] = useState<number[]>([
    Number(searchParams.get("minPrice")) || priceBounds[0],
    Number(searchParams.get("maxPrice")) || priceBounds[1],
  ]);
  const [years, setYears] = useState<number[]>([
    Number(searchParams.get("minYear")) || yearBounds[0],
    Number(searchParams.get("maxYear")) || yearBounds[1],
  ]);
  const [kms, setKms] = useState<number>(
    Number(searchParams.get("maxKms")) || kmsMax,
  );

  // Re-sync sliders when the URL is cleared/changed elsewhere.
  useEffect(() => {
    setPrice([
      Number(searchParams.get("minPrice")) || priceBounds[0],
      Number(searchParams.get("maxPrice")) || priceBounds[1],
    ]);
    setYears([
      Number(searchParams.get("minYear")) || yearBounds[0],
      Number(searchParams.get("maxYear")) || yearBounds[1],
    ]);
    setKms(Number(searchParams.get("maxKms")) || kmsMax);
  }, [searchParams, priceBounds, yearBounds, kmsMax]);

  const toArr = (v: number | readonly number[]): number[] =>
    Array.isArray(v) ? [...v] : [v as number];

  const commitPrice = (v: number | readonly number[]) => {
    const a = toArr(v);
    setParams({
      minPrice: a[0] > priceBounds[0] ? a[0] : null,
      maxPrice: a[1] < priceBounds[1] ? a[1] : null,
    });
  };
  const commitYears = (v: number | readonly number[]) => {
    const a = toArr(v);
    setParams({
      minYear: a[0] > yearBounds[0] ? a[0] : null,
      maxYear: a[1] < yearBounds[1] ? a[1] : null,
    });
  };
  const commitKms = (v: number | readonly number[]) => {
    const value = toArr(v)[0];
    setParams({ maxKms: value < kmsMax ? value : null });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="text-muted-foreground"
        >
          <RotateCcw className="size-3.5" /> Reset
        </Button>
      </div>

      {/* Make */}
      <div className="space-y-2">
        <Label>Make</Label>
        <Select value={make} onValueChange={(v) => setParams({ make: v as string })}>
          <SelectTrigger className="h-9 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Makes</SelectItem>
            {makes.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Car-only: fuel + transmission */}
      {type === "car" && (
        <>
          <div className="space-y-2">
            <Label>Fuel Type</Label>
            <Select
              value={fuel}
              onValueChange={(v) => setParams({ fuel: v as string })}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fuel Types</SelectItem>
                {FUELS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {capitalize(f)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transmission</Label>
            <Select
              value={transmission}
              onValueChange={(v) => setParams({ transmission: v as string })}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {TRANSMISSIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {capitalize(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Price range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Price</Label>
          <span className="text-xs text-muted-foreground">
            {formatPriceShort(price[0])} – {formatPriceShort(price[1])}
          </span>
        </div>
        <Slider
          value={price}
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={PRICE_STEP}
          onValueChange={(v) => setPrice(toArr(v))}
          onValueCommitted={commitPrice}
        />
      </div>

      {/* Year range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Year</Label>
          <span className="text-xs text-muted-foreground">
            {years[0]} – {years[1]}
          </span>
        </div>
        <Slider
          value={years}
          min={yearBounds[0]}
          max={yearBounds[1]}
          step={1}
          onValueChange={(v) => setYears(toArr(v))}
          onValueCommitted={commitYears}
        />
      </div>

      {/* Max KMs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Max Kilometres</Label>
          <span className="text-xs text-muted-foreground">
            Up to {formatKms(kms)}
          </span>
        </div>
        <Slider
          value={[kms]}
          min={0}
          max={kmsMax}
          step={KMS_STEP}
          onValueChange={(v) => setKms(toArr(v)[0])}
          onValueCommitted={commitKms}
        />
      </div>
    </div>
  );
}
