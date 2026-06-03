"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Loader2, Pencil, Check, X, Car, Bike, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  createMakeAction, updateMakeAction, deleteMakeAction,
  createModelAction, updateModelAction, deleteModelAction,
  createVariantAction, updateVariantAction, deleteVariantAction,
} from "@/app/actions/admin";
import type { VehicleMake, VehicleModel, VehicleType, VehicleVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  makes: VehicleMake[];
  models: VehicleModel[];
  variants: VehicleVariant[];
}

type Tab = "makes" | "models" | "variants";

// Shared column templates — must match between TableShell header and EditableRow
// Type badge is rendered inline (not a separate column) so all grids are compact
const COLS_MAKES    = "minmax(0,1fr) 88px";              // Name+TypePill | Actions
const COLS_MODELS   = "180px minmax(0,1fr) 88px";        // Make+TypePill | Model Name | Actions
const COLS_VARIANTS = "180px 140px minmax(0,1fr) 88px";  // Make+TypePill | Model | Variant Name | Actions

// ── Root ──────────────────────────────────────────────────────────────────────

export function CatalogManager({ makes, models, variants }: Props) {
  const [tab, setTab] = useState<Tab>("makes");

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="inline-flex rounded-lg border bg-muted p-1">
        {(["makes", "models", "variants"] as Tab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={cn("rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            {t}
            <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-[10px] font-semibold">
              {t === "makes" ? makes.length : t === "models" ? models.length : variants.length}
            </span>
          </button>
        ))}
      </div>

      {tab === "makes"    && <MakesTab    makes={makes} />}
      {tab === "models"   && <ModelsTab   makes={makes} models={models} />}
      {tab === "variants" && <VariantsTab makes={makes} models={models} variants={variants} />}
    </div>
  );
}

// ── Type toggle ───────────────────────────────────────────────────────────────

function TypeToggle({ value, onChange, carCount, bikeCount }: {
  value: VehicleType; onChange: (t: VehicleType) => void;
  carCount: number; bikeCount: number;
}) {
  return (
    <div className="inline-flex rounded-md border bg-muted p-0.5">
      {(["car", "bike"] as VehicleType[]).map((t) => {
        const Icon = t === "car" ? Car : Bike;
        return (
          <button key={t} type="button" onClick={() => onChange(t)}
            className={cn("flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium capitalize transition-colors",
              value === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <Icon className="size-3" />
            {t}
            <span className="rounded-full bg-muted-foreground/20 px-1.5 text-[10px] font-semibold">
              {t === "car" ? carCount : bikeCount}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Makes ─────────────────────────────────────────────────────────────────────

function MakesTab({ makes }: { makes: VehicleMake[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [typeFilter, setTypeFilter] = useState<VehicleType>("car");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const filtered = makes
    .filter((m) => m.type === typeFilter)
    .filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()));

  function handleTypeChange(t: VehicleType) { setTypeFilter(t); setSearch(""); setAdding(false); setNewName(""); }

  function handleAdd() {
    if (!newName.trim()) return;
    startTransition(async () => {
      const res = await createMakeAction({ name: newName, type: typeFilter });
      if (!res.ok) { toast.error(res.error ?? "Failed."); return; }
      toast.success(`"${newName}" added.`);
      setNewName(""); setAdding(false); router.refresh();
    });
  }

  function handleUpdate(id: string, name: string) {
    startTransition(async () => {
      const res = await updateMakeAction(id, name);
      if (!res.ok) { toast.error(res.error ?? "Failed."); return; }
      toast.success("Renamed."); router.refresh();
    });
  }

  function handleDelete(id: string, label: string) {
    startTransition(async () => {
      const res = await deleteMakeAction(id);
      if (!res.ok) { toast.error(res.error ?? "Failed."); return; }
      toast.success(`"${label}" removed.`); router.refresh();
    });
  }

  return (
    <TableShell
      toolbar={
        <>
          <TypeToggle value={typeFilter} onChange={handleTypeChange}
            carCount={makes.filter((m) => m.type === "car").length}
            bikeCount={makes.filter((m) => m.type === "bike").length} />
          <div className="ml-auto">
            {!adding
              ? <Button size="sm" onClick={() => setAdding(true)}><Plus className="size-3.5" /> Add Make</Button>
              : <div className="flex items-center gap-2">
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setNewName(""); } }}
                    placeholder={typeFilter === "car" ? "e.g. Maruti Suzuki" : "e.g. Hero MotoCorp"}
                    className="h-8 w-48" autoFocus />
                  <Button size="sm" onClick={handleAdd} disabled={pending || !newName.trim()}>
                    {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNewName(""); }}>
                    <X className="size-3.5" />
                  </Button>
                </div>
            }
          </div>
        </>
      }
      filterBar={
        <SearchBar value={search} onChange={setSearch} placeholder="Search makes…" count={filtered.length} total={makes.filter((m) => m.type === typeFilter).length} />
      }
      headers={["Make Name", "Actions"]}
      colWidths={COLS_MAKES}
    >
      {filtered.length === 0
        ? <EmptyRow text={search ? `No makes match "${search}"` : `No ${typeFilter} makes yet — add one above.`} />
        : filtered.map((m) => (
            <EditableRow key={m.id} label={m.name} inlineBadge={m.type} colWidths={COLS_MAKES} disabled={pending}
              onSave={(n) => handleUpdate(m.id, n)} onDelete={() => handleDelete(m.id, m.name)} />
          ))}
    </TableShell>
  );
}

// ── Models ────────────────────────────────────────────────────────────────────

function ModelsTab({ makes, models }: { makes: VehicleMake[]; models: VehicleModel[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [typeFilter, setTypeFilter] = useState<VehicleType>("car");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [addMake, setAddMake] = useState("");
  const [newName, setNewName] = useState("");

  const typedMakes  = makes.filter((m) => m.type === typeFilter);
  const addMakeId   = typedMakes.find((m) => m.name === addMake)?.id ?? "";
  const typedMakeIds = typedMakes.map((m) => m.id);

  const filtered = models
    .filter((m) => typedMakeIds.includes(m.makeId))
    .filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.makeName.toLowerCase().includes(search.toLowerCase()));

  function handleTypeChange(t: VehicleType) { setTypeFilter(t); setSearch(""); setAdding(false); setAddMake(""); setNewName(""); }

  function handleAdd() {
    if (!newName.trim() || !addMakeId) return;
    startTransition(async () => {
      const res = await createModelAction({ makeId: addMakeId, name: newName });
      if (!res.ok) { toast.error(res.error ?? "Failed."); return; }
      toast.success(`"${newName}" added.`);
      setNewName(""); setAdding(false); router.refresh();
    });
  }

  function handleUpdate(id: string, name: string) {
    startTransition(async () => {
      const res = await updateModelAction(id, name);
      if (!res.ok) { toast.error(res.error ?? "Failed."); return; }
      toast.success("Renamed."); router.refresh();
    });
  }

  function handleDelete(id: string, label: string) {
    startTransition(async () => {
      const res = await deleteModelAction(id);
      if (!res.ok) { toast.error(res.error ?? "Failed."); return; }
      toast.success(`"${label}" removed.`); router.refresh();
    });
  }

  return (
    <TableShell
      toolbar={
        <>
          <TypeToggle value={typeFilter} onChange={handleTypeChange}
            carCount={models.filter((m) => makes.find((mk) => mk.id === m.makeId)?.type === "car").length}
            bikeCount={models.filter((m) => makes.find((mk) => mk.id === m.makeId)?.type === "bike").length} />
          <div className="ml-auto">
            {!adding
              ? <Button size="sm" onClick={() => setAdding(true)}><Plus className="size-3.5" /> Add Model</Button>
              : <div className="flex items-center gap-2">
                  <Select value={addMake} onValueChange={(v) => setAddMake(v ?? "")}>
                    <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Select make" /></SelectTrigger>
                    <SelectContent>{typedMakes.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setNewName(""); setAddMake(""); } }}
                    placeholder="Model name" className="h-8 w-36" autoFocus />
                  <Button size="sm" onClick={handleAdd} disabled={pending || !newName.trim() || !addMake}>
                    {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNewName(""); setAddMake(""); }}>
                    <X className="size-3.5" />
                  </Button>
                </div>
            }
          </div>
        </>
      }
      filterBar={
        <SearchBar value={search} onChange={setSearch} placeholder="Search make or model…" count={filtered.length} total={models.filter((m) => typedMakeIds.includes(m.makeId)).length} />
      }
      headers={["Make", "Model Name", "Actions"]}
      colWidths={COLS_MODELS}
    >
      {filtered.length === 0
        ? <EmptyRow text={search ? `No models match "${search}"` : `No ${typeFilter} models yet — add one above.`} />
        : filtered.map((m) => (
            <EditableRow key={m.id} label={m.name}
              leadingCells={[{ text: m.makeName, badge: typeFilter }]}
              colWidths={COLS_MODELS} disabled={pending}
              onSave={(n) => handleUpdate(m.id, n)} onDelete={() => handleDelete(m.id, m.name)} />
          ))}
    </TableShell>
  );
}

// ── Variants ──────────────────────────────────────────────────────────────────

function VariantsTab({ makes, models, variants }: { makes: VehicleMake[]; models: VehicleModel[]; variants: VehicleVariant[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [typeFilter, setTypeFilter] = useState<VehicleType>("car");
  const [search, setSearch]         = useState("");
  const [adding, setAdding]         = useState(false);
  const [addMake, setAddMake]       = useState("");
  const [addModel, setAddModel]     = useState("");
  const [newName, setNewName]       = useState("");

  const typedMakes   = makes.filter((m) => m.type === typeFilter);
  const typedMakeIds = typedMakes.map((m) => m.id);
  const addMakeId    = typedMakes.find((m) => m.name === addMake)?.id ?? "";
  const addModels    = addMakeId ? models.filter((m) => m.makeId === addMakeId) : [];
  const addModelId   = addModels.find((m) => m.name === addModel)?.id ?? "";

  const typedVariants = variants.filter((v) => {
    const model = models.find((m) => m.id === v.modelId);
    return model && typedMakeIds.includes(model.makeId);
  });
  const filtered = typedVariants
    .filter((v) => !search || [v.name, v.makeName, v.modelName].some((s) => s.toLowerCase().includes(search.toLowerCase())));

  function handleTypeChange(t: VehicleType) {
    setTypeFilter(t); setSearch("");
    setAdding(false); setAddMake(""); setAddModel(""); setNewName("");
  }

  function handleAdd() {
    if (!newName.trim() || !addModelId) return;
    startTransition(async () => {
      const res = await createVariantAction({ modelId: addModelId, name: newName });
      if (!res.ok) { toast.error(res.error ?? "Failed."); return; }
      toast.success(`"${newName}" added.`);
      setNewName(""); setAdding(false); router.refresh();
    });
  }

  function handleUpdate(id: string, name: string) {
    startTransition(async () => {
      const res = await updateVariantAction(id, name);
      if (!res.ok) { toast.error(res.error ?? "Failed."); return; }
      toast.success("Renamed."); router.refresh();
    });
  }

  function handleDelete(id: string, label: string) {
    startTransition(async () => {
      const res = await deleteVariantAction(id);
      if (!res.ok) { toast.error(res.error ?? "Failed."); return; }
      toast.success(`"${label}" removed.`); router.refresh();
    });
  }

  return (
    <TableShell
      toolbar={
        <>
          <TypeToggle value={typeFilter} onChange={handleTypeChange}
            carCount={typedVariants.filter(() => typeFilter === "car").length}
            bikeCount={typedVariants.filter(() => typeFilter === "bike").length} />
          <div className="ml-auto">
            {!adding
              ? <Button size="sm" onClick={() => setAdding(true)}><Plus className="size-3.5" /> Add Variant</Button>
              : <div className="flex flex-wrap items-center gap-2">
                  <Select value={addMake} onValueChange={(v) => { setAddMake(v ?? ""); setAddModel(""); }}>
                    <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Make" /></SelectTrigger>
                    <SelectContent>{typedMakes.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={addModel} onValueChange={(v) => setAddModel(v ?? "")} disabled={!addMake}>
                    <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Model" /></SelectTrigger>
                    <SelectContent>{addModels.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setNewName(""); } }}
                    placeholder="Variant name" className="h-8 w-32" autoFocus />
                  <Button size="sm" onClick={handleAdd} disabled={pending || !newName.trim() || !addModel}>
                    {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNewName(""); setAddMake(""); setAddModel(""); }}>
                    <X className="size-3.5" />
                  </Button>
                </div>
            }
          </div>
        </>
      }
      filterBar={
        <SearchBar value={search} onChange={setSearch} placeholder="Search make, model or variant…" count={filtered.length} total={typedVariants.length} />
      }
      headers={["Make", "Model", "Variant Name", "Actions"]}
      colWidths={COLS_VARIANTS}
    >
      {filtered.length === 0
        ? <EmptyRow text={search ? `No variants match "${search}"` : `No ${typeFilter} variants yet — add one above.`} />
        : filtered.map((v) => (
            <EditableRow key={v.id} label={v.name}
              leadingCells={[{ text: v.makeName, badge: typeFilter }, { text: v.modelName }]}
              colWidths={COLS_VARIANTS} disabled={pending}
              onSave={(n) => handleUpdate(v.id, n)} onDelete={() => handleDelete(v.id, v.name)} />
          ))}
    </TableShell>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function TableShell({ toolbar, filterBar, headers, colWidths, children }: {
  toolbar: React.ReactNode;
  filterBar: React.ReactNode;
  headers: string[];
  colWidths: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Toolbar: type toggle + action button */}
      <div className="flex flex-wrap items-center gap-3 border-b px-4 py-2.5">
        {toolbar}
      </div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 border-b bg-muted/30 px-4 py-2">
        {filterBar}
      </div>
      {/* Column headers */}
      <div className="grid border-b bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        style={{ gridTemplateColumns: colWidths }}>
        {headers.slice(0, -1).map((h) => <span key={h}>{h}</span>)}
        <span className="text-right">{headers[headers.length - 1]}</span>
      </div>
      {/* Rows */}
      <ul className="divide-y">{children}</ul>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder, count, total }: {
  value: string; onChange: (v: string) => void; placeholder: string;
  count: number; total: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="h-7 w-48 pl-7 text-xs" />
        {value && (
          <button type="button" onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="size-3" />
          </button>
        )}
      </div>
      {value && (
        <span className="text-xs text-muted-foreground">{count} of {total}</span>
      )}
    </div>
  );
}

function TypePill({ type }: { type: string }) {
  return (
    <span className={cn(
      "ml-1.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize",
      type === "car" ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600",
    )}>{type}</span>
  );
}

function EditableRow({ label, inlineBadge, leadingCells = [], colWidths, onSave, onDelete, disabled }: {
  label: string;
  inlineBadge?: string;                             // type pill shown inline after the label (Makes tab)
  leadingCells?: { text: string; badge?: string }[]; // cells before the label; badge adds TypePill (Models/Variants)
  colWidths: string;
  onSave: (n: string) => void; onDelete: () => void; disabled: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(label);

  function handleSave() {
    if (!value.trim() || value.trim() === label) { setEditing(false); setValue(label); return; }
    onSave(value.trim()); setEditing(false);
  }

  return (
    <li className="grid items-center gap-3 px-4 py-2 transition-colors hover:bg-white/[0.03]"
      style={{ gridTemplateColumns: colWidths }}>

      {/* Leading cells — Make (+ TypePill) and optional Model */}
      {leadingCells.map((cell, i) => (
        <span key={i} className="flex min-w-0 items-center">
          <span className="truncate text-xs text-muted-foreground">{cell.text}</span>
          {cell.badge && <TypePill type={cell.badge} />}
        </span>
      ))}

      {/* Editable entity name cell */}
      {editing
        ? <Input value={value} onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setEditing(false); setValue(label); } }}
            className="h-7 text-sm" autoFocus />
        : <span className="flex min-w-0 items-center">
            <span className="truncate text-sm font-medium">{label}</span>
            {inlineBadge && <TypePill type={inlineBadge} />}
          </span>}

      {/* Actions */}
      <div className="flex items-center justify-end gap-0.5">
        {editing ? (
          <>
            <IconBtn onClick={handleSave} disabled={disabled} label="Save" className="hover:text-green-500"><Check className="size-3.5" /></IconBtn>
            <IconBtn onClick={() => { setEditing(false); setValue(label); }} label="Cancel"><X className="size-3.5" /></IconBtn>
          </>
        ) : (
          <>
            <IconBtn onClick={() => setEditing(true)} disabled={disabled} label={`Edit ${label}`}><Pencil className="size-3.5" /></IconBtn>
            <IconBtn onClick={onDelete} disabled={disabled} label={`Delete ${label}`} className="hover:text-destructive"><Trash2 className="size-3.5" /></IconBtn>
          </>
        )}
      </div>
    </li>
  );
}

function IconBtn({ onClick, disabled, label, className, children }: {
  onClick: () => void; disabled?: boolean; label: string;
  className?: string; children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label}
      className={cn("rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40", className)}>
      {children}
    </button>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <li className="px-4 py-8 text-center text-sm text-muted-foreground">{text}</li>;
}
