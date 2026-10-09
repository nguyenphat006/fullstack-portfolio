"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useConfirm } from "@/components/feedback/confirm";
import { cn } from "@/lib/utils";
import type { AttachmentItem } from "./AttachmentManager";
import { FileTypeIcon, type CategoryInfo, type PreviewFileType } from "./previewers";

interface FilePreviewInfoPanelProps {
  file: AttachmentItem | null;
  attachments: AttachmentItem[];
  ext: string;
  fileType: PreviewFileType;
  catInfo: CategoryInfo;
  readonly: boolean;
  onDownload: () => void;
  onClose: () => void;
  onDelete?: (item: AttachmentItem) => void;
  onSelectFile?: (item: AttachmentItem) => void;
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm break-all">{children}</dd>
    </div>
  );
}

/** Cột phải của hộp xem trước: thông tin tệp · tệp khác · tải xuống / xóa */
export function FilePreviewInfoPanel({ file, attachments, ext, fileType, catInfo, readonly, onDownload, onClose, onDelete, onSelectFile }: FilePreviewInfoPanelProps) {
  const t = useTranslations("attachments");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const confirm = useConfirm();

  const remove = () => {
    if (!file || !onDelete) return;
    confirm({
      title: t("deleteTitle", { count: 1 }),
      description: file.file_name,
      confirmText: tc("actions.delete"),
      danger: true,
      onConfirm: () => {
        onDelete(file);
        onClose();
      },
    });
  };

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-l bg-background md:flex">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex items-start gap-2.5">
          <FileTypeIcon fileType={fileType} className="mt-0.5" />
          <div className="min-w-0 space-y-1.5">
            <p className="text-sm font-semibold break-all">{file?.file_name}</p>
            <StatusBadge tone={catInfo.tone} label={tr(catInfo.label)} />
          </div>
        </div>
        <dl className="space-y-3">
          <Info label={t("columns.size")}>
            <span className="font-mono">{file?.file_size_formatted || "0 B"}</span> <span className="text-xs text-muted-foreground">.{ext.toUpperCase()}</span>
          </Info>
          <Info label={t("columns.uploadedBy")}>{file?.created_by_name || t("system")}</Info>
          <Info label={t("preview.time")}>{file?.created_at}</Info>
          {file?.description && <Info label={tc("fields.note")}>{file.description}</Info>}
        </dl>

        {attachments.length > 1 && (
          <div className="border-t pt-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t("preview.otherFiles", { count: attachments.length })}</p>
            <ul className="space-y-1">
              {attachments.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectFile?.(item)}
                    className={cn(
                      "w-full truncate rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted",
                      item.id === file?.id && "bg-[var(--c-primary-bg)] font-semibold text-primary hover:bg-[var(--c-primary-bg)]",
                    )}
                  >
                    {item.file_name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-2 border-t p-4">
        <Button className="w-full" onClick={onDownload}>
          <Download />
          {tc("actions.download")}
        </Button>
        {!readonly && onDelete && file && (
          <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={remove}>
            <Trash2 />
            {t("deleteFile")}
          </Button>
        )}
      </div>
    </aside>
  );
}
