"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  hint?: string;
  className?: string;
}

/** Vùng kéo thả / bấm để chọn tệp (thay Upload.Dragger của antd) */
export function FileDropzone({ onFiles, accept, multiple, disabled, loading, title, hint, className }: FileDropzoneProps) {
  const t = useTranslations("form");
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const pick = (list: FileList | null) => {
    if (!list || !list.length || disabled) return;
    onFiles(multiple ? Array.from(list) : [list[0]]);
  };
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        pick(e.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-4 py-6 text-center transition-colors",
        over ? "border-primary bg-primary/5" : "border-input hover:border-primary/60 hover:bg-muted/50",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {loading ? <Loader2 className="size-6 animate-spin text-muted-foreground" /> : <UploadCloud className="size-6 text-muted-foreground" />}
      <span className="text-sm font-medium">{title ?? t("dropzone")}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
