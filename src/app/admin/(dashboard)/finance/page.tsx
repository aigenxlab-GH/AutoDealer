import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { financeCompanyRepository } from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FinanceCompanyList } from "@/components/admin/finance-company-list";

export const metadata: Metadata = {
  title: "Finance Companies",
  robots: { index: false },
};

export default async function AdminFinancePage() {
  const companies = await financeCompanyRepository.list();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">
            Finance Companies
          </h1>
          <p className="text-sm text-white/40">
            Manage the banks &amp; NBFCs shown in the public EMI calculator.
          </p>
        </div>
        <Link
          href="/admin/finance/new"
          className={cn(buttonVariants(), "shrink-0")}
        >
          <PlusCircle className="size-4" /> Add Company
        </Link>
      </div>

      <FinanceCompanyList companies={companies} />
    </div>
  );
}
