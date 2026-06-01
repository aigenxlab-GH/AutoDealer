"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminNav } from "./admin-nav";
import { siteConfig } from "@/config/site";

export function AdminMobileBar({ email }: { email?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-14 items-center gap-3 border-b bg-card px-4 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <div onClick={() => setOpen(false)} className="h-full">
            <AdminNav email={email} />
          </div>
        </SheetContent>
      </Sheet>
      <span className="text-sm font-semibold">{siteConfig.shortName} Admin</span>
    </div>
  );
}
