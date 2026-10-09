import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import __Entities__View from "@/modules/__ROUTE__";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("__NS__");
  return { title: t("pageTitle") };
}

export default function __Entities__Page() {
  return <__Entities__View />;
}
