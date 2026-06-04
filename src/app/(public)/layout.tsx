import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { WhatsAppProvider } from "@/components/providers/whatsapp-provider";
import { settingsRepository } from "@/lib/data";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await settingsRepository.getShopSettings();

  return (
    <WhatsAppProvider number={settings.whatsappNumber}>
      <div className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    </WhatsAppProvider>
  );
}
