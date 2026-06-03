"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bike, Car, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaUploader } from "./media-uploader";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type {
  FuelType,
  Transmission,
  Vehicle,
  VehicleInput,
  VehicleMake,
  VehicleModel,
  VehicleType,
  VehicleVariant,
} from "@/lib/types";
import { saveVehicleAction } from "@/app/actions/admin";
import { ComboSelect } from "@/components/ui/combo-select";

const FUELS: { value: FuelType; label: string }[] = [
  { value: "petrol",     label: "Petrol" },
  { value: "diesel",     label: "Diesel" },
  { value: "petrol-cng", label: "Petrol & CNG" },
  { value: "electric",   label: "Electric" },
  { value: "hybrid",     label: "Hybrid" },
];
const TRANSMISSIONS: Transmission[] = ["manual", "automatic"];
const CAR_BODY = ["Hatchback", "Sedan", "SUV", "MUV", "Coupe", "Convertible"];
const BIKE_BODY = ["Commuter", "Sport", "Cruiser", "Scooter", "Adventure", "Cafe Racer"];

interface VehicleFormProps {
  vehicle?: Vehicle;
  makes: VehicleMake[];
  models: VehicleModel[];
  variants: VehicleVariant[];
}

function defaults(): VehicleInput {
  return {
    type: "car",
    make: "",
    model: "",
    variant: "",
    year: new Date().getFullYear(),
    price: 0,
    kmsDriven: 0,
    owners: 1,
    fuelType: "petrol",
    transmission: "manual",
    engineCc: undefined,
    mileage: undefined,
    color: "",
    bodyType: "",
    registrationNumber: "",
    registrationCity: siteConfig.dealer.city,
    insuranceValidTill: "",
    description: "",
    ncapRating: undefined,
    images: [],
    primaryImageUrl: "",
    isSold: false,
    isFeatured: false,
  };
}

function fromVehicle(v: Vehicle): VehicleInput {
  const { id: _id, createdAt: _c, views: _v, ...rest } = v;
  return { ...rest, variant: v.variant ?? "" };
}

export function VehicleForm({ vehicle, makes, models, variants }: VehicleFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<VehicleInput>(
    vehicle ? fromVehicle(vehicle) : defaults(),
  );
  const [submitting, setSubmitting] = useState(false);

  // Catalog options scoped to selected vehicle type
  const makeOptions = makes.filter((m) => m.type === form.type);

  // Find the currently-selected make object (match by name + type)
  const selectedMakeObj = makeOptions.find((m) => m.name === form.make);
  const modelOptions = selectedMakeObj
    ? models.filter((m) => m.makeId === selectedMakeObj.id)
    : [];

  // Find the currently-selected model object
  const selectedModelObj = modelOptions.find((m) => m.name === form.model);
  const variantOptions = selectedModelObj
    ? variants.filter((v) => v.modelId === selectedModelObj.id)
    : [];

  // Custom (manual) entry flags — true when value is outside the catalog list
  const [customMake, setCustomMake] = useState<boolean>(() => {
    if (!vehicle?.make) return false;
    return !makes.some((m) => m.name === vehicle.make && m.type === vehicle.type);
  });
  const [customModel, setCustomModel] = useState<boolean>(() => {
    if (!vehicle?.model || customMake) return false;
    const mObj = makes.find((m) => m.name === vehicle.make && m.type === vehicle.type);
    if (!mObj) return false;
    return !models.some((m) => m.makeId === mObj.id && m.name === vehicle.model);
  });
  const [customVariant, setCustomVariant] = useState<boolean>(() => {
    if (!vehicle?.variant || customModel) return false;
    const mObj = makes.find((m) => m.name === vehicle.make && m.type === vehicle.type);
    const mdObj = mObj ? models.find((m) => m.makeId === mObj.id && m.name === vehicle.model) : undefined;
    if (!mdObj) return false;
    return !variants.some((v) => v.modelId === mdObj.id && v.name === vehicle.variant);
  });

  const hasMakes = makeOptions.length > 0;

  const maxImages =
    form.type === "car" ? siteConfig.limits.carImages : siteConfig.limits.bikeImages;

  function set<K extends keyof VehicleInput>(key: K, value: VehicleInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function switchType(type: VehicleType) {
    setCustomMake(false);
    setCustomModel(false);
    setCustomVariant(false);
    setForm((f) => {
      const max = type === "car" ? siteConfig.limits.carImages : siteConfig.limits.bikeImages;
      const images = f.images.slice(0, max);
      return {
        ...f,
        type,
        make: "",
        model: "",
        variant: "",
        images,
        primaryImageUrl: images.includes(f.primaryImageUrl) ? f.primaryImageUrl : (images[0] ?? ""),
        fuelType: type === "car" ? (f.fuelType ?? "petrol") : undefined,
        transmission: type === "car" ? (f.transmission ?? "manual") : undefined,
        engineCc: type === "bike" ? (f.engineCc ?? 0) : undefined,
        bodyType: "",
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await saveVehicleAction(form, vehicle?.id);
    if (!res.ok) {
      setSubmitting(false);
      toast.error(res.error ?? "Could not save vehicle.");
      return;
    }
    toast.success(vehicle ? "Vehicle updated" : "Vehicle added");
    router.push("/admin/dashboard");
    router.refresh();
  }

  const bodyOptions = form.type === "car" ? CAR_BODY : BIKE_BODY;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type toggle */}
      <Card title="Vehicle Type">
        <div className="inline-flex rounded-lg border bg-muted p-1">
          {(["car", "bike"] as VehicleType[]).map((t) => {
            const Icon = t === "car" ? Car : Bike;
            return (
              <button
                key={t}
                type="button"
                onClick={() => switchType(t)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                  form.type === t
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" /> {t}
              </button>
            );
          })}
        </div>
        {!hasMakes && (
          <p className="mt-2 text-xs text-amber-500">
            No {form.type} makes in catalog yet —{" "}
            <a href="/admin/catalog" className="underline">add them in Catalog</a>{" "}
            or enter manually below.
          </p>
        )}
      </Card>

      {/* Core details */}
      <Card title="Details">
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Make */}
          <Field label="Make" required>
            {customMake || !hasMakes ? (
              <div className="flex gap-2">
                <Input
                  value={form.make}
                  onChange={(e) => { set("make", e.target.value); set("model", ""); set("variant", ""); }}
                  placeholder="e.g. Maruti Suzuki"
                  required
                  autoFocus={customMake}
                />
                {customMake && hasMakes && (
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 text-xs"
                    onClick={() => {
                      setCustomMake(false);
                      setCustomModel(false);
                      setCustomVariant(false);
                      set("make", "");
                      set("model", "");
                      set("variant", "");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ) : (
              <ComboSelect
                value={makeOptions.some((m) => m.name === form.make) ? form.make : ""}
                onChange={(val) => {
                  if (val === "__other__") {
                    setCustomMake(true); setCustomModel(true); setCustomVariant(true);
                    set("make", ""); set("model", ""); set("variant", "");
                  } else {
                    set("make", val); set("model", ""); set("variant", "");
                    setCustomModel(false); setCustomVariant(false);
                  }
                }}
                options={makeOptions.map((m) => ({ value: m.name, label: m.name }))}
                placeholder="Select make"
                showAll={false}
                otherLabel="Other — enter manually"
                triggerClassName="w-full"
              />
            )}
          </Field>

          {/* Model */}
          <Field label="Model" required>
            {customMake || customModel || (!hasMakes) ? (
              <div className="flex gap-2">
                <Input
                  value={form.model}
                  onChange={(e) => { set("model", e.target.value); set("variant", ""); }}
                  placeholder="e.g. Swift"
                  required
                />
                {customModel && !customMake && hasMakes && (
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 text-xs"
                    onClick={() => {
                      setCustomModel(false);
                      setCustomVariant(false);
                      set("model", "");
                      set("variant", "");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ) : (
              <ComboSelect
                value={modelOptions.some((m) => m.name === form.model) ? form.model : ""}
                onChange={(val) => {
                  if (val === "__other__") {
                    setCustomModel(true); setCustomVariant(true);
                    set("model", ""); set("variant", "");
                  } else {
                    set("model", val); set("variant", "");
                    setCustomVariant(false);
                  }
                }}
                options={modelOptions.map((m) => ({ value: m.name, label: m.name }))}
                placeholder={form.make ? (modelOptions.length ? "Select model" : "No models yet") : "Select make first"}
                showAll={false}
                otherLabel="Other — enter manually"
                disabled={!form.make}
                triggerClassName="w-full"
              />
            )}
          </Field>

          {/* Variant */}
          <Field label="Variant">
            {customMake || customModel || customVariant || (!hasMakes) ? (
              <div className="flex gap-2">
                <Input
                  value={form.variant ?? ""}
                  onChange={(e) => set("variant", e.target.value)}
                  placeholder="e.g. ZXI+"
                />
                {customVariant && !customMake && !customModel && hasMakes && (
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 text-xs"
                    onClick={() => {
                      setCustomVariant(false);
                      set("variant", "");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ) : (
              <Select
                value={variantOptions.some((v) => v.name === form.variant) ? (form.variant ?? "") : ""}
                onValueChange={(v) => {
                  const val = v ?? "";
                  if (val === "__other__") {
                    setCustomVariant(true);
                    set("variant", "");
                  } else {
                    set("variant", val);
                  }
                }}
                disabled={!form.model}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={form.model ? (variantOptions.length ? "Select variant" : "No variants — enter manually") : "Select model first"} />
                </SelectTrigger>
                <SelectContent>
                  {variantOptions.map((v) => (
                    <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                  ))}
                  <SelectItem value="__other__" className="text-muted-foreground italic">
                    Other — enter manually
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </Field>

          <Field label="Production Year" required>
            <Input
              type="number"
              value={form.year || ""}
              onChange={(e) => set("year", Number(e.target.value))}
              min={1980}
              max={new Date().getFullYear() + 1}
              required
            />
          </Field>
          <Field label="Price (₹)" required>
            <Input
              type="number"
              value={form.price || ""}
              onChange={(e) => set("price", Number(e.target.value))}
              placeholder="e.g. 685000"
              min={0}
              required
            />
          </Field>
          <Field label="Kilometres Driven" required>
            <Input
              type="number"
              value={form.kmsDriven || ""}
              onChange={(e) => set("kmsDriven", Number(e.target.value))}
              placeholder="e.g. 28400"
              min={0}
              required
            />
          </Field>
          <Field label="Owners">
            <Select
              value={String(form.owners)}
              onValueChange={(v) => set("owners", Number(v ?? "1"))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}{n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} Owner
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={form.type === "car" ? "Mileage (km/l)" : "Mileage (kmpl)"}>
            <Input
              type="number"
              value={form.mileage ?? ""}
              onChange={(e) =>
                set("mileage", e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="e.g. 22"
              min={0}
            />
          </Field>
        </div>
      </Card>

      {/* Type-specific */}
      <Card title={form.type === "car" ? "Car Specifications" : "Bike Specifications"}>
        <div className="grid gap-4 sm:grid-cols-2">
          {form.type === "car" ? (
            <>
              <Field label="Fuel Type">
                <Select
                  value={form.fuelType ?? "petrol"}
                  onValueChange={(v) => set("fuelType", (v ?? "petrol") as FuelType)}
                >
                  <SelectTrigger className="w-full capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUELS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Transmission">
                <Select
                  value={form.transmission ?? "manual"}
                  onValueChange={(v) => set("transmission", (v ?? "manual") as Transmission)}
                >
                  <SelectTrigger className="w-full capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSIONS.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </>
          ) : (
            <Field label="Engine (CC)" required>
              <Input
                type="number"
                value={form.engineCc ?? ""}
                onChange={(e) =>
                  set("engineCc", e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="e.g. 349"
                min={0}
                required
              />
            </Field>
          )}
          <Field label="Body Type">
            <Select
              value={form.bodyType || ""}
              onValueChange={(v) => set("bodyType", v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select body type" />
              </SelectTrigger>
              <SelectContent>
                {bodyOptions.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Colour">
            <Input
              value={form.color ?? ""}
              onChange={(e) => set("color", e.target.value)}
              placeholder="e.g. Pearl White"
            />
          </Field>
        </div>
      </Card>

      {/* Registration */}
      <Card title="Registration & Insurance">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Registration Number">
            <Input
              value={form.registrationNumber ?? ""}
              onChange={(e) => set("registrationNumber", e.target.value)}
              placeholder="e.g. CG-07-MJ-4521"
            />
          </Field>
          <Field label="Registration City">
            <Input
              value={form.registrationCity ?? ""}
              onChange={(e) => set("registrationCity", e.target.value)}
            />
          </Field>
          <Field label="Insurance Valid Till">
            <Input
              type="date"
              value={form.insuranceValidTill?.slice(0, 10) ?? ""}
              onChange={(e) => set("insuranceValidTill", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {/* Description */}
      <Card title="Description">
        <Textarea
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Highlight condition, service history, features…"
          rows={4}
        />
      </Card>

      {/* NCAP Safety Rating */}
      <Card title="Safety">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Global NCAP Safety Rating
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => set("ncapRating", form.ncapRating === star ? undefined : star)}
                className="p-0.5 transition-transform hover:scale-110"
                title={`${star} star${star > 1 ? "s" : ""}`}
              >
                <svg
                  className="size-7"
                  viewBox="0 0 24 24"
                  fill={(form.ncapRating ?? 0) >= star ? "#f59e0b" : "none"}
                  stroke={(form.ncapRating ?? 0) >= star ? "#f59e0b" : "currentColor"}
                  strokeWidth="1.5"
                >
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </button>
            ))}
            {form.ncapRating && (
              <span className="ml-2 text-sm font-medium text-amber-500">
                {form.ncapRating} / 5 stars
              </span>
            )}
            {form.ncapRating && (
              <button
                type="button"
                onClick={() => set("ncapRating", undefined)}
                className="ml-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Click a star to set the rating. Click the same star again or Clear to remove.
          </p>
        </div>
      </Card>

      {/* Media */}
      <Card title="Photos">
        <MediaUploader
          images={form.images}
          primary={form.primaryImageUrl}
          max={maxImages}
          onChange={(images, primary) =>
            setForm((f) => ({ ...f, images, primaryImageUrl: primary }))
          }
        />
      </Card>

      {/* Flags */}
      <Card title="Visibility">
        <div className="space-y-4">
          <ToggleRow
            label="Featured"
            hint="Show on the homepage and highlight in listings."
            checked={form.isFeatured}
            onChange={(v) => set("isFeatured", v)}
          />
          <ToggleRow
            label="Mark as Sold"
            hint="Sold vehicles stay visible but can't be enquired."
            checked={form.isSold}
            onChange={(v) => set("isSold", v)}
          />
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/dashboard")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {vehicle ? "Save Changes" : "Add Vehicle"}
        </Button>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
