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
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Vehicle } from "@/lib/types";
import { formatPriceFull, formatKms } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteVehicleAction, setSoldAction } from "@/app/actions/admin";

export function InventoryTable({
  vehicles,
  leadCounts,
}: {
  vehicles: Vehicle[];
  leadCounts: Record<string, number>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) =>
      `${v.make} ${v.model} ${v.variant ?? ""} ${v.registrationNumber ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [vehicles, query]);

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
      <div className="border-b p-3">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search inventory…"
            className="h-9 pl-9"
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
              <tr key={v.id} className="border-b last:border-0">
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
                <td
                  colSpan={6}
                  className="p-10 text-center text-sm text-muted-foreground"
                >
                  No vehicles match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
