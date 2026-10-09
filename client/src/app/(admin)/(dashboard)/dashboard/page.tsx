import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DashboardView } from "@/modules/dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return { title: t("pageTitle") };
}

export default function DashboardPage() {
  return <DashboardView />;
}
