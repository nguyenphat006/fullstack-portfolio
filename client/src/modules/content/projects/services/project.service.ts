import { createCrudService } from "@/lib/api/crud";
import type { ProjectCreateInput, ProjectFilters, ProjectItem, ProjectUpdateInput } from "../types";

/** CRUD + statistics + batch actions chuẩn cho `/projects/` (BaseERPViewSet). Endpoint riêng: thêm bằng http.get/post. */
export const projectService = createCrudService<
  ProjectItem,
  ProjectCreateInput,
  ProjectUpdateInput,
  ProjectFilters
>("/projects/");
