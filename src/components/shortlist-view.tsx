"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { VehicleGrid } from "@/components/vehicle-grid";
import { useShortlist } from "@/lib/use-shortlist";
import type { Vehicle } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ShortlistView({ vehicles }: { vehicles: Vehicle[] }) {
  const { ids, ready, clear, count } = useShortlist();

  if (!ready) {
    return <div className="h-64" aria-hidden />;
  }

  const shortlisted = vehicles.filter((v) => ids.includes(v.id));

  if (shortlisted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Heart className="size-7" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">Your shortlist is empty</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Tap the heart on any vehicle to save it here for later.
        </p>
        <div className="mt-5 flex gap-3">
          <Link href="/cars" className={cn(buttonVariants())}>
            Browse Cars
          </Link>
          <Link
            href="/bikes"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Browse Bikes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {count} saved vehicle{count === 1 ? "" : "s"}
        </p>
        <Button variant="ghost" size="sm" onClick={clear}>
          <Trash2 className="size-4" /> Clear all
        </Button>
      </div>
      <VehicleGrid vehicles={shortlisted} />
    </>
  );
}
