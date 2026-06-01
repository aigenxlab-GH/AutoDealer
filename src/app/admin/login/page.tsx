import type { Metadata } from "next";
import { Car } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <Car className="size-6" />
          </span>
          <h1 className="mt-3 text-xl font-bold">{siteConfig.name}</h1>
          <p className="text-sm text-muted-foreground">Admin Control Desk</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <LoginForm from={from} />
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo credentials: admin@sapphireautohub.com / admin123
        </p>
      </div>
    </div>
  );
}
