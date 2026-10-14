import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LandingView from "@/modules/content/landing/LandingView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing");
  return { title: t("title") };
}

export default function LandingPage() {
  return <LandingView />;
}
