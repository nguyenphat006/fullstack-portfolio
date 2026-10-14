"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useController, useFormContext, type FieldValues, type Path, type RegisterOptions } from "react-hook-form";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import { cn } from "@/lib/utils";
import { FieldShell } from "./fields";
import { MarkdownEditor, type MediaKind } from "./MarkdownEditor";

interface UploadProps {
  /** Tải tệp lên server, trả URL */
  upload: (file: File, kind: MediaKind) => Promise<string>;
}

/** Ảnh đại diện: xem trước lớn 16:10, chọn / kéo thả để tải lên (không nhập URL tay). Giá trị form là URL ảnh. */
export function CoverImageField<T extends FieldValues>({
  name, label, rules, upload,
}: UploadProps & { name: Path<T>; label?: React.ReactNode; rules?: RegisterOptions<T, Path<T>> }) {
  const t = useTranslations("form.cover");
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController({ name, control, rules });
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [over, setOver] = useState(false);
  const value = (field.value as string) || "";

  const handle = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      field.onChange(await upload(file, "image"));
    } catch (error) {
      toast.error(extractErrorMessage(error, t("hint")));
    } finally {
      setUploading(false);
    }
  };

  return (
    <FieldShell id={`f-${String(name)}`} label={label} required={Boolean(rules?.required)} hint={t("hint")} error={fieldState.error?.message} className="form-section__full">
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); void handle(e.dataTransfer.files?.[0]); }}
        className={cn(
          "relative flex aspect-[16/10] w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-dashed bg-[var(--c-bg-subtle)] transition-colors",
          over && "border-[var(--c-primary)] bg-[var(--c-primary-bg)]",
          fieldState.error && "border-destructive",
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh vừa tải lên / đường dẫn từ API
          <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="flex flex-col items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ImagePlus className="size-8" />
            {t("choose")}
          </button>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="size-6 animate-spin" />
          </div>
        )}
      </div>
      {value && (
        <div className="mt-2 flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={uploading}>
            <RefreshCw /> {t("replace")}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => field.onChange("")} disabled={uploading}>
            <Trash2 /> {t("remove")}
          </Button>
        </div>
      )}
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { void handle(e.target.files?.[0]); e.target.value = ""; }} />
    </FieldShell>
  );
}

/** Trường Markdown của react-hook-form (bọc MarkdownEditor). */
export function MarkdownField<T extends FieldValues>({
  name, label, rules, upload, minHeight,
}: UploadProps & { name: Path<T>; label?: React.ReactNode; rules?: RegisterOptions<T, Path<T>>; minHeight?: number }) {
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController({ name, control, rules });
  const id = `f-${String(name)}`;
  return (
    <FieldShell id={id} label={label} required={Boolean(rules?.required)} error={fieldState.error?.message} className="form-section__full">
      <MarkdownEditor id={id} value={(field.value as string) ?? ""} onChange={field.onChange} upload={upload} invalid={Boolean(fieldState.error)} minHeight={minHeight} />
    </FieldShell>
  );
}
