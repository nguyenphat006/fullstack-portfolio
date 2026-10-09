import { StatusPage } from "@/components/common";
import { getTranslations } from "next-intl/server";

/** 404 bên trong khu vực đã đăng nhập (giữ sidebar + topbar). Gọi bằng notFound() trong page. */
export default async function DashboardNotFound() {
  const t = await getTranslations("errors");
  return <StatusPage status="404" title={t("notFound.dataTitle")} subTitle={t("notFound.dataHint")} />;
}
