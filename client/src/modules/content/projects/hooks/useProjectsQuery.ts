"use client";

import { createCrudHooks } from "@/lib/api/createCrudHooks";
import { projectService } from "../services/project.service";

export const PROJECTS_QUERY_KEY = ["projects"] as const;

const hooks = createCrudHooks(PROJECTS_QUERY_KEY, projectService);

export const projectQueryKeys = hooks.keys;
export const useProjectsList = hooks.useList;
export const useProjectDetail = hooks.useDetail;
export const useCreateProjectMutation = hooks.useCreate;
export const useUpdateProjectMutation = hooks.useUpdate;
export const useDeleteProjectMutation = hooks.useDelete;
export const useBatchDeleteProjectsMutation = hooks.useBatchDelete;
export const useBatchStatusProjectsMutation = hooks.useBatchStatus;
