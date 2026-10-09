"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Ban, CircleCheck, Trash2 } from "lucide-react";
import { ExcelImportModal } from "@/components/common";
import { ACTIVE_STATUS, StatusBadge, statusOptions } from "@/components/common/StatusBadge";
import { CodeText, ListPage, RelativeTime, defineColumns, useExcelExport, useListState, type BulkAction } from "@/components/list";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";
import { rbacService } from "@/modules/settings/services/rbac.service";
import { normalizeText } from "@/lib/text/normalize";
import { UserFormModal } from "./components/UserFormModal";
import {
  useUserDetail,
  useUsersList,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBatchDeleteUsersMutation,
  useBatchStatusChangeMutation,
  useImportUsersMutation,
} from "./hooks/useUsersQuery";
import { isAdminAccount } from "./UserDetailView";
import { useUserHero } from "./hero";
import type { UserItem, CreateUserInput } from "./types";

export function UsersView() {
  const t = useTranslations("users");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const userHero = useUserHero();
  const { can, isSuperUser } = usePermission();
  const importColumns = [
    { key: "username", label: t("fields.username"), required: true },
    { key: "full_name", label: t("fields.fullName"), required: false },
    { key: "email", label: t("fields.email"), required: true },
    { key: "phone_number", label: t("fields.phone"), required: false },
    { key: "password", label: t("import.passwordColumn"), required: true },
  ];
  const list = useListState({ defaultOrdering: "-updated_at" });
  const query = useUsersList(list.params);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();
  const batchDelete = useBatchDeleteUsersMutation();
  const batchStatus = useBatchStatusChangeMutation();
  const importMutation = useImportUsersMutation();

  const { openExport, exportModal } = useExcelExport({
    endpoint: "/users/",
    label: t("title"),
    list,
    total: query.data?.count ?? 0,
    preview: query.data?.results,
  });

  const columns = useMemo(
    () =>
      defineColumns<UserItem>([
        {
          key: "full_name",
          title: t("fields.fullName"),
          width: 200,
          pinned: "left",
          hideable: false,
          sortable: true,
          ellipsis: true,
          filter: { type: "text" },
          link: (r) => `/users/${r.id}`,
          render: (v, r) => v || r.username,
        },
        { key: "username", title: t("fields.username"), width: 130, sortable: true, filter: { type: "text" }, render: (v) => <CodeText>{v}</CodeText> },
        { key: "email", title: t("fields.email"), width: 200, ellipsis: true, filter: { type: "text" } },
        { key: "phone_number", title: t("fields.phone"), width: 140, defaultHidden: true, filter: { type: "text" } },
        {
          key: "roles",
          title: t("fields.roles"),
          width: 180,
          ellipsis: true,
          filter: {
            type: "remote",
            fetchOptions: async (search) =>
              (await rbacService.getRoles())
                .filter((r) => normalizeText(`${r.role_name} ${r.role_code}`).includes(normalizeText(search)))
                .map((r) => ({ value: r.id, label: r.role_name, code: r.role_code })),
          },
          render: (_, r) => r.roles?.map((role) => role.role_name).join(", "),
        },
        {
          key: "is_active",
          title: tc("fields.status"),
          width: 130,
          filter: { type: "select", options: statusOptions(ACTIVE_STATUS, tr) },
          render: (v) => <StatusBadge map={ACTIVE_STATUS} value={v} />,
        },
        {
          key: "updated_at",
          title: tc("fields.updatedAt"),
          width: 150,
          sortable: true,
          filter: { type: "date" },
          render: (v) => <RelativeTime value={v} />,
        },
        { key: "created_at", title: tc("fields.createdAt"), width: 140, defaultHidden: true, sortable: true, filter: { type: "date" }, render: (v) => <RelativeTime value={v} /> },
      ]),
    [t, tc, tr],
  );

  const handleSubmit = async (values: CreateUserInput) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: values });
      toast.success(tc("messages.updated", { entity: t("entity") }));
    } else {
      await createMutation.mutateAsync(values);
      toast.success(tc("messages.created", { entity: t("entity") }));
    }
    setFormOpen(false);
  };

  const showBatchResult = (res: { message: string; data: { skipped?: unknown[] } }) =>
    res.data.skipped?.length ? toast.warning(res.message) : toast.success(res.message);

  const bulkActions: BulkAction[] = [
    ...(can(PERMISSIONS.USER.UPDATE)
      ? [
          { key: "activate", label: tc("actions.unlock"), icon: <CircleCheck />, onClick: async (ids: number[]) => showBatchResult(await batchStatus.mutateAsync({ ids, isActive: true })) },
          { key: "deactivate", label: tc("actions.lock"), icon: <Ban />, onClick: async (ids: number[]) => showBatchResult(await batchStatus.mutateAsync({ ids, isActive: false })) },
        ]
      : []),
    ...(can(PERMISSIONS.USER.DELETE)
      ? [
          {
            key: "delete",
            label: tc("actions.delete"),
            icon: <Trash2 />,
            danger: true,
            confirm: {
              title: (n: number) => tc("messages.bulkDeleteTitle", { count: n, entity: t("entity") }),
              content: `${t("bulkDeleteHint")} ${tc("messages.deleteIrreversible")}`,
              okText: tc("actions.delete"),
            },
            onClick: async (ids: number[]) => showBatchResult(await batchDelete.mutateAsync(ids)),
          },
        ]
      : []),
  ];

  return (
    <ListPage<UserItem>
      moduleCode="USER"
      tableKey="users"
      list={list}
      query={query}
      columns={columns}
      entityLabel={t("entity")}
      searchPlaceholder={t("searchPlaceholder")}
      onCreate={can(PERMISSIONS.USER.CREATE) ? () => { setEditing(null); setFormOpen(true); } : undefined}
      rowActions={{
        // Khớp quy tắc backend: chỉ Quản trị viên sửa được tài khoản Quản trị viên
        onEdit: can(PERMISSIONS.USER.UPDATE) ? (r) => { setEditing(r); setFormOpen(true); } : undefined,
        editDisabledReason: (r) => (isAdminAccount(r) && !isSuperUser ? t("adminEditOnly") : null),
        onDelete: can(PERMISSIONS.USER.DELETE)
          ? async (r) => {
              await deleteMutation.mutateAsync(r.id);
              toast.success(tc("messages.deleted", { entity: t("entity") }));
            }
          : undefined,
        deleteTitle: (r) => tc("messages.deleteTitle", { entity: t("entity"), name: r.full_name || r.username }),
        protectedReason: (r) => (isAdminAccount(r) ? t("cannotDeleteAdmin") : null),
      }}
      bulkActions={bulkActions}
      onExport={can(PERMISSIONS.USER.EXPORT) ? openExport : undefined}
      onImport={can(PERMISSIONS.USER.IMPORT) ? () => setImportOpen(true) : undefined}
      quickView={{ useDetail: useUserDetail, hero: userHero, href: (id) => `/users/${id}` }}
    >
      <UserFormModal
        open={formOpen}
        editingUser={editing}
        loading={createMutation.isPending || updateMutation.isPending}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
      <ExcelImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title={t("import.title")}
        sampleTemplateName="Mau_Nhap_Tai_Khoan"
        templateColumns={importColumns}
        templateUrl={`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"}/users/excel-template/`}
        onImport={(rows: Record<string, unknown>[]) => importMutation.mutateAsync(rows)}
      />
      {exportModal}
    </ListPage>
  );
}

export default UsersView;
