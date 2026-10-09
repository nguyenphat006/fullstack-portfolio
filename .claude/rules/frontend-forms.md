---
paths:
  - "client/src/**"
---

# Frontend — form, lỗi API, component UI, định dạng số

Stack: Tailwind v4 + shadcn/ui (Radix) + react-hook-form + lucide-react + sonner. Không dùng lại Ant Design.

## Tầng component
| Thư mục | Nội dung | Ghi chú |
|---|---|---|
| `@/components/ui` | Primitive shadcn (Button, Dialog, Sheet, Popover, Select, Checkbox, Tabs, Tooltip…) | Thêm bằng `npx shadcn@latest add <tên>`; hạn chế sửa tay |
| `@/components/controls` | `Combobox` (1/nhiều, gõ tìm ngay trên ô, ảnh / mã / badge, ảo hóa + cuộn vô hạn — xem mục "Ô chọn"), `TreeSelect`/`TreeChecklist`, `DateRangePicker` (ISO `[from, to]` + preset), `NumberInput` (theo `useNumberFormat`), `FileDropzone`, `ImageUpload` (ảnh NVL, logo… — xem trước + bỏ ảnh + kéo thả; `upload(file) => Promise<url>`, backend lưu bằng `apps/core/image_upload.save_uploaded_image`, chỉ ảnh raster trừ khi thật cần SVG) | Control không phụ thuộc form |
| `@/components/form` | `FormDialog`, `FormSection`, `FieldShell`, `TextField`, `TextareaField`, `NumberField`, `SwitchField`, `SelectField` (≤ 7 lựa chọn), `ComboboxField`, `TreeSelectField`, `EntityComboField` | Bọc control bằng `useController` |
| `@/components/feedback` | `useConfirm()` (Promise<boolean>, `onConfirm` giữ trạng thái đang xử lý), `Spinner` | |

- Biểu tượng: `lucide-react`; trong Button để icon tự co (`<Pencil />`), ngoài Button đặt `className="size-4"`.
- Gộp class: `cn` từ `@/lib/utils` (xem bẫy ở `frontend-architecture.md`).

## Form modal chuẩn (mẫu `units/components/UnitFormModal.tsx`)
```tsx
const form = useForm<FormValues>({ defaultValues: EMPTY });
useEffect(() => { if (open) form.reset(editing ? toValues(editing) : EMPTY); }, [open, editing, form]);
<FormDialog open={open} onClose={onCancel} title={editing ? `Sửa … ${editing.code}` : "Thêm …"} size="sm" form={form}
  submitText={editing ? "Lưu thay đổi" : "Thêm …"} onSubmit={(v) => onSubmit(toPayload(v))}>
  <TextField<FormValues> name="code" label="Mã" disabled={!!editing} transform={(v) => v.toUpperCase()}
    rules={{ required: editing ? false : "Nhập mã", pattern: { value: /^[A-Z0-9_]+$/, message: "…" } }} />
  <SwitchField<FormValues> name="is_active" label="Trạng thái" onText="Hoạt động" offText="Tạm ngưng" />
</FormDialog>
```
- `FormDialog` lo: nút Lưu/Hủy + trạng thái gửi, hỏi "Bỏ thay đổi chưa lưu?" khi đóng lúc form `isDirty` (kể cả Esc / bấm ra ngoài), thân form cuộn trong hộp (cao tối đa `100vh - 80px`), `readOnly` khi thiếu quyền. Kích thước `sm` 480 · `md` 640 · `lg` 880 · `xl` 1040.
- View `onSubmit` **ném lỗi lại**; `FormDialog` gọi `applyServerErrors(form, error)` gắn `errors` backend vào từng ô, không gắn được thì `toast.error(extractErrorMessage(...))`. Không tự viết try/catch trong FormModal.
- Nhiều trường → `<FormSection>` (lưới 2 cột, 1 cột trên mobile; ô cả hàng `className="form-section__full"`). Không dựng lưới tay.
- Form inline (ngoài hộp thoại, vd. Cấu hình hệ thống, Hồ sơ): `FormProvider` + `<form onSubmit={form.handleSubmit(...)}>` + các trường trên; lỗi server tự gọi `applyServerErrors`.
- Trường tùy biến (ảnh, nhóm checkbox…): `useController` + bọc trong `FieldShell` để có nhãn / gợi ý / lỗi đồng nhất.
- `required` trên mảng rỗng (chọn nhiều) được react-hook-form coi là thiếu → dùng được cho `ComboboxField multiple`.

## Bắt lỗi API
- Mọi `catch` dùng helper trong `@/lib/api/errorUtils` — không đọc `error.response.data.*`, không viết lại cục bộ:
  - `extractErrorMessage(error, "fallback")` → luôn là string (an toàn cho `toast.error`).
  - `getErrorCode(error)` → rẽ nhánh theo `code` (`validation_error`, `business_rule`, `not_found`...).
  - Form react-hook-form: `applyServerErrors(form, error)` (`@/lib/api/formErrors`).
- Thông báo: `import { toast } from "sonner"` → `toast.success/error/warning/info`. Batch có `res.data.skipped?.length` → `toast.warning(res.message)`.
- Xác nhận: thao tác nguy hiểm dùng `useConfirm()` (`danger: true`) hoặc `<DeleteConfirm onConfirm>` (nút thùng rác mặc định); `ListPage` / `DetailPage` đã có sẵn cho xóa.

## Chọn thực thể động
`EntityComboField` (`queryKey`, `fetchPage`, `toOption`, `initialOptions`) cho ĐVT, người dùng, khách hàng…: tìm ở server (debounce 300ms), tải thêm khi cuộn, chỉ gọi API khi mở; `initialOptions` cho giá trị đang có khi sửa. Không tải toàn bộ danh mục vào `options`.

## Tạo mới / chỉnh sửa: Modal hay trang riêng
- Modal (`FormDialog`): master data & thực thể gọn (< ~12 trường, 1 bước) — Users, Roles, Units, Categories, Suppliers.
- Trang riêng `/[module]/new`, `/[module]/[id]/edit`: chứng từ phức hợp có wizard, bảng dòng con, cây BOM — WorkOrders, BOM Builder.
- Sửa ngay trong trang chi tiết (theo khối / tab): hồ sơ nhiều tab — xem bảng "cách sửa" trong `frontend-detail-views.md`.

## Quốc gia
- Lưu **mã ISO 3166-1 alpha-2** (`US`, `SE`, `VN`), không lưu tên. Danh sách 249 mã ở `client/src/lib/countries.ts` = `server/apps/core/countries.py` (backend kiểm tra mã hợp lệ). Không tạo bảng quốc gia.
- Tên theo ngôn ngữ: `Intl.DisplayNames` qua `countryName(code, locale)` / hook `useCountryName()`; cờ: `<CountryFlag code />` (thư viện `flag-icons`, SVG trong gói — không dùng emoji cờ vì Windows hiện thành chữ).
- Form: `<CountryField name="country" />` (`@/components/form`); bộ lọc / Combobox: `useCountryOptions()` (cờ + tên + mã, sắp theo tên). Lọc cột: `filter: { type: "multiSelect", options: countryOptions }` + backend `'country': ['exact', 'in']`.

## Định dạng số (`useNumberFormat()` từ `NumberFormatProvider`)
- Cấu hình người dùng lưu `localStorage` key `app_number_format_settings`; chưa chọn thì theo Cấu hình hệ thống (mặc định quốc tế `1,250,000.50`, tùy chọn VN `1.250.000,50`). Không tự format bằng `toLocaleString` rải rác.
- Helper: `formatDimension` (mm, 2 số lẻ) · `formatWeight` (kg, 3) · `formatVolume` (m²/m³/lít/định mức, 4) · `formatPercent` (1) · `formatCurrency` (VNĐ, 0).
- Ô nhập số / tiền: `NumberField` (hoặc `NumberInput` ngoài form) — đã theo định dạng người dùng, có `suffix` đơn vị.

## Ô chọn `Combobox` (chuẩn chung cho mọi select picker, chốt 2026-10-03)
- **Gõ tìm ngay trên ô** (không mở popup rồi mới tìm), không dấu, tìm cả theo `code`; ↑ ↓ Enter Esc (Esc không đóng Dialog), Backspace xóa giá trị cuối; chọn nhiều hiện chip.
- Lựa chọn `ComboOption`: `label` + tùy chọn `image` (thumbnail) / `icon`, `code` (monospace bên phải), `description` (dòng phụ), `badge` (vd. `StatusBadge`); bố cục khác hẳn → `renderOption`. Không ghép mã vào nhãn kiểu `"Tên (MÃ)"` — dùng `code`.
- `inline`: danh sách luôn hiện dưới ô tìm (không thả xuống) — chỉ dùng cho popover lọc theo cột; Esc không bị chặn để đóng popover cha.
- Hiệu năng: danh sách ảo hóa (`@tanstack/react-virtual`), lọc tại chỗ dùng chỉ mục chuẩn hóa sẵn + `useDeferredValue`.
- Dữ liệu từ server: hook chung `useEntityOptions(source)` (`@/components/controls/useEntityOptions`: `queryKey`, `fetchPage`, `toOption`, `initialOptions`) — tìm ở server (debounce 300ms), **cuộn vô hạn** theo trang, chỉ gọi API khi mở. Form dùng `EntityComboField`; bộ lọc cột dùng `filter: { type: "remote", source: remoteSource({...}) }`. `fetchOptions` chỉ cho danh mục nhỏ trả hết một lần.
