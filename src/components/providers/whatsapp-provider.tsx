"use client";

import { createContext, useContext } from "react";
import { siteConfig } from "@/config/site";

const WhatsAppContext = createContext<string>(siteConfig.dealer.whatsappNumber);

/** Provides the live WhatsApp number from admin settings to all client components. */
export function WhatsAppProvider({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <WhatsAppContext.Provider value={number || siteConfig.dealer.whatsappNumber}>
      {children}
    </WhatsAppContext.Provider>
  );
}

/** Returns the current WhatsApp number (from DB settings, falling back to siteConfig). */
export function useWhatsAppNumber(): string {
  return useContext(WhatsAppContext);
}
