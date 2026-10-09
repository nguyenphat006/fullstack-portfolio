"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw, RotateCw, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewerProps {
  src: string;
  alt?: string;
}

/** Xem ảnh: phóng to / thu nhỏ / xoay (nơi gọi đặt key={src} để tự đặt lại khi đổi tệp) */
export function ImagePreviewer({ src, alt }: ImagePreviewerProps) {
  const t = useTranslations("attachments.preview");
  const tc = useTranslations("common");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const tool = (label: string, icon: React.ReactNode, run: () => void) => (
    <Button variant="ghost" size="icon-sm" aria-label={label} title={label} onClick={run}>
      {icon}
    </Button>
  );

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-auto p-6">
      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border bg-popover/95 px-2 py-1 shadow-md backdrop-blur">
        {tool(t("zoomIn"), <ZoomIn />, () => setZoom((z) => Math.min(z + 0.25, 4)))}
        {tool(t("zoomOut"), <ZoomOut />, () => setZoom((z) => Math.max(z - 0.25, 0.25)))}
        <span className="min-w-10 text-center text-xs font-semibold text-muted-foreground tabular-nums">{Math.round(zoom * 100)}%</span>
        {tool(t("rotateLeft"), <RotateCcw />, () => setRotation((r) => r - 90))}
        {tool(t("rotateRight"), <RotateCw />, () => setRotation((r) => r + 90))}
        {tool(tc("actions.reset"), <Undo2 />, () => {
          setZoom(1);
          setRotation(0);
        })}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full rounded object-contain shadow-md transition-transform duration-200"
        style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
      />
    </div>
  );
}
