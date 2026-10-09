import { http } from "@/lib/api/axiosClient";
import type { Schemas } from "@/types/api";

export type SearchGroup = Schemas["SearchGroup"];
export type SearchResult = Schemas["SearchResult"];

/** Độ dài từ khóa tối thiểu — khớp `MIN_QUERY_LENGTH` ở backend (`apps/core/views_search.py`) */
export const SEARCH_MIN_LENGTH = 2;

export const searchService = {
  /**
   * Tìm bản ghi theo mã / tên trên mọi phân hệ người dùng có quyền `_READ` (backend lọc RBAC),
   * nhóm theo phân hệ, tối đa `limit` kết quả mỗi phân hệ.
   */
  global: (q: string, limit = 5) => http.get<SearchGroup[]>("/search/", { params: { q, limit } }),
};
