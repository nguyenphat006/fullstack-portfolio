"use client";

import React from "react";

interface PdfPreviewerProps {
  src: string;
  title?: string;
}

/** Xem PDF bằng trình xem sẵn có của trình duyệt */
export function PdfPreviewer({ src, title }: PdfPreviewerProps) {
  return <iframe src={`${src}#toolbar=1&navpanes=0`} title={title} className="size-full flex-1 border-0 bg-background" />;
}
