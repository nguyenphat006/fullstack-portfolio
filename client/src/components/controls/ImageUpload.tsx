"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/controls/FileDropzone";
import { extractErrorMessage } from "@/lib/api/errorUtils";

interface ImageUploadProps {
  /** URL ảnh hiện tại ("" = chưa có) */
  value?: string | null;
  onChange: (url: string) => void;
  /** Tải tệp lên server, trả URL ảnh (vd. `customerService.uploadLogo`) */
  upload: (file: File) => Promise<string>;
  /** Gợi ý định dạng / dung lượng, vd. "JPG, PNG, WEBP — tối đa 2MB" */
  hint?: string;
  alt?: string;
  disabled?: boolean;
}

/** Ô tải ảnh dùng chung (ảnh NVL, logo khách hàng…): xem trước + bỏ ảnh + kéo thả / chọn tệp. Giá trị là URL ảnh. */
export function ImageUpload({ value, onChange, upload, hint, alt = "", disabled }: ImageUploadProps) {
  const t = useTranslations("form");
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      onChange(await upload(file));
    } catch (err) {
      toast.error(extractErrorMessage(err, t("image.uploadError")));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-start gap-3">
      {value && (
        <div className="relative size-[88px] shrink-0 overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh vừa tải lên / URL từ API */}
          <img src={value} alt={alt} className="size-full object-cover" />
          {!disabled && (
            <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 size-5 rounded" aria-label={t("image.remove")} onClick={() => onChange("")}>
              <X className="size-3" />
            </Button>
          )}
        </div>
      )}
      <FileDropzone
        className="flex-1 py-4"
        accept="image/*"
        disabled={disabled || uploading}
        loading={uploading}
        title={uploading ? t("image.uploading") : t("image.dropHint")}
        hint={hint}
        onFiles={([file]) => handleFile(file)}
      />
    </div>
  );
}
