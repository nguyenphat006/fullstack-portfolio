"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Languages, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/feedback/confirm";
import { http } from "@/lib/api/axiosClient";
import { extractErrorMessage } from "@/lib/api/errorUtils";

interface TranslateButtonProps {
  /** Văn bản tiếng Việt cần dịch, khóa = tên trường tiếng Anh trong form (vd. { title_en: "…" }) */
  getSource: () => Record<string, string>;
  /** Giá trị tiếng Anh hiện có (để hỏi trước khi ghi đè) */
  getCurrent: () => Record<string, string>;
  /** Nhận bản dịch (cùng khóa với `getSource`) rồi gán vào form */
  onResult: (translations: Record<string, string>) => void;
}

/** Nút "Dịch từ tiếng Việt": gọi `POST /translate/`, điền sẵn các ô tiếng Anh để người dùng chỉnh lại trước khi lưu. */
export function TranslateButton({ getSource, getCurrent, onResult }: TranslateButtonProps) {
  const t = useTranslations("common.translate");
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);

  const run = async () => {
    const source = getSource();
    const texts = Object.fromEntries(Object.entries(source).filter(([, v]) => v.trim()));
    if (Object.keys(texts).length === 0) {
      toast.info(t("nothing"));
      return;
    }
    const hasExisting = Object.keys(texts).some((key) => (getCurrent()[key] ?? "").trim());
    if (hasExisting) {
      const ok = await confirm({ title: t("confirmTitle"), description: t("confirmBody"), confirmText: t("confirmOk") });
      if (!ok) return;
    }

    setLoading(true);
    try {
      const res = await http.post<{ translations: Record<string, string> }>("/translate/", { texts, source: "vi", target: "en" });
      onResult(res.translations);
      toast.success(t("done"));
    } catch (error) {
      toast.error(extractErrorMessage(error, t("error")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={run} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : <Languages />}
      {loading ? t("running") : t("button")}
    </Button>
  );
}
