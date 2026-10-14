"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useController, useFormContext, type FieldValues, type Path, type PathValue, type RegisterOptions } from "react-hook-form";
import { Combobox, type ComboOption } from "@/components/controls/Combobox";
import { DatePicker } from "@/components/controls/DatePicker";
import { MonthRangePicker } from "@/components/controls/MonthRangePicker";
import { formatDay, formatPeriod, parsePeriod, parseViDay } from "@/lib/formatters/period";
import { FieldShell } from "./fields";

type TechRow = [title: string, slug: string, hex: string];

/** Danh mục ~3.400 công nghệ (simple-icons) — tải riêng khi mở trang soạn, cache suốt phiên */
function useTechCatalog() {
  return useQuery({
    queryKey: ["tech-catalog"],
    queryFn: async () => (await import("@/constants/tech-catalog.json")).default as TechRow[],
    staleTime: Infinity,
  });
}

/** Chọn nhiều công nghệ từ thư viện có logo (không gõ tay). Giá trị form: string[] tên công nghệ. */
export function TechStackField<T extends FieldValues>({
  name, label, hint, rules,
}: { name: Path<T>; label?: React.ReactNode; hint?: React.ReactNode; rules?: RegisterOptions<T, Path<T>> }) {
  const t = useTranslations("form.tech");
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController({ name, control, rules });
  const catalog = useTechCatalog();
  const value = ((field.value as string[] | undefined) ?? []).map(String);

  const options = React.useMemo<ComboOption[]>(() => {
    const rows = catalog.data ?? [];
    const known = new Set(rows.map((r) => r[0]));
    // Giữ cả công nghệ đã lưu trước đây nhưng không có trong thư viện
    const extra = value.filter((v) => !known.has(v)).map((v) => ({ value: v, label: v }));
    return [...extra, ...rows.map(([title, slug]) => ({ value: title, label: title, image: `https://cdn.simpleicons.org/${slug}` }))];
  }, [catalog.data, value]);

  const id = `f-${String(name)}`;
  return (
    <FieldShell id={id} label={label} required={Boolean(rules?.required)} hint={hint ?? t("hint")} error={fieldState.error?.message}>
      <Combobox
        id={id}
        multiple
        options={options}
        value={value}
        onChange={(v) => field.onChange(v as PathValue<T, Path<T>>)}
        placeholder={catalog.isLoading ? t("loading") : t("placeholder")}
      />
    </FieldShell>
  );
}

/**
 * Khoảng thời gian theo tháng: ghi cùng lúc 2 trường chữ — tiếng Việt ("05/2025 - 08/2025") và tiếng Anh ("May 2025 - Aug 2025").
 */
export function PeriodField<T extends FieldValues>({
  name, nameEn, label, rules,
}: { name: Path<T>; nameEn: Path<T>; label?: React.ReactNode; rules?: RegisterOptions<T, Path<T>> }) {
  const { control, setValue } = useFormContext<T>();
  const { field, fieldState } = useController({ name, control, rules });
  const id = `f-${String(name)}`;
  return (
    <FieldShell id={id} label={label} required={Boolean(rules?.required)} error={fieldState.error?.message}>
      <MonthRangePicker
        id={id}
        value={parsePeriod(field.value as string)}
        invalid={Boolean(fieldState.error)}
        onChange={(p) => {
          field.onChange(formatPeriod(p, "vi") as PathValue<T, Path<T>>);
          setValue(nameEn, formatPeriod(p, "en") as PathValue<T, Path<T>>, { shouldDirty: true });
        }}
      />
    </FieldShell>
  );
}

/** Ngày: ghi cùng lúc tiếng Việt ("10/03/2026") và tiếng Anh ("Mar 10, 2026"). */
export function DayField<T extends FieldValues>({
  name, nameEn, label, rules,
}: { name: Path<T>; nameEn: Path<T>; label?: React.ReactNode; rules?: RegisterOptions<T, Path<T>> }) {
  const { control, setValue } = useFormContext<T>();
  const { field, fieldState } = useController({ name, control, rules });
  const id = `f-${String(name)}`;
  return (
    <FieldShell id={id} label={label} required={Boolean(rules?.required)} error={fieldState.error?.message}>
      <DatePicker
        id={id}
        value={parseViDay(field.value as string)}
        invalid={Boolean(fieldState.error)}
        onChange={(iso) => {
          field.onChange((iso ? formatDay(iso, "vi") : "") as PathValue<T, Path<T>>);
          setValue(nameEn, (iso ? formatDay(iso, "en") : "") as PathValue<T, Path<T>>, { shouldDirty: true });
        }}
      />
    </FieldShell>
  );
}
