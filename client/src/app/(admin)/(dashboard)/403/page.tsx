import { StatusPage } from "@/components/common";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("forbidden") };
}

export default async function ForbiddenPage() {
  const t = await getTranslations("errors");
  return <StatusPage status="403" title={t("forbidden.title")} subTitle={t("forbidden.pageHint")} />;
}
