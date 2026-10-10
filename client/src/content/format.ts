/** Điền biến vào chuỗi mẫu: fmt("Đọc bài {title}", { title: "A" }). Chuỗi (không phải hàm) để truyền qua RSC sang client. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}
