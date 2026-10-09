import { isAxiosError } from "axios";
import { isApiEnvelope, type FieldErrors } from "./types";
import { readClientLocale } from "@/i18n/config";

function getEnvelope(error: unknown) {
  if (isAxiosError(error) && isApiEnvelope(error.response?.data)) {
    return error.response.data;
  }
  return null;
}

/**
 * Trích thông báo lỗi dạng chuỗi an toàn từ mọi loại lỗi (Axios / envelope backend / Error / string).
 * Luôn trả về string -> không bao giờ làm crash React khi truyền vào `message.error()`.
 */
// Chạy ngoài cây React (không dùng được useTranslations) -> chọn chữ mặc định theo cookie ngôn ngữ
const DEFAULT_TEXT = {
  vi: { fallback: "Có lỗi xảy ra khi xử lý yêu cầu", network: "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng." },
  en: { fallback: "Something went wrong while processing the request", network: "Cannot reach the server. Please check your connection." },
};

export function extractErrorMessage(error: unknown, fallback: string = DEFAULT_TEXT[readClientLocale()].fallback): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  const envelope = getEnvelope(error);
  if (envelope?.message) return envelope.message;

  if (isAxiosError(error)) {
    if (!error.response) return DEFAULT_TEXT[readClientLocale()].network;
    const data = error.response.data as { detail?: unknown } | undefined;
    if (typeof data?.detail === "string") return data.detail;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** Lỗi theo từng trường từ backend (`errors` của envelope) hoặc `null`. */
export function getFieldErrors(error: unknown): FieldErrors | null {
  return getEnvelope(error)?.errors ?? null;
}

/** Mã lỗi backend: `validation_error`, `business_rule`, `not_found`, `permission_denied`, ... */
export function getErrorCode(error: unknown): string | null {
  return getEnvelope(error)?.code ?? null;
}

/**
 * Như `extractErrorMessage` nhưng đọc được lỗi của request tải file (`responseType: "blob"`),
 * khi backend trả envelope JSON nằm trong Blob.
 */
export async function extractErrorMessageAsync(error: unknown, fallback?: string): Promise<string> {
  if (isAxiosError(error) && error.response?.data instanceof Blob) {
    const blob = error.response.data;
    if (blob.type.includes("application/json")) {
      try {
        const body: unknown = JSON.parse(await blob.text());
        if (isApiEnvelope(body) && body.message) return body.message;
      } catch {
        // Blob không phải JSON hợp lệ -> dùng thông điệp mặc định
      }
    }
  }
  return extractErrorMessage(error, fallback);
}
