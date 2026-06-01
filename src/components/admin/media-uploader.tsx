"use client";

import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/upload";

interface MediaUploaderProps {
  images: string[];
  primary: string;
  max: number;
  onChange: (images: string[], primary: string) => void;
}

export function MediaUploader({
  images,
  primary,
  max,
  onChange,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);

  function commit(next: string[], nextPrimary?: string) {
    const primaryUrl =
      nextPrimary && next.includes(nextPrimary)
        ? nextPrimary
        : next.includes(primary)
          ? primary
          : (next[0] ?? "");
    onChange(next, primaryUrl);
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const room = max - images.length;
    if (room <= 0) {
      toast.error(`You can add up to ${max} images.`);
      return;
    }
    const picked = Array.from(files).slice(0, room);
    setUploading(true);
    try {
      const urls = await Promise.all(picked.map(uploadImage));
      commit([...images, ...urls]);
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
    if (files.length > room) toast.error(`Only ${max} images allowed.`);
  }

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    if (images.length >= max) {
      toast.error(`You can add up to ${max} images.`);
      return;
    }
    commit([...images, url]);
    setUrlInput("");
  }

  function removeAt(index: number) {
    const next = images.filter((_, i) => i !== index);
    commit(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Photos{" "}
          <span className="font-normal text-muted-foreground">
            ({images.length}/{max})
          </span>
        </span>
      </div>

      {/* Dropzone */}
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 px-4 py-8 text-center transition-colors hover:bg-muted/50",
          images.length >= max && "pointer-events-none opacity-50",
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
      >
        {uploading ? (
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        ) : (
          <ImagePlus className="size-7 text-muted-foreground" />
        )}
        <p className="mt-2 text-sm font-medium">
          {uploading ? "Uploading…" : "Click to upload or drag & drop"}
        </p>
        <p className="text-xs text-muted-foreground">
          JPG/PNG · up to {max} images
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {/* URL fallback */}
      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="…or paste an image URL"
          className="h-9"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addUrl} className="h-9">
          Add
        </Button>
      </div>

      {/* Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((src, i) => {
            const isPrimary = src === primary;
            return (
              <div
                key={`${src.slice(0, 24)}-${i}`}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg border-2",
                  isPrimary ? "border-brand" : "border-transparent",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Upload ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="Remove image"
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => commit(images, src)}
                  className={cn(
                    "absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 py-1 text-[11px] font-medium",
                    isPrimary
                      ? "bg-brand text-brand-foreground"
                      : "bg-black/50 text-white opacity-0 group-hover:opacity-100",
                  )}
                >
                  <Star className={cn("size-3", isPrimary && "fill-current")} />
                  {isPrimary ? "Primary" : "Set primary"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
