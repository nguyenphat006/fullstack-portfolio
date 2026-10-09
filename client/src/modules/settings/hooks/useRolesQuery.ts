"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rbacService } from "../services/rbac.service";
import type { RoleItem, RoleCreateInput, RoleUpdateInput } from "../types";

export const ROLES_QUERY_KEY = ["roles"];

/** Hook lấy danh sách toàn bộ Vai trò */
export function useRolesList(options?: { enabled?: boolean }) {
  return useQuery<RoleItem[]>({
    queryKey: ROLES_QUERY_KEY,
    queryFn: () => rbacService.getRoles(),
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
  });
}

/** Hook tạo mới Vai trò */
export function useCreateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoleCreateInput) => rbacService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["grouped-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

/** Hook cập nhật Vai trò */
export function useUpdateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleUpdateInput }) =>
      rbacService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["grouped-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

/** Hook xóa Vai trò */
export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rbacService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["grouped-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
