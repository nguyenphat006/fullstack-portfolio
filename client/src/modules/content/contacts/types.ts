import type { Schemas } from "@/types/api";

/**
 * Kiểu dữ liệu sinh từ OpenAPI (serializer backend). Chạy `npm run gen:api` sau khi backend có endpoint.
 * Thêm trường mới: sửa serializer backend -> spectacular -> gen:api (không gõ tay ở đây).
 */
export type ContactItem = Schemas["Contact"];
export type ContactCreateInput = Schemas["ContactCreateUpdateRequest"];
export type ContactUpdateInput = ContactCreateInput;

export interface ContactFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
  ordering?: string;
}
