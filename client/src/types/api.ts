/**
 * Kiểu dữ liệu sinh tự động từ OpenAPI của backend (server/schema.yml).
 * Không sửa tay api.generated.ts — chạy lại: `npm run gen:api`.
 *
 * @example
 * type Unit = Schemas["UnitOfMeasure"];                        // serializer đọc
 * type UnitInput = Schemas["UnitOfMeasureCreateUpdateRequest"]; // payload ghi
 */
import type { components } from "./api.generated";

export type Schemas = components["schemas"];
