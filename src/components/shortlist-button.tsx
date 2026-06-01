"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useShortlist } from "@/lib/use-shortlist";
import { cn } from "@/lib/utils";

interface ShortlistButtonProps {
  vehicleId: string;
  /** "icon" = floating heart on cards/gallery. "full" = labelled button. */
  variant?: "icon" | "full";
  className?: string;
}

export function ShortlistButton({
  vehicleId,
  variant = "icon",
  className,
}: ShortlistButtonProps) {
  const { has, toggle, ready } = useShortlist();
  const active = ready && has(vehicleId);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(vehicleId);
    toast.success(active ? "Removed from shortlist" : "Added to shortlist");
  };

  if (variant === "full") {
    return (
      <Button
        type="button"
        variant={active ? "default" : "outline"}
        onClick={onClick}
        className={className}
        aria-pressed={active}
      >
        <Heart className={cn("size-4", active && "fill-current")} />
        {active ? "Shortlisted" : "Shortlist"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? "Remove from shortlist" : "Add to shortlist"}
      aria-pressed={active}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background",
        className,
      )}
    >
      <Heart
        className={cn("size-[18px]", active && "fill-red-500 text-red-500")}
      />
    </button>
  );
}
