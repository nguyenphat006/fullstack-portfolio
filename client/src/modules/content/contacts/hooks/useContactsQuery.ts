"use client";

import { createCrudHooks } from "@/lib/api/createCrudHooks";
import { contactService } from "../services/contact.service";

export const CONTACTS_QUERY_KEY = ["contacts"] as const;

const hooks = createCrudHooks(CONTACTS_QUERY_KEY, contactService);

export const contactQueryKeys = hooks.keys;
export const useContactsList = hooks.useList;
export const useContactDetail = hooks.useDetail;
export const useCreateContactMutation = hooks.useCreate;
export const useUpdateContactMutation = hooks.useUpdate;
export const useDeleteContactMutation = hooks.useDelete;
export const useBatchDeleteContactsMutation = hooks.useBatchDelete;
export const useBatchStatusContactsMutation = hooks.useBatchStatus;
