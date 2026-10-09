import { createCrudService } from "@/lib/api/crud";
import type { BlogCreateInput, BlogFilters, BlogItem, BlogUpdateInput } from "../types";

/** CRUD + statistics + batch actions chuẩn cho `/blogs/` (BaseERPViewSet). Endpoint riêng: thêm bằng http.get/post. */
export const blogService = createCrudService<
  BlogItem,
  BlogCreateInput,
  BlogUpdateInput,
  BlogFilters
>("/blogs/");
