import { createCrudService } from "@/lib/api/crud";
import type { __Entity__CreateInput, __Entity__Filters, __Entity__Item, __Entity__UpdateInput } from "../types";

/** CRUD + statistics + batch actions chuẩn cho `__RESOURCE__` (BaseERPViewSet). Endpoint riêng: thêm bằng http.get/post. */
export const __entity__Service = createCrudService<
  __Entity__Item,
  __Entity__CreateInput,
  __Entity__UpdateInput,
  __Entity__Filters
>("__RESOURCE__");
