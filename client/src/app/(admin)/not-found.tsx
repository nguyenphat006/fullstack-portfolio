import { StatusPage } from "@/components/common";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return { title: t("notFound") };
}

export default async function NotFound() {
  const t = await getTranslations("errors");
  return <StatusPage status="404" title={t("notFound.pageTitle")} subTitle={t("notFound.pageHint")} fullScreen />;
}
