"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Download, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";

/** SCOPED CSS CHO WORD DOCX VIEWER ĐỂ CĂN GIỮA NỀN TRẮNG CHUẨN XÁC */
export function DocxPreviewStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
            .docx-render-target {
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              width: 100% !important;
            }
            .docx-render-target section,
            .docx-render-target .docx-clean-page,
            .docx-render-target .docx {
              background: #FFFFFF !important;
              color: #0F172A !important;
              margin: 0 auto 32px auto !important;
              padding: 56px 64px !important; /* Tăng padding lề trang giấy Word A4 chuẩn xác */
              box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08) !important;
              border: 1px solid #E2E8F0 !important;
              border-radius: 4px !important;
              box-sizing: border-box !important;
              width: 100% !important;
              max-width: 860px !important;
              min-height: 1050px !important;
            }
            .docx-render-target p,
            .docx-render-target span,
            .docx-render-target td,
            .docx-render-target th {
              color: #0F172A !important;
            }
            .docx-render-target p {
              line-height: 1.6 !important;
              margin-bottom: 0.75em !important;
            }
            .docx-render-target table {
              border-collapse: collapse !important;
              width: 100% !important;
              margin: 16px 0 !important;
            }
          `,
      }}
    />
  );
}

interface DocxPreviewerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/** Xem .docx: mỗi trang giấy trắng căn giữa (docx-preview vẽ vào containerRef) */
export function DocxPreviewer({ containerRef }: DocxPreviewerProps) {
  return (
    <div className="flex flex-1 flex-col items-center overflow-auto px-6 pt-10 pb-16">
      <div ref={containerRef} className="docx-render-target" />
    </div>
  );
}

/** Word định dạng cũ (.doc) không xem được trên trình duyệt */
export function DocLegacyPreviewer({ onDownload }: { onDownload: () => void }) {
  const t = useTranslations("attachments.preview");
  const tc = useTranslations("common");
  return (
    <div className="m-auto max-w-md space-y-3 p-10 text-center">
      <FileType className="mx-auto size-10 text-[var(--c-primary)]" />
      <p className="font-semibold">{t("docLegacyTitle")}</p>
      <p className="text-sm text-muted-foreground">{t("docLegacyHint")}</p>
      <Button onClick={onDownload}>
        <Download />
        {tc("actions.download")}
      </Button>
    </div>
  );
}
