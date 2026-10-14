"use client";

import { LayoutGrid, List } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "table";

/** Đổi kiểu xem danh sách: lưới thẻ / bảng. */
export function ViewModeToggle({ value, onChange }: { value: ViewMode; onChange: (mode: ViewMode) => void }) {
  const t = useTranslations("list.view");
  const items: { key: ViewMode; icon: React.ReactNode; label: string }[] = [
    { key: "grid", icon: <LayoutGrid />, label: t("grid") },
    { key: "table", icon: <List />, label: t("table") },
  ];
  return (
    <div className="inline-flex items-center rounded-md border bg-card p-0.5" role="group" aria-label={t("label")}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          aria-pressed={value === item.key}
          title={item.label}
          aria-label={item.label}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded text-muted-foreground transition-colors [&_svg]:size-4",
            value === item.key ? "bg-[var(--c-bg-muted)] text-foreground" : "hover:text-foreground",
          )}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
