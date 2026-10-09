"use client";

import { createCrudHooks } from "@/lib/api/createCrudHooks";
import { __entity__Service } from "../services/__entity__.service";

export const __ENTITIES_KEY___QUERY_KEY = ["__entities__"] as const;

const hooks = createCrudHooks(__ENTITIES_KEY___QUERY_KEY, __entity__Service);

export const __entity__QueryKeys = hooks.keys;
export const use__Entities__List = hooks.useList;
export const use__Entity__Detail = hooks.useDetail;
export const useCreate__Entity__Mutation = hooks.useCreate;
export const useUpdate__Entity__Mutation = hooks.useUpdate;
export const useDelete__Entity__Mutation = hooks.useDelete;
export const useBatchDelete__Entities__Mutation = hooks.useBatchDelete;
export const useBatchStatus__Entities__Mutation = hooks.useBatchStatus;
