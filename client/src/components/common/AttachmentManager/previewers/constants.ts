import type { StatusTone } from "@/components/common/StatusBadge";
import type { MessageKey } from "@/i18n/types";
import type { AttachmentItem } from "../AttachmentManager";

export interface CategoryInfo {
  /** Khóa chữ — dịch lúc render bằng useTranslations() */
  label: MessageKey;
  tone: StatusTone;
}

/** Nhãn + tông badge của phân loại tệp */
export const CATEGORY_LABELS: Record<string, CategoryInfo> = {
  DOCUMENT: { label: "attachments.categories.DOCUMENT", tone: "info" },
  IMAGE: { label: "attachments.categories.IMAGE", tone: "success" },
  CAD_DRAWING: { label: "attachments.categories.CAD_DRAWING", tone: "accent" },
  SPEC_SHEET: { label: "attachments.categories.SPEC_SHEET", tone: "info" },
  CONTRACT: { label: "attachments.categories.CONTRACT", tone: "warning" },
  OTHER: { label: "attachments.categories.OTHER", tone: "neutral" },
};

/** Lựa chọn phân loại khi tải lên / sửa (nhãn là khóa chữ) */
export const CATEGORY_OPTIONS: { value: string; label: MessageKey }[] = [
  { value: "DOCUMENT", label: "attachments.categoryOptions.DOCUMENT" },
  { value: "IMAGE", label: "attachments.categoryOptions.IMAGE" },
  { value: "CAD_DRAWING", label: "attachments.categoryOptions.CAD_DRAWING" },
  { value: "SPEC_SHEET", label: "attachments.categoryOptions.SPEC_SHEET" },
  { value: "CONTRACT", label: "attachments.categoryOptions.CONTRACT" },
  { value: "OTHER", label: "attachments.categoryOptions.OTHER" },
];

export type PreviewFileType = "image" | "pdf" | "excel" | "docx" | "doc_legacy" | "text" | "unsupported";

/** URL đầy đủ của tệp (file_url là link ký của backend) */
export function resolveFileUrl(file: AttachmentItem | null): string {
  if (!file) return "";
  const raw = file.file_url || file.file || "";
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("blob:")) return raw;
  const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1").replace(/\/api\/v1\/?$/, "");
  return `${apiOrigin}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

/** Loại tệp để chọn trình xem phù hợp */
export function detectFileType(ext: string, mime: string): PreviewFileType {
  if (["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"].includes(ext) || mime.startsWith("image/")) return "image";
  if (ext === "pdf" || mime.includes("pdf")) return "pdf";
  if (["xlsx", "xls", "csv"].includes(ext) || mime.includes("spreadsheet") || mime.includes("excel")) return "excel";
  if (ext === "docx") return "docx";
  if (ext === "doc") return "doc_legacy";
  if (["txt", "json", "log", "xml", "md", "sql"].includes(ext) || mime.startsWith("text/")) return "text";
  return "unsupported";
}

/** Tải tệp đính kèm về máy (link ký, không cần JWT); lỗi mạng → mở tab mới */
export async function downloadAttachment(file: AttachmentItem) {
  const url = resolveFileUrl(file);
  if (!url) return;
  try {
    const blob = await (await fetch(url)).blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = file.file_name || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}
