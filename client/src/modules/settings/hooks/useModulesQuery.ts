"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moduleService } from "../services/module.service";
import type { ModuleCreateInput, ModuleUpdateInput, AddActionInput } from "../types";

export const MODULES_QUERY_KEY = ["modules"];

export function useModulesList(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: MODULES_QUERY_KEY,
    queryFn: () => moduleService.getModules(),
    staleTime: 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateModuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ModuleCreateInput) => moduleService.createModule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
      queryClient.invalidateQueries({ queryKey: ["grouped-permissions"] });
    },
  });
}

export function useUpdateModuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ModuleUpdateInput }) =>
      moduleService.updateModule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
      queryClient.invalidateQueries({ queryKey: ["grouped-permissions"] });
    },
  });
}

export function useDeleteModuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => moduleService.deleteModule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
      queryClient.invalidateQueries({ queryKey: ["grouped-permissions"] });
    },
  });
}

export function useAddActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: number; data: AddActionInput }) =>
      moduleService.addAction(moduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
      queryClient.invalidateQueries({ queryKey: ["grouped-permissions"] });
    },
  });
}

export function useRemoveActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, permissionId }: { moduleId: number; permissionId: number }) =>
      moduleService.removeAction(moduleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
      queryClient.invalidateQueries({ queryKey: ["grouped-permissions"] });
    },
  });
}

export function useReorderModulesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: number[]) => moduleService.reorderModules(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
    },
  });
}
