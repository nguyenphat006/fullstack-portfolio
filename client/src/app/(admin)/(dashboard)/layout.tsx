"use client";

import React from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import AuthGuard from "@/components/auth/AuthGuard";
import { Spinner } from "@/components/feedback/Spinner";

const DashboardLayout = dynamic(
  () => import("@/components/layouts/DashboardLayout"),
  {
    ssr: false,
    loading: () => <LayoutLoading />,
  }
);

function LayoutLoading() {
  const t = useTranslations("errors");
  return <Spinner fullScreen label={t("loadingUi")} />;
}

export default function AppDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  );
}
