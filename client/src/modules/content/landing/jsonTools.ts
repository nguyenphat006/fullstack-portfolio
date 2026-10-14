/** Tiện ích cho trình sửa nội dung JSON của CMS landing. */

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };

/** Khóa không phụ thuộc ngôn ngữ: sửa ở tab Tiếng Việt, tự chép sang bản tiếng Anh khi lưu */
export const NEUTRAL_KEYS = new Set(["id", "logo", "avatar", "image", "thumbnail", "websiteUrl", "url", "href", "iconName", "email", "value"]);
/** Khóa là ảnh -> ô tải ảnh */
export const IMAGE_KEYS = new Set(["logo", "avatar", "image", "thumbnail"]);
/** Khóa là chữ dài -> ô nhiều dòng */
export const LONG_TEXT = /(description|content|subtext|body|excerpt|summary|introBody)$/i;

export const isObject = (v: unknown): v is JsonObject => typeof v === "object" && v !== null && !Array.isArray(v);

/** Bản sao rỗng của một phần tử (để thêm mục mới vào danh sách) */
export function blankLike(value: Json): Json {
  if (typeof value === "string") return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return [];
  if (isObject(value)) {
    const out: JsonObject = {};
    for (const [k, v] of Object.entries(value)) out[k] = k === "id" ? `item-${Date.now().toString(36)}` : blankLike(v);
    return out;
  }
  return null;
}

/** Bản tiếng Anh theo đúng cấu trúc tiếng Việt: chép khóa trung lập + mục còn thiếu từ bản tiếng Việt */
export function syncNeutral(vi: Json, en: Json | undefined): Json {
  if (Array.isArray(vi)) {
    const enList = Array.isArray(en) ? en : [];
    return vi.map((item, i) => syncNeutral(item, enList[i]));
  }
  if (isObject(vi)) {
    const enObj = isObject(en) ? en : {};
    const out: JsonObject = {};
    for (const [k, v] of Object.entries(vi)) {
      out[k] = NEUTRAL_KEYS.has(k) && !isObject(v) && !Array.isArray(v) ? v : syncNeutral(v, enObj[k]);
    }
    return out;
  }
  return en === undefined || en === null || en === "" ? vi : en;
}

/** Danh sách chuỗi cần dịch: [đường dẫn, chữ tiếng Việt] (bỏ khóa trung lập, chuỗi rỗng, URL) */
export function collectTexts(value: Json, path: (string | number)[] = [], out: [string, string][] = []): [string, string][] {
  if (typeof value === "string") {
    const key = String(path[path.length - 1] ?? "");
    if (value.trim() && !NEUTRAL_KEYS.has(key) && !/^(https?:|mailto:|\/|#)/.test(value)) out.push([JSON.stringify(path), value]);
  } else if (Array.isArray(value)) value.forEach((v, i) => collectTexts(v, [...path, i], out));
  else if (isObject(value)) Object.entries(value).forEach(([k, v]) => collectTexts(v, [...path, k], out));
  return out;
}

/** Ghi giá trị vào đường dẫn (trả bản sao mới) */
export function setAt(root: Json, path: (string | number)[], value: Json): Json {
  if (!path.length) return value;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const copy = [...root];
    copy[head as number] = setAt(copy[head as number] ?? null, rest, value);
    return copy;
  }
  const obj = isObject(root) ? root : {};
  return { ...obj, [head]: setAt(obj[head as string] ?? null, rest, value) };
}

/** "websiteUrl" -> "Website url" (nhãn dự phòng khi chưa có bản dịch) */
export const humanize = (key: string) =>
  key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/^./, (c) => c.toUpperCase());
