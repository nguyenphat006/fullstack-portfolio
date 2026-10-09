import { http } from "@/lib/api/axiosClient";
import type { Paginated } from "@/lib/api/types";
import type {
  AddActionInput,
  ModuleCreateInput,
  ModuleRegistryItem,
  ModuleUpdateInput,
  PermissionItem,
} from "../types";

export const moduleService = {
  /** Toàn bộ phân hệ (danh mục cấu hình nhỏ, lấy 1 trang tối đa 100) */
  getModules: async (): Promise<ModuleRegistryItem[]> =>
    (await http.get<Paginated<ModuleRegistryItem>>("/modules/", { params: { page_size: 100 } })).results,

  getModule: (id: number) => http.get<ModuleRegistryItem>(`/modules/${id}/`),

  /** Tạo phân hệ mới kèm danh sách action -> backend tự sinh permissions */
  createModule: (data: ModuleCreateInput) => http.post<ModuleRegistryItem>("/modules/", data),

  updateModule: (id: number, data: ModuleUpdateInput) => http.patch<ModuleRegistryItem>(`/modules/${id}/`, data),

  deleteModule: (id: number) => http.delete(`/modules/${id}/`),

  addAction: (moduleId: number, data: AddActionInput) =>
    http.post<PermissionItem>(`/modules/${moduleId}/add-action/`, data),

  removeAction: (moduleId: number, permissionId: number) =>
    http.delete(`/modules/${moduleId}/remove-action/${permissionId}/`),

  /** Sắp xếp lại thứ tự hiển thị theo danh sách IDs */
  reorderModules: (orderedIds: number[]) => http.post<null>("/modules/reorder/", { ordered_ids: orderedIds }),
};
