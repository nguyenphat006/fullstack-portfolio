import React from "react";
import { Inbox, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  /** Icon của nút hành động (mặc định dấu +); null = không icon */
  icon?: React.ReactNode;
  /** Kiểu nút hành động (mặc định primary) */
  actionType?: "primary" | "default";
}

/** Trạng thái rỗng / lỗi / không khớp lọc — kèm hành động kế tiếp nếu có */
export function EmptyState({ title, description, actionText, onAction, icon, actionType = "primary" }: EmptyStateProps) {
  const tc = useTranslations("common");
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <Inbox className="size-9 text-muted-foreground/50" strokeWidth={1.5} />
      <p className="text-sm font-medium text-foreground">{title ?? tc("status.noData")}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {actionText && onAction && (
        <Button className="mt-2" variant={actionType === "primary" ? "default" : "outline"} onClick={onAction}>
          {icon === undefined ? <Plus /> : icon}
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
