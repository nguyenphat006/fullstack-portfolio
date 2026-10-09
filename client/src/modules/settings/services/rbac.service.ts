import { http } from "@/lib/api/axiosClient";
import type { Paginated } from "@/lib/api/types";
import type { GroupedPermission, PermissionItem, RoleCreateInput, RoleItem, RoleUpdateInput } from "../types";

/** Số bản ghi tối đa backend cho phép mỗi trang — đủ cho danh mục cấu hình (vai trò, quyền) */
const ALL_ITEMS = { page_size: 100 };

export const rbacService = {
  /** Toàn bộ vai trò (danh mục nhỏ, lấy 1 trang tối đa) */
  getRoles: async (): Promise<RoleItem[]> =>
    (await http.get<Paginated<RoleItem>>("/roles/", { params: ALL_ITEMS })).results,

  getRole: (roleId: number) => http.get<RoleItem>(`/roles/${roleId}/`),

  createRole: (data: RoleCreateInput) => http.post<RoleItem>("/roles/", data),

  updateRole: (roleId: number, data: RoleUpdateInput) => http.patch<RoleItem>(`/roles/${roleId}/`, data),

  deleteRole: (roleId: number) => http.delete(`/roles/${roleId}/`),

  getPermissions: async (): Promise<PermissionItem[]> =>
    (await http.get<Paginated<PermissionItem>>("/permissions/", { params: ALL_ITEMS })).results,

  /** Danh mục quyền gom nhóm theo phân hệ */
  getGroupedPermissions: () => http.get<GroupedPermission[]>("/permissions/grouped/"),

  setRolePermissions: (roleId: number, permissionIds: number[]) =>
    http.post<RoleItem>(`/roles/${roleId}/set-permissions/`, { permission_ids: permissionIds }),

  /** Lưu ma trận phân quyền cho nhiều vai trò: `{ [roleId]: permissionIds[] }` */
  batchSetRolePermissions: (matrix: Record<number | string, number[]>) =>
    http.post<null>("/roles/batch-set-permissions/", { matrix }),
};
