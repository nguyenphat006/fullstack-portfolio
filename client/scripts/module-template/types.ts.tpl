import type { Schemas } from "@/types/api";

/**
 * Kiểu dữ liệu sinh từ OpenAPI (serializer backend). Chạy `npm run gen:api` sau khi backend có endpoint.
 * Thêm trường mới: sửa serializer backend -> spectacular -> gen:api (không gõ tay ở đây).
 */
export type __Entity__Item = Schemas["__SCHEMA__"];
export type __Entity__CreateInput = Schemas["__SCHEMA__CreateUpdateRequest"];
export type __Entity__UpdateInput = Omit<__Entity__CreateInput, "code">;

export interface __Entity__Filters {
  search?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
  ordering?: string;
}
