"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Download, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { AttachmentItem } from "../AttachmentManager";
import type { CategoryInfo } from "./constants";

interface UnsupportedPreviewerProps {
  file: AttachmentItem | null;
  ext: string;
  catInfo: CategoryInfo;
  onDownload: () => void;
}

/** Định dạng không xem được trên trình duyệt (CAD, ZIP…) → mời tải về */
export function UnsupportedPreviewer({ file, ext, catInfo, onDownload }: UnsupportedPreviewerProps) {
  const t = useTranslations("attachments.preview");
  const tc = useTranslations("common");
  const tr = useTranslations();
  return (
    <div className="m-auto max-w-md space-y-3 p-10 text-center">
      <File className="mx-auto size-10 text-muted-foreground" />
      <p className="font-semibold break-all">{file?.file_name}</p>
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <StatusBadge tone={catInfo.tone} label={tr(catInfo.label)} />
        <span>.{ext.toUpperCase() || "?"}</span>
        <span>{file?.file_size_formatted}</span>
      </div>
      <p className="text-sm text-muted-foreground">{t("unsupported")}</p>
      <Button onClick={onDownload}>
        <Download />
        {tc("actions.download")}
      </Button>
    </div>
  );
}
