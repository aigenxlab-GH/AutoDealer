"use client";

import { useState, useTransition } from "react";
import { MapPin, ExternalLink, Save, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveShopSettingsAction } from "@/app/actions/admin";
import type { ShopSettings } from "@/lib/data/repository";

export function SettingsForm({ initial }: { initial: ShopSettings }) {
  const [mapsLink,  setMapsLink]  = useState(initial.mapsLink);
  const [mapsEmbed, setMapsEmbed] = useState(initial.mapsEmbed);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const res = await saveShopSettingsAction({ mapsLink, mapsEmbed });
      if (res.ok) {
        toast.success("Settings saved!");
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        toast.error(res.error ?? "Failed to save.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Google Maps Share Link */}
      <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-brand" />
          <h2 className="text-sm font-semibold">Shop Location</h2>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Google Maps Share Link
          </label>
          <Input
            value={mapsLink}
            onChange={(e) => setMapsLink(e.target.value)}
            placeholder="https://maps.app.goo.gl/xxxxx"
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Open Google Maps → search your shop → tap{" "}
            <span className="font-medium text-foreground">Share</span> → copy the link.
            This is used for the &ldquo;Get Directions&rdquo; button on the homepage.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Google Maps Embed URL <span className="text-muted-foreground/50">(optional — for the map preview)</span>
          </label>
          <Input
            value={mapsEmbed}
            onChange={(e) => setMapsEmbed(e.target.value)}
            placeholder="https://www.google.com/maps/embed?pb=..."
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Google Maps → Share →{" "}
            <span className="font-medium text-foreground">Embed a map</span> → copy only the{" "}
            <span className="font-mono font-medium text-foreground">src=&quot;...&quot;</span> URL from the iframe code.
          </p>
        </div>

        {/* Live map preview */}
        {mapsEmbed && (
          <div className="overflow-hidden rounded-lg border">
            <iframe
              src={mapsEmbed}
              width="100%"
              height="260"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Shop location preview"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <Button onClick={handleSave} disabled={pending} size="sm">
            {pending
              ? <><Loader2 className="size-4 animate-spin" /> Saving…</>
              : saved
              ? <><CheckCircle2 className="size-4" /> Saved!</>
              : <><Save className="size-4" /> Save Settings</>}
          </Button>
          {mapsLink && (
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-3.5" /> Preview on Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
