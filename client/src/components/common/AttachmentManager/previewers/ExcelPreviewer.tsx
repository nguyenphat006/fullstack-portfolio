"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type * as XLSX from "xlsx";
import { cn } from "@/lib/utils";
import type { SheetTableData } from "./excelUtils";

interface ExcelPreviewerProps {
  workbook: XLSX.WorkBook | null;
  activeSheet: string;
  sheetData: SheetTableData;
  onSheetChange: (sheetName: string) => void;
}

/** Xem bảng tính: chọn trang tính, cuộn toàn bộ (không phân trang) */
export function ExcelPreviewer({ workbook, activeSheet, sheetData, onSheetChange }: ExcelPreviewerProps) {
  const t = useTranslations("attachments.preview");
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {workbook && workbook.SheetNames.length > 1 && (
        <div className="flex gap-1 overflow-x-auto border-b bg-muted/50 px-2 pt-1" role="tablist">
          {workbook.SheetNames.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={activeSheet === name}
              onClick={() => onSheetChange(name)}
              className={cn(
                "rounded-t-md border-b-2 px-3 py-1.5 text-xs whitespace-nowrap",
                activeSheet === name ? "border-primary bg-background font-semibold text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-auto p-3">
        {sheetData.rows.length === 0 ? (
          <p className="mt-16 text-center text-sm text-muted-foreground">{t("emptySheet")}</p>
        ) : (
          <table className="border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-muted">
              <tr>
                <th className="sticky left-0 z-20 w-12 border bg-muted px-2 py-1 font-semibold text-muted-foreground">#</th>
                {sheetData.columns.map((c) => (
                  <th key={c} className="min-w-[120px] border px-2 py-1 font-semibold text-muted-foreground">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheetData.rows.map((row, r) => (
                <tr key={r}>
                  <td className="sticky left-0 border bg-muted px-2 py-1 text-center font-semibold text-muted-foreground tabular-nums">{r + 1}</td>
                  {row.map((cell, c) => (
                    <td key={c} className="max-w-[240px] truncate border px-2 py-1" title={String(cell ?? "")}>
                      {String(cell ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
