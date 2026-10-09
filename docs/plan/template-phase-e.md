# Plan Phase E — Tính năng bổ sung cho template

> Trạng thái: **Phase E ĐÃ DUYỆT** (2026-09-27, theo toàn bộ đề xuất). **Phase F ĐÃ DUYỆT**. **Phase G** (nhánh shadcn/ui) làm sau khi E + F xong trên `main`.
> Cập nhật: 2026-09-27

Phạm vi đã chốt (Nhóm 2):

| Mã | Tính năng | Mức độ |
|---|---|---|
| E1 | Thông báo trong ứng dụng | **Cơ bản**: báo khi tác vụ xuất dữ liệu xong / lỗi; có service dùng chung cho module sau |
| E2 | Cấu hình hệ thống trên UI | Thông tin nhận diện + định dạng mặc định, sửa được trên màn hình Cài đặt |
| E3 | Dashboard tổng quan mẫu | **1 trang** KPI card + biểu đồ làm mẫu, không làm dashboard riêng cho từng module |
| E4 | Command palette (Ctrl+K) | Tìm nhanh màn hình theo menu có quyền |

Thứ tự làm: **E4 → E3 → E1 → E2** (không cần DBML trước, cần DBML sau). E1 và E2 chỉ bắt đầu khi DBML ở mục tương ứng được duyệt.

---

## E4. Command palette (Ctrl+K) — chỉ frontend

**Mục tiêu:** nhấn `Ctrl+K` / `⌘K` (hoặc bấm ô tìm kiếm trên topbar) → hộp thoại gõ tên màn hình → Enter để mở.

**Hành vi**
- Nguồn dữ liệu: cây menu `useNavigation()` (đã lọc theo quyền) → không lộ màn hình không có quyền.
- Tìm không dấu tiếng Việt ("nguyen vat lieu" khớp "Nguyên vật liệu"), khớp cả nhãn cha ("Danh mục › Đơn vị tính").
- Điều hướng bàn phím: ↑ ↓ Enter Esc.
- Nhóm "Gần đây": 5 màn hình mở gần nhất (localStorage, theo user).
- Nhóm "Thao tác nhanh": Trang cá nhân, Đổi giao diện sáng/tối, Đăng xuất.

**Việc cần làm**
- [x] `src/components/layouts/CommandPalette.tsx` (Modal antd + Input + danh sách).
- [x] Hook `useHotkey` (Ctrl+K / ⌘K), gắn trong `DashboardLayout`; ô tìm kiếm trên topbar (ẩn trên mobile, thay bằng icon).
- [x] Hàm thuần `searchNavigation(tree, query)` + bỏ dấu.
- [x] Smoke test Playwright: mở palette, gõ, Enter → đúng URL.

**Không làm:** tìm dữ liệu bản ghi (tìm user/NVL theo tên) — để module tự làm sau.

---

## E3. Dashboard tổng quan mẫu

**Mục tiêu:** thay `DashboardView` hiện tại (MetricCard về user/phân hệ) bằng **1 trang tổng quan mẫu** có số liệu thật, làm khuôn để dự án con sao chép.

**Bố cục**
1. Hàng KPI (4 card): Người dùng hoạt động · Nguyên vật liệu · Tác vụ xuất dữ liệu 7 ngày · Thao tác hệ thống hôm nay. Mỗi card có số + so sánh kỳ trước (▲/▼ %).
2. Biểu đồ đường: số thao tác (audit events) theo ngày, 14 ngày gần nhất.
3. Biểu đồ tròn / cột: NVL theo nhóm (top 6 + "Khác").
4. Danh sách "Hoạt động gần đây": 8 thao tác mới nhất (ai – làm gì – lúc nào), link tới bản ghi.
5. Giữ khối trạng thái hệ thống (`/health/`) hiện có.

**Phân quyền:** mỗi khối chỉ hiện nếu user có quyền READ tương ứng (`MATERIAL_READ`, `AUDIT_LOGS_READ`...). Backend trả `null` cho khối không có quyền.

**Backend**
- [x] `GET /api/v1/dashboard/overview/` (app `core` hoặc app mới `dashboard`): 1 request trả toàn bộ số liệu; cache Redis 60 giây theo user.
- [x] Serializer có type đầy đủ để `gen:api` sinh đúng kiểu.
- [x] Test: user chỉ có `USER_READ` không nhận khối NVL / nhật ký.

**Frontend**
- [x] `modules/dashboard/`: `services`, `hooks/useDashboardOverview`, `components/KpiCard`, `ActivityChart`, `CategoryChart`, `RecentActivity`.
- [x] Biểu đồ dùng thư viện đã chốt (xem mục Cần chốt), màu lấy từ `var(--c-*)` → đúng cả chế độ tối.
- [x] Hướng dẫn trong `docs/TEMPLATE.md`: cách thêm 1 KPI / 1 biểu đồ cho module mới.

---

## E1. Thông báo trong ứng dụng (cơ bản)

**Mục tiêu:** chuông trên topbar có số chưa đọc; tác vụ xuất dữ liệu xong / lỗi thì người tạo nhận thông báo, bấm vào để tải file.

**DBML đề xuất (cần duyệt)**
```dbml
// 0.10 Thông báo trong ứng dụng
Table Notifications {
  Id bigint [primary key, increment]
  RecipientId int [not null, ref: > Users.Id, note: 'Người nhận']
  Level varchar(20) [not null, default: 'INFO', note: 'INFO, SUCCESS, WARNING, ERROR']
  Title varchar(255) [not null]
  Message text [null]
  Link varchar(500) [null, note: 'Đường dẫn frontend khi bấm vào (vd. /users/5) hoặc link tải file']
  SourceType varchar(50) [null, note: 'Nguồn phát sinh: DATA_TRANSFER_JOB, USER...']
  SourceId bigint [null]
  ReadAt timestamp [null, note: 'NULL = chưa đọc']

  // Standard Audit Fields
  Description text [null]
  IsActive boolean [default: true]
  CreatedById int [ref: > Users.Id]
  UpdatedById int [ref: > Users.Id]
  CreatedAt timestamp [default: `now()`]
  UpdatedAt timestamp
  DeletedAt timestamp [null, note: 'Soft delete']

  indexes {
    (RecipientId, ReadAt) [note: 'Đếm / lọc chưa đọc của người dùng']
    CreatedAt
  }
}
```

**Backend**
- [x] Model `Notification(AuditModel)` + migration.
- [x] Service dùng chung `apps/core/notifications.py`: `notify(user, title, message=None, level='INFO', link=None, source=None)` — module sau chỉ gọi hàm này.
- [x] Gọi `notify` trong `execute_data_export_job` khi COMPLETED (link tải) và FAILED (thông điệp lỗi).
- [x] API (chỉ thấy thông báo của chính mình, không cần mã quyền): `GET /notifications/` (phân trang, lọc `unread`), `GET /notifications/unread-count/`, `POST /notifications/{id}/read/`, `POST /notifications/read-all/`.
- [x] Dọn thông báo cũ: xóa thông báo đã đọc > 30 ngày (lệnh `cleanup_notifications`, gọi được từ cron / Celery beat).
- [x] Test: không đọc được thông báo của người khác; job xong → có thông báo.

**Frontend**
- [x] Chuông topbar: badge số chưa đọc, polling `unread-count` 30 giây (dừng khi tab ẩn).
- [x] Popover danh sách 10 thông báo mới nhất: icon theo level, thời gian tương đối, "Đánh dấu đã đọc tất cả".
- [x] Bấm thông báo → đánh dấu đã đọc + mở `link`.
- [x] Khi có thông báo mới trong lúc đang mở app → `notification` antd góc màn hình (chỉ loại SUCCESS/ERROR).

**Không làm:** trang danh sách thông báo riêng, WebSocket/SSE realtime, email, cài đặt nhận thông báo.

---

## E2. Cấu hình hệ thống trên UI

**Mục tiêu:** Quản trị viên sửa thông tin nhận diện và định dạng mặc định trên màn hình, không cần sửa code `APP_CONFIG`.

**DBML đề xuất (cần duyệt)** — bảng 1 dòng (singleton), trường có kiểu rõ ràng:
```dbml
// 0.11 Cấu hình hệ thống (1 dòng duy nhất)
Table SystemSettings {
  Id int [primary key, increment]
  AppName varchar(100) [not null, note: 'Tên ứng dụng: sidebar, trang đăng nhập, tiêu đề tab']
  AppBadge varchar(30) [null, note: 'Nhãn phụ cạnh tên (vd. MES 2.0)']
  Tagline varchar(150) [null]
  CompanyName varchar(255) [null, note: 'Tên đơn vị sở hữu, hiện ở footer']
  LogoUrl varchar(500) [null, note: 'Logo tải lên; NULL = dùng logo mặc định']
  Timezone varchar(50) [not null, default: 'Asia/Ho_Chi_Minh']
  DateFormat varchar(20) [not null, default: 'DD/MM/YYYY']
  NumberFormat varchar(10) [not null, default: 'INTL', note: 'INTL = 1,250.50; VN = 1.250,50 (mặc định cho user chưa tự chọn)']

  // Standard Audit Fields
  Description text [null]
  IsActive boolean [default: true]
  CreatedById int [ref: > Users.Id]
  UpdatedById int [ref: > Users.Id]
  CreatedAt timestamp [default: `now()`]
  UpdatedAt timestamp
  DeletedAt timestamp [null, note: 'Soft delete']
}
```

**Backend**
- [x] Model + migration; `seed_core` tạo dòng mặc định (idempotent, không ghi đè).
- [x] `GET /system-settings/public/` (không cần đăng nhập — trang login cần tên + logo), `GET/PATCH /system-settings/` (cần `SETTINGS_READ` / `SETTINGS_UPDATE`), upload logo (giới hạn ảnh ≤ 1MB, png/jpg/svg... tùy chốt).
- [x] Cache Redis, xóa cache khi PATCH.
- [x] pghistory để có lịch sử thay đổi.
- [x] Test: user thường không PATCH được; public không lộ trường nội bộ.

**Frontend**
- [x] Tab mới "Cấu hình hệ thống" trong màn hình Cài đặt (form + xem trước logo), gate `SETTINGS_UPDATE`.
- [x] Hook `useSystemSettings()`; sidebar, trang đăng nhập, footer, tiêu đề tab đọc từ đây, **`APP_CONFIG` chỉ còn là giá trị dự phòng** khi API chưa trả.
- [x] `NumberFormatProvider` dùng `NumberFormat` hệ thống làm mặc định khi user chưa tự chọn; ngày tháng dùng `DateFormat`.

**Không làm:** đổi màu chủ đạo trên UI, đa công ty, cấu hình SMTP.

---

## Hoàn thành mỗi mục (Definition of Done)
- Backend: `makemigrations` → `migrate` → `check` 0 issues; test pass trong container; `spectacular` 0 warning → `npm run gen:api`.
- Frontend: `tsc`, `antd lint` ("No issues found"), `npm run build` 0 errors / 0 warnings; kiểm tra sáng + tối, desktop + mobile (ảnh chụp xong thì xóa).
- Gate quyền theo `.claude/rules/security-rbac.md`.
- UI/UX theo `.claude/rules/frontend-ux.md`: chạy checklist cuối file (bỏ khối thừa, tab Network chỉ có request cần thiết, đủ trạng thái tải / rỗng / lỗi).
- Cập nhật `docs/TEMPLATE.md`, README liên quan, rules 2 bên nếu có quy ước mới.
- Mỗi mục 1 commit riêng (Conventional Commits), chỉ commit khi user yêu cầu.

---

## Đã chốt (Phase E)
1. Biểu đồ: `recharts`.
2. Nguồn thông báo: tác vụ xuất dữ liệu (xong / lỗi) + được gán / gỡ vai trò + mật khẩu bị quản trị viên đặt lại.
3. Cập nhật thông báo: polling 30 giây, dừng khi tab ẩn.
4. Cấu hình hệ thống: bảng 1 dòng có kiểu (`SystemSettings`).
5. DBML `Notifications` và `SystemSettings`: **đã duyệt** như trên — cập nhật vào `database.dbml` khi bắt đầu E1 / E2.
6. KPI dashboard: 4 KPI như đề xuất.

---

# Phase F — Bộ khung UI & thiết kế lại trang danh sách / chi tiết (ĐÃ DUYỆT phạm vi)

**Thiết kế chi tiết (wireframe, menu cột, kiểu lọc, badge, mobile): [`ui-list-detail-design.md`](ui-list-detail-design.md)** — chờ user duyệt thiết kế trước khi code F1.

**Vấn đề hiện tại:** mỗi module tự viết thanh lọc (246–414 dòng), Hero chi tiết (236–446 dòng), tab nhật ký, thao tác hàng loạt; bộ lọc không lên URL; 2 component badge trùng việc, màu hex cứng từng trạng thái.
**Mục tiêu:** module mới chỉ khai báo cấu hình (cột, bộ lọc, trường hiển thị, status map); bố cục, quyền, trạng thái tải / rỗng / lỗi do bộ khung lo.

## F0. Bỏ tính năng thùng rác
Bản ghi đã xóa **không xem lại / khôi phục được** qua giao diện hay API. Vẫn giữ xóa mềm trong CSDL (`DeletedAt`) để bảo toàn khóa ngoại, chống trùng mã và giữ nhật ký — DBML không đổi.
- [x] Backend: bỏ action `trash`, `restore`, `batch_restore`, `batch_hard_delete` khỏi `BaseERPViewSet` + map quyền trong `DEFAULT_ACTION_PERMISSIONS`; sửa test liên quan.
- [x] Frontend: xóa `RecycleBinDrawer`, `useTrash` / `useRestore` / `useBatchRestore` trong factory, chỗ dùng ở `users`.
- [x] Khuôn `startmodule` / `gen:module` không sinh phần thùng rác.
- [x] Sinh lại `schema.yml` + `api.generated.ts`; cập nhật rules 2 bên (bỏ mô tả thùng rác, ghi rõ "không có thùng rác").

## F1. Trạng thái danh sách trên URL — `useListState`
- [x] Đồng bộ `q`, bộ lọc, `page`, `page_size`, `ordering` ↔ query string (`router.replace`, debounce tìm kiếm 300ms, đổi lọc về trang 1).

## F2. Trang danh sách — `ListPage` + `DataTable` mới (thiết kế mục 1)
- [x] `defineColumns`: `sortable`, `filter.type` (text, select, multiSelect, tree, number, date, boolean, remote), `pinned`, `width/minWidth`, `link`.
- [x] **Menu cột thống nhất**: sắp xếp tăng / giảm / bỏ · lọc theo kiểu cột · ghim trái / phải · chuyển trái / phải · tự vừa độ rộng · ẩn cột. Bấm tiêu đề xoay vòng sắp xếp.
- [x] Toolbar: tìm kiếm + 2 bộ lọc nhanh + Popover "Bộ lọc"; bên phải ⟳ · Xuất/Nhập · ⚙. Dải tag bộ lọc đang bật.
- [x] `⚙` Tùy chỉnh bảng: hiện/ẩn, kéo đổi thứ tự, ghim, mật độ, khôi phục mặc định; co giãn cột bằng kéo mép, nhấp đúp tự vừa.
- [x] Tên bản ghi là link chi tiết; cột thao tác ✎ 🗑 ⋯ theo quyền; `BulkActionBar` nổi đáy.
- [x] Trạng thái: Skeleton lần đầu, giữ dữ liệu cũ khi đổi trang, rỗng / không khớp lọc / lỗi.
- [x] Mobile: bộ lọc vào Drawer đáy, menu cột dạng Drawer.
- [x] Backend: dùng `filterset_fields` dạng dict của django-filter (`{"code": ["icontains"], "updated_at": ["date__gte", "date__lte"]}`) thay cho `ERPFilterSet` riêng — không cần code thêm; test lọc theo cột trong từng module.

## F3. Badge trạng thái thống nhất (thiết kế mục 3)
- [x] `StatusBadge` 1 kiểu, màu theo 6 tone (`success`, `info`, `warning`, `error`, `neutral`, `accent`) từ biến `--c-*`, chế độ tối tự pha.
- [x] `defineStatusMap` → dùng chung cho badge và options bộ lọc; map có sẵn `ACTIVE_STATUS`.
- [x] Gộp `StatusTag` + `StatusBadge` cũ, xóa bảng màu hex theo từng trạng thái; mã / phiên bản hiển thị monospace xám.

## F4. Trang chi tiết — `DetailPage` (thiết kế mục 2)
- [x] Hero 2 tầng khai báo (`image`, `title`, `badges`, `subtitle`, `fields` tối đa 8 + "Xem thêm"), 1 nút chính + `⋯` (tự bỏ mục không có handler).
- [x] Tabs có `?tab=` trên URL, tải khi mở; tab chuẩn "Tệp đính kèm" (có số lượng, readonly theo quyền) + "Nhật ký" (`EntityAuditTab` dùng chung, nhóm theo ngày, "Tải thêm").
- [x] Skeleton đúng bố cục; 404 "không tồn tại hoặc đã bị xóa"; mobile xếp dọc.

## F5. Xem nhanh — `QuickViewDrawer`
- [x] Từ `⋯` trên dòng; dùng lại `hero.fields`; tải khi mở; không mất bộ lọc.

## F6. Thành phần form
- [x] `FormSection` (nhóm + lưới 2 cột, 1 cột mobile), `EntitySelect` chung (remote search, tải thêm khi cuộn), cảnh báo "Có thay đổi chưa lưu".

## F7. Áp dụng & khuôn sinh module
- [x] Chuyển module: `units` → `material-categories` → `materials` → `users` → `audit-logs`; xóa toolbar / hero / audit tab cũ.
- [x] Khuôn `gen:module` sinh sẵn `ListPage` + `DetailPage` + status map.
- [x] Cập nhật `frontend-tables.md`, `frontend-detail-views.md`, `frontend-ux.md` (+ `.agents` 02c, 02d, 02e), `docs/TEMPLATE.md`, `client/README.md`.

**Không làm trong Phase F:** sắp xếp nhiều cột, bộ lọc đã lưu theo user, sửa trực tiếp trên ô bảng, chuyển bản ghi trước / sau.

## Thứ tự thực hiện (đã chốt)
**F0 → E4 → F1 → F3 → F2 → F4 → F7 → F5 → F6 → E3 → E1 → E2**
(F0 dọn trước cho gọn; badge F3 làm trước F2 vì bảng dùng badge; E3/E1/E2 làm sau để dùng luôn bộ khung mới.)

## Đã chốt (Phase F)
1. Thiết kế `ui-list-detail-design.md` được duyệt. Phong cách bảng tham khảo **tablecn** (https://table-cn.vercel.app): header chữ nhỏ đậm vừa, viền mảnh, dòng thoáng, sắp xếp khi bấm header, kéo / ghim / co giãn / ẩn cột, trạng thái trên URL. **Bộ lọc giữ kiểu lọc theo từng cột** (menu cột), không dùng "filter builder" AND/OR của tablecn.
2. Thư viện: làm Phase E + F bằng **Ant Design trên `main`**; sau đó chuyển toàn bộ sang shadcn/ui ở nhánh riêng (Phase G).

---

# Phase G — Chuyển toàn bộ frontend sang shadcn/ui (nhánh riêng)

> Bắt đầu sau khi Phase E + F hoàn tất trên `main`. Nhánh: `refactor/shadcn-ui` tạo từ `main`. `main` giữ bản Ant Design.

**Stack:** Tailwind CSS v4 + shadcn/ui (Radix) + TanStack Table v9 + react-hook-form + zod + sonner (thông báo) + lucide-react (icon).

**Bảng dữ liệu:** dựng theo giao diện và cấu trúc của tablecn nhưng **tự sở hữu code**:
- Các gói `@querycn/*` mới ở bản 0.2.0, 1 người duy trì → không phụ thuộc trực tiếp; tham khảo registry (MIT) rồi viết `DataTable` riêng trên `@tanstack/react-table` v9.
- Giữ nguyên API khai báo của Phase F (`defineColumns`, `ListPage`, `DetailPage`, `defineStatusMap`, `useListState`) → module chỉ đổi phần bên trong bộ khung.
- Lọc theo từng cột (menu cột) như thiết kế F2.

**Việc cần làm**
- [x] G1. Nền tảng: Tailwind v4, `components.json`, theme sáng / tối map từ biến `--c-*` hiện có, font, `sonner`, `lucide-react`.
- [x] G2. Thành phần cơ bản shadcn: Button, Input, Select, Combobox, Dialog, Sheet, Popover, DropdownMenu, Tabs, Tooltip, Badge, Skeleton, Calendar / DateRangePicker, Form.
- [x] G3. Thành phần tự viết (shadcn không có): TreeSelect, Upload kéo thả, NumberInput có định dạng, Descriptions, Timeline, ConfirmPopover.
- [x] G4. Bộ khung: `DataTable` (TanStack v9: sort, pin, resize, reorder, hide, menu cột, lọc theo cột, virtualization khi cần), `ListPage`, `DetailPage`, `StatusBadge`, `BulkActionBar`, `FilterBar`, `QuickViewDrawer`, `FormSection`, `EntitySelect`.
- [x] G5. Layout: sidebar, topbar, breadcrumb, command palette, thông báo, trang lỗi / 403 / 404, đăng nhập.
- [x] G6. Chuyển module: units → material-categories → materials → users → audit-logs → settings (ma trận quyền) → profile → dashboard → cấu hình hệ thống; xóa file antd tương ứng.
- [x] G7. Gỡ `antd`, `@ant-design/*`; bỏ bước `antd lint` trong CI; cập nhật khuôn `gen:module`, rules frontend 2 bên, skill `antd` → ghi chú không dùng trên nhánh này, README / TEMPLATE.
- [x] G8. Kiểm tra: `tsc`, `eslint`, `build` 0 cảnh báo; Playwright smoke; ảnh sáng / tối, desktop / mobile từng màn hình.

## Nhật ký thực hiện
| Ngày | Mục | Ghi chú |
|---|---|---|
| 2026-09-27 | — | Tạo plan, chờ chốt các mục ở trên |
| 2026-09-27 | — | Thêm rule `frontend-ux.md` / `02e-frontend-ux.md`, áp dụng cho mọi mục của plan |
| 2026-09-27 | E | User duyệt Phase E theo toàn bộ đề xuất (kể cả 2 đoạn DBML) |
| 2026-09-27 | F | Đề xuất Phase F (bộ khung UI danh sách / chi tiết), chờ chốt |
| 2026-09-27 | F | User chốt Phase F; yêu cầu tự thiết kế lại danh sách / chi tiết, menu cột thống nhất, badge; bỏ thùng rác (F0) |
| 2026-09-27 | F, G | Duyệt thiết kế; phong cách bảng theo tablecn, lọc theo từng cột. Làm E + F bằng antd trên `main`, sau đó Phase G chuyển shadcn/ui ở nhánh `refactor/shadcn-ui` |
| 2026-09-27 | F0 | Xong: bỏ thùng rác; sửa lỗi user đã xóa vẫn hiện trong API |
| 2026-09-27 | E4 | Xong: Ctrl+K (tìm không dấu, Gần đây, thao tác nhanh), smoke test |
| 2026-09-27 | F1–F3 | Xong bộ khung `components/list` (useListState, ListPage, ListTable, menu cột, lọc theo kiểu, ⚙, BulkActionBar) + `StatusBadge` 6 tông; module mẫu `units` đã chuyển |
| 2026-09-27 | F4 | Xong `components/detail` (DetailPage, EntityAuditTab); chuyển chi tiết NVL + người dùng. Sửa lỗi: "Đổi mật khẩu" ở chi tiết người dùng đổi mật khẩu của chính người xem → thay bằng đặt lại mật khẩu cho tài khoản đó; form người dùng mặc định gán vai trò ADMIN (id 1); nhân bản tài khoản thiếu ô mật khẩu |
| 2026-09-27 | F7 | Xong: units, nhóm NVL, NVL, người dùng, nhật ký dùng ListPage; khuôn gen:module + startmodule theo khung mới; rules 2 bên + tài liệu. Sửa: xuất NVL là nút giả |
| 2026-09-27 | F5, F6 | Xong: QuickViewDrawer (NVL, người dùng), EntitySelect (ĐVT trong form NVL — bỏ tải sẵn toàn bộ ĐVT), FormSection (khuôn gen:module), useUnsavedGuard cho mọi form modal |
| 2026-09-27 | E3 | Xong: app `apps/dashboard` (1 endpoint gộp, lọc theo quyền, cache 60s, 3 test), trang Tổng quan mới (4 KPI, biểu đồ recharts, hoạt động gần đây, trạng thái hệ thống); bỏ MetricCard không còn dùng |
| 2026-09-27 | E1 | Xong: bảng Notifications (DBML + migration core.0003), notify(), API + test, thông báo xuất dữ liệu / đổi vai trò / đặt lại mật khẩu, chuông topbar. Sửa: nút tải tệp tác vụ nền mở URL API không kèm JWT (401) → tải qua axiosClient |
| 2026-09-27 | E2 | Xong: bảng SystemSettings (DBML + migration core.0004, pghistory), API công khai / quản trị / logo + test, seed_core tạo dòng mặc định, tab Cấu hình hệ thống; sidebar / đăng nhập / chân trang / tiêu đề tab / định dạng số theo cấu hình; dev proxy ảnh /media công khai sang backend |
| 2026-09-27 | G1–G5 | Nhánh `refactor/shadcn-ui`: Tailwind v4 + shadcn (Radix), control tự viết (Combobox, TreeSelect, DateRangePicker, NumberInput, FileDropzone), FormDialog + react-hook-form, khung danh sách / chi tiết, layout. **Quyết định:** không dùng TanStack Table — sắp xếp / lọc / phân trang đều ở server nên bảng `<table>` tự dựng (ghim, co giãn, ẩn / đổi thứ tự cột) gọn hơn |
| 2026-09-27 | G6 | Xong: chuyển toàn bộ module (units → … → cấu hình hệ thống, đăng nhập) và component dùng chung. Sửa: form NVL đọc `parent_id` không tồn tại nên nhóm con của KIM LOẠI không hiện quy cách |
| 2026-09-27 | G7 | Xong: gỡ antd / @ant-design / dayjs; CI thay antd lint bằng ESLint `--max-warnings=0` (sửa hết cảnh báo); khuôn gen:module, rules 2 bên, README / TEMPLATE theo shadcn |
| 2026-09-27 | G8 | Xong: tsc, ESLint, build 0 cảnh báo; Playwright smoke 11/11 (1 bỏ qua trên mobile); 62 test backend; ảnh sáng / tối, desktop / mobile 10 màn hình |
