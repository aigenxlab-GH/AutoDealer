"use client";

import Image, { type ImageProps } from "next/image";
import { Car, Bike } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { VehicleType } from "@/lib/types";

type VehicleImageProps = Omit<ImageProps, "onError"> & {
  vehicleType?: VehicleType;
};

function isRawSrc(src: ImageProps["src"]): src is string {
  return (
    typeof src === "string" &&
    (src.startsWith("data:") || src.startsWith("blob:"))
  );
}

/**
 * next/image wrapper that:
 *  - degrades to a clean branded placeholder if the photo fails to load, and
 *  - falls back to a plain <img> for data:/blob: sources (admin uploads in mock
 *    mode) which the Next image optimizer can't process.
 */
export function VehicleImage({
  vehicleType = "car",
  className,
  alt,
  src,
  fill,
  ...props
}: VehicleImageProps) {
  const [failed, setFailed] = useState(false);
  const Icon = vehicleType === "bike" ? Bike : Car;

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-muted to-secondary text-muted-foreground",
          fill ? "absolute inset-0 h-full w-full" : "h-full w-full",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <Icon className="size-10 opacity-40" />
      </div>
    );
  }

  if (isRawSrc(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className={cn(fill && "absolute inset-0 h-full w-full", className)}
      />
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
