"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { axiosClient } from "@/lib/api/axiosClient";
import { extractErrorMessageAsync } from "@/lib/api/errorUtils";
import { ExportConfigModal, type ExportConfigPayload } from "@/components/common/ExportConfigModal/ExportConfigModal";
import { exportJobWatcher } from "@/components/common/FloatingTaskWidget";
import type { ListState } from "./useListState";

interface UseExcelExportOptions<T> {
  /** Endpoint danh sách, vd. "/units/" -> dùng `export-columns/` và `export-excel/` của BaseERPViewSet */
  endpoint: string;
  /** Tên hiển thị, vd. "Đơn vị tính" (tiêu đề modal, tên tệp, tiến trình nền) */
  label: string;
  list: ListState;
  total: number;
  /** Vài dòng đang hiển thị để xem trước */
  preview?: T[];
}

function saveBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Luồng xuất Excel / CSV dùng chung: modal cấu hình cột → POST export-excel/ kèm bộ lọc đang áp dụng.
 * Dữ liệu lớn: server trả job_id -> theo dõi ở FloatingTaskWidget; dữ liệu nhỏ: tải tệp ngay.
 */
export function useExcelExport<T>({ endpoint, label, list, total, preview }: UseExcelExportOptions<T>) {
  const t = useTranslations("list");
  const [selectedIds, setSelectedIds] = useState<number[] | null>(null);
  const [exporting, setExporting] = useState(false);
  const base = endpoint.endsWith("/") ? endpoint : `${endpoint}/`;

  const confirm = async (config: ExportConfigPayload) => {
    setExporting(true);
    try {
      const body: Record<string, unknown> = { columns: config.columns, format: config.format, include_images: config.include_images, scope: config.scope };
      if (config.scope === "selected") body.ids = config.ids ?? selectedIds ?? [];
      // Bộ lọc hiện tại đi qua query string (backend filter_queryset đọc query_params)
      const { page: _page, page_size: _size, ...filters } = list.params; // eslint-disable-line @typescript-eslint/no-unused-vars
      const response = await axiosClient.post(`${base}export-excel/`, body, {
        params: config.scope === "all" ? filters : undefined,
        responseType: "blob",
      });
      const blob = response as unknown as Blob;
      if (blob.type?.includes("application/json")) {
        const json = JSON.parse(await blob.text());
        const job = json?.data ?? json;
        if (job?.job_id) {
          exportJobWatcher.track(job.job_id, `${label} (${config.format.toUpperCase()})`, job.total_rows, label);
          toast.info(t("export.background"));
          setSelectedIds(null);
          return;
        }
      }
      const date = new Date().toISOString().slice(0, 10);
      saveBlob(blob, `${label.replace(/\s+/g, "_")}_${date}.${config.format === "csv" ? "csv" : "xlsx"}`);
      toast.success(t("export.done"));
      setSelectedIds(null);
    } catch (error) {
      toast.error(await extractErrorMessageAsync(error, t("export.failed")));
    } finally {
      setExporting(false);
    }
  };

  const modal = (
    <ExportConfigModal
      open={selectedIds !== null}
      onClose={() => setSelectedIds(null)}
      title={t("export.title", { label })}
      columnsUrl={`${base}export-columns/`}
      previewData={(preview ?? []).slice(0, 3) as unknown as Record<string, unknown>[]}
      totalFilteredCount={total}
      selectedCount={selectedIds?.length ?? 0}
      selectedIds={selectedIds ?? []}
      onConfirmExport={confirm}
      loading={exporting}
    />
  );

  return { openExport: (ids: number[]) => setSelectedIds(ids), exportModal: modal };
}
