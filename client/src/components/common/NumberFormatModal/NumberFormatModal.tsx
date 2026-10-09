"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NumberInput } from "@/components/controls/NumberInput";
import { useNumberFormat } from "@/providers/NumberFormatProvider";
import { DEFAULT_NUMBER_SETTINGS, VIETNAM_NUMBER_SETTINGS, type NumberFormatSettings, type NumberFormatStyle } from "@/lib/formatters/numberConfig";
import { formatCurrency, formatDimension, formatPercent, formatVolume, formatWeight } from "@/lib/formatters/numberFormatter";
import { cn } from "@/lib/utils";

export interface NumberFormatModalProps {
  open: boolean;
  onCancel: () => void;
}

// Nhãn / gợi ý: khóa trong namespace numberFormat (styles.<value>.label|hint)
const STYLES: { value: NumberFormatStyle; example: string }[] = [
  { value: "international", example: "1,250,000.50" },
  { value: "vietnam", example: "1.250.000,50" },
];

type DecimalKey = "currencyDecimals" | "dimensionDecimals" | "weightDecimals" | "volumeDecimals" | "percentDecimals";

// Nhãn: numberFormat.decimals.<key>
const DECIMALS: { key: DecimalKey; max: number }[] = [
  { key: "currencyDecimals", max: 4 },
  { key: "dimensionDecimals", max: 4 },
  { key: "weightDecimals", max: 5 },
  { key: "volumeDecimals", max: 6 },
  { key: "percentDecimals", max: 3 },
];

/** Cấu hình định dạng số của người dùng (lưu trình duyệt), có xem trước tức thì */
export function NumberFormatModal({ open, onCancel }: NumberFormatModalProps) {
  const t = useTranslations("numberFormat");
  const tc = useTranslations("common");
  const { settings, updateSettings, resetSettings } = useNumberFormat();
  const [draft, setDraft] = useState<NumberFormatSettings>(settings);

  useEffect(() => {
    if (open) setDraft(settings); // eslint-disable-line react-hooks/set-state-in-effect
  }, [open, settings]);

  const changeStyle = (style: NumberFormatStyle) => {
    const base = style === "vietnam" ? VIETNAM_NUMBER_SETTINGS : DEFAULT_NUMBER_SETTINGS;
    // Giữ số chữ số thập phân người dùng đã chỉnh
    setDraft((prev) => ({ ...prev, ...base, ...Object.fromEntries(DECIMALS.map((d) => [d.key, prev[d.key]])) }));
  };

  const preview = useMemo(
    () => [
      { label: t("preview.currency"), value: formatCurrency(12500000, { settings: draft }) },
      { label: t("preview.dimension"), value: formatDimension(1850.5, { settings: draft }) },
      { label: t("preview.weight"), value: formatWeight(0.308, { settings: draft, unit: "kg/m" }) },
      { label: t("preview.volume"), value: formatVolume(0.0456, { settings: draft }) },
      { label: t("preview.scrap"), value: formatPercent(5.25, { settings: draft }) },
    ],
    [draft, t],
  );

  const save = () => {
    updateSettings(draft);
    toast.success(t("applied"));
    onCancel();
  };

  const reset = () => {
    resetSettings();
    setDraft(DEFAULT_NUMBER_SETTINGS);
    toast.info(t("restored"));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="flex max-h-[calc(100vh-80px)] flex-col gap-0 p-0 sm:max-w-[640px]">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
          <section>
            <h3 className="mb-2 text-sm font-semibold">{t("separatorStyle")}</h3>
            <RadioGroup value={draft.style} onValueChange={(v) => changeStyle(v as NumberFormatStyle)} className="grid gap-3 sm:grid-cols-2">
              {STYLES.map((s) => (
                <Label
                  key={s.value}
                  htmlFor={`nf-${s.value}`}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal transition-colors hover:bg-muted/50",
                    draft.style === s.value && "border-primary bg-[var(--c-primary-bg)] hover:bg-[var(--c-primary-bg)]",
                  )}
                >
                  <RadioGroupItem id={`nf-${s.value}`} value={s.value} className="mt-0.5" />
                  <span className="space-y-1">
                    <span className="block text-sm font-medium">{t(`styles.${s.value}.label`)}</span>
                    <span className="block text-xs text-muted-foreground">{t(`styles.${s.value}.hint`)}</span>
                    <span className="block font-mono text-sm font-semibold">{s.example}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold">{t("decimalPlaces")}</h3>
            <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {DECIMALS.map((d) => (
                <div key={d.key} className="flex items-center justify-between gap-3">
                  <Label htmlFor={`nf-${d.key}`} className="font-normal">
                    {t(`decimals.${d.key}`)}
                  </Label>
                  <NumberInput
                    id={`nf-${d.key}`}
                    className="w-20"
                    min={0}
                    max={d.max}
                    value={draft[d.key]}
                    onChange={(v) => setDraft((prev) => ({ ...prev, [d.key]: v ?? DEFAULT_NUMBER_SETTINGS[d.key] }))}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold">{t("previewTitle")}</h3>
            <dl className="grid grid-cols-2 gap-3 rounded-lg bg-[var(--c-bg-subtle)] p-3 sm:grid-cols-3">
              {preview.map((p) => (
                <div key={p.label}>
                  <dt className="text-xs text-muted-foreground">{p.label}</dt>
                  <dd className="font-mono text-sm font-semibold tabular-nums">{p.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <DialogFooter className="border-t px-6 py-3">
          <Button variant="ghost" className="sm:mr-auto" onClick={reset}>
            <RotateCcw />
            {t("restoreDefault")}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            {tc("actions.cancel")}
          </Button>
          <Button onClick={save}>{tc("actions.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
