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
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              "rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t}
            <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-[10px] font-semibold">
              {t === "makes" ? makes.length : t === "models" ? models.length : variants.length}
            </span>
          </button>
        ))}
      </div>

      {tab === "makes" && <MakesTab makes={makes} />}
      {tab === "models" && <ModelsTab makes={makes} models={models} />}
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

  function handleUpdate(id: string, newName: string, oldName: string) {
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
          <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="e.g. Maruti Suzuki" className="w-52" />
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
    >
      {makes.length === 0 && <Empty text="No makes yet. Add your first one above." />}
      {makes.map((m) => (
        <EditableRow key={m.id} label={m.name} badge={m.type} disabled={pending}
          onSave={(newName) => handleUpdate(m.id, newName, m.name)}
          onDelete={() => handleDelete(m.id, m.name)} />
      ))}
    </Section>
  );
}

// ── Models ────────────────────────────────────────────────────────────────────

function ModelsTab({ makes, models }: { makes: VehicleMake[]; models: VehicleModel[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [makeId, setMakeId] = useState("");
  const [name, setName] = useState("");

  const filtered = makeId ? models.filter((m) => m.makeId === makeId) : models;

  function handleAdd() {
    if (!name.trim() || !makeId) return;
    startTransition(async () => {
      const res = await createModelAction({ makeId, name });
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
          <Select value={makeId} onValueChange={(v) => setMakeId(v ?? "")}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Select make" /></SelectTrigger>
            <SelectContent>{makes.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="e.g. Swift" className="w-44" disabled={!makeId} />
          <Button onClick={handleAdd} disabled={pending || !name.trim() || !makeId} size="sm">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add Model
          </Button>
        </div>
      }
      filter={
        makes.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Filter:</span>
            <Select value={makeId} onValueChange={(v) => setMakeId(v ?? "")}>
              <SelectTrigger className="h-7 w-40 text-xs"><SelectValue placeholder="All makes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All makes</SelectItem>
                {makes.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )
      }
    >
      {filtered.length === 0 && <Empty text={makeId ? "No models for this make yet." : "No models yet. Add your first one above."} />}
      {filtered.map((m) => (
        <EditableRow key={m.id} label={m.name} badge={m.makeName} disabled={pending}
          onSave={(newName) => handleUpdate(m.id, newName)}
          onDelete={() => handleDelete(m.id, m.name)} />
      ))}
    </Section>
  );
}

// ── Variants ──────────────────────────────────────────────────────────────────

function VariantsTab({ makes, models, variants }: { makes: VehicleMake[]; models: VehicleModel[]; variants: VehicleVariant[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [makeId, setMakeId] = useState("");
  const [modelId, setModelId] = useState("");
  const [name, setName] = useState("");

  const filteredModels = makeId ? models.filter((m) => m.makeId === makeId) : models;
  const filteredVariants = modelId
    ? variants.filter((v) => v.modelId === modelId)
    : makeId ? variants.filter((v) => filteredModels.some((m) => m.id === v.modelId))
    : variants;

  function handleMakeChange(id: string | null) { setMakeId(id ?? ""); setModelId(""); }

  function handleAdd() {
    if (!name.trim() || !modelId) return;
    startTransition(async () => {
      const res = await createVariantAction({ modelId, name });
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
          <Select value={makeId} onValueChange={handleMakeChange}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Select make" /></SelectTrigger>
            <SelectContent>{makes.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={modelId} onValueChange={(v) => setModelId(v ?? "")} disabled={!makeId}>
            <SelectTrigger className="w-40"><SelectValue placeholder={makeId ? "Select model" : "Pick make first"} /></SelectTrigger>
            <SelectContent>{filteredModels.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="e.g. ZXI+" className="w-36" disabled={!modelId} />
          <Button onClick={handleAdd} disabled={pending || !name.trim() || !modelId} size="sm">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add Variant
          </Button>
        </div>
      }
      filter={
        (makes.length > 0 || models.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Filter:</span>
            <Select value={makeId} onValueChange={handleMakeChange}>
              <SelectTrigger className="h-7 w-36 text-xs"><SelectValue placeholder="All makes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All makes</SelectItem>
                {makes.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={modelId} onValueChange={(v) => setModelId(v ?? "")} disabled={!makeId}>
              <SelectTrigger className="h-7 w-36 text-xs"><SelectValue placeholder="All models" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All models</SelectItem>
                {filteredModels.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )
      }
    >
      {filteredVariants.length === 0 && <Empty text={modelId ? "No variants for this model yet." : "No variants yet. Add your first one above."} />}
      {filteredVariants.map((v) => (
        <EditableRow key={v.id} label={v.name} badge={`${v.makeName} › ${v.modelName}`} disabled={pending}
          onSave={(newName) => handleUpdate(v.id, newName)}
          onDelete={() => handleDelete(v.id, v.name)} />
      ))}
    </Section>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Section({ addForm, filter, children }: { addForm: React.ReactNode; filter?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="space-y-3 border-b p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add new</p>
        {addForm}
      </div>
      {filter && <div className="border-b px-4 py-2">{filter}</div>}
      <ul className="divide-y">{children}</ul>
    </div>
  );
}

function EditableRow({ label, badge, onSave, onDelete, disabled }: {
  label: string;
  badge: string;
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

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {editing ? (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
            className="h-7 text-sm"
            autoFocus
          />
        ) : (
          <>
            <span className="truncate text-sm font-medium">{label}</span>
            <span className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground capitalize">{badge}</span>
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {editing ? (
          <>
            <button type="button" onClick={handleSave} disabled={disabled} className="rounded p-1 text-muted-foreground transition-colors hover:bg-green-500/10 hover:text-green-500 disabled:opacity-40" aria-label="Save">
              <Check className="size-4" />
            </button>
            <button type="button" onClick={handleCancel} className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent" aria-label="Cancel">
              <X className="size-4" />
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setEditing(true)} disabled={disabled} className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40" aria-label={`Edit ${label}`}>
              <Pencil className="size-4" />
            </button>
            <button type="button" onClick={onDelete} disabled={disabled} className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40" aria-label={`Delete ${label}`}>
              <Trash2 className="size-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

function Empty({ text }: { text: string }) {
  return <li className="px-4 py-6 text-center text-sm text-muted-foreground">{text}</li>;
}
