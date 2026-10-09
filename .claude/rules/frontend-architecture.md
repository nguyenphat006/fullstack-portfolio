---
paths:
  - "client/**"
---

# Frontend — kiến trúc Next.js 16 + TanStack Query + shadcn/ui

## Feature module (`client/src/modules/<feature>/`)
`src/app/**/page.tsx` chỉ là wrapper mỏng: khai báo `metadata` và render View. Không đặt bảng, form, logic nghiệp vụ trong `src/app/`.

```text
src/modules/<feature>/            # nhóm được: modules/master-data/units/
├── types.ts                      # kiểu dữ liệu khớp serializer backend
├── services/<entity>.service.ts  # gọi API qua axiosClient
├── hooks/use<Entity>Query.ts     # useQuery / useMutation
├── components/                   # <Entity>FormModal (FormDialog), tab nghiệp vụ riêng...
├── <Feature>View.tsx             # trang danh sách
├── <Entity>DetailView.tsx        # trang chi tiết /[module]/[id] (nếu có)
└── index.ts                      # barrel export + default export View
```
Module mẫu để sao chép: `modules/master-data/units` (danh sách) và `modules/master-data/materials` (có trang chi tiết).

## Lớp API (`src/lib/api/`)
- `axiosClient`: gắn JWT, tự refresh khi 401, **tự bóc envelope** `{success, message, data}` → service nhận thẳng `data`. Không viết `res.data || res`, `Array.isArray(res) ? …` hay đoán cấu trúc response.
- `http.get/post/put/patch/delete<T>()`: wrapper có kiểu — service luôn dùng `http`, không gọi `axiosClient` trực tiếp.
- `http.envelope.post<T>()`: khi cần `message` của server (vd. kết quả batch có bản ghi bị bỏ qua).
- Kiểu chung trong `types.ts`: `Paginated<T>`, `ApiEnvelope<T>`, `BatchResult`, `EntityStatistics`, `FieldErrors`.
- Kiểu entity sinh từ OpenAPI: `npm run gen:api` → `src/types/api.generated.ts`; dùng `Schemas["UnitOfMeasure"]` thay vì gõ tay khi có thể.

## Service + hooks chuẩn (factory)
Module CRUD dùng factory, chỉ viết thêm endpoint riêng:
```ts
// services/unit.service.ts
export const unitService = createCrudService<UnitItem, UnitCreateInput, UnitUpdateInput, UnitFilters>("/units/");

// hooks/useUnitsQuery.ts
export const UNITS_QUERY_KEY = ["units"] as const;
const unitHooks = createCrudHooks(UNITS_QUERY_KEY, unitService);
export const useUnitsList = unitHooks.useList;          // useDetail, useStatistics
export const useCreateUnitMutation = unitHooks.useCreate; // useUpdate, useDelete, useBatchDelete, useBatchStatus
```
- Endpoint riêng: `{ ...createCrudService(...), getTree: () => http.get<T[]>(...) }` (mẫu: `material-categories`, `materials`).
- Query key con lồng dưới key gốc (`[...KEY, "tree"]`) để mutation CRUD invalidate luôn.
- Batch: `useBatchDelete()` / `useBatchStatus()` trả envelope → `toast.success(res.message)`; nếu `res.data.skipped?.length` → `toast.warning(res.message)`.

## TanStack Query
- Hook tự viết (ngoài factory): query key có namespace; mọi `useMutation` gọi `invalidateQueries({ queryKey: KEY })` trong `onSuccess`. Nhật ký (`["audit-logs"]`) được `MutationCache` trong `QueryProvider` tự invalidate sau mọi mutation thành công — không tự gọi lại trong từng hook.
- Dữ liệu tải trong Modal/Drawer (metadata cột, options): `useQuery` với `enabled: open && !!url` và `staleTime` ≥ 5 phút.
- Không dùng `useEffect` + `useCallback` phụ thuộc vào prop mặc định kiểu mảng/object (`columns = []`) để fetch — mỗi render tạo tham chiếu mới → vòng lặp gọi API vô hạn. Mặc định rỗng cho dữ liệu query: hằng số cấp module (`const NO_ROWS: T[] = []`), không `data = []`.
- ESLint `react-hooks/set-state-in-effect` cấm `useEffect(() => setX(...))`. Đồng bộ state theo prop/dữ liệu → cập nhật ngay trong render (`if (source !== data) { setSource(data); setRows(...) }`, mẫu `settings/components/ModuleTable.tsx`); cờ "đã mount" → `useMounted()`; tải dữ liệu → `useQuery`.

## Component dùng chung (`@/components/common`)
Luôn dùng lại trước khi tự viết: trang danh sách `ListPage` (`@/components/list`, xem `frontend-tables.md`), trang chi tiết `DetailPage` (`@/components/detail`, xem `frontend-detail-views.md`), `StatusBadge`, `DeleteConfirm`, `EmptyState`, `ExcelImportModal`, `ExportConfigModal` (qua `useExcelExport`), `DetailAttachmentsTab`. Bảng phụ nhỏ (vai trò, phân hệ, tệp đính kèm) tự dựng `<table className="dt">` trong `.dt-scroll` (không có DataTable chung). Form / control / primitive: xem `frontend-forms.md`.
- `PageHeader`: title/subtitle lấy từ `useModuleHeader("<MODULE_CODE>")` (dữ liệu `ModuleRegistries`), không hardcode chuỗi.
- Phân quyền UI: `usePermission().can(PERMISSIONS.X)` hoặc `<Can>`; mã quyền trong `@/constants/permissions`. Quy ước gate nút + `RouteGuard`: xem `security-rbac.md`.

## State
- Server state → TanStack Query. Client state toàn cục → Zustand (`src/stores/`). Không lưu dữ liệu server vào Zustand.

## Layout
- `components/layouts/DashboardLayout.tsx`: sidebar desktop `sticky top-0 h-screen` (`AppSidebar`, menu cuộn riêng `.sidebar-scrollable-menu`), mobile dùng `Sheet`; topbar dính (breadcrumb, thông báo, tài khoản). Không phá cấu trúc này khi sửa layout.
- Tìm kiếm toàn cục: ô tìm cố định đầu sidebar (dưới tên dự án) + Ctrl K mở `CommandPalette` (màn hình theo menu đã lọc quyền + bản ghi theo mã / tên từ `/search/` + lịch sử gần đây theo người dùng). Không đặt ô tìm riêng ở topbar / từng trang. Chi tiết: `docs/GLOBAL_SEARCH.md`.
- Thêm trang mới: đăng ký module trong backend `seed_core`/ModuleRegistries để menu + breadcrumb + header tự hiển thị.

## Kiểm tra
Sau khi sửa frontend: `npx tsc --noEmit` → `npm run lint -- --max-warnings=0` → `npm run build` (0 errors, 0 warnings). CI chạy đúng các lệnh này.

## Giao diện sáng / tối (theme)
- Màu: ưu tiên lớp Tailwind theo token shadcn (`text-foreground`, `text-muted-foreground`, `bg-background`, `border`, `bg-primary`… — trỏ về `--c-*`); cần màu riêng thì `var(--c-*)` định nghĩa ở `src/app/globals.css` (có giá trị cho cả 2 chế độ): `--c-text`, `--c-text-2`, `--c-text-secondary`, `--c-text-tertiary`, `--c-surface`, `--c-layout`, `--c-bg-subtle`, `--c-bg-muted`, `--c-table-head` (nền hàng tiêu đề bảng), `--c-sider-*` (sidebar tối: nền, chữ, hover, mục đang mở), `--c-border`, `--c-border-strong`, `--c-primary`, `--c-primary-bg`, `--c-success(-bg)`, `--c-warning(-bg)`, `--c-error(-bg)`, `--c-info(-bg)`, `--c-purple(-bg)`, `--c-brand-gradient`.
- **Không** viết mã hex cứng cho nền / chữ / viền (sai màu ở chế độ tối). Ngoại lệ có chủ đích: sidebar tối, khối nền thương hiệu chữ trắng (gradient cố định), thuộc tính SVG `fill`.
- Khối nền màu có chữ trắng: **không** dùng biến màu chữ (`--c-text`) trong gradient — biến này đổi sang màu sáng ở chế độ tối.
- Badge trạng thái: `StatusBadge` 6 tông (`success` `info` `warning` `error` `neutral` `accent`), khai báo `defineStatusMap({ CODE: { label, tone } })`, dùng chung cho options bộ lọc (`statusOptions`). "Tạm ngưng" là xám, không đỏ. Mã bản ghi hiển thị `CodeText` monospace, không dùng badge màu.
- Chế độ lưu ở `useThemeStore` (gán `data-theme` trên `<html>`); biến thể `dark:` của Tailwind khớp `[data-theme=dark]`. CSS tự viết đặt trong `@layer components` để lớp tiện ích Tailwind ghi đè được.
- Tên / logo / nhận diện ứng dụng lấy qua `useSystemSettings()` (Cài đặt → "Cấu hình hệ thống"); `APP_CONFIG` (`src/config/app.ts`) chỉ là giá trị dự phòng + metadata tĩnh. Tiêu đề trang chỉ khai `metadata.title = "Tên trang"` (layout gốc tự thêm hậu tố).
- Trạng thái đọc từ `localStorage` (user, theme) chỉ dùng sau khi mount — lần render đầu ở client phải giống server (tránh hydration mismatch).

## Bẫy đã gặp — không lặp lại
| Lỗi đã xảy ra | Quy tắc |
|---|---|
| Refresh token hỏng sau khi backend bọc envelope: đoạn refresh dùng `axios` gốc nên không qua interceptor bóc `data` | Mọi request đi qua `axiosClient` / `http`. Trường hợp buộc dùng `axios` gốc hoặc `fetch` (vd. refresh token, tải file) phải tự đọc `isApiEnvelope(body) ? body.data : body`. |
| Dashboard thống kê luôn hiện 0 vì code cũ đọc `res.data` từ kết quả đã bóc | Không viết `res.data \|\| res`, `(res as any)?.data?.results`… Kiểu trả về khai báo ở service (`http.get<T>`), component dùng thẳng. Đoán cấu trúc response che giấu bug. |
| Danh sách vai trò, phân hệ, tệp đính kèm, tab nhật ký chỉ lấy **trang đầu 10 bản ghi** rồi dùng như toàn bộ → bản ghi thứ 11 biến mất | API danh sách luôn phân trang. Cần "toàn bộ" danh mục nhỏ → `params: { page_size: 100 }` và đọc `.results`; danh sách lớn → phân trang server-side (`ListPage`) hoặc remote search. |
| Lỗi của request tải file (`responseType: "blob"`) là Blob → `extractErrorMessage` không đọc được thông điệp | Nút xuất / tải file dùng `await extractErrorMessageAsync(error, "…")`. |
| `catch (err: any)` rồi đọc `err.response.data.detail` / `.message` thủ công → vỡ khi đổi định dạng lỗi | Không khai báo `: any` trong `catch`; chỉ dùng helper của `errorUtils`. |
| Route trùng (`/units` và `/master-data/units`) → hai URL cho một màn hình | Mỗi màn hình đúng một route, khớp `route_path` trong `seed_core`. |
| Component 800–1000 dòng (FilePreviewModal, ModuleTable, MaterialFormModal) khó sửa và review | File component > ~400 dòng → tách khối con + hàm thuần (`*Utils.ts`) vào thư mục con cùng tên. |
| Thư viện `xlsx` bản npm có lỗ hổng mức cao, không có bản vá | Dùng bản SheetJS chính thức từ CDN (`https://cdn.sheetjs.com/xlsx-<ver>/xlsx-<ver>.tgz`). Dependabot **không** theo dõi dependency dạng URL → tự kiểm tra bản mới khi có tin bảo mật. |
| `schema.yml` / `api.generated.ts` bị Git trên Windows đổi sang CRLF → CI báo "đã cũ" dù nội dung giống | File sinh tự động cố định `eol=lf` trong `.gitattributes`. |
| Hydration mismatch mỗi lần F5 khi đã đăng nhập: store đọc `localStorage` lúc nạp module, server render màn hình chờ còn client render nội dung | Component phụ thuộc `localStorage` render giống server ở lần đầu (`useMounted()`) rồi mới hiện nội dung thật (xem `AuthGuard`). |
| Dark mode: banner Dashboard mất chữ vì gradient dùng biến màu chữ; số liệu MetricCard chìm vì mặc định `#0F172A` | Theo mục "Giao diện sáng / tối": nền thương hiệu dùng màu cố định, giá trị mặc định dùng `var(--c-text)`. Kiểm tra bằng ảnh chụp cả 2 chế độ. |
| Hook cập nhật hồ sơ ghi `localStorage["user"]` trong khi store đọc `user_profile` → topbar không đổi tên | Cập nhật user qua `useAuthStore.getState().updateUser(...)`, không ghi `localStorage` thủ công. |
| Next 16 đổi prop `error.tsx` từ `reset` sang `retry` | Trước khi dùng file convention / API Next, đọc `node_modules/next/dist/docs/` (xem `client/AGENTS.md`). |
| Breadcrumb tạo link tới đường dẫn không có trang (`/settings`, `/master-data`) → bấm ra 404, Next prefetch treo khiến trang không bao giờ "network idle" | Breadcrumb lấy nhãn + link từ cây menu (`useNavigation`); đoạn không phải trang thật không được là link. |
| `package-lock.json` tạo bằng npm 11 trên Windows thiếu optional deps của Linux (`@emnapi/*`) → `npm ci` trên CI/Docker báo "not in sync" | CI và Dockerfile dùng `npm install --no-audit --no-fund`; khi cập nhật lock có thể sinh bằng container Linux (`docker run node:22-alpine npm install --package-lock-only`). |
| Nút "Đổi mật khẩu" ở chi tiết người dùng mở `ChangePasswordModal` (đổi mật khẩu **của người đang đăng nhập**) → quản trị tưởng đổi cho người khác nhưng đổi của chính mình | Thao tác trên tài khoản khác gọi API của tài khoản đó (`ResetPasswordModal` → `PATCH /users/{id}/`). Component "của tôi" chỉ dùng ở trang hồ sơ / menu người dùng. |
| Form tạo người dùng mặc định `role_ids: [1]` (= ADMIN) và có danh sách vai trò dự phòng viết cứng kèm ID | Không đặt giá trị mặc định là ID bản ghi CSDL; options lấy từ API (tải khi mở form). |
| Nút "Xuất dữ liệu" / "Nhập Excel" giả (chỉ hiện thông báo) | Dùng `useExcelExport` / `ExcelImportModal`; chưa có chức năng thì không hiện nút. |
| Mỗi module tự viết FilterToolbar / Table / Hero 250–450 dòng, lệch giao diện | Trang danh sách dùng `ListPage`, chi tiết dùng `DetailPage`; module chỉ khai báo cột / bộ lọc / trường. |
| Sửa bản ghi báo "Mã: trường này là bắt buộc": form sửa chỉ gửi trường được sửa nhưng service gọi `PUT` (cập nhật toàn phần) | Cập nhật luôn dùng `PATCH` (`createCrudService().update`, service tự viết cũng vậy). |
| Lưu Cấu hình hệ thống luôn 400 `"" is not a valid choice`: Radix Select gọi `onValueChange("")` khi `form.reset` gắn lại danh sách lựa chọn | `SelectField` bỏ qua giá trị rỗng; dùng Select của Radix ngoài `SelectField` thì chặn `""` tương tự. QA form phải **bấm Lưu thật**, không chỉ mở form. |
| `client/.gitignore` có `.env*` nên `client/.env.example` chưa từng được commit, bản clone mới thiếu file mẫu | Thêm `!.env.example` sau mọi luật ignore `.env*`; kiểm tra bằng `git ls-files`. |
| Đồng bộ state trong render (`if (source !== data) setRows(...)`) với `const { data = [] } = useQuery()` → mỗi render một mảng mới → "Too many re-renders" (ma trận quyền, bảng phân hệ) | Giá trị mặc định rỗng là hằng số cấp module (`const NO_ROLES: RoleItem[] = []`), không viết `= []` trong destructuring. |
| CI trước dùng `antd lint` (luôn exit 0, phải grep output); sau khi bỏ antd không còn kiểm tra tĩnh nào ngoài tsc | CI chạy `npm run lint -- --max-warnings=0` (ESLint `eslint-config-next`, gồm `react-hooks`); sửa lỗi thật, chỉ `eslint-disable-next-line` kèm lý do khi quy tắc không áp dụng (interceptor ngoài cây React…). |
| shadcn CLI sinh `import { cn } from "cn"` (gói `cn` chính thức của shadcn) trong `components/ui`, còn code dự án dùng `clsx + tailwind-merge` riêng → hai bộ gộp class | `@/lib/utils` re-export `cn` từ gói `cn`; code dự án import `cn` từ `@/lib/utils`, không cài lại clsx/tailwind-merge. |
| `FormDialog` đôi khi đóng luôn không hỏi "Bỏ thay đổi chưa lưu?": `form.formState.isDirty` chỉ được đọc trong hàm xử lý đóng, react-hook-form không theo dõi nên trả `false` cũ (test Vitest bắt được) | `formState` là Proxy — đọc trường cần dùng **trong lúc render** (`const { isDirty } = form.formState`) hoặc `useFormState`, rồi mới dùng trong callback. |
| Combobox không cuộn được: (1) khung danh sách là flex cột → khối ảo hóa (dòng `absolute`) co bằng khung nên không tràn; (2) trong Dialog, danh sách portal ra ngoài bị `RemoveScroll` của Dialog chặn wheel | Danh sách ảo hóa đặt trong khung `display: block` (khối trong `shrink-0`); nội dung popover portal trong Dialog bọc `<RemoveScroll removeScrollBar={false}>` như Radix Select. QA Combobox phải **cuộn thử** cả trong form modal. |
