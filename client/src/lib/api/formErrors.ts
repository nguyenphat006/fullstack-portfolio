import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { getFieldErrors } from "./errorUtils";

/**
 * Gắn lỗi theo trường từ backend (`errors: { field: [msg] }`) vào form react-hook-form.
 * Trả `true` nếu đã gắn được ít nhất 1 lỗi (nơi gọi không cần hiện toast chung nữa).
 */
export function applyServerErrors<T extends FieldValues>(form: UseFormReturn<T>, error: unknown): boolean {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return false;
  const known = new Set(Object.keys(form.getValues()));
  let applied = false;
  for (const [name, messages] of Object.entries(fieldErrors)) {
    if (!known.has(name)) continue;
    form.setError(name as Path<T>, { type: "server", message: messages.join(" ") }, { shouldFocus: !applied });
    applied = true;
  }
  return applied;
}
