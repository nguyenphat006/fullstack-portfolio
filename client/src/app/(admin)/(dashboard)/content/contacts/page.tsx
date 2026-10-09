import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactsView from "@/modules/content/contacts";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contacts");
  return { title: t("pageTitle") };
}

export default function ContactsPage() {
  return <ContactsView />;
}
