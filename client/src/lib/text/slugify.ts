/** "Hệ thống Trường Song Ngữ Lạc Hồng" -> "he-thong-truong-song-ngu-lac-hong" (bỏ dấu tiếng Việt, chỉ a-z 0-9 và "-"). */
export function slugify(value: string, maxLength = 150): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}
