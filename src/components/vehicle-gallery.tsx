"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { VehicleImage } from "@/components/vehicle-image";
import { ShortlistButton } from "@/components/shortlist-button";
import { Badge } from "@/components/ui/badge";
import type { VehicleType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VehicleGalleryProps {
  images: string[];
  alt: string;
  vehicleType: VehicleType;
  vehicleId: string;
  isSold?: boolean;
}

export function VehicleGallery({
  images,
  alt,
  vehicleType,
  vehicleId,
  isSold,
}: VehicleGalleryProps) {
  const [mainRef, mainApi] = useEmblaCarousel({ loop: images.length > 1 });
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!mainApi) return;
    const index = mainApi.selectedScrollSnap();
    setSelected(index);
    thumbApi?.scrollTo(index);
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
    return () => {
      mainApi.off("select", onSelect);
      mainApi.off("reInit", onSelect);
    };
  }, [mainApi, onSelect]);

  return (
    <div className="space-y-3">
      {/* Main viewport */}
      <div className="relative overflow-hidden rounded-xl border bg-muted">
        <div ref={mainRef} className="overflow-hidden">
          <div className="flex">
            {images.map((src, i) => (
              <div key={i} className="relative aspect-[4/3] min-w-0 flex-[0_0_100%]">
                <VehicleImage
                  src={src}
                  alt={`${alt} — photo ${i + 1}`}
                  fill
                  vehicleType={vehicleType}
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Overlays */}
        <div className="absolute left-3 top-3 flex gap-2">
          {isSold && <Badge variant="destructive">Sold</Badge>}
        </div>
        <ShortlistButton
          vehicleId={vehicleId}
          className="absolute right-3 top-3 size-10"
        />
        <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          {selected + 1} / {images.length}
        </div>

        {images.length > 1 && (
          <>
            <GalleryArrow
              side="left"
              onClick={() => mainApi?.scrollPrev()}
              label="Previous photo"
            />
            <GalleryArrow
              side="right"
              onClick={() => mainApi?.scrollNext()}
              label="Next photo"
            />
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div ref={thumbRef} className="overflow-hidden">
          <div className="flex gap-2">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => mainApi?.scrollTo(i)}
                aria-label={`View photo ${i + 1}`}
                className={cn(
                  "relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity",
                  selected === i
                    ? "border-brand"
                    : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <VehicleImage
                  src={src}
                  alt={`${alt} thumbnail ${i + 1}`}
                  fill
                  vehicleType={vehicleType}
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryArrow({
  side,
  onClick,
  label,
}: {
  side: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
