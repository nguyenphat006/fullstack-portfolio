/** Bỏ dấu tiếng Việt + chữ thường để tìm kiếm không phân biệt dấu ("Nguyên vật liệu" ~ "nguyen vat lieu"). */
export function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
