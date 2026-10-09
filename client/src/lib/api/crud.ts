import { http } from "./axiosClient";
import type { ApiEnvelope, BatchResult, EntityStatistics, ListParams, Paginated } from "./types";

/**
 * Service CRUD chuẩn cho mọi ViewSet kế thừa `BaseERPViewSet` ở backend.
 *
 * @example
 * export const unitService = createCrudService<UnitItem, UnitCreateInput, UnitUpdateInput, UnitFilters>("/units/");
 * // bổ sung endpoint riêng:
 * export const materialService = {
 *   ...createCrudService<MaterialItem, MaterialFormValues>("/materials/"),
 *   getNextCode: (categoryId: number) => http.get<NextCode>("/materials/next-code/", { params: { category_id: categoryId } }),
 * };
 */
export function createCrudService<
  TItem,
  TCreate = Partial<TItem>,
  TUpdate = TCreate,
  TParams extends object = ListParams,
>(resource: string) {
  const base = resource.endsWith("/") ? resource : `${resource}/`;

  return {
    resource: base,
    list: (params?: TParams) => http.get<Paginated<TItem>>(base, { params }),
    get: (id: number) => http.get<TItem>(`${base}${id}/`),
    create: (data: TCreate) => http.post<TItem>(base, data),
    // PATCH: form sửa chỉ gửi trường được phép sửa (mã bản ghi khóa sau khi tạo)
    update: (id: number, data: TUpdate) => http.patch<TItem>(`${base}${id}/`, data),
    patch: (id: number, data: Partial<TUpdate>) => http.patch<TItem>(`${base}${id}/`, data),
    remove: (id: number) => http.delete(`${base}${id}/`),
    statistics: () => http.get<EntityStatistics>(`${base}statistics/`),
    /** Trả nguyên envelope để hiển thị message server (có số bản ghi bị bỏ qua) */
    batchDelete: (ids: number[]) => http.envelope.post<BatchResult>(`${base}batch-delete/`, { ids }),
    batchStatus: (ids: number[], isActive: boolean) =>
      http.envelope.post<BatchResult>(`${base}batch-status/`, { ids, is_active: isActive }),
  };
}

export type CrudService<TItem, TCreate = Partial<TItem>, TUpdate = TCreate, TParams extends object = ListParams> =
  ReturnType<typeof createCrudService<TItem, TCreate, TUpdate, TParams>>;

export type BatchEnvelope = ApiEnvelope<BatchResult>;
