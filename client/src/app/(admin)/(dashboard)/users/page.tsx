import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UsersView } from "@/modules/users";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("users");
  return { title: t("pageTitle") };
}

export default function UsersPage() {
  return <UsersView />;
}
