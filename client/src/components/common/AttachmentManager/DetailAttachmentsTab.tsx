"use client";

import React from "react";
import { AttachmentManager, type AttachmentManagerProps } from "./AttachmentManager";

export interface DetailAttachmentsTabProps extends AttachmentManagerProps {
  /** Giữ để tương thích nơi gọi; tab đã có tiêu đề nên không hiển thị lại */
  entityName?: string;
  title?: string;
  extra?: React.ReactNode;
}

/** Tab "Tệp đính kèm" dùng chung cho trang chi tiết mọi thực thể */
export function DetailAttachmentsTab({ entityType, entityId, extra, readonly = false, maxFileSizeMB = 25 }: DetailAttachmentsTabProps) {
  return (
    <div className="space-y-3">
      {extra && <div className="flex justify-end">{extra}</div>}
      <AttachmentManager entityType={entityType} entityId={entityId} readonly={readonly} maxFileSizeMB={maxFileSizeMB} />
    </div>
  );
}

export default DetailAttachmentsTab;
