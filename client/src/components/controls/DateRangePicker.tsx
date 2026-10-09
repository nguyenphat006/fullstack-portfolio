"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarIcon, X } from "lucide-react";
import { vi } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Khoảng ngày dạng chuỗi ISO "YYYY-MM-DD" (null = để trống) */
export type DateRange = [string | null, string | null];

const pad = (n: number) => String(n).padStart(2, "0");
export const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s: string | null) => (s ? new Date(`${s}T00:00:00`) : undefined);
const show = (s: string | null) => (s ? s.split("-").reverse().join("/") : "…");

/** `label`: khóa trong `form.dateRange` */
export const DATE_PRESETS: { label: "today" | "last7" | "last30" | "thisMonth"; range: () => DateRange }[] = [
  { label: "today", range: () => [toIso(new Date()), toIso(new Date())] },
  { label: "last7", range: () => [toIso(new Date(Date.now() - 6 * 864e5)), toIso(new Date())] },
  { label: "last30", range: () => [toIso(new Date(Date.now() - 29 * 864e5)), toIso(new Date())] },
  {
    label: "thisMonth",
    range: () => {
      const now = new Date();
      return [toIso(new Date(now.getFullYear(), now.getMonth(), 1)), toIso(now)];
    },
  },
];

interface DateRangePickerProps {
  value: DateRange | null;
  onChange: (value: DateRange | null) => void;
  placeholder?: string;
  className?: string;
  /** Hiện các mốc nhanh (Hôm nay, 7 ngày…) */
  presets?: boolean;
}

/** Chọn khoảng ngày (từ – đến), có mốc nhanh; giá trị ISO để gửi thẳng lên API */
export function DateRangePicker({ value, onChange, placeholder, className, presets = true }: DateRangePickerProps) {
  const t = useTranslations("form");
  const [open, setOpen] = useState(false);
  const [from, to] = value ?? [null, null];
  const hasValue = Boolean(from || to);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className={cn("w-full justify-start font-normal", !hasValue && "text-muted-foreground", className)}>
          <CalendarIcon className="size-4" />
          <span className="flex-1 truncate text-left">{hasValue ? `${show(from)} – ${show(to)}` : placeholder ?? t("dateRange.placeholder")}</span>
          {hasValue && (
            <X
              className="size-3.5 opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {presets && (
          <div className="flex flex-wrap gap-1 border-b p-2">
            {DATE_PRESETS.map((p) => (
              <Button
                key={p.label}
                type="button"
                variant="secondary"
                size="xs"
                onClick={() => {
                  onChange(p.range());
                  setOpen(false);
                }}
              >
                {t(`dateRange.${p.label}`)}
              </Button>
            ))}
          </div>
        )}
        <Calendar
          mode="range"
          locale={vi}
          numberOfMonths={1}
          defaultMonth={fromIso(from) ?? new Date()}
          selected={{ from: fromIso(from), to: fromIso(to) }}
          onSelect={(range) => onChange(range?.from || range?.to ? [range.from ? toIso(range.from) : null, range.to ? toIso(range.to) : null] : null)}
        />
      </PopoverContent>
    </Popover>
  );
}
