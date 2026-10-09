"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Ban, CircleCheck, Trash2 } from "lucide-react";
import { ACTIVE_STATUS, StatusBadge, statusOptions } from "@/components/common/StatusBadge";
import { CodeText, ListPage, RelativeTime, defineColumns, useExcelExport, useListState, type BulkAction } from "@/components/list";
import { PERMISSIONS } from "@/constants/permissions";
import { usePermission } from "@/hooks/usePermission";
import { BlogFormModal } from "./components/BlogFormModal";
import {
  useBatchDeleteBlogsMutation,
  useBatchStatusBlogsMutation,
  useCreateBlogMutation,
  useDeleteBlogMutation,
  useBlogsList,
  useUpdateBlogMutation,
} from "./hooks/useBlogsQuery";
import type { BlogCreateInput, BlogItem, BlogUpdateInput } from "./types";

/**
 * Trang danh sách bài viết — khung ListPage (docs/plan/ui-list-detail-design.md).
 * Thêm cột / bộ lọc: sửa `columns`; bộ lọc cột cần lookup tương ứng trong `filterset_fields` ở backend.
 * Cần trang chi tiết: tạo BlogDetailView bằng <DetailPage> và thêm `link` cho cột tên.
 * Chữ hiển thị: messages/<vi|en>/blogs.json (rule frontend-i18n.md).
 */
export function BlogsView() {
  const t = useTranslations("blogs");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const { can } = usePermission();
  const list = useListState({ defaultOrdering: "-updated_at" });
  const query = useBlogsList(list.params);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BlogItem | null>(null);

  const createMutation = useCreateBlogMutation();
  const updateMutation = useUpdateBlogMutation();
  const deleteMutation = useDeleteBlogMutation();
  const batchDelete = useBatchDeleteBlogsMutation();
  const batchStatus = useBatchStatusBlogsMutation();

  const { openExport, exportModal } = useExcelExport({
    endpoint: "/blogs/",
    label: t("title"),
    list,
    total: query.data?.count ?? 0,
    preview: query.data?.results,
  });

  const columns = useMemo(
    () =>
      defineColumns<BlogItem>([
        { key: "slug", title: t("fields.slug"), width: 200, pinned: "left", hideable: false, sortable: true, filter: { type: "text" }, render: (v) => <CodeText>{v}</CodeText> },
        { key: "title", title: t("fields.title"), width: 280, sortable: true, filter: { type: "text" } },
        { key: "category", title: t("fields.category"), width: 140, sortable: true, filter: { type: "text" } },
        { key: "published_date", title: t("fields.publishedDate"), width: 130 },
        { key: "read_time", title: t("fields.readTime"), width: 120 },
        { key: "excerpt", title: t("fields.excerpt"), width: 300, ellipsis: true },
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

  // Lỗi được ném lại cho FormDialog gắn vào từng ô nhập
  const handleSubmit = async (values: BlogCreateInput | BlogUpdateInput) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: values as BlogUpdateInput });
      toast.success(tc("messages.updated", { entity: t("entity") }));
    } else {
      await createMutation.mutateAsync(values as BlogCreateInput);
      toast.success(tc("messages.created", { entity: t("entity") }));
    }
    setFormOpen(false);
  };

  const showBatchResult = (res: { message: string; data: { skipped?: unknown[] } }) =>
    res.data.skipped?.length ? toast.warning(res.message) : toast.success(res.message);

  const bulkActions: BulkAction[] = [
    ...(can(PERMISSIONS.BLOG.UPDATE)
      ? [
          { key: "activate", label: tc("actions.activate"), icon: <CircleCheck />, onClick: async (ids: number[]) => showBatchResult(await batchStatus.mutateAsync({ ids, isActive: true })) },
          { key: "deactivate", label: tc("actions.deactivate"), icon: <Ban />, onClick: async (ids: number[]) => showBatchResult(await batchStatus.mutateAsync({ ids, isActive: false })) },
        ]
      : []),
    ...(can(PERMISSIONS.BLOG.DELETE)
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
    <ListPage<BlogItem>
      moduleCode="BLOG"
      tableKey="blogs-table"
      list={list}
      query={query}
      columns={columns}
      entityLabel={t("entity")}
      searchPlaceholder={t("searchPlaceholder")}
      onCreate={can(PERMISSIONS.BLOG.CREATE) ? () => { setEditing(null); setFormOpen(true); } : undefined}
      rowActions={{
        onEdit: can(PERMISSIONS.BLOG.UPDATE) ? (r) => { setEditing(r); setFormOpen(true); } : undefined,
        onDelete: can(PERMISSIONS.BLOG.DELETE)
          ? async (r) => {
              await deleteMutation.mutateAsync(r.id);
              toast.success(tc("messages.deleted", { entity: t("entity") }));
            }
          : undefined,
        deleteTitle: (r) => tc("messages.deleteTitle", { entity: t("entity"), name: r.title }),
      }}
      bulkActions={bulkActions}
      onExport={can(PERMISSIONS.BLOG.EXPORT) ? openExport : undefined}
    >
      <BlogFormModal
        open={formOpen}
        editing={editing}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />
      {exportModal}
    </ListPage>
  );
}

export default BlogsView;
