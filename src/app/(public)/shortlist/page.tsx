import type { Metadata } from "next";
import { vehicleRepository } from "@/lib/data";
import { ShortlistView } from "@/components/shortlist-view";

export const metadata: Metadata = {
  title: "My Shortlist",
  description: "Vehicles you've saved for later.",
};

export default async function ShortlistPage() {
  const vehicles = await vehicleRepository.list({ includeSold: true });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        My Shortlist
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your saved cars and bikes, ready when you are.
      </p>
      <div className="mt-8">
        <ShortlistView vehicles={vehicles} />
      </div>
    </div>
  );
}
