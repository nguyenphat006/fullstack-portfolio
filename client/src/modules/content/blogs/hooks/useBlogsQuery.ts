"use client";

import { createCrudHooks } from "@/lib/api/createCrudHooks";
import { blogService } from "../services/blog.service";

export const BLOGS_QUERY_KEY = ["blogs"] as const;

const hooks = createCrudHooks(BLOGS_QUERY_KEY, blogService);

export const blogQueryKeys = hooks.keys;
export const useBlogsList = hooks.useList;
export const useBlogDetail = hooks.useDetail;
export const useCreateBlogMutation = hooks.useCreate;
export const useUpdateBlogMutation = hooks.useUpdate;
export const useDeleteBlogMutation = hooks.useDelete;
export const useBatchDeleteBlogsMutation = hooks.useBatchDelete;
export const useBatchStatusBlogsMutation = hooks.useBatchStatus;
