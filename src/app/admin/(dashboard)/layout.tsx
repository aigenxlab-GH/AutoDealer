import { AdminNav } from "@/components/admin/admin-nav";
import { AdminMobileBar } from "@/components/admin/admin-mobile-bar";
import { getAdminSession } from "@/lib/auth-server";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  const email = session?.email;

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card lg:block">
        <AdminNav email={email} />
      </aside>

      <div className="lg:pl-64">
        <AdminMobileBar email={email} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
