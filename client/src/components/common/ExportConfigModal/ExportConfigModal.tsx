"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Download, Loader2, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { http } from "@/lib/api/axiosClient";
import { normalizeText } from "@/lib/text/normalize";
import { cn } from "@/lib/utils";

export interface ExportColumnDef {
  key: string;
  label: string;
  type?: "string" | "number" | "date" | "datetime" | "boolean" | "image";
  default_selected?: boolean;
  defaultSelected?: boolean;
  required?: boolean;
}

export interface ExportConfigPayload {
  format: "xlsx" | "csv";
  scope: "all" | "selected" | "full";
  columns: string[];
  include_images: boolean;
  ids?: (number | string)[];
}

export interface ExportConfigModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Endpoint lấy danh sách trường (vd. "/users/export-columns/") */
  columnsUrl?: string;
  /** Danh sách cột dự phòng nếu không dùng endpoint */
  availableColumns?: ExportColumnDef[];
  previewData?: Record<string, unknown>[];
  totalFilteredCount: number;
  selectedCount?: number;
  selectedIds?: (number | string)[];
  onConfirmExport: (config: ExportConfigPayload) => Promise<void>;
  loading?: boolean;
}

/** Trường nội bộ / nhạy cảm không bao giờ cho xuất */
const HIDDEN_FIELDS = new Set(["id", "is_superuser", "is_staff", "password", "deleted_at", "groups", "user_permissions", "first_name", "last_name", "date_joined"]);

const isDefault = (c: ExportColumnDef) => c.default_selected !== false && c.defaultSelected !== false;

function OptionCard({ id, value, title, hint, disabled }: { id: string; value: string; title: React.ReactNode; hint: string; disabled?: boolean }) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 font-normal transition-colors hover:bg-muted/50",
        "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-[var(--c-primary-bg)]",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <RadioGroupItem id={id} value={value} disabled={disabled} className="mt-0.5" />
      <span className="min-w-0 space-y-0.5">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </Label>
  );
}

function previewCell(col: ExportColumnDef, value: unknown, labels: { image: string; yes: string; no: string }) {
  if (col.type === "image") return value ? labels.image : "—";
  if (col.type === "boolean") return value ? labels.yes : labels.no;
  if (value === undefined || value === null || value === "") return "—";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

/** Cấu hình xuất dữ liệu: định dạng · phạm vi · chọn cột · xem trước 3 dòng */
export function ExportConfigModal({
  open,
  onClose,
  title,
  columnsUrl,
  availableColumns = [],
  previewData = [],
  totalFilteredCount = 0,
  selectedCount = 0,
  selectedIds = [],
  onConfirmExport,
  loading = false,
}: ExportConfigModalProps) {
  const t = useTranslations("dataTransfer.export");
  const tc = useTranslations("common");
  const { data: fetched, isLoading } = useQuery({
    queryKey: ["export-columns", columnsUrl],
    queryFn: () => http.get<ExportColumnDef[]>(columnsUrl as string),
    enabled: open && !!columnsUrl,
    staleTime: 5 * 60 * 1000,
  });

  const columns = useMemo(
    () => (fetched?.length ? fetched : availableColumns).filter((c) => !HIDDEN_FIELDS.has(c.key.toLowerCase())),
    [fetched, availableColumns],
  );

  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<ExportConfigPayload["scope"]>("all");
  const [format, setFormat] = useState<ExportConfigPayload["format"]>("xlsx");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [wasOpen, setWasOpen] = useState(false);
  const [columnsReady, setColumnsReady] = useState(false);

  // Mỗi lần mở: đặt lại lựa chọn (cập nhật trong render, không qua effect)
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setScope(selectedCount > 0 ? "selected" : "all");
      setFormat("xlsx");
      setSearch("");
      setColumnsReady(false);
    }
  }
  // Cột mặc định: chọn đúng 1 lần khi danh sách cột sẵn sàng
  if (open && !columnsReady && columns.length) {
    const defaults = columns.filter(isDefault).map((c) => c.key);
    setSelectedKeys(defaults.length ? defaults : columns.map((c) => c.key));
    setColumnsReady(true);
  }

  const visibleColumns = useMemo(() => {
    const q = normalizeText(search.trim());
    return q ? columns.filter((c) => normalizeText(`${c.label} ${c.key}`).includes(q)) : columns;
  }, [columns, search]);

  const previewColumns = columns.filter((c) => selectedKeys.includes(c.key));
  const toggle = (key: string, on: boolean) => setSelectedKeys((prev) => (on ? [...prev, key] : prev.filter((k) => k !== key)));

  const resetDefaults = () => {
    setSelectedKeys(columns.filter(isDefault).map((c) => c.key));
    setScope(selectedCount > 0 ? "selected" : "all");
    setFormat("xlsx");
    setSearch("");
  };

  const scopeLabel = scope === "full" ? t("scopeLabel.full") : scope === "selected" ? t("scopeLabel.selected", { count: selectedCount }) : t("scopeLabel.rows", { count: totalFilteredCount });
  const cellLabels = { image: t("image"), yes: tc("status.yes"), no: tc("status.no") };
  const disabled = !selectedKeys.length || (scope === "selected" && !selectedCount) || (scope === "all" && !totalFilteredCount);

  const submit = async () => {
    if (disabled) return;
    await onConfirmExport({ format, scope, columns: selectedKeys, include_images: format === "xlsx", ids: scope === "selected" ? selectedIds : undefined });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[calc(100vh-80px)] flex-col gap-0 p-0 sm:max-w-[880px]">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title ?? t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-4">
          <div className="grid gap-5 lg:grid-cols-[2fr_3fr]">
            <section>
              <h3 className="mb-2 text-sm font-semibold">{t("format")}</h3>
              <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportConfigPayload["format"])} className="grid grid-cols-2 gap-2">
                <OptionCard id="ex-xlsx" value="xlsx" title="Excel (.xlsx)" hint={t("xlsxHint")} />
                <OptionCard id="ex-csv" value="csv" title="CSV (.csv)" hint={t("csvHint")} />
              </RadioGroup>
            </section>
            <section>
              <h3 className="mb-2 text-sm font-semibold">{t("scope")}</h3>
              <RadioGroup value={scope} onValueChange={(v) => setScope(v as ExportConfigPayload["scope"])} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <OptionCard id="ex-all" value="all" title={t("scopeAll", { count: totalFilteredCount })} hint={t("scopeAllHint")} />
                <OptionCard id="ex-selected" value="selected" title={t("scopeSelected", { count: selectedCount })} hint={selectedCount ? t("scopeSelectedHint") : t("scopeSelectedNone")} disabled={!selectedCount} />
                <OptionCard id="ex-full" value="full" title={t("scopeFull")} hint={t("scopeFullHint")} />
              </RadioGroup>
            </section>
          </div>

          <section>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">
                {t("columns")} <span className="font-normal text-muted-foreground">({selectedKeys.length}/{columns.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchColumns")} aria-label={t("searchColumns")} className="h-8 w-44 pl-8" />
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedKeys(columns.map((c) => c.key))}>
                  {tc("actions.selectAll")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedKeys([])}>
                  {t("deselectAll")}
                </Button>
              </div>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-9" />
                ))}
              </div>
            ) : (
              <div className="grid max-h-48 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                {visibleColumns.map((c) => {
                  const checked = selectedKeys.includes(c.key);
                  return (
                    <Label key={c.key} htmlFor={`ex-col-${c.key}`} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 font-normal hover:bg-muted/60">
                      <Checkbox id={`ex-col-${c.key}`} checked={checked} onCheckedChange={(v) => toggle(c.key, v === true)} />
                      <span className="truncate text-sm">{c.label}</span>
                    </Label>
                  );
                })}
                {!visibleColumns.length && <p className="col-span-full py-4 text-center text-sm text-muted-foreground">{t("noColumns")}</p>}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold">{t("preview")}</h3>
            {!previewColumns.length ? (
              <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">{t("pickColumn")}</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      {previewColumns.map((c) => (
                        <th key={c.key} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-t">
                        {previewColumns.map((c) => (
                          <td key={c.key} className={cn("max-w-[200px] truncate px-3 py-2", (c.type === "number" || c.type?.startsWith("date")) && "font-mono")}>
                            {previewCell(c, row[c.key], cellLabels)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {!previewData.length && (
                      <tr>
                        <td colSpan={previewColumns.length} className="px-3 py-4 text-center text-muted-foreground">
                          {t("noPreview")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <DialogFooter className="border-t px-6 py-3">
          <Button variant="ghost" className="sm:mr-auto" onClick={resetDefaults}>
            <RotateCcw />
            {tc("actions.reset")}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {tc("actions.cancel")}
          </Button>
          <Button onClick={submit} disabled={disabled || loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Download />}
            {t("submit", { format: format.toUpperCase(), scope: scopeLabel })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExportConfigModal;
