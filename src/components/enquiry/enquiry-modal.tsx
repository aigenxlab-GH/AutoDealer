"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp";
import type { Vehicle } from "@/lib/types";
import { isValidIndianPhone } from "@/lib/phone";
import { buildEnquiryWhatsAppUrl, vehicleTitle } from "@/lib/whatsapp";
import { formatPriceShort } from "@/lib/format";
import { createLeadAction } from "@/app/actions/leads";

const ENQUIRY_EVENT = "sah:open-enquiry";

/** Dispatch from any button to open the shared enquiry modal. */
export function openEnquiry() {
  window.dispatchEvent(new CustomEvent(ENQUIRY_EVENT));
}

/**
 * Mount once per vehicle detail page. Implements the PRD hybrid flow:
 * capture Name + Phone → persist a lead → redirect to the WhatsApp deep link.
 */
export function EnquiryModalHost({ vehicle }: { vehicle: Vehicle }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(ENQUIRY_EVENT, handler);
    return () => window.removeEventListener(ENQUIRY_EVENT, handler);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: { name?: string; phone?: string } = {};
    if (name.trim().length < 2) next.name = "Please enter your name.";
    if (!isValidIndianPhone(phone))
      next.phone = "Enter a valid 10-digit mobile number.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const res = await createLeadAction({
      vehicleId: vehicle.id,
      customerName: name,
      customerPhone: phone,
    });

    if (!res.ok) {
      setSubmitting(false);
      toast.error(res.error ?? "Something went wrong. Please try again.");
      return;
    }

    toast.success("Opening WhatsApp to connect you with the dealer…");
    // PRD step 3: deep-link dispatch.
    window.location.assign(buildEnquiryWhatsAppUrl(vehicle, name));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Enquire about this vehicle</DialogTitle>
          <DialogDescription>
            Share your details and we’ll continue the conversation on WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="text-sm font-semibold">{vehicleTitle(vehicle)}</p>
          <p className="text-sm font-bold text-brand">
            {formatPriceShort(vehicle.price)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="enq-name">Your Name</Label>
            <Input
              id="enq-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              autoComplete="name"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="enq-phone">Mobile Number</Label>
            <div className="flex items-center gap-2">
              <span className="flex h-9 items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground">
                +91
              </span>
              <Input
                id="enq-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                inputMode="numeric"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#25D366] text-white hover:bg-[#25D366]/90"
            size="lg"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <WhatsAppIcon className="size-5" />
            )}
            Continue on WhatsApp
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Your details are kept private and used only to assist you.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
