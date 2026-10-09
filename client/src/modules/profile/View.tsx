"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfileQuery } from "./hooks/useProfileQuery";
import { ProfileGeneralTab } from "./components/ProfileGeneralTab";
import { ProfileSecurityTab } from "./components/ProfileSecurityTab";

export function ProfileView() {
  const t = useTranslations("profile");
  const [activeTab, setActiveTab] = useState("general");
  const { data: profile, isLoading } = useProfileQuery();

  return (
    <div className="space-y-4">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {isLoading || !profile ? (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
          <TabsList variant="line" className="h-auto w-full justify-start gap-4 rounded-none border-b p-0">
            <TabsTrigger value="general" className="flex-none px-0.5 py-2">
              {t("tabs.general")}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-none px-0.5 py-2">
              {t("tabs.security")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <ProfileGeneralTab profile={profile} />
          </TabsContent>
          <TabsContent value="security">
            <ProfileSecurityTab />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
