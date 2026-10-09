import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProfileView } from "@/modules/profile";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile");
  return { title: t("pageTitle") };
}

export default function ProfilePage() {
  return <ProfileView />;
}
