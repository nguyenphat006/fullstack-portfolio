/**
 * Gộp className + loại trùng lớp Tailwind — dùng chung gói `cn` của shadcn/ui
 * (component trong components/ui import thẳng từ "cn"; code dự án import từ đây).
 */
export { cn, type ClassValue } from "cn";

/** Rút gọn đoạn văn về câu đầu tiên (dùng ở landing). */
export function shortSentence(text: string) {
  const clean = text.trim();
  if (!clean) return "";

  const first = clean
    .split(".")
    .map((part) => part.trim())
    .find(Boolean);

  if (!first || !clean.includes(".")) return clean;

  return `${first}.`;
}
