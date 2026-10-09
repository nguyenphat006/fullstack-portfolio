"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Download, Loader2, Maximize2, Minimize2, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AttachmentItem } from "./AttachmentManager";
import { FilePreviewInfoPanel } from "./FilePreviewInfoPanel";
import {
  CATEGORY_LABELS,
  resolveFileUrl,
  detectFileType,
  downloadAttachment,
  FileTypeIcon,
  ImagePreviewer,
  PdfPreviewer,
  ExcelPreviewer,
  DocxPreviewStyles,
  DocxPreviewer,
  DocLegacyPreviewer,
  TextPreviewer,
  UnsupportedPreviewer,
  useFilePreviewContent,
} from "./previewers";

export interface FilePreviewModalProps {
  open: boolean;
  file: AttachmentItem | null;
  attachments?: AttachmentItem[];
  onClose: () => void;
  onDelete?: (item: AttachmentItem) => void;
  onSelectFile?: (item: AttachmentItem) => void;
  readonly?: boolean;
}

/** Xem trước tệp đính kèm (ảnh, PDF, Excel, Word, văn bản); ← → chuyển tệp */
export function FilePreviewModal({ open, file, attachments = [], onClose, onDelete, onSelectFile, readonly = false }: FilePreviewModalProps) {
  const t = useTranslations("attachments.preview");
  const tc = useTranslations("common");
  const [fullscreen, setFullscreen] = useState(false);

  const fullUrl = useMemo(() => resolveFileUrl(file), [file]);
  const ext = file?.file_name?.split(".").pop()?.toLowerCase() || "";
  const fileType = useMemo(() => detectFileType(ext, file?.mime_type || ""), [ext, file]);

  const index = file ? attachments.findIndex((a) => a.id === file.id) : -1;
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < attachments.length - 1;

  useEffect(() => {
    if (!open || !onSelectFile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrev) onSelectFile(attachments[index - 1]);
      else if (e.key === "ArrowRight" && hasNext) onSelectFile(attachments[index + 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hasPrev, hasNext, index, attachments, onSelectFile]);

  const { loading, error, workbook, activeSheet, sheetData, textContent, docxContainerRef, handleSheetChange } = useFilePreviewContent({ open, file, fullUrl, fileType });

  const download = () => file && downloadAttachment(file);
  const catInfo = (file && CATEGORY_LABELS[file.file_category]) || CATEGORY_LABELS.OTHER;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0",
          fullscreen ? "h-screen w-screen max-w-none rounded-none sm:max-w-none" : "h-[88vh] w-[94vw] max-w-none sm:max-w-[1400px]",
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <FileTypeIcon fileType={fileType} />
            <DialogTitle className="truncate text-sm">{file?.file_name}</DialogTitle>
            <DialogDescription className="sr-only">{t("description")}</DialogDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {attachments.length > 1 && (
              <>
                <Button variant="ghost" size="icon-sm" aria-label={t("prevFile")} title={t("prevFile")} disabled={!hasPrev} onClick={() => onSelectFile?.(attachments[index - 1])}>
                  <ChevronLeft />
                </Button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {index + 1}/{attachments.length}
                </span>
                <Button variant="ghost" size="icon-sm" aria-label={t("nextFile")} title={t("nextFile")} disabled={!hasNext} onClick={() => onSelectFile?.(attachments[index + 1])}>
                  <ChevronRight />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon-sm" aria-label={tc("actions.download")} title={tc("actions.download")} className="md:hidden" onClick={download}>
              <Download />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label={fullscreen ? t("exitFullscreen") : t("fullscreen")} title={fullscreen ? t("exitFullscreen") : t("fullscreen")} onClick={() => setFullscreen(!fullscreen)}>
              {fullscreen ? <Minimize2 /> : <Maximize2 />}
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm" aria-label={tc("actions.close")}>
                <X />
              </Button>
            </DialogClose>
          </div>
        </header>

        <DocxPreviewStyles />
        <div className="flex min-h-0 flex-1">
          <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--c-bg-subtle)]">
            {loading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-sm">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">{t("loading")}</span>
              </div>
            )}
            {error ? (
              <div className="m-auto max-w-md space-y-3 p-10 text-center">
                <TriangleAlert className="mx-auto size-8 text-[var(--c-warning)]" />
                <p className="font-semibold">{t("failed")}</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button onClick={download}>
                  <Download />
                  {t("downloadToOpen")}
                </Button>
              </div>
            ) : (
              <>
                {fileType === "image" && <ImagePreviewer key={fullUrl} src={fullUrl} alt={file?.file_name} />}
                {fileType === "pdf" && <PdfPreviewer src={fullUrl} title={file?.file_name} />}
                {fileType === "excel" && <ExcelPreviewer workbook={workbook} activeSheet={activeSheet} sheetData={sheetData} onSheetChange={handleSheetChange} />}
                {fileType === "docx" && <DocxPreviewer containerRef={docxContainerRef} />}
                {fileType === "doc_legacy" && <DocLegacyPreviewer onDownload={download} />}
                {fileType === "text" && <TextPreviewer content={textContent} />}
                {fileType === "unsupported" && <UnsupportedPreviewer file={file} ext={ext} catInfo={catInfo} onDownload={download} />}
              </>
            )}
          </div>
          <FilePreviewInfoPanel
            file={file}
            attachments={attachments}
            ext={ext}
            fileType={fileType}
            catInfo={catInfo}
            readonly={readonly}
            onDownload={download}
            onClose={onClose}
            onDelete={onDelete}
            onSelectFile={onSelectFile}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FilePreviewModal;
