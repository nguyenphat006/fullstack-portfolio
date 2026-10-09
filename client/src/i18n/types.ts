import type { MessageKeys, Messages, NestedKeyOf } from "next-intl";

/**
 * Khóa chữ đầy đủ tính từ gốc, vd "common.status.active".
 * Dùng cho hằng số khai báo ngoài component (bản đồ trạng thái, options…): lưu KHÓA, dịch lúc render
 * bằng `useTranslations()` (không namespace) -> `t(key)`.
 */
export type MessageKey = MessageKeys<Messages, NestedKeyOf<Messages>>;
