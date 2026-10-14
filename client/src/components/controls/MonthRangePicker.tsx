"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarRange, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { formatPeriod, type Period, type YearMonth } from "@/lib/formatters/period";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/** Lưới 12 tháng + chuyển năm */
function MonthGrid({ value, onPick, min }: { value: YearMonth | null; onPick: (ym: YearMonth) => void; min?: YearMonth | null }) {
  const locale = useLocale();
  const [year, setYear] = useState(() => Number((value ?? "").slice(0, 4)) || new Date().getFullYear());
  const names = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { month: "short" }).format(new Date(2000, i, 1)),
  );
  return (
    <div className="w-56">
      <div className="mb-2 flex items-center justify-between">
        <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => setYear((y) => y - 1)} aria-label="-1"><ChevronLeft /></Button>
        <span className="text-sm font-semibold tabular-nums">{year}</span>
        <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => setYear((y) => y + 1)} aria-label="+1"><ChevronRight /></Button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {names.map((name, i) => {
          const ym = `${year}-${pad(i + 1)}`;
          const disabled = Boolean(min && ym < min);
          return (
            <button
              key={ym}
              type="button"
              disabled={disabled}
              onClick={() => onPick(ym)}
              className={cn(
                "h-8 rounded-md text-xs capitalize transition-colors hover:bg-[var(--c-bg-muted)] disabled:opacity-30",
                value === ym && "bg-[var(--c-primary)] text-white hover:bg-[var(--c-primary)]",
              )}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface MonthRangePickerProps {
  value: Period;
  onChange: (value: Period) => void;
  placeholder?: string;
  invalid?: boolean;
  id?: string;
}

/** Chọn khoảng thời gian theo tháng (bắt đầu → kết thúc hoặc "Hiện tại") — dùng chung cho dự án, kinh nghiệm, học vấn… */
export function MonthRangePicker({ value, onChange, placeholder, invalid, id }: MonthRangePickerProps) {
  const t = useTranslations("form.period");
  const locale = useLocale() === "en" ? "en" : "vi";
  const [open, setOpen] = useState(false);
  const label = formatPeriod(value, locale);
  const present = value.to === "present";

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
          <CalendarRange className="size-4 text-muted-foreground" />
          <span className={cn("flex-1 truncate", !label && "text-muted-foreground")}>{label || placeholder || t("placeholder")}</span>
          {label && (
            <span
              role="button"
              tabIndex={-1}
              aria-label={t("clear")}
              onClick={(e) => { e.stopPropagation(); onChange({ from: null, to: null }); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t("from")}</p>
            <MonthGrid value={value.from} onPick={(ym) => onChange({ from: ym, to: value.to && value.to !== "present" && value.to < ym ? null : value.to })} />
          </div>
          <div className={cn(present && "pointer-events-none opacity-40")}>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t("to")}</p>
            <MonthGrid value={present ? null : value.to} min={value.from} onPick={(ym) => { onChange({ ...value, to: ym }); setOpen(false); }} />
          </div>
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2 border-t pt-3 text-sm">
          <Switch checked={present} onCheckedChange={(on) => onChange({ ...value, to: on ? "present" : null })} />
          {t("present")}
        </label>
      </PopoverContent>
    </Popover>
  );
}
