"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarIcon } from "lucide-react";
import { enUS, vi } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDay } from "@/lib/formatters/period";
import { cn } from "@/lib/utils";
import { toIso } from "./DateRangePicker";

interface DatePickerProps {
  /** Ngày ISO "YYYY-MM-DD" (null = chưa chọn) */
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  invalid?: boolean;
  id?: string;
}

/** Chọn một ngày (lịch thả xuống) — dùng chung cho ngày đăng bài, mốc thời gian… */
export function DatePicker({ value, onChange, placeholder, invalid, id }: DatePickerProps) {
  const t = useTranslations("form.period");
  const locale = useLocale() === "en" ? "en" : "vi";
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 text-left text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            invalid && "border-destructive",
          )}
        >
          <CalendarIcon className="size-4 text-muted-foreground" />
          <span className={cn("flex-1 truncate", !value && "text-muted-foreground")}>{value ? formatDay(value, locale) : placeholder ?? t("pickDate")}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          locale={locale === "vi" ? vi : enUS}
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => { onChange(d ? toIso(d) : null); setOpen(false); }}
        />
      </PopoverContent>
    </Popover>
  );
}
