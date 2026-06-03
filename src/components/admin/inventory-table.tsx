"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  CheckCircle2,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
  Car,
  Bike,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Vehicle } from "@/lib/types";
import { formatPriceFull, formatKms } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteVehicleAction, setSoldAction } from "@/app/actions/admin";

type TypeFilter   = "all" | "car" | "bike";
type StatusFilter = "all" | "active" | "sold";

export function InventoryTable({
  vehicles,
  leadCounts,
}: {
  vehicles: Vehicle[];
  leadCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [query,  setQuery]  = useState("");
  const [typeF,  setTypeF]  = useState<TypeFilter>("all");
  const [statusF, setStatusF] = useState<StatusFilter>("all");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (typeF   !== "all" && v.type !== typeF)                  return false;
      if (statusF === "active" && v.isSold)                       return false;
      if (statusF === "sold"   && !v.isSold)                      return false;
      if (q && !`${v.make} ${v.model} ${v.variant ?? ""} ${v.registrationNumber ?? ""}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [vehicles, query, typeF, statusF]);

  const counts = useMemo(() => ({
    all:    vehicles.length,
    car:    vehicles.filter((v) => v.type === "car").length,
    bike:   vehicles.filter((v) => v.type === "bike").length,
    active: vehicles.filter((v) => !v.isSold).length,
    sold:   vehicles.filter((v) =>  v.isSold).length,
  }), [vehicles]);

  function toggleSold(v: Vehicle) {
    startTransition(async () => {
      await setSoldAction(v.id, !v.isSold);
      toast.success(v.isSold ? "Marked as available" : "Marked as sold");
      router.refresh();
    });
  }

  function remove(v: Vehicle) {
    if (!confirm(`Delete ${v.year} ${v.make} ${v.model}? This cannot be undone.`))
      return;
    startTransition(async () => {
      await deleteVehicleAction(v.id);
      toast.success("Vehicle deleted");
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b p-3">
        {/* Type toggle */}
        <div className="inline-flex rounded-lg border bg-muted p-0.5">
          {([["all","All",null], ["car","Cars",Car], ["bike","Bikes",Bike]] as [TypeFilter, string, React.ElementType | null][]).map(([val, label, Icon]) => (
            <button key={val} type="button" onClick={() => setTypeF(val)}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                typeF === val ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {Icon && <Icon className="size-3" />}
              {label}
              <span className="rounded-full bg-muted-foreground/20 px-1.5 text-[10px] font-semibold">
                {val === "all" ? counts.all : val === "car" ? counts.car : counts.bike}
              </span>
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="inline-flex rounded-lg border bg-muted p-0.5">
          {([["all","All"], ["active","Active"], ["sold","Sold"]] as [StatusFilter, string][]).map(([val, label]) => (
            <button key={val} type="button" onClick={() => setStatusF(val)}
              className={cn("rounded-md px-3 py-1 text-xs font-medium transition-colors",
                statusF === val ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {label}
              <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 text-[10px] font-semibold">
                {val === "all" ? counts.all : val === "active" ? counts.active : counts.sold}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative ml-auto max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search make, model, reg…"
            className="h-8 pl-9 text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="p-3 font-medium">Vehicle</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 text-center font-medium">Leads</th>
              <th className="p-3 text-center font-medium">Views</th>
              <th className="p-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={v.primaryImageUrl}
                        alt={v.model}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {v.year} {v.make} {v.model}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {v.variant ? `${v.variant} · ` : ""}
                        {formatKms(v.kmsDriven)} ·{" "}
                        <span className="capitalize">{v.type}</span>
                      </p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap p-3 font-medium">
                  {formatPriceFull(v.price)}
                </td>
                <td className="p-3">
                  {v.isSold ? (
                    <Badge variant="destructive">Sold</Badge>
                  ) : (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600">
                      Active
                    </Badge>
                  )}
                </td>
                <td className="p-3 text-center">{leadCounts[v.id] ?? 0}</td>
                <td className="p-3 text-center text-muted-foreground">
                  {v.views}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => toggleSold(v)}
                      title={v.isSold ? "Mark available" : "Mark sold"}
                    >
                      {v.isSold ? (
                        <RotateCcw className="size-4" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                    </Button>
                    <Link
                      href={`/admin/dashboard/${v.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                      )}
                      title="Edit"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => remove(v)}
                      title="Delete"
                      className="text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-sm text-muted-foreground">
                  {vehicles.length === 0
                    ? "No vehicles yet — add your first one."
                    : "No vehicles match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
