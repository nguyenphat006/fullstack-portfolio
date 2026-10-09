/**
 * Hợp đồng API chuẩn với backend (xem server/apps/core/responses.py).
 *
 * Mọi response JSON có dạng `ApiEnvelope<T>`; `axiosClient` tự bóc envelope nên service nhận thẳng `T`.
 * Danh sách phân trang: `T = Paginated<Item>`.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors: FieldErrors | null;
  code: string | null;
}

/** Lỗi theo từng trường: `{ field_name: ["Thông báo lỗi", ...] }` */
export type FieldErrors = Record<string, string[]>;

export interface Paginated<T> {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

/** Kết quả chung của các action hàng loạt (`batch-delete`, `batch-status`, ...) */
export interface BatchResult {
  count: number;
  skipped?: { id: number; reason: string }[];
}

export interface EntityStatistics {
  total: number;
  active: number;
  inactive: number;
  new_this_month: number;
  [key: string]: number;
}

export function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ApiEnvelope<unknown>).success === "boolean" &&
    "message" in value &&
    "data" in value
  );
}
