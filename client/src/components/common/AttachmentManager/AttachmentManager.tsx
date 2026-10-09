"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Download, Eye, Paperclip, Pencil, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Combobox } from "@/components/controls/Combobox";
import { FileDropzone } from "@/components/controls/FileDropzone";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useConfirm } from "@/components/feedback/confirm";
import { http } from "@/lib/api/axiosClient";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import type { Paginated } from "@/lib/api/types";
import { normalizeText } from "@/lib/text/normalize";
import { FilePreviewModal } from "./FilePreviewModal";
import { AttachmentEditModal } from "./AttachmentEditModal";
import { CATEGORY_LABELS, CATEGORY_OPTIONS, FileTypeIcon, detectFileType, downloadAttachment } from "./previewers";

export interface AttachmentItem {
  id: number;
  entity_type: string;
  entity_id: number;
  file: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_size_formatted: string;
  mime_type?: string;
  file_category: string;
  description?: string;
  created_by_name?: string;
  created_at: string;
}

export interface AttachmentManagerProps {
  entityType: string;
  entityId: number;
  readonly?: boolean;
  maxFileSizeMB?: number;
}

const PAGE_SIZE = 10;

const fileTypeOf = (item: AttachmentItem) => detectFileType(item.file_name?.split(".").pop()?.toLowerCase() || "", item.mime_type || "");

/** Danh sách + tải lên / xem trước / sửa / xóa tệp đính kèm của 1 thực thể */
export function AttachmentManager({ entityType, entityId, readonly = false, maxFileSizeMB = 25 }: AttachmentManagerProps) {
  const t = useTranslations("attachments");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const queryKey = useMemo(() => ["attachments", entityType, entityId], [entityType, entityId]);

  const [category, setCategory] = useState("DOCUMENT");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [preview, setPreview] = useState<AttachmentItem | null>(null);
  const [editing, setEditing] = useState<AttachmentItem | null>(null);

  // Danh mục nhỏ theo thực thể: tải 1 lần tối đa 100 tệp, lọc tại chỗ
  const { data: attachments = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => (await http.get<Paginated<AttachmentItem>>("/attachments/", { params: { entity_type: entityType, entity_id: entityId, page_size: 100 } })).results,
    enabled: !!entityId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const upload = useMutation({
    mutationFn: (file: File) => {
      const data = new FormData();
      data.append("file", file);
      data.append("entity_type", entityType);
      data.append("entity_id", String(entityId));
      data.append("file_category", category);
      if (description.trim()) data.append("description", description.trim());
      return http.post("/attachments/", data, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: (_, file) => {
      invalidate();
      setDescription("");
      toast.success(t("uploaded", { name: file.name }));
    },
    onError: (err) => toast.error(extractErrorMessage(err, t("uploadFailed"))),
  });

  const removeMany = async (ids: number[]) => {
    try {
      await Promise.all(ids.map((id) => http.delete(`/attachments/${id}/`)));
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
      await invalidate();
      toast.success(t("deleted", { count: ids.length }));
    } catch (err) {
      toast.error(extractErrorMessage(err, t("deleteFailed")));
      throw err;
    }
  };

  const confirmRemove = (items: AttachmentItem[]) =>
    confirm({
      title: t("deleteTitle", { count: items.length }),
      description: items.length === 1 ? items[0].file_name : t("deleteIrreversible"),
      confirmText: tc("actions.delete"),
      danger: true,
      onConfirm: () => removeMany(items.map((i) => i.id)),
    });

  const onFiles = (files: File[]) => {
    files.forEach((file) => {
      if (file.size > maxFileSizeMB * 1024 * 1024) toast.error(t("tooLarge", { name: file.name, max: maxFileSizeMB }));
      else upload.mutate(file);
    });
  };

  const filtered = useMemo(() => {
    const q = normalizeText(search.trim());
    return attachments.filter(
      (a) =>
        (!filterCategory || a.file_category === filterCategory) &&
        (!q || normalizeText(`${a.file_name} ${a.description ?? ""} ${a.created_by_name ?? ""}`).includes(q)),
    );
  }, [attachments, search, filterCategory]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  const selectedItems = attachments.filter((a) => selected.includes(a.id));
  const allOnPage = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  const toggleAll = (on: boolean) =>
    setSelected((prev) => (on ? Array.from(new Set([...prev, ...rows.map((r) => r.id)])) : prev.filter((id) => !rows.some((r) => r.id === id))));

  return (
    <div className="space-y-4">
      {!readonly && (
        <div className="space-y-3 rounded-lg bg-[var(--c-bg-subtle)] p-3">
          <div className="grid gap-2 sm:grid-cols-[200px_1fr]">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full bg-background" aria-label={t("uploadCategory")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {tr(o.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input className="bg-background" placeholder={t("notePlaceholder")} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <FileDropzone
            multiple
            className="bg-background py-5"
            disabled={upload.isPending || !entityId}
            loading={upload.isPending}
            title={upload.isPending ? t("uploading") : t("dropTitle")}
            hint={t("dropHint", { max: maxFileSizeMB })}
            onFiles={onFiles}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-64">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchAria")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <Combobox
          className="w-48"
          allowClear
          aria-label={t("filterCategory")}
          placeholder={t("allCategories")}
          options={CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: tr(o.label) }))}
          value={filterCategory}
          onChange={(v) => {
            setFilterCategory(v);
            setPage(0);
          }}
        />
        {selected.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("selectedCount", { count: selected.length })}</span>
            <Button variant="outline" size="sm" onClick={() => selectedItems.forEach((f, i) => setTimeout(() => downloadAttachment(f), i * 300))}>
              <Download />
              {tc("actions.download")}
            </Button>
            {!readonly && (
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => confirmRemove(selectedItems)}>
                <Trash2 />
                {tc("actions.delete")}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-[13px] text-muted-foreground">
            <tr>
              <th className="w-10 px-3 py-2.5">
                <Checkbox aria-label={tc("actions.selectAll")} checked={allOnPage} onCheckedChange={(v) => toggleAll(v === true)} disabled={!rows.length} />
              </th>
              <th className="px-3 py-2.5 font-medium">{t("columns.file")}</th>
              <th className="hidden w-36 px-3 py-2.5 font-medium md:table-cell">{t("columns.category")}</th>
              <th className="hidden w-24 px-3 py-2.5 text-right font-medium sm:table-cell">{t("columns.size")}</th>
              <th className="hidden w-40 px-3 py-2.5 font-medium lg:table-cell">{t("columns.uploadedBy")}</th>
              <th className="hidden w-36 px-3 py-2.5 font-medium lg:table-cell">{tc("fields.createdAt")}</th>
              <th className="w-px px-3 py-2.5" aria-label={tc("fields.actions")} />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }, (_, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td colSpan={7} className="px-3 py-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                  <Paperclip className="mx-auto mb-2 size-5" />
                  {attachments.length ? t("noMatch") : t("empty")}
                </td>
              </tr>
            ) : (
              rows.map((item) => {
                const cat = CATEGORY_LABELS[item.file_category] || CATEGORY_LABELS.OTHER;
                const isSelected = selected.includes(item.id);
                return (
                  <tr key={item.id} data-state={isSelected ? "selected" : undefined} className="border-b last:border-0 hover:bg-muted/40 data-[state=selected]:bg-[var(--c-primary-bg)]">
                    <td className="px-3 py-2.5">
                      <Checkbox
                        aria-label={t("selectFile", { name: item.file_name })}
                        checked={isSelected}
                        onCheckedChange={(v) => setSelected((prev) => (v === true ? [...prev, item.id] : prev.filter((id) => id !== item.id)))}
                      />
                    </td>
                    <td className="max-w-0 px-3 py-2.5">
                      <div className="flex items-start gap-2.5">
                        <FileTypeIcon fileType={fileTypeOf(item)} className="mt-0.5" />
                        <div className="min-w-0">
                          <button type="button" className="block max-w-full truncate text-left font-medium text-primary hover:underline" onClick={() => setPreview(item)}>
                            {item.file_name}
                          </button>
                          {item.description && <p className="truncate text-xs text-muted-foreground">{item.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-2.5 md:table-cell">
                      <StatusBadge tone={cat.tone} label={tr(cat.label)} />
                    </td>
                    <td className="hidden px-3 py-2.5 text-right font-mono text-xs sm:table-cell">{item.file_size_formatted}</td>
                    <td className="hidden truncate px-3 py-2.5 text-[13px] lg:table-cell">{item.created_by_name || t("system")}</td>
                    <td className="hidden px-3 py-2.5 text-[13px] text-muted-foreground lg:table-cell">{item.created_at}</td>
                    <td className="px-2 py-1.5">
                      <div className="flex justify-end gap-0.5">
                        <Button variant="ghost" size="icon-sm" aria-label={t("previewAction")} title={t("previewAction")} onClick={() => setPreview(item)}>
                          <Eye />
                        </Button>
                        <Button variant="ghost" size="icon-sm" aria-label={tc("actions.download")} title={tc("actions.download")} onClick={() => downloadAttachment(item)}>
                          <Download />
                        </Button>
                        {!readonly && (
                          <>
                            <Button variant="ghost" size="icon-sm" aria-label={t("editInfo")} title={t("editInfo")} onClick={() => setEditing(item)}>
                              <Pencil />
                            </Button>
                            <Button variant="ghost" size="icon-sm" aria-label={t("deleteFile")} title={t("deleteFile")} className="text-destructive hover:text-destructive" onClick={() => confirmRemove([item])}>
                              <Trash2 />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-[13px] text-muted-foreground">
          <span>{t("fileCount", { count: filtered.length })}</span>
          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" aria-label={tc("actions.previous")} disabled={current === 0} onClick={() => setPage(current - 1)}>
                <ChevronLeft />
              </Button>
              <span className="tabular-nums">
                {current + 1}/{pageCount}
              </span>
              <Button variant="outline" size="icon-sm" aria-label={tc("actions.next")} disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>
                <ChevronRight />
              </Button>
            </div>
          )}
        </div>
      )}

      <FilePreviewModal
        open={!!preview}
        file={preview}
        attachments={filtered}
        onClose={() => setPreview(null)}
        onSelectFile={setPreview}
        onDelete={(item) => removeMany([item.id]).catch(() => undefined)}
        readonly={readonly}
      />
      <AttachmentEditModal open={!!editing} item={editing} onClose={() => setEditing(null)} queryKey={queryKey} />
    </div>
  );
}

export default AttachmentManager;
