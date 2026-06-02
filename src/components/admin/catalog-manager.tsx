"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Loader2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createMakeAction, updateMakeAction, deleteMakeAction,
  createModelAction, updateModelAction, deleteModelAction,
  createVariantAction, updateVariantAction, deleteVariantAction,
} from "@/app/actions/admin";
import type { VehicleMake, VehicleModel, VehicleType, VehicleVariant } from "@/lib/types";

interface Props {
  makes: VehicleMake[];
  models: VehicleModel[];
  variants: VehicleVariant[];
}

type Tab = "makes" | "models" | "variants";

export function CatalogManager({ makes, models, variants }: Props) {
  const [tab, setTab] = useState<Tab>("makes");
  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border bg-muted p-1">
        {(["makes", "models", "variants"] as Tab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={["rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"].join(" ")}>
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

// ── Makes ─────────────────────────────────────────────────────────────────────

function MakesTab({ makes }: { makes: VehicleMake[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [type, setType] = useState<VehicleType>("car");

  function handleAdd() {
    if (!name.trim()) return;
    startTransition(async () => {
      const res = await createMakeAction({ name, type });
      if (!res.ok) { toast.error(res.error ?? "Failed to add."); return; }
      toast.success(`"${name}" added.`);
      setName("");
      router.refresh();
    });
  }

  function handleUpdate(id: string, newName: string) {
    startTransition(async () => {
      const res = await updateMakeAction(id, newName);
      if (!res.ok) { toast.error(res.error ?? "Failed to update."); return; }
      toast.success(`Renamed to "${newName}".`);
      router.refresh();
    });
  }

  function handleDelete(id: string, label: string) {
    startTransition(async () => {
      const res = await deleteMakeAction(id);
      if (!res.ok) { toast.error(res.error ?? "Failed to delete."); return; }
      toast.success(`"${label}" removed.`);
      router.refresh();
    });
  }

  return (
    <Section
      addForm={
        <div className="flex flex-wrap gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g. Maruti Suzuki" className="w-52" />
          <Select value={type} onValueChange={(v) => setType((v ?? "car") as VehicleType)}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="bike">Bike</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={pending || !name.trim()} size="sm">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add Make
          </Button>
        </div>
      }
      headers={["Make Name", "Type"]}
    >
      {makes.length === 0 && <Empty text="No makes yet. Add your first one above." cols={2} />}
      {makes.map((m) => (
        <EditableRow key={m.id} label={m.name} badge={m.type} disabled={pending}
          onSave={(n) => handleUpdate(m.id, n)}
          onDelete={() => handleDelete(m.id, m.name)} />
      ))}
    </Section>
  );
}

// ── Models ────────────────────────────────────────────────────────────────────

function ModelsTab({ makes, models }: { makes: VehicleMake[]; models: VehicleModel[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Use make NAME as select value (unique; avoids showing UUID)
  const [filterMakeName, setFilterMakeName] = useState("");
  const [addMakeName, setAddMakeName] = useState("");
  const [name, setName] = useState("");

  const addMakeId = makes.find((m) => m.name === addMakeName)?.id ?? "";
  const filterMakeId = makes.find((m) => m.name === filterMakeName)?.id ?? "";
  const filtered = filterMakeId ? models.filter((m) => m.makeId === filterMakeId) : models;

  function handleAdd() {
    if (!name.trim() || !addMakeId) return;
    startTransition(async () => {
      const res = await createModelAction({ makeId: addMakeId, name });
      if (!res.ok) { toast.error(res.error ?? "Failed to add."); return; }
      toast.success(`"${name}" added.`);
      setName("");
      router.refresh();
    });
  }

  function handleUpdate(id: string, newName: string) {
    startTransition(async () => {
      const res = await updateModelAction(id, newName);
      if (!res.ok) { toast.error(res.error ?? "Failed to update."); return; }
      toast.success(`Renamed to "${newName}".`);
      router.refresh();
    });
  }

  function handleDelete(id: string, label: string) {
    startTransition(async () => {
      const res = await deleteModelAction(id);
      if (!res.ok) { toast.error(res.error ?? "Failed to delete."); return; }
      toast.success(`"${label}" removed.`);
      router.refresh();
    });
  }

  return (
    <Section
      addForm={
        <div className="flex flex-wrap gap-2">
          {/* Use make name as value → no UUID shown */}
          <Select value={addMakeName} onValueChange={(v) => setAddMakeName(v ?? "")}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Select make" /></SelectTrigger>
            <SelectContent>
              {makes.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g. Swift" className="w-44" disabled={!addMakeName} />
          <Button onClick={handleAdd} disabled={pending || !name.trim() || !addMakeName} size="sm">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add Model
          </Button>
        </div>
      }
      filter={
        makes.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Filter by Make:</span>
            <Select value={filterMakeName} onValueChange={(v) => setFilterMakeName(v ?? "")}>
              <SelectTrigger className="h-7 w-40 text-xs"><SelectValue placeholder="All makes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All makes</SelectItem>
                {makes.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )
      }
      headers={["Model Name", "Make"]}
    >
      {filtered.length === 0 && <Empty text={filterMakeName ? "No models for this make yet." : "No models yet. Add your first one above."} cols={2} />}
      {filtered.map((m) => (
        <EditableRow key={m.id} label={m.name} badge={m.makeName} disabled={pending}
          onSave={(n) => handleUpdate(m.id, n)}
          onDelete={() => handleDelete(m.id, m.name)} />
      ))}
    </Section>
  );
}

// ── Variants ──────────────────────────────────────────────────────────────────

function VariantsTab({ makes, models, variants }: { makes: VehicleMake[]; models: VehicleModel[]; variants: VehicleVariant[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filterMakeName, setFilterMakeName] = useState("");
  const [addMakeName, setAddMakeName]   = useState("");
  const [addModelName, setAddModelName] = useState("");
  const [filterModelName, setFilterModelName] = useState("");
  const [name, setName] = useState("");

  const addMakeId    = makes.find((m) => m.name === addMakeName)?.id ?? "";
  const addModels    = addMakeId ? models.filter((m) => m.makeId === addMakeId) : [];
  const addModelId   = addModels.find((m) => m.name === addModelName)?.id ?? "";

  const filterMakeId  = makes.find((m) => m.name === filterMakeName)?.id ?? "";
  const filterModels  = filterMakeId ? models.filter((m) => m.makeId === filterMakeId) : models;
  const filterModelId = filterModels.find((m) => m.name === filterModelName)?.id ?? "";

  const filteredVariants = filterModelId
    ? variants.filter((v) => v.modelId === filterModelId)
    : filterMakeId
    ? variants.filter((v) => filterModels.some((m) => m.id === v.modelId))
    : variants;

  function handleMakeChange(val: string | null) {
    setAddMakeName(val ?? "");
    setAddModelName("");
  }

  function handleFilterMakeChange(val: string | null) {
    setFilterMakeName(val ?? "");
    setFilterModelName("");
  }

  function handleAdd() {
    if (!name.trim() || !addModelId) return;
    startTransition(async () => {
      const res = await createVariantAction({ modelId: addModelId, name });
      if (!res.ok) { toast.error(res.error ?? "Failed to add."); return; }
      toast.success(`"${name}" added.`);
      setName("");
      router.refresh();
    });
  }

  function handleUpdate(id: string, newName: string) {
    startTransition(async () => {
      const res = await updateVariantAction(id, newName);
      if (!res.ok) { toast.error(res.error ?? "Failed to update."); return; }
      toast.success(`Renamed to "${newName}".`);
      router.refresh();
    });
  }

  function handleDelete(id: string, label: string) {
    startTransition(async () => {
      const res = await deleteVariantAction(id);
      if (!res.ok) { toast.error(res.error ?? "Failed to delete."); return; }
      toast.success(`"${label}" removed.`);
      router.refresh();
    });
  }

  return (
    <Section
      addForm={
        <div className="flex flex-wrap gap-2">
          <Select value={addMakeName} onValueChange={handleMakeChange}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Select make" /></SelectTrigger>
            <SelectContent>{makes.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={addModelName} onValueChange={(v) => setAddModelName(v ?? "")} disabled={!addMakeName}>
            <SelectTrigger className="w-40"><SelectValue placeholder={addMakeName ? "Select model" : "Pick make first"} /></SelectTrigger>
            <SelectContent>{addModels.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g. ZXI+" className="w-36" disabled={!addModelName} />
          <Button onClick={handleAdd} disabled={pending || !name.trim() || !addModelId} size="sm">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add Variant
          </Button>
        </div>
      }
      filter={
        makes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Filter:</span>
            <Select value={filterMakeName} onValueChange={handleFilterMakeChange}>
              <SelectTrigger className="h-7 w-36 text-xs"><SelectValue placeholder="All makes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All makes</SelectItem>
                {makes.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterModelName} onValueChange={(v) => setFilterModelName(v ?? "")} disabled={!filterMakeName}>
              <SelectTrigger className="h-7 w-36 text-xs"><SelectValue placeholder="All models" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All models</SelectItem>
                {filterModels.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )
      }
      headers={["Variant Name", "Make", "Model"]}
    >
      {filteredVariants.length === 0 && <Empty text={filterModelName ? "No variants for this model yet." : "No variants yet. Add your first one above."} cols={3} />}
      {filteredVariants.map((v) => (
        <EditableRow key={v.id} label={v.name} badge={v.makeName} badge2={v.modelName} disabled={pending}
          onSave={(n) => handleUpdate(v.id, n)}
          onDelete={() => handleDelete(v.id, v.name)} />
      ))}
    </Section>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Section({ addForm, filter, headers, children }: {
  addForm: React.ReactNode;
  filter?: React.ReactNode;
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="space-y-3 border-b p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add new</p>
        {addForm}
      </div>
      {filter && <div className="border-b px-4 py-2">{filter}</div>}
      {/* Column headers */}
      <div className="grid border-b px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        style={{ gridTemplateColumns: `1fr repeat(${headers.length - 1}, auto) 5rem` }}>
        {headers.map((h) => <span key={h}>{h}</span>)}
        <span className="text-right">Actions</span>
      </div>
      <ul className="divide-y">{children}</ul>
    </div>
  );
}

function EditableRow({ label, badge, badge2, onSave, onDelete, disabled }: {
  label: string;
  badge: string;
  badge2?: string;
  onSave: (newName: string) => void;
  onDelete: () => void;
  disabled: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(label);

  function handleSave() {
    if (!value.trim() || value.trim() === label) { setEditing(false); setValue(label); return; }
    onSave(value.trim());
    setEditing(false);
  }

  function handleCancel() { setEditing(false); setValue(label); }

  const cols = badge2 ? 3 : 2;

  return (
    <li className="grid items-center gap-3 px-4 py-2.5"
      style={{ gridTemplateColumns: `1fr repeat(${cols - 1}, auto) 5rem` }}>
      {editing ? (
        <Input value={value} onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
          className="h-7 text-sm" autoFocus />
      ) : (
        <span className="truncate text-sm font-medium">{label}</span>
      )}
      <span className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground capitalize">{badge}</span>
      {badge2 && <span className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">{badge2}</span>}
      <div className="flex items-center justify-end gap-1">
        {editing ? (
          <>
            <button type="button" onClick={handleSave} disabled={disabled}
              className="rounded p-1 text-muted-foreground hover:bg-green-500/10 hover:text-green-500 disabled:opacity-40" aria-label="Save">
              <Check className="size-4" />
            </button>
            <button type="button" onClick={handleCancel}
              className="rounded p-1 text-muted-foreground hover:bg-accent" aria-label="Cancel">
              <X className="size-4" />
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setEditing(true)} disabled={disabled}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40" aria-label={`Edit ${label}`}>
              <Pencil className="size-4" />
            </button>
            <button type="button" onClick={onDelete} disabled={disabled}
              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40" aria-label={`Delete ${label}`}>
              <Trash2 className="size-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

function Empty({ text, cols }: { text: string; cols: number }) {
  return (
    <li className="px-4 py-6 text-center text-sm text-muted-foreground" style={{ gridColumn: `span ${cols + 1}` }}>
      {text}
    </li>
  );
}
