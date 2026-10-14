import { http } from "@/lib/api/axiosClient";
import { createCrudService } from "@/lib/api/crud";
import type { ProjectCreateInput, ProjectFilters, ProjectItem, ProjectUpdateInput } from "../types";

/** CRUD + statistics + batch actions chuẩn cho `/projects/` (BaseERPViewSet). Endpoint riêng: thêm bằng http.get/post. */
export const projectService = {
  ...createCrudService<
  ProjectItem,
  ProjectCreateInput,
  ProjectUpdateInput,
  ProjectFilters
>("/projects/"),
  /** Tải ảnh / video (ảnh đại diện, chèn vào nội dung Markdown) -> URL tệp */
  uploadMedia: async (file: File, kind: "image" | "video" = "image") => {
    const body = new FormData();
    body.append("file", file);
    const res = await http.post<{ image_url: string }>(`/projects/upload-media/?kind=${kind}`, body);
    return res.image_url;
  },
};
