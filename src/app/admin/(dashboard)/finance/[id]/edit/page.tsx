import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { financeCompanyRepository } from "@/lib/data";
import { FinanceCompanyForm } from "@/components/admin/finance-company-form";

export const metadata: Metadata = {
  title: "Edit Finance Company",
  robots: { index: false },
};

export default async function EditFinanceCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await financeCompanyRepository.getById(id);
  if (!company) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/finance"
          className="flex items-center gap-1 text-sm text-white/40 hover:text-white/70"
        >
          <ArrowLeft className="size-4" /> Back to Finance Companies
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white/90">
          Edit {company.name}
        </h1>
      </div>
      <FinanceCompanyForm company={company} />
    </div>
  );
}
