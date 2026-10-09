"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import * as XLSX from "xlsx";
import type { AttachmentItem } from "../AttachmentManager";
import type { PreviewFileType } from "./constants";
import { parseSheetToTable, EMPTY_SHEET_DATA, type SheetTableData } from "./excelUtils";

interface UseFilePreviewContentParams {
  open: boolean;
  file: AttachmentItem | null;
  fullUrl: string;
  fileType: PreviewFileType;
}

/** Logic tải & phân tích dữ liệu cho từng loại tệp (Excel, Word .docx, văn bản) */
export function useFilePreviewContent({ open, file, fullUrl, fileType }: UseFilePreviewContentParams) {
  const t = useTranslations("attachments.preview");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // States cho Excel Viewer
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [sheetData, setSheetData] = useState<SheetTableData>(EMPTY_SHEET_DATA);

  // State cho Text Viewer
  const [textContent, setTextContent] = useState<string>("");

  // Ref cho Word (.docx) container
  const docxContainerRef = useRef<HTMLDivElement>(null);

  const applySheet = (sheet: XLSX.WorkSheet) => {
    const parsed = parseSheetToTable(sheet);
    if (parsed) setSheetData(parsed);
  };

  // Reset states khi đổi tệp (cập nhật trong render, không qua effect)
  const [shownFile, setShownFile] = useState(file);
  if (shownFile !== file) {
    setShownFile(file);
    setWorkbook(null);
    setActiveSheet("");
    setSheetData(EMPTY_SHEET_DATA);
    setTextContent("");
    setError(null);
  }

  const loadFileContent = useCallback(async () => {
    if (!open || !file || !fullUrl) return;

    if (fileType === "excel") {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const buffer = await response.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        setWorkbook(wb);
        if (wb.SheetNames.length > 0) {
          const firstSheet = wb.SheetNames[0];
          setActiveSheet(firstSheet);
          applySheet(wb.Sheets[firstSheet]);
        }
      } catch (err) {
        console.error("Lỗi đọc file Excel:", err);
        setError(t("excelError"));
      } finally {
        setLoading(false);
      }
    } else if (fileType === "docx") {
      setLoading(true);
      setError(null);
      try {
        const { renderAsync } = await import("docx-preview");
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();
        if (docxContainerRef.current) {
          docxContainerRef.current.innerHTML = "";
          // inWrapper: false để KHÔNG tạo wrapper nền phụ phía sau, loại bỏ hoàn toàn trang nền thừa
          await renderAsync(blob, docxContainerRef.current, undefined, {
            className: "docx-clean-page",
            inWrapper: false,
            ignoreWidth: false,
            ignoreHeight: false,
            breakPages: true,
          });
        }
      } catch (err) {
        console.error("Lỗi hiển thị tài liệu Word:", err);
        setError(t("wordError"));
      } finally {
        setLoading(false);
      }
    } else if (fileType === "text") {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        setTextContent(text);
      } catch (err) {
        console.error("Lỗi đọc văn bản:", err);
        setError(t("textError"));
      } finally {
        setLoading(false);
      }
    }
  }, [open, file, fullUrl, fileType, t]);

  useEffect(() => {
    // Đọc tệp từ server (hệ thống ngoài React) rồi đổ kết quả vào state
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFileContent();
  }, [loadFileContent]);

  // Đổi sheet trong file Excel
  const handleSheetChange = (sheetName: string) => {
    if (!workbook) return;
    setActiveSheet(sheetName);
    applySheet(workbook.Sheets[sheetName]);
  };

  return {
    loading,
    error,
    workbook,
    activeSheet,
    sheetData,
    textContent,
    docxContainerRef,
    handleSheetChange,
  };
}
