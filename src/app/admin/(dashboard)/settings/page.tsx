import type { Metadata } from "next";
import { settingsRepository } from "@/lib/data";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
};

export default async function AdminSettingsPage() {
  const shopSettings = await settingsRepository.getShopSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your shop details shown on the public website.
        </p>
      </div>

      <SettingsForm initial={shopSettings} />
    </div>
  );
}
