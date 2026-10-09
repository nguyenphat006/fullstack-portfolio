import type { Schemas } from "@/types/api";

/**
 * Kiểu dữ liệu sinh từ OpenAPI (serializer backend). Chạy `npm run gen:api` sau khi backend có endpoint.
 * Thêm trường mới: sửa serializer backend -> spectacular -> gen:api (không gõ tay ở đây).
 */
export type ProjectItem = Schemas["Project"];
export type ProjectCreateInput = Schemas["ProjectCreateUpdateRequest"];
export type ProjectUpdateInput = ProjectCreateInput;

export interface ProjectFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
  ordering?: string;
}
