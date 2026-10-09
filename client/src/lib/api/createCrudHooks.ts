"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CrudService } from "./crud";
import type { ListParams } from "./types";

/**
 * Bộ hook TanStack Query chuẩn cho một `createCrudService`.
 * Mọi mutation tự `invalidateQueries` theo `queryKey` gốc -> danh sách, chi tiết, thống kê đều làm mới.
 *
 * @example
 * export const UNITS_QUERY_KEY = ["units"] as const;
 * const unitHooks = createCrudHooks(UNITS_QUERY_KEY, unitService);
 * export const useUnitsList = unitHooks.useList;
 */
export function createCrudHooks<TItem, TCreate, TUpdate, TParams extends object = ListParams>(
  queryKey: readonly unknown[],
  service: CrudService<TItem, TCreate, TUpdate, TParams>,
) {
  const keys = {
    all: queryKey,
    list: (params?: TParams) => [...queryKey, "list", params ?? {}] as const,
    detail: (id: number) => [...queryKey, "detail", id] as const,
    statistics: () => [...queryKey, "statistics"] as const,
  };

  function useInvalidate() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey });
  }

  return {
    keys,

    useList: (params?: TParams, options?: { enabled?: boolean }) =>
      useQuery({
        queryKey: keys.list(params),
        queryFn: () => service.list(params),
        placeholderData: keepPreviousData,
        enabled: options?.enabled ?? true,
      }),

    useDetail: (id: number | null | undefined) =>
      useQuery({
        queryKey: keys.detail(id ?? 0),
        queryFn: () => service.get(id as number),
        enabled: !!id,
      }),

    useStatistics: (options?: { enabled?: boolean }) =>
      useQuery({
        queryKey: keys.statistics(),
        queryFn: () => service.statistics(),
        staleTime: 30_000,
        enabled: options?.enabled ?? true,
      }),

    useCreate: () => {
      const invalidate = useInvalidate();
      return useMutation({ mutationFn: (data: TCreate) => service.create(data), onSuccess: invalidate });
    },

    useUpdate: () => {
      const invalidate = useInvalidate();
      return useMutation({
        mutationFn: ({ id, data }: { id: number; data: TUpdate }) => service.update(id, data),
        onSuccess: invalidate,
      });
    },

    useDelete: () => {
      const invalidate = useInvalidate();
      return useMutation({ mutationFn: (id: number) => service.remove(id), onSuccess: invalidate });
    },

    useBatchDelete: () => {
      const invalidate = useInvalidate();
      return useMutation({ mutationFn: (ids: number[]) => service.batchDelete(ids), onSuccess: invalidate });
    },

    useBatchStatus: () => {
      const invalidate = useInvalidate();
      return useMutation({
        mutationFn: ({ ids, isActive }: { ids: number[]; isActive: boolean }) => service.batchStatus(ids, isActive),
        onSuccess: invalidate,
      });
    },
  };
}
