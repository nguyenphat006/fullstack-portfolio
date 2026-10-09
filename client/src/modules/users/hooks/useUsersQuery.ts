"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCrudHooks } from "@/lib/api/createCrudHooks";
import { userService } from "../services/user.service";

export const USERS_QUERY_KEY = ["users"] as const;

const userHooks = createCrudHooks(USERS_QUERY_KEY, userService);

export const USER_QUERY_KEYS = userHooks.keys;
export const useUsersList = userHooks.useList;
export const useUserDetail = userHooks.useDetail;
export const useCreateUserMutation = userHooks.useCreate;
export const useUpdateUserMutation = userHooks.useUpdate;
export const useDeleteUserMutation = userHooks.useDelete;
export const useBatchDeleteUsersMutation = userHooks.useBatchDelete;
export const useBatchStatusChangeMutation = userHooks.useBatchStatus;

/** Thống kê người dùng (có thêm chỉ số `management`) */
export function useUserStatistics(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.statistics(),
    queryFn: () => userService.statistics(),
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
  });
}

/** Nhập dữ liệu người dùng hàng loạt từ Excel */
export function useImportUsersMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: Record<string, unknown>[]) => userService.importExcel(rows),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}
