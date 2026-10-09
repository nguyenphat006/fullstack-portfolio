---
description: "Quy chuẩn Kiến trúc Frontend Next.js 16, Feature-Driven Modules, React Query & Core Layout"
globs: ["client/**/*"]
always_apply: true
---

# 🏗️ QUY CHUẨN KIẾN TRÚC FRONTEND (NEXT.JS 16 + SHADCN/UI)

## 1. Kiến trúc Feature-Driven Modules (`client/src/modules/`)
- **TUYỆT ĐỐI KHÔNG** viết logic nghiệp vụ, bảng dữ liệu, form modal trực tiếp trong `src/app/`.
- `src/app/` chỉ chứa các file `page.tsx` mỏng (Thin Router Wrapper) để khai báo metadata và render View từ `src/modules/`.
- Mỗi phân hệ chức năng bắt buộc phải đóng gói thành một Module hoàn chỉnh:
  ```text
  src/modules/<feature_name>/
  ├── types.ts              # Kiểu dữ liệu TypeScript riêng của module
  ├── services/             # Hàm gọi API qua axiosClient (ví dụ: product.service.ts)
  ├── hooks/                # Custom hooks / TanStack Query (useProductsQuery, useProductMutations)
  ├── components/           # Component con nội bộ (FormModal dùng FormDialog, tab nghiệp vụ)
  ├── <Feature>View.tsx     # Màn hình chính ráp nối các component lại
  └── index.ts              # Barrel export ra bên ngoài
  ```

---

## 2. Quản lý Dữ liệu & Cache với TanStack React Query
- **Query Keys:** Bắt buộc có namespace chuẩn: `['products', params]`, `['materials']`, `['bom_tree', variantId]`.
- **Cache Invalidation:** Mọi thao tác thêm/sửa/xóa qua `useMutation` **bắt buộc** phải gọi `queryClient.invalidateQueries({ queryKey: [...] })` để UI tự động làm mới dữ liệu mới nhất mà không cần reload trang. Nhật ký (`["audit-logs"]`) được `MutationCache` trong `QueryProvider` tự invalidate sau mọi mutation thành công — không tự gọi lại trong từng hook.

---

## 2b. Lớp API Chuẩn (`src/lib/api/`) & Factory CRUD
- `axiosClient` **tự bóc envelope** `{success, message, data}` → service nhận thẳng `data`. **Cấm** viết `res.data || res`, `(res as any)?.data?.results`, `Array.isArray(res) ? ...`.
- Service dùng `http.get/post/put/patch/delete<T>()` (có kiểu); cần `message` của server → `http.envelope.post<T>()`.
- Module CRUD dùng factory, chỉ viết thêm endpoint riêng:
  ```ts
  export const unitService = createCrudService<UnitItem, UnitCreateInput, UnitUpdateInput, UnitFilters>("/units/");
  export const UNITS_QUERY_KEY = ["units"] as const;
  const unitHooks = createCrudHooks(UNITS_QUERY_KEY, unitService);
  export const useUnitsList = unitHooks.useList;   // useDetail, useCreate, useUpdate, useDelete, useBatchDelete, useBatchStatus...
  ```
- Kiểu entity sinh từ OpenAPI: `npm run gen:api` → dùng `Schemas["UnitOfMeasure"]` (mẫu `modules/master-data/units/types.ts`).
- API danh sách luôn **phân trang**: danh mục nhỏ cần toàn bộ → `params: { page_size: 100 }` + `.results`.
- Module mẫu: `modules/master-data/units` (danh sách), `modules/master-data/materials` (có trang chi tiết).

---

## 3. Component dùng chung
- `<PageHeader />`: `title` / `subtitle` **BẮT BUỘC** lấy từ `ModuleRegistries` qua `useModuleHeader(MODULE_CODE)`, không set cứng chuỗi (breadcrumb do Topbar lo).
- Trang danh sách `ListPage` (`@/components/list`, xem 02c), trang chi tiết `DetailPage` (`@/components/detail`, xem 02d).
- `@/components/common`: `StatusBadge` (+ `defineStatusMap`), `EmptyState`, `StatusPage`, `DeleteConfirm`, `ExportConfigModal` (qua `useExcelExport`), `ExcelImportModal`, `DetailAttachmentsTab`, `NumberFormatModal`.
- Form, control (`Combobox`, `TreeSelect`, `DateRangePicker`, `NumberInput`, `FileDropzone`), primitive shadcn, `useConfirm`: xem 02b.
- Bảng phụ nhỏ (vai trò, phân hệ, tệp đính kèm): tự dựng `<table className="dt">` trong `.dt-scroll` — không có DataTable chung.

---

## 4. Chống Vòng Lặp Vô Hạn Gọi API trong Modal / Components (Zero Infinite API Loops)
- **Tuyệt đối KHÔNG sử dụng `useEffect` kết hợp `useCallback` với default array prop (`prop = []`):**
  - Khai báo giá trị mặc định dạng mảng (`propColumns = []`) sẽ sinh ra một địa chỉ tham chiếu object/array mới ở mỗi lần Component render. Nếu truyền mảng này vào `deps` của `useCallback` hay `useEffect`, nó sẽ kích hoạt fetch API liên tục không ngừng (vòng lặp vô hạn HTTP N+1).
- **Bắt buộc dùng TanStack React Query (`useQuery`):**
  - Mọi API tải metadata hoặc dữ liệu động trong Modal (như `columnsUrl`) phải được bọc bằng `useQuery` kèm `staleTime` (tối thiểu 5 phút) và `enabled: open && !!url`.
  - Nhờ cơ chế Deduplication và Cache của TanStack Query, API chỉ được gọi đúng 1 lần duy nhất, ngăn chặn triệt để tình trạng re-fetch liên tục khi Component re-render.
- **Không `setState` trong `useEffect`** (ESLint `react-hooks/set-state-in-effect`): đồng bộ state theo dữ liệu → cập nhật trong render (`if (source !== data) { setSource(data); setRows(...) }`, mẫu `settings/components/ModuleTable.tsx`); cờ "đã mount" → `useMounted()`. Giá trị mặc định rỗng của query là hằng số cấp module (`const NO_ROWS: T[] = []`), **không** `const { data = [] } = useQuery()`.

---

## 5. Layout (`components/layouts/DashboardLayout.tsx`)
- Sidebar desktop cố định `sticky top-0 h-screen` (`AppSidebar`, logo cao 64px, menu cuộn nội bộ `.sidebar-scrollable-menu`); mobile mở bằng `Sheet`.
- Topbar dính: breadcrumb (từ cây menu), chuông thông báo, menu tài khoản. Không phá cấu trúc này khi sửa layout.
- Tìm kiếm toàn cục: ô tìm cố định đầu sidebar (dưới tên dự án) + Ctrl K mở `CommandPalette` (màn hình theo menu đã lọc quyền + bản ghi theo mã / tên từ `/search/` + lịch sử gần đây theo người dùng). Không đặt ô tìm riêng ở topbar / từng trang. Chi tiết: `docs/GLOBAL_SEARCH.md`.

---

## 5b. Phân quyền giao diện (gate quyền)
- API là lớp bảo mật; UI chỉ ẩn thao tác không có quyền để trải nghiệm khớp backend.
- `RouteGuard` (trong `DashboardLayout`) chỉ cho vào route có trong cây menu; URL khác → trang 403. Trang chung cho mọi user → `ALWAYS_ALLOWED`.
- View quyết định quyền, component con chỉ hiển thị: truyền handler khi có quyền (`onEdit={can(PERMISSIONS.USER.UPDATE) ? handleEdit : undefined}`), component render nút khi có handler. Nếu dùng prop `canUpdate` / `canDelete` thì View **phải truyền**, không dựa vào mặc định `true`.
- Checklist: tạo · sửa · xóa · hàng loạt · xuất · nhập · kéo thả · tệp đính kèm (`readonly`) · tab nhật ký (`AUDIT_LOGS_READ`) · checkbox ma trận (`disabled`).

## 6. Giao diện sáng / tối (theme)
- Màu: ưu tiên lớp Tailwind theo token shadcn (`text-foreground`, `text-muted-foreground`, `bg-background`, `border`…, trỏ về `--c-*`); cần màu riêng dùng biến CSS `var(--c-*)` định nghĩa ở `src/app/globals.css` (có giá trị cho cả 2 chế độ): `--c-text`, `--c-text-2`, `--c-text-secondary`, `--c-text-tertiary`, `--c-surface`, `--c-layout`, `--c-bg-subtle`, `--c-bg-muted`, `--c-table-head` (nền hàng tiêu đề bảng), `--c-sider-*` (sidebar tối: nền, chữ, hover, mục đang mở), `--c-border`, `--c-border-strong`, `--c-primary`, `--c-primary-bg`, `--c-success(-bg)`, `--c-warning(-bg)`, `--c-error(-bg)`, `--c-info(-bg)`, `--c-purple(-bg)`, `--c-brand-gradient`.
- **Không** viết mã hex cứng cho nền / chữ / viền (sai màu ở chế độ tối). Ngoại lệ có chủ đích: sidebar tối, khối nền thương hiệu chữ trắng (gradient cố định), thuộc tính SVG `fill`.
- Khối nền màu có chữ trắng: **không** dùng biến màu chữ (`--c-text`) trong gradient — biến này đổi sang màu sáng ở chế độ tối.
- Badge trạng thái: `StatusBadge` 6 tông (`success` `info` `warning` `error` `neutral` `accent`), khai báo `defineStatusMap({ CODE: { label, tone } })`, dùng chung cho options bộ lọc (`statusOptions`). "Tạm ngưng" là xám, không đỏ. Mã bản ghi hiển thị `CodeText` monospace, không dùng badge màu.
- Chế độ lưu ở `useThemeStore` (gán `data-theme` trên `<html>`, biến thể `dark:` của Tailwind khớp `[data-theme=dark]`). CSS tự viết nằm trong `@layer components` để lớp tiện ích Tailwind ghi đè được.
- Tên / logo / nhận diện ứng dụng lấy qua `useSystemSettings()` (Cài đặt → "Cấu hình hệ thống"); `APP_CONFIG` (`src/config/app.ts`) chỉ là giá trị dự phòng + metadata tĩnh. Tiêu đề trang chỉ khai `metadata.title = "Tên trang"` (layout gốc tự thêm hậu tố).
- Trạng thái đọc từ `localStorage` (user, theme) chỉ dùng sau khi mount (`useMounted()`) — lần render đầu ở client phải giống server (tránh hydration mismatch).
