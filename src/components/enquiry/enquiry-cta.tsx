"use client";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import { ShortlistButton } from "@/components/shortlist-button";
import { formatPriceShort } from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { cn } from "@/lib/utils";
import { openEnquiry } from "./enquiry-modal";

export function EnquireButton({
  className,
  label = "Enquire Now",
  size = "lg",
}: {
  className?: string;
  label?: string;
  size?: "default" | "sm" | "lg";
}) {
  return (
    <Button
      type="button"
      size={size}
      onClick={openEnquiry}
      className={cn("bg-[#25D366] text-white hover:bg-[#25D366]/90", className)}
    >
      <WhatsAppIcon className="size-5" />
      {label}
    </Button>
  );
}

/** Fixed bottom action bar shown on mobile viewports only. */
export function StickyEnquireBar({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </p>
          <p className="text-lg font-bold leading-tight text-brand">
            {formatPriceShort(vehicle.price)}
          </p>
        </div>
        <ShortlistButton
          vehicleId={vehicle.id}
          variant="icon"
          className="border"
        />
        <EnquireButton className="flex-1" />
      </div>
    </div>
  );
}
