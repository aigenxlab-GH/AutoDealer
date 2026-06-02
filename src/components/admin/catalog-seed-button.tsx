"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Database, Loader2, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { seedCatalogAction } from "@/app/actions/admin";

export function CatalogSeedButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleSeed() {
    startTransition(async () => {
      const res = await seedCatalogAction();
      setConfirming(false);
      if (!res.ok) {
        toast.error(res.error ?? "Seeding failed.");
        return;
      }
      const { makes, models, variants } = res.stats!;
      toast.success(`Catalog seeded: ${makes} makes, ${models} models, ${variants} variants.`);
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5">
        <AlertTriangle className="size-3.5 shrink-0 text-amber-500" />
        <span className="text-xs text-amber-500">This will delete all current catalog data.</span>
        <Button size="sm" onClick={handleSeed} disabled={pending}
          className="ml-1 h-6 bg-amber-500 px-2 text-xs text-white hover:bg-amber-600">
          {pending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
          {pending ? "Seeding…" : "Confirm"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={pending}
          className="h-6 px-2 text-xs">
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
      <Database className="size-3.5" />
      Seed Indian Market Data
    </Button>
  );
}
