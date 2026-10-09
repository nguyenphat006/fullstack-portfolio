"use client";

import React from "react";
import { File, FileImage, FileSpreadsheet, FileText, FileType } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PreviewFileType } from "./constants";

const ICONS: Record<PreviewFileType, { icon: React.ElementType; color: string }> = {
  image: { icon: FileImage, color: "text-[var(--c-success)]" },
  pdf: { icon: FileText, color: "text-[var(--c-error)]" },
  excel: { icon: FileSpreadsheet, color: "text-[var(--c-success)]" },
  docx: { icon: FileType, color: "text-[var(--c-primary)]" },
  doc_legacy: { icon: FileType, color: "text-[var(--c-primary)]" },
  text: { icon: FileText, color: "text-muted-foreground" },
  unsupported: { icon: File, color: "text-[var(--c-purple)]" },
};

/** Biểu tượng theo loại tệp */
export function FileTypeIcon({ fileType, className }: { fileType: PreviewFileType; className?: string }) {
  const { icon: Icon, color } = ICONS[fileType];
  return <Icon className={cn("size-5 shrink-0", color, className)} aria-hidden />;
}
