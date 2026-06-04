"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { buildContextWhatsAppUrl } from "@/lib/whatsapp";

/** Persistent WhatsApp CTA — pre-fills a context-aware message based on current page. */
export function FloatingWhatsApp() {
  const pathname = usePathname();
  const href = buildContextWhatsAppUrl(pathname);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95"
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
