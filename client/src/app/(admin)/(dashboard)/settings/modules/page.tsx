import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ModulesView } from "@/modules/settings";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings");
  return { title: t("pageTitle") };
}

export default function ModulesSettingsPage() {
  return <ModulesView />;
}
