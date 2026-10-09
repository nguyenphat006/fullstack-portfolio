"use client";

import React, { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common";
import { ModuleTable } from "./components/ModuleTable";
import { ModuleFormModal } from "./components/ModuleFormModal";
import { AddActionModal } from "./components/AddActionModal";
import { RolePermissionMatrixTab } from "./components/RolePermissionMatrixTab";
import { RoleManagementTab } from "./components/RoleManagementTab";
import { SystemSettingsTab } from "./components/SystemSettingsTab";
import {
  useModulesList,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
  useAddActionMutation,
  useRemoveActionMutation,
  useReorderModulesMutation,
} from "./hooks/useModulesQuery";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import { useModuleHeader } from "@/hooks/useModuleHeader";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";
import type { ModuleRegistryItem, ModuleCreateInput, ModuleUpdateInput, AddActionInput } from "./types";

/** Mảng rỗng cố định: ModuleTable so sánh tham chiếu `data` để sắp lại hàng */
const NO_MODULES: ModuleRegistryItem[] = [];

const TABS = ["matrix", "roles", "system", "modules"] as const;

/** Cài đặt: 4 tab (tab đang mở ở ?tab=); mỗi tab tự tải dữ liệu khi mở */
export function ModulesView() {
  const t = useTranslations("settings");
  const { can } = usePermission();
  const { title, subtitle } = useModuleHeader("SETTINGS");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = TABS.some((key) => key === tabParam) ? (tabParam as string) : TABS[0];

  const setActiveTab = (key: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (key === TABS[0]) sp.delete("tab");
    else sp.set("tab", key);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={title} subtitle={subtitle} />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="h-auto w-full justify-start gap-4 overflow-x-auto rounded-none border-b p-0">
          {TABS.map((key) => (
            <TabsTrigger key={key} value={key} className="flex-none px-0.5 py-2">
              {t(`tabs.${key}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="matrix" className="pt-4">
          <RolePermissionMatrixTab />
        </TabsContent>
        <TabsContent value="roles" className="pt-4">
          <RoleManagementTab onNavigateToMatrix={() => setActiveTab("matrix")} />
        </TabsContent>
        <TabsContent value="system" className="pt-4">
          <SystemSettingsTab canEdit={can(PERMISSIONS.SETTINGS.UPDATE)} />
        </TabsContent>
        <TabsContent value="modules" className="pt-4">
          <ModulesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** Tab "Phân hệ & điều hướng": bảng cây phân hệ kéo thả + form phân hệ / quyền */
function ModulesTab() {
  const t = useTranslations("settings");
  const { can } = usePermission();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleRegistryItem | null>(null);
  const [actionModule, setActionModule] = useState<ModuleRegistryItem | null>(null);

  const { data: modules = NO_MODULES, isLoading } = useModulesList();
  const createMutation = useCreateModuleMutation();
  const updateMutation = useUpdateModuleMutation();
  const deleteMutation = useDeleteModuleMutation();
  const addActionMutation = useAddActionMutation();
  const removeActionMutation = useRemoveActionMutation();
  const reorderMutation = useReorderModulesMutation();

  // Lỗi ném lại cho FormDialog gắn vào ô nhập
  const handleFormSubmit = async (values: ModuleCreateInput | ModuleUpdateInput) => {
    if (editingModule) {
      await updateMutation.mutateAsync({ id: editingModule.id, data: values as ModuleUpdateInput });
      toast.success(t("modules.updated", { name: editingModule.module_name }));
    } else {
      await createMutation.mutateAsync(values as ModuleCreateInput);
      toast.success(t("modules.created"));
    }
    setIsFormOpen(false);
  };

  const run = async (fn: () => Promise<unknown>, ok: string, fail: string) => {
    try {
      await fn();
      toast.success(ok);
    } catch (error) {
      toast.error(extractErrorMessage(error, fail));
    }
  };

  const handleAddActionSubmit = async (data: AddActionInput) => {
    if (!actionModule) return;
    await addActionMutation.mutateAsync({ moduleId: actionModule.id, data });
    toast.success(t("modules.actionAdded", { name: actionModule.module_name }));
    setActionModule(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {can(PERMISSIONS.SETTINGS.CREATE) && (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setEditingModule(null);
              setIsFormOpen(true);
            }}
          >
            <Plus />
            {t("modules.add")}
          </Button>
        </div>
      )}
      <ModuleTable
        data={modules}
        loading={isLoading}
        onEdit={
          can(PERMISSIONS.SETTINGS.UPDATE)
            ? (mod) => {
                setEditingModule(mod);
                setIsFormOpen(true);
              }
            : undefined
        }
        onDelete={can(PERMISSIONS.SETTINGS.DELETE) ? (id) => run(() => deleteMutation.mutateAsync(id), t("modules.deleted"), t("modules.deleteError")) : undefined}
        onAddAction={can(PERMISSIONS.SETTINGS.CREATE) ? setActionModule : undefined}
        onRemoveAction={
          can(PERMISSIONS.SETTINGS.DELETE)
            ? (moduleId, permissionId) => run(() => removeActionMutation.mutateAsync({ moduleId, permissionId }), t("modules.actionRemoved"), t("modules.actionRemoveError"))
            : undefined
        }
        onReorder={can(PERMISSIONS.SETTINGS.UPDATE) ? (ids) => run(() => reorderMutation.mutateAsync(ids), t("modules.reordered"), t("modules.reorderError")) : undefined}
      />
      <ModuleFormModal
        open={isFormOpen}
        editingModule={editingModule}
        existingModules={modules}
        onCancel={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />
      <AddActionModal
        open={!!actionModule}
        module={actionModule}
        onCancel={() => setActionModule(null)}
        onSubmit={handleAddActionSubmit}
        loading={addActionMutation.isPending}
      />
    </div>
  );
}
