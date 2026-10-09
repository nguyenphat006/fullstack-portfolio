---
description: "Đa ngôn ngữ vi / en với next-intl: tệp chữ theo namespace, khóa có kiểm tra kiểu, cookie NEXT_LOCALE, Accept-Language"
globs: ["client/**/*"]
always_apply: true
---

# Frontend — đa ngôn ngữ (vi / en) với next-intl

Tiếng Việt là ngôn ngữ mặc định và là **nguồn chuẩn** của chữ. Không có chữ hiển thị viết cứng trong `.tsx` / `.ts` (trừ comment, log).
Mẫu: `modules/master-data/units` (View, FormModal, page), `components/layouts/DashboardLayout.tsx`.

## Tổ chức
- Chữ ở `client/messages/<vi|en>/<namespace>.json`, mỗi namespace một tệp (`index.ts` gom lại). Thêm namespace mới → tạo tệp ở **cả hai** ngôn ngữ + thêm dòng import vào cả hai `index.ts`.
- Namespace: `common` (từ dùng chung: `actions.*`, `status.*`, `fields.*`, `messages.*`, `language.*`), `validation`, `meta`, `layout`, `list`, `detail`, `form`, `auth`, `errors`, mỗi module một namespace (`units`, `materials`, `users`, `settings`…).
- Ngôn ngữ lưu ở cookie `NEXT_LOCALE` (không tiền tố URL); đổi bằng `useChangeLocale()` (`@/i18n/useChangeLocale`). `axiosClient` gửi `Accept-Language` → backend trả thông báo, lỗi, tên menu theo ngôn ngữ đó.
- Khóa được kiểm tra kiểu theo tệp `vi` (`src/i18n/global.d.ts`): gõ sai khóa → `tsc` báo lỗi. `npm run i18n:check` so khớp khóa `vi` ↔ `en` (CI chạy).

## Dùng trong code
```tsx
const t = useTranslations("units");      // namespace của module
const tc = useTranslations("common");    // từ dùng chung
t("form.editTitle", { code })            // tham số ICU: "Sửa đơn vị tính {code}"
```
- Server component / `page.tsx`: `const t = await getTranslations("units")`; tiêu đề trang dùng `generateMetadata` → `t("pageTitle")`.
- Hằng số khai báo ngoài component (bản đồ trạng thái, options, cấu hình cột tĩnh): lưu **khóa đầy đủ** kiểu `MessageKey` (`@/i18n/types`, vd `"common.status.active"`), dịch lúc render bằng `useTranslations()` (không namespace). `defineStatusMap({ X: { label: "auditLogs.actions.create", tone } })`; options bộ lọc: `statusOptions(MAP, t)`.
- Cột bảng (`defineColumns`) tạo trong `useMemo` → thêm `t` vào deps.
- Thông điệp ghép: dùng tham số, không nối chuỗi: `tc("messages.deleteTitle", { entity: t("entity"), name })`. Số nhiều: ICU `{count, plural, one {…} other {…}}` (tiếng Anh).
- Xác nhận hàng loạt: `confirm.title: (n) => tc("messages.bulkDeleteTitle", { count: n, entity: t("entity") })`.
- Dấu `{` `}` `'` trong câu là cú pháp ICU — cần chữ `{` thật thì viết `'{'`.
- Chữ từ backend (menu, thông báo lỗi, `message` của API, nhãn `*_display`) đã theo ngôn ngữ — hiển thị thẳng, không dịch lại. Dữ liệu người dùng nhập (tên NVL, mô tả…) không dịch.
- Ngày giờ / số: định dạng số theo `useNumberFormat()` (không đổi theo ngôn ngữ); ngày tương đối dùng `RelativeTime` (đã theo ngôn ngữ).

## Viết chữ
- `vi` viết hoa chữ đầu câu, ngắn, động từ rõ (như `frontend-ux.md`); `en` sentence case ("Add unit of measure"), không viết hoa mọi từ.
- Khóa camelCase theo ý nghĩa (`form.createTitle`, `bulkDeleteHint`), không theo nội dung câu. Không lặp lại khóa đã có trong `common`.
