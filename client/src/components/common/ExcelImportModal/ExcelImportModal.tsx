"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CircleCheck, CircleX, Download, Loader2, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileDropzone } from "@/components/controls/FileDropzone";
import { extractErrorMessage, extractErrorMessageAsync } from "@/lib/api/errorUtils";
import { downloadFile } from "@/lib/api/download";
import { cn } from "@/lib/utils";

export interface ExcelColumnDef {
  key: string;
  label: string;
  required?: boolean;
}

export interface ExcelImportModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  templateUrl?: string;
  templateColumns?: ExcelColumnDef[];
  sampleTemplateName?: string;
  onImport: (rows: Record<string, unknown>[]) => Promise<unknown>;
}

type ParsedRow = Record<string, unknown> & { _rowNum: number; _errors: string[] };

const PAGE_SIZE = 10;
// Bước: dataTransfer.import.steps.<key>
const STEPS = ["pick", "check", "import"] as const;

/** Nhập dữ liệu từ Excel: tải mẫu → chọn tệp → xem trước & kiểm tra cột bắt buộc → nhập các dòng hợp lệ */
export function ExcelImportModal({
  open,
  onClose,
  title,
  templateUrl,
  templateColumns = [],
  sampleTemplateName = "Mau_Nhap_Lieu",
  onImport,
}: ExcelImportModalProps) {
  const t = useTranslations("dataTransfer.import");
  const tc = useTranslations("common");
  const [step, setStep] = useState(0);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setStep(0);
    setRows([]);
    setHeaders([]);
    setPage(0);
  };

  const close = () => {
    if (importing) return;
    reset();
    onClose();
  };

  const downloadTemplate = async () => {
    if (templateUrl) {
      try {
        await downloadFile(templateUrl, `${sampleTemplateName}.xlsx`);
      } catch (error) {
        toast.error(await extractErrorMessageAsync(error, t("templateDownloadFailed")));
      }
      return;
    }
    if (!templateColumns.length) {
      toast.warning(t("templateNoColumns"));
      return;
    }
    const headerRow = Object.fromEntries(templateColumns.map((c) => [c.key, `${c.label}${c.required ? " *" : ""}`]));
    const ws = XLSX.utils.json_to_sheet([headerRow], { skipHeader: true });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mau_Nhap");
    XLSX.writeFile(wb, `${sampleTemplateName}.xlsx`);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const table = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
        if (!table || table.length < 2) {
          toast.error(t("noHeader"));
          return;
        }
        const heads = table[0].map((h) => String(h ?? "").replace(/\*/g, "").trim());
        const parsed: ParsedRow[] = [];
        for (let i = 1; i < table.length; i++) {
          const values = table[i];
          if (!values?.length || values.every((v) => v === undefined || v === "")) continue;
          const row: ParsedRow = { _rowNum: i + 1, _errors: [] };
          heads.forEach((h, idx) => (row[h] = values[idx] ?? ""));
          templateColumns.forEach((col) => {
            if (!col.required) return;
            const v = row[col.label] ?? row[col.key];
            if (v === undefined || v === null || String(v).trim() === "") row._errors.push(t("missing", { field: col.label }));
          });
          parsed.push(row);
        }
        if (!parsed.length) {
          toast.error(t("noRows"));
          return;
        }
        setHeaders(heads);
        setRows(parsed);
        setPage(0);
        setStep(1);
      } catch (err) {
        toast.error(t("readFailed", { reason: extractErrorMessage(err, t("badFormat")) }));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validRows = rows.filter((r) => r._errors.length === 0);
  const errorCount = rows.length - validRows.length;
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const confirmImport = async () => {
    if (!validRows.length) return;
    setImporting(true);
    setStep(2);
    try {
      await onImport(validRows);
      toast.success(t("imported", { count: validRows.length }));
      reset();
      onClose();
    } catch (err) {
      setStep(1);
      toast.error(extractErrorMessage(err, t("importFailed")));
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="flex max-h-[calc(100vh-80px)] flex-col gap-0 p-0 sm:max-w-[920px]">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title ?? t("title")}</DialogTitle>
          <DialogDescription asChild>
            <ol className="flex flex-wrap items-center gap-2 text-xs">
              {STEPS.map((s, i) => (
                <li key={s} className={cn("flex items-center gap-1.5", i === step ? "font-medium text-foreground" : "text-muted-foreground")}>
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border text-[11px]",
                      i < step && "border-primary bg-primary text-primary-foreground",
                      i === step && "border-primary text-primary",
                    )}
                  >
                    {i + 1}
                  </span>
                  {t(`steps.${s}`)}
                  {i < STEPS.length - 1 && <ChevronRight className="size-3 text-muted-foreground" />}
                </li>
              ))}
            </ol>
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {step === 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">{t("formatHint")}</span>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download />
                  {t("downloadTemplate")}
                </Button>
              </div>
              <FileDropzone
                className="py-10"
                accept=".xlsx,.xls,.csv"
                title={t("dropTitle")}
                hint={t("dropHint")}
                onFiles={([file]) => readFile(file)}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <p className={cn("rounded-md border px-3 py-2 text-sm", errorCount ? "border-[var(--c-warning)] bg-[var(--c-warning-bg)]" : "border-[var(--c-success)] bg-[var(--c-success-bg)]")}>
                {t.rich("summary", {
                  total: rows.length,
                  valid: validRows.length,
                  b: (chunks) => <strong>{chunks}</strong>,
                  ok: (chunks) => <span className="font-semibold text-[var(--c-success)]">{chunks}</span>,
                })}
                {errorCount > 0 && t.rich("summaryErrors", { errors: errorCount, err: (chunks) => <span className="font-semibold text-[var(--c-error)]">{chunks}</span> })}
              </p>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="w-20 px-3 py-2 text-left font-medium whitespace-nowrap">{t("row")}</th>
                      {headers.map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r) => (
                      <tr key={r._rowNum} className={cn("border-t", r._errors.length > 0 && "bg-[var(--c-error-bg)]")}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 tabular-nums">
                            {r._errors.length ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <CircleX className="size-4 text-[var(--c-error)]" aria-label={r._errors.join("; ")} />
                                </TooltipTrigger>
                                <TooltipContent>{r._errors.join("; ")}</TooltipContent>
                              </Tooltip>
                            ) : (
                              <CircleCheck className="size-4 text-[var(--c-success)]" aria-label={t("valid")} />
                            )}
                            {r._rowNum}
                          </span>
                        </td>
                        {headers.map((h) => (
                          <td key={h} className="max-w-[220px] truncate px-3 py-2">
                            {String(r[h] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pageCount > 1 && (
                <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                  <Button variant="outline" size="icon-sm" aria-label={tc("actions.previous")} disabled={page === 0} onClick={() => setPage(page - 1)}>
                    <ChevronLeft />
                  </Button>
                  {page + 1}/{pageCount}
                  <Button variant="outline" size="icon-sm" aria-label={tc("actions.next")} disabled={page >= pageCount - 1} onClick={() => setPage(page + 1)}>
                    <ChevronRight />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-3">
          {step === 0 ? (
            <Button variant="outline" onClick={close}>
              {tc("actions.close")}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={reset} disabled={importing}>
                <RotateCcw />
                {t("pickAgain")}
              </Button>
              <Button onClick={confirmImport} disabled={importing || validRows.length === 0}>
                {importing && <Loader2 className="animate-spin" />}
                {t("submit", { count: validRows.length })}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ExcelImportModal;
