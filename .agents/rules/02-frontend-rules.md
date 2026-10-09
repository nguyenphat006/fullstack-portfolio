---
description: "Mục lục & Chỉ dẫn Quy chuẩn Frontend Next.js 16 + Tailwind v4 + shadcn/ui (tách thành các rules chuyên biệt)"
globs: ["client/**/*"]
always_apply: true
---

# 🎨 MỤC LỤC QUY CHUẨN FRONTEND (NEXT.JS 16 + SHADCN/UI)

> Quy chuẩn chi tiết chia thành các file chuyên biệt dưới đây. Lỗi đã gặp: `06-known-pitfalls.md` mục 2.

### 1. 🏗️ [02a. Kiến trúc Frontend & TanStack Query](02a-frontend-architecture.md)
- Feature module `src/modules/<feature>/`; `src/app/` chỉ là route mỏng.
- Lớp API `http<T>` + factory `createCrudService` / `createCrudHooks`; invalidate cache sau mutate.
- Component dùng chung, layout (sidebar sticky, Sheet trên mobile), theme sáng / tối qua biến `--c-*`.

### 2. 📝 [02b. Form, component UI & validation](02b-frontend-forms-validation.md)
- Tầng `ui` (shadcn) → `controls` → `form` (react-hook-form + `FormDialog`) → `feedback` (`useConfirm`).
- Lỗi API qua `errorUtils` + `applyServerErrors`; thông báo `toast` (sonner); định dạng số `useNumberFormat`.

### 3. 📊 [02c. Trang danh sách ListPage](02c-frontend-tables-data.md)
- Khai báo cột (`defineColumns`: sắp xếp, lọc theo kiểu cột, ghim, ẩn, co giãn), `rowActions`, `bulkActions`, xuất/nhập Excel. Không MetricCards, không thùng rác.

### 4. 🏛️ [02d. Trang chi tiết DetailPage](02d-frontend-detail-views.md)
- Hero 2 tầng, tab trên `?tab=`, tab "Tệp đính kèm" / "Nhật ký" dùng chung, không lặp dữ liệu.

### 5. ✨ [02e. UI/UX gọn gàng & tải dữ liệu tiết kiệm](02e-frontend-ux.md)

## Kiểm tra bắt buộc
`npx tsc --noEmit` → `npm run lint -- --max-warnings=0` → `npm run build` (0 lỗi, 0 cảnh báo). CI chạy đúng các lệnh này.
