import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuditLogsView } from "@/modules/audit-logs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auditLogs");
  return { title: t("pageTitle") };
}

export default function AuditLogsPage() {
  return <AuditLogsView />;
}
