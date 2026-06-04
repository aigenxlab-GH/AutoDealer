"use client";

import { useState, useTransition } from "react";
import { MapPin, ExternalLink, Save, Loader2, CheckCircle2, Phone, Clock, Building2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveShopSettingsAction } from "@/app/actions/admin";
import type { ShopSettings } from "@/lib/data/repository";

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Card({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-brand" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function SettingsForm({ initial }: { initial: ShopSettings }) {
  const [form, setForm] = useState<ShopSettings>(initial);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function set(key: keyof ShopSettings, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      const res = await saveShopSettingsAction(form);
      if (res.ok) {
        toast.success("Settings saved!");
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        toast.error(res.error ?? "Failed to save.");
      }
    });
  }

  const phones = [
    { key: "phone1" as const, label: "Phone 1 (Primary)" },
    { key: "phone2" as const, label: "Phone 2" },
    { key: "phone3" as const, label: "Phone 3" },
    { key: "phone4" as const, label: "Phone 4" },
  ];

  return (
    <div className="space-y-5">

      {/* ── WhatsApp ── */}
      <Card icon={MessageCircle} title="WhatsApp Number">
        <FieldGroup label="WhatsApp Number"
          hint="Enter country code + number without + or spaces. e.g. 919920042608 for +91 99200 42608">
          <Input
            value={form.whatsappNumber}
            onChange={(e) => set("whatsappNumber", e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="919920042608"
            className="font-mono"
            maxLength={15}
            type="tel"
          />
          {form.whatsappNumber && (
            <a
              href={`https://wa.me/${form.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
            >
              <MessageCircle className="size-3" /> Test this number on WhatsApp
            </a>
          )}
        </FieldGroup>
      </Card>

      {/* ── Address ── */}
      <Card icon={Building2} title="Shop Address">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Address Line" hint="Street / area / landmark">
            <Input value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)}
              placeholder="e.g. Near Bus Stand, Main Road" />
          </FieldGroup>
          <FieldGroup label="City">
            <Input value={form.city} onChange={(e) => set("city", e.target.value)}
              placeholder="e.g. Janjgir-Champa" />
          </FieldGroup>
          <FieldGroup label="State">
            <Input value={form.state} onChange={(e) => set("state", e.target.value)}
              placeholder="e.g. Chhattisgarh" />
          </FieldGroup>
          <FieldGroup label="Pincode">
            <Input value={form.pincode} onChange={(e) => set("pincode", e.target.value)}
              placeholder="e.g. 495668" maxLength={6} />
          </FieldGroup>
        </div>
        <FieldGroup label="Open Hours" hint="Shown on the homepage location section">
          <Input value={form.openHours} onChange={(e) => set("openHours", e.target.value)}
            placeholder="e.g. Mon – Sat, 9:30 AM – 8:00 PM" />
        </FieldGroup>
      </Card>

      {/* ── Phone Numbers ── */}
      <Card icon={Phone} title="Phone Numbers">
        <div className="grid gap-4 sm:grid-cols-2">
          {phones.map(({ key, label }) => (
            <FieldGroup key={key} label={label}>
              <Input value={form[key]} onChange={(e) => set(key, e.target.value)}
                placeholder="+91 98765 43210" type="tel" />
            </FieldGroup>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          All filled numbers appear on the homepage. Leave blank to hide.
        </p>
      </Card>

      {/* ── Google Maps ── */}
      <Card icon={MapPin} title="Google Maps">
        <FieldGroup label="Share Link"
          hint='Open Google Maps → search your shop → Share → copy the link. Used for the "Get Directions" button.'>
          <Input value={form.mapsLink} onChange={(e) => set("mapsLink", e.target.value)}
            placeholder="https://maps.app.goo.gl/xxxxx" className="font-mono text-xs" />
        </FieldGroup>

        <FieldGroup label='Embed URL (for map preview on homepage)'>
          <Input value={form.mapsEmbed} onChange={(e) => set("mapsEmbed", e.target.value)}
            placeholder="https://www.google.com/maps/embed?pb=..." className="font-mono text-xs" />
          {form.mapsEmbed && !form.mapsEmbed.includes("google.com/maps/embed") && (
            <p className="mt-1 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-600">
              ⚠️ This doesn&apos;t look like a valid embed URL. It must start with{" "}
              <span className="font-mono">https://www.google.com/maps/embed</span>.
              <br />
              <strong>How to get it:</strong> Google Maps → Share → &ldquo;Embed a map&rdquo; tab → copy the URL inside{" "}
              <span className="font-mono">src=&quot;...&quot;</span> from the iframe code shown.
            </p>
          )}
          {form.mapsEmbed && form.mapsEmbed.includes("google.com/maps/embed") && (
            <p className="mt-1 text-xs text-emerald-600">✓ Valid embed URL</p>
          )}
          {!form.mapsEmbed && (
            <p className="mt-1 text-xs text-muted-foreground">
              Google Maps → Share → &ldquo;Embed a map&rdquo; tab → copy only the URL inside{" "}
              <span className="font-mono">src=&quot;...&quot;</span>
            </p>
          )}
        </FieldGroup>

        {form.mapsEmbed && (
          <div className="overflow-hidden rounded-lg border">
            <iframe src={form.mapsEmbed} width="100%" height="240" style={{ border: 0 }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="Shop location preview" />
          </div>
        )}
      </Card>

      {/* ── Save ── */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={pending}>
          {pending
            ? <><Loader2 className="size-4 animate-spin" /> Saving…</>
            : saved
            ? <><CheckCircle2 className="size-4" /> Saved!</>
            : <><Save className="size-4" /> Save All Settings</>}
        </Button>
        {form.mapsLink && (
          <a href={form.mapsLink} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ExternalLink className="size-3.5" /> Preview on Maps
          </a>
        )}
      </div>
    </div>
  );
}
