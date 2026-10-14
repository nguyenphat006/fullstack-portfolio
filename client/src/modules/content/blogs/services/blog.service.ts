import { http } from "@/lib/api/axiosClient";
import { createCrudService } from "@/lib/api/crud";
import type { BlogCreateInput, BlogFilters, BlogItem, BlogUpdateInput } from "../types";

/** CRUD + statistics + batch actions chuẩn cho `/blogs/` (BaseERPViewSet). Endpoint riêng: thêm bằng http.get/post. */
export const blogService = {
  ...createCrudService<
  BlogItem,
  BlogCreateInput,
  BlogUpdateInput,
  BlogFilters
>("/blogs/"),
  /** Tải ảnh / video (ảnh đại diện, chèn vào nội dung Markdown) -> URL tệp */
  uploadMedia: async (file: File, kind: "image" | "video" = "image") => {
    const body = new FormData();
    body.append("file", file);
    const res = await http.post<{ image_url: string }>(`/blogs/upload-media/?kind=${kind}`, body);
    return res.image_url;
  },
};
