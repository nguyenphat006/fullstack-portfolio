import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UserDetailView } from "@/modules/users";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("users");
  return { title: t("detailPageTitle") };
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserDetailView userId={parseInt(id, 10)} />;
}
