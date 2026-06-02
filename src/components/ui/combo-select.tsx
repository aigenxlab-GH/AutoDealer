"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  allLabel?: string;
  otherLabel?: string;   // if set, shows "Other — enter manually" at bottom
  showAll?: boolean;     // whether to show the "All" option (default false)
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

export function ComboSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  allLabel = "All",
  otherLabel,
  showAll = true,
  disabled = false,
  triggerClassName,
}: ComboSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  const selected = options.find((o) => o.value === value);
  const displayLabel = value === "" ? allLabel : (selected?.label ?? placeholder);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  function select(val: string) {
    onChange(val);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 text-xs transition-colors",
          "hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-ring ring-1 ring-ring/30",
          triggerClassName,
        )}
      >
        <span className={cn("flex-1 truncate text-left", !value && "text-muted-foreground")}>
          {displayLabel}
        </span>
        <ChevronDown className={cn("size-3 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-lg border bg-popover shadow-lg ring-1 ring-foreground/10">
          {/* Search input */}
          <div className="flex items-center gap-1.5 border-b px-2 py-1.5">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Escape") { setOpen(false); setSearch(""); }
                if (e.key === "Enter" && filtered.length === 1) select(filtered[0].value);
              }}
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {/* All option */}
            {showAll && (
              <li>
                <button type="button" onClick={() => select("")}
                  className={cn("flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent",
                    value === "" && "font-medium text-foreground")}>
                  <Check className={cn("size-3 shrink-0", value === "" ? "opacity-100" : "opacity-0")} />
                  {allLabel}
                </button>
              </li>
            )}

            {filtered.length === 0 && (
              <li className="px-2.5 py-3 text-center text-xs text-muted-foreground">No results</li>
            )}

            {filtered.map((o) => (
              <li key={o.value}>
                <button type="button" onClick={() => select(o.value)}
                  className={cn("flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent",
                    value === o.value && "font-medium text-foreground")}>
                  <Check className={cn("size-3 shrink-0", value === o.value ? "opacity-100" : "opacity-0")} />
                  {o.label}
                </button>
              </li>
            ))}

            {/* Other option — always visible, not filtered */}
            {otherLabel && (
              <>
                <li className="mx-2 my-1 border-t" />
                <li>
                  <button type="button" onClick={() => select("__other__")}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs italic text-muted-foreground transition-colors hover:bg-accent">
                    <Check className="size-3 shrink-0 opacity-0" />
                    {otherLabel}
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
