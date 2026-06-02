import type { Metadata } from "next";
import { financeCompanyRepository } from "@/lib/data";
import { FinanceCalculator } from "@/components/finance/finance-calculator";
import type { FinanceCompany } from "@/lib/types";

export const revalidate = 60; // revalidate every minute after admin updates

export const metadata: Metadata = {
  title: "Car Finance & EMI Calculator",
  description:
    "Compare car loan EMI from top banks. Calculate your monthly instalment instantly and apply via WhatsApp.",
};

export default async function FinancePage() {
  const companies: FinanceCompany[] = await financeCompanyRepository.list(true);
  return <FinanceCalculator companies={companies} />;
}
