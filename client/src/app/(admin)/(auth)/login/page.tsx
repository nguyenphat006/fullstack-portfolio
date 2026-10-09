import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginView } from "@/modules/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("pageTitle") };
}

export default function LoginPage() {
  return <LoginView />;
}
