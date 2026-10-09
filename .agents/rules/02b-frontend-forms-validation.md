---
description: "Quy chuẩn Form (react-hook-form + FormDialog), component shadcn/ui, bắt lỗi API & định dạng số liệu"
globs: ["client/**/*"]
always_apply: true
---

# 📝 QUY CHUẨN FORM, COMPONENT UI & VALIDATION (shadcn/ui + react-hook-form)

Stack: Tailwind CSS v4 + shadcn/ui (Radix) + react-hook-form + lucide-react + sonner. Dự án **không** còn dùng Ant Design.

## 1. Tầng component
- `@/components/ui` — primitive shadcn (Button, Dialog, Sheet, Popover, Select, Checkbox, Tabs, Tooltip…). Thêm bằng `npx shadcn@latest add <tên>`, hạn chế sửa tay.
- `@/components/controls` — `Combobox` (1/nhiều, gõ tìm ngay trên ô, ảnh / mã / badge, ảo hóa + cuộn vô hạn — xem mục "Ô chọn"), `TreeSelect` / `TreeChecklist`, `DateRangePicker` (ISO `[from, to]` + preset), `NumberInput` (theo `useNumberFormat`), `FileDropzone`, `ImageUpload` (ảnh NVL, logo… — xem trước + bỏ ảnh + kéo thả; `upload(file) => Promise<url>`, backend lưu bằng `apps/core/image_upload.save_uploaded_image`, chỉ ảnh raster trừ khi thật cần SVG).
- `@/components/form` — `FormDialog`, `FormSection`, `FieldShell`, `TextField`, `TextareaField`, `NumberField`, `SwitchField`, `SelectField` (≤ 7 lựa chọn), `ComboboxField`, `TreeSelectField`, `EntityComboField`.
- `@/components/feedback` — `useConfirm()` (trả `Promise<boolean>`; `onConfirm` giữ trạng thái "đang xử lý"), `Spinner`.
- Biểu tượng: `lucide-react`. Gộp class: `cn` từ `@/lib/utils`.

## 2. Form modal chuẩn (mẫu `modules/master-data/units/components/UnitFormModal.tsx`)
```tsx
const form = useForm<FormValues>({ defaultValues: EMPTY });
useEffect(() => { if (open) form.reset(editing ? toValues(editing) : EMPTY); }, [open, editing, form]);
<FormDialog open={open} onClose={onCancel} title={editing ? `Sửa … ${editing.code}` : "Thêm …"} size="sm" form={form}
  submitText={editing ? "Lưu thay đổi" : "Thêm …"} onSubmit={(v) => onSubmit(toPayload(v))}>
  <TextField<FormValues> name="name" label="Tên" rules={{ required: "Nhập tên", maxLength: { value: 100, message: "Tối đa 100 ký tự" } }} />
  <SwitchField<FormValues> name="is_active" label="Trạng thái" onText="Hoạt động" offText="Tạm ngưng" />
</FormDialog>
```
- `FormDialog` lo sẵn: nút Lưu/Hủy + trạng thái gửi, hỏi "Bỏ thay đổi chưa lưu?" khi đóng lúc `isDirty` (kể cả Esc / bấm ra ngoài), thân form cuộn trong hộp (cao tối đa `100vh - 80px`, header/footer cố định), `readOnly` khi thiếu quyền. Kích thước `sm` 480 · `md` 640 · `lg` 880 · `xl` 1040.
- View `onSubmit` **ném lỗi lại**; `FormDialog` gọi `applyServerErrors(form, error)` gắn lỗi backend vào từng ô, còn lại `toast.error(...)`. FormModal không tự try/catch.
- Nhiều trường → `<FormSection>` (lưới 2 cột, 1 cột trên mobile; ô cả hàng `className="form-section__full"`).
- Form inline (Cấu hình hệ thống, Hồ sơ): `FormProvider` + `<form onSubmit={form.handleSubmit(...)}>`; lỗi server tự gọi `applyServerErrors`.
- Trường tùy biến (ảnh, nhóm checkbox): `useController` + `FieldShell`.
- Chọn thực thể động (ĐVT, người dùng, khách hàng…): `EntityComboField` — tìm ở server (debounce), tải thêm khi cuộn, chỉ gọi API khi mở; `initialOptions` cho giá trị đang có khi sửa.

## 3. Bắt lỗi API & thông báo
- **BẮT BUỘC** dùng helper `@/lib/api/errorUtils` ở mọi `catch` (không đọc `error.response.data.*`, không `catch (err: any)`):
  - `extractErrorMessage(error, "fallback")` → luôn string (an toàn cho `toast.error`).
  - `extractErrorMessageAsync(error, "fallback")` → request tải file (`responseType: "blob"`).
  - `getErrorCode(error)` → rẽ nhánh theo `code`. Form: `applyServerErrors(form, error)` (`@/lib/api/formErrors`).
- Thông báo: `toast.success/error/warning/info` từ `sonner`. Không truyền object vào toast.
- Xác nhận thao tác nguy hiểm: `useConfirm()` (`danger: true`) hoặc `<DeleteConfirm onConfirm>`.

## 4. Định dạng số liệu (`NumberFormatProvider` & `useNumberFormat`)
- Cấu hình người dùng lưu `localStorage` (`app_number_format_settings`), đổi ở menu Avatar → `NumberFormatModal`; chưa chọn thì theo Cấu hình hệ thống.
  - Kiểu quốc tế (mặc định): `1,250,000.50` · Kiểu Việt Nam: `1.250.000,50`.
- Hiển thị: `formatDimension` (mm, 2 số lẻ) · `formatWeight` (kg, 3) · `formatVolume` (m²/m³/lít/định mức, 4) · `formatPercent` (1) · `formatCurrency` (VNĐ, 0). Không `toLocaleString` rải rác.
- Ô nhập số / tiền: `NumberField` (hoặc `NumberInput` ngoài form) — tự theo định dạng người dùng, có `suffix` đơn vị.

## 5. Modal hay trang riêng
- `FormDialog`: master data gọn (< ~12 trường, 1 bước) — Users, Roles, Units, Categories.
- Trang `/[module]/new`, `/[module]/[id]/edit`: chứng từ phức hợp (wizard, dòng con, cây BOM).
- Sửa ngay trong trang chi tiết (theo khối / tab): hồ sơ nhiều tab — xem bảng "cách sửa" trong `02d-frontend-detail-views.md`.

## Quốc gia
- Lưu **mã ISO 3166-1 alpha-2** (`US`, `SE`, `VN`), không lưu tên. Danh sách 249 mã ở `client/src/lib/countries.ts` = `server/apps/core/countries.py` (backend kiểm tra mã hợp lệ). Không tạo bảng quốc gia.
- Tên theo ngôn ngữ: `Intl.DisplayNames` qua `countryName(code, locale)` / hook `useCountryName()`; cờ: `<CountryFlag code />` (thư viện `flag-icons`, SVG trong gói — không dùng emoji cờ vì Windows hiện thành chữ).
- Form: `<CountryField name="country" />` (`@/components/form`); bộ lọc / Combobox: `useCountryOptions()` (cờ + tên + mã, sắp theo tên). Lọc cột: `filter: { type: "multiSelect", options: countryOptions }` + backend `'country': ['exact', 'in']`.

## Ô chọn `Combobox` (chuẩn chung cho mọi select picker, chốt 2026-10-03)
- **Gõ tìm ngay trên ô** (không mở popup rồi mới tìm), không dấu, tìm cả theo `code`; ↑ ↓ Enter Esc (Esc không đóng Dialog), Backspace xóa giá trị cuối; chọn nhiều hiện chip.
- Lựa chọn `ComboOption`: `label` + tùy chọn `image` (thumbnail) / `icon`, `code` (monospace bên phải), `description` (dòng phụ), `badge` (vd. `StatusBadge`); bố cục khác hẳn → `renderOption`. Không ghép mã vào nhãn kiểu `"Tên (MÃ)"` — dùng `code`.
- `inline`: danh sách luôn hiện dưới ô tìm (không thả xuống) — chỉ dùng cho popover lọc theo cột; Esc không bị chặn để đóng popover cha.
- Hiệu năng: danh sách ảo hóa (`@tanstack/react-virtual`), lọc tại chỗ dùng chỉ mục chuẩn hóa sẵn + `useDeferredValue`.
- Dữ liệu từ server: hook chung `useEntityOptions(source)` (`@/components/controls/useEntityOptions`: `queryKey`, `fetchPage`, `toOption`, `initialOptions`) — tìm ở server (debounce 300ms), **cuộn vô hạn** theo trang, chỉ gọi API khi mở. Form dùng `EntityComboField`; bộ lọc cột dùng `filter: { type: "remote", source: remoteSource({...}) }`. `fetchOptions` chỉ cho danh mục nhỏ trả hết một lần.
