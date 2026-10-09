"use client";

import React from "react";

/** Xem tệp văn bản / mã */
export function TextPreviewer({ content }: { content: string }) {
  return (
    <div className="flex-1 overflow-auto bg-background p-4">
      <pre className="m-0 font-mono text-[13px] leading-relaxed break-all whitespace-pre-wrap">{content}</pre>
    </div>
  );
}
