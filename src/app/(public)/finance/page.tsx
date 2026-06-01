import type { Metadata } from "next";
import { FinanceCalculator } from "@/components/finance/finance-calculator";

export const metadata: Metadata = {
  title: "Car Finance & EMI Calculator",
  description:
    "Compare car loan EMI from SBI, HDFC Bank and Bajaj Finance. Calculate your monthly instalment instantly and apply via WhatsApp.",
};

export default function FinancePage() {
  return <FinanceCalculator />;
}
