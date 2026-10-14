"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Ban, CircleCheck, Trash2 } from "lucide-react";
import { ACTIVE_STATUS, StatusBadge, statusOptions } from "@/components/common/StatusBadge";
import { CodeText, ListPage, RelativeTime, defineColumns, useExcelExport, useListState, type BulkAction, ViewModeToggle, type ViewMode } from "@/components/list";
import { PERMISSIONS } from "@/constants/permissions";
import { usePermission } from "@/hooks/usePermission";
import { useRouter } from "next/navigation";
import { ContentGrid } from "../ContentGrid";
import {
  useBatchDeleteProjectsMutation,
  useBatchStatusProjectsMutation,
  useDeleteProjectMutation,
  useProjectsList,
} from "./hooks/useProjectsQuery";
import type { ProjectItem } from "./types";

/**
 * Trang danh sách dự án — khung ListPage (docs/plan/ui-list-detail-design.md).
 * Thêm cột / bộ lọc: sửa `columns`; bộ lọc cột cần lookup tương ứng trong `filterset_fields` ở backend.
 * Cần trang chi tiết: tạo ProjectDetailView bằng <DetailPage> và thêm `link` cho cột tên.
 * Chữ hiển thị: messages/<vi|en>/projects.json (rule frontend-i18n.md).
 */
export function ProjectsView() {
  const t = useTranslations("projects");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const { can } = usePermission();
  const list = useListState({ defaultOrdering: "-updated_at" });
  const query = useProjectsList(list.params);

  const router = useRouter();
  const [view, setView] = useState<ViewMode>("grid");
  const editHref = (id: number) => `/content/projects/${id}/edit`;

  const deleteMutation = useDeleteProjectMutation();
  const batchDelete = useBatchDeleteProjectsMutation();
  const batchStatus = useBatchStatusProjectsMutation();

  const { openExport, exportModal } = useExcelExport({
    endpoint: "/projects/",
    label: t("title"),
    list,
    total: query.data?.count ?? 0,
    preview: query.data?.results,
  });

  const columns = useMemo(
    () =>
      defineColumns<ProjectItem>([
        { key: "slug", title: t("fields.slug"), width: 180, pinned: "left", hideable: false, sortable: true, filter: { type: "text" }, render: (v) => <CodeText>{v}</CodeText> },
        { key: "title", title: t("fields.title"), width: 260, sortable: true, filter: { type: "text" } },
        { key: "year", title: t("fields.year"), width: 90, sortable: true },
        { key: "role", title: t("fields.role"), width: 180, ellipsis: true },
        { key: "featured", title: t("fields.featured"), width: 110, render: (v) => (v ? tc("status.yes") : tc("status.no")) },
        { key: "summary", title: t("fields.summary"), width: 300, ellipsis: true },
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
          width: 140,
          sortable: true,
          filter: { type: "date" },
          render: (v, r) => <RelativeTime value={v} by={r.updated_by_name} />,
        },
      ]),
    [t, tc, tr],
  );

  const showBatchResult = (res: { message: string; data: { skipped?: unknown[] } }) =>
    res.data.skipped?.length ? toast.warning(res.message) : toast.success(res.message);

  const bulkActions: BulkAction[] = [
    ...(can(PERMISSIONS.PROJECT.UPDATE)
      ? [
          { key: "activate", label: tc("actions.activate"), icon: <CircleCheck />, onClick: async (ids: number[]) => showBatchResult(await batchStatus.mutateAsync({ ids, isActive: true })) },
          { key: "deactivate", label: tc("actions.deactivate"), icon: <Ban />, onClick: async (ids: number[]) => showBatchResult(await batchStatus.mutateAsync({ ids, isActive: false })) },
        ]
      : []),
    ...(can(PERMISSIONS.PROJECT.DELETE)
      ? [
          {
            key: "delete",
            label: tc("actions.delete"),
            icon: <Trash2 />,
            danger: true,
            confirm: {
              title: (n: number) => tc("messages.bulkDeleteTitle", { count: n, entity: t("entity") }),
              content: tc("messages.deleteIrreversible"),
              okText: tc("actions.delete"),
            },
            onClick: async (ids: number[]) => showBatchResult(await batchDelete.mutateAsync(ids)),
          },
        ]
      : []),
  ];

  return (
    <ListPage<ProjectItem>
      moduleCode="PROJECT"
      tableKey="projects-table"
      list={list}
      query={query}
      columns={columns}
      entityLabel={t("entity")}
      searchPlaceholder={t("searchPlaceholder")}
      onCreate={can(PERMISSIONS.PROJECT.CREATE) ? () => router.push("/content/projects/new") : undefined}
      rowActions={{
        onEdit: can(PERMISSIONS.PROJECT.UPDATE) ? (r) => router.push(editHref(r.id)) : undefined,
        onDelete: can(PERMISSIONS.PROJECT.DELETE)
          ? async (r) => {
              await deleteMutation.mutateAsync(r.id);
              toast.success(tc("messages.deleted", { entity: t("entity") }));
            }
          : undefined,
        deleteTitle: (r) => tc("messages.deleteTitle", { entity: t("entity"), name: r.title }),
      }}
      bulkActions={bulkActions}
      toolbarExtra={<ViewModeToggle value={view} onChange={setView} />}
      renderGrid={
        view === "grid"
          ? (rows) => (
              <ContentGrid
                items={rows.map((r) => ({ id: r.id, title: r.title, subtitle: r.summary, meta: r.year, image: r.image, isActive: r.is_active, featured: r.featured ?? false, tags: Array.isArray(r.stack) ? (r.stack as string[]) : [] }))}
                editHref={editHref}
                canEdit={can(PERMISSIONS.PROJECT.UPDATE)}
                entityLabel={t("entity")} featuredLabel={t("fields.featured")}
                onDelete={
                  can(PERMISSIONS.PROJECT.DELETE)
                    ? async (item) => {
                        await deleteMutation.mutateAsync(item.id);
                        toast.success(tc("messages.deleted", { entity: t("entity") }));
                      }
                    : undefined
                }
              />
            )
          : undefined
      }
      onExport={can(PERMISSIONS.PROJECT.EXPORT) ? openExport : undefined}
    >
      {exportModal}
    </ListPage>
  );
}

export default ProjectsView;
