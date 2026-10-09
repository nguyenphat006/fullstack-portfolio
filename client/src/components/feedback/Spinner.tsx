import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Vòng xoay chờ + dòng chữ tùy chọn; `fullScreen` = căn giữa toàn màn hình */
export function Spinner({ label, fullScreen, className }: { label?: string; fullScreen?: boolean; className?: string }) {
  return (
    <div role="status" className={cn("flex flex-col items-center justify-center gap-3 text-muted-foreground", fullScreen && "min-h-screen", className)}>
      <Loader2 className="size-8 animate-spin text-primary" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
