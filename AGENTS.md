# 🤖 AGENTS & CODING STANDARDS (Fullstack Portfolio)

Tài liệu này là **Cẩm nang Quy chuẩn Cốt lõi** mà mọi AI Agent (và lập trình viên) **BẮT BUỘC PHẢI ĐỌC VÀ TUÂN THỦ NGHIÊM NGẶT 100%** trong suốt quá trình phát triển dự án **Fullstack Portfolio (Django + Next.js)** của **ERICSS**.

---

## 🎯 1. NGUYÊN TẮC SỐNG CÒN CỦA DỰ ÁN (CORE GOLDEN RULES)

1. **CSDL DBML LÀ SINGLE SOURCE OF TRUTH:**
   - Mọi Model Django Backend và Giao diện Frontend **phải luôn bám sát 100% vào file thiết kế [server/database.dbml](server/database.dbml)**.
   - **TUYỆT ĐỐI KHÔNG:** Tự ý code Model, tạo bảng, thêm cột trước khi phân tích và chốt trong file `.dbml`.

2. **QUY TRÌNH KIỂM TRA MÔI TRƯỜNG BẮT BUỘC (HEALTH CHECKS):**
   - **Sau khi code Backend:** Bắt buộc chạy chuỗi lệnh:
     `python manage.py makemigrations` ➔ `python manage.py migrate` ➔ `python manage.py check` (phải đạt 0 errors).
   - **Sau khi code Frontend:** Bắt buộc chạy chuỗi lệnh:
     `npx tsc --noEmit` ➔ `npm run lint -- --max-warnings=0` ➔ `npm run build` (phải đạt 0 errors, 0 warnings).

---

## 📑 2. DANH MỤC CÁC QUY CHUẨN KỸ THUẬT (RULES)

1. **[01. Quy chuẩn Kiến trúc Tổng thể](.agents/rules/01-general-architecture.md):**
   - Định hướng template: lõi hệ thống dùng chung + phân hệ mẫu xóa được; dự án clone về tự ghi phạm vi nghiệp vụ riêng.
   - Cấu trúc Monorepo (`client/` Next.js 16 + `server/` Django 5 + `docker-compose.yml`).

2. **[02a. Kiến trúc Frontend & TanStack React Query](.agents/rules/02a-frontend-architecture.md):**
   - Kiến trúc Feature-Driven Modules tại `client/src/modules/<feature>/` (`types.ts`, `services/`, `hooks/`, `components/`, `View.tsx`, `index.ts`).
   - `client/src/app/` chỉ chứa thin router wrappers.
   - Bắt buộc tái sử dụng component chuẩn: `ListPage`, `DetailPage`, `PageHeader`, `StatusBadge`, `EmptyState`, `DeleteConfirm`, `ExportConfigModal`, `DetailAttachmentsTab`.
   - Quản lý Cache với TanStack React Query (`invalidateQueries`), chống vòng lặp vô hạn API / render, layout sidebar cố định, theme sáng / tối qua `--c-*`.

3. **[02b. Form, component UI & Validation](.agents/rules/02b-frontend-forms-validation.md):**
   - Tầng component shadcn/ui (`ui` → `controls` → `form` → `feedback`), form react-hook-form + `FormDialog` (gắn lỗi backend vào ô nhập, hỏi khi đóng lúc chưa lưu).
   - Helper lỗi `extractErrorMessage` / `applyServerErrors`, thông báo `toast` (sonner), xác nhận `useConfirm`.
   - Chuẩn hóa định dạng số kỹ thuật ($mm$, $m^2$, $m^3$, $kg$, VNĐ) qua `useNumberFormat`.

4. **[02c. Trang Danh Sách ListPage](.agents/rules/02c-frontend-tables-data.md):**
   - `ListPage` + `useListState` (tìm kiếm / lọc / trang / sắp xếp trên URL), `defineColumns` với lọc theo kiểu cột, menu cột thống nhất, ⚙ tùy chỉnh bảng, thanh hàng loạt.
   - Backend khai báo lookup lọc trong `filterset_fields` dạng dict. Xuất Excel qua `useExcelExport`. Template không có thùng rác.

5. **[02d. Trang Chi Tiết DetailPage](.agents/rules/02d-frontend-detail-views.md):**
   - `DetailPage`: Hero 2 tầng khai báo, 1 nút chính + menu ⋯, tab `?tab=`, tab Tệp đính kèm / Nhật ký dùng chung, Skeleton, 404.
   - Không lặp thông tin giữa Hero và tab.

5b. **[02e. UI/UX Gọn Gàng & Tải Dữ Liệu Tiết Kiệm](.agents/rules/02e-frontend-ux.md):**
   - Mỗi màn hình 1 mục tiêu chính, hiển thị theo lớp (tab / Drawer / Popover), không khối trang trí.
   - Layout theo thang khoảng cách 4/8, không Card lồng Card, tối đa 1 nút primary mỗi vùng, kiểm tra 375px.
   - Chỉ gọi API cho dữ liệu đang hiển thị: query trong tab, `enabled: open`, phân trang server, 1 endpoint gộp cho số liệu tổng hợp.

5c. **[02f. Đa ngôn ngữ vi / en](.agents/rules/02f-frontend-i18n.md):**
   - Không viết cứng chữ hiển thị: `useTranslations("<namespace>")`, chữ ở `client/messages/<vi|en>/<namespace>.json` (vi là nguồn chuẩn).
   - Hằng số ngoài component lưu khóa `MessageKey`, dịch lúc render; tham số ICU thay cho nối chuỗi; `npm run i18n:check` so khớp vi ↔ en.

6. **[03. Quy chuẩn Backend Django + PostgreSQL](.agents/rules/03-backend-django-rules.md):**
   - Kiến trúc Domain-Driven Apps tại `server/apps/`.
   - Quy chuẩn CSDL: `PascalCase` cho tên bảng (số nhiều) và tên cột trong DBML (Django: `db_table` PascalCase, field `snake_case`), khóa chính `Id`, khóa ngoại `<Target>Id`.
   - Bộ trường Audit bắt buộc: `Description`, `IsActive`, `CreatedById`, `UpdatedById`, `CreatedAt`, `UpdatedAt`, `DeletedAt` (Soft Delete).
   - **Sắp xếp mặc định & Index:** Mọi API Get danh sách và QuerySet luôn sắp xếp theo `['-updated_at', 'id']` và có composite index tương ứng.
   - Tối ưu hóa truy vấn chống N+1 Query (`select_related`, `prefetch_related`), bọc giao dịch ghi dữ liệu bằng `with transaction.atomic():`.
   - **Quy chuẩn API Options vs Thực thể động:** Endpoint `/options/` chỉ chứa metadata cố định (models, actions). Thực thể động (Users, Customers...) bắt buộc dùng API riêng có phân trang và search.
   - **Tinh gọn Serializer & Bảo mật Quyền hạn:** API danh sách người dùng (`GET /users/`) chỉ trả về thông tin cốt lõi, cấm trả về mảng `permissions` hay nested role permission arrays; `permissions` chỉ dành riêng cho `/auth/me/`.
   - SimpleJWT authentication + Role-Based Access Control (RBAC).

6b. **[03b. Hợp đồng API chuẩn & Template Backend](.agents/rules/03b-backend-api-contract.md):**
   - Response thống nhất `{success, message, data, errors, code}` tự động qua renderer; lỗi luôn `raise` (`ValidationError`, `BusinessError`, `NotFound`).
   - `BaseERPViewSet` có sẵn CRUD, statistics, batch-* (payload `{ids}`), export; quy tắc nghiệp vụ qua hook `check_can_destroy` / `check_can_change_status` / `after_write`.
   - `ModulePermissionChecker` fail-closed + bảng quyền mặc định theo action; test bắt buộc chạy trong container Docker.

8. **[05. Tự động Đúc kết & Cập nhật Rules (Continuous Learning)](.agents/rules/05-continuous-learning.md):**
   - Bất cứ khi nào USER yêu cầu pattern chung mới hoặc khi xử lý xong một lỗi kỹ thuật quan trọng (không được phép lặp lại), Agent **bắt buộc phải chủ động cập nhật** vào Rules và Git để duy trì bộ nhớ tri thức lâu dài cho dự án.

9. **[06. Sổ tay Lỗi đã gặp (Known Pitfalls)](.agents/rules/06-known-pitfalls.md):**
   - Danh sách các lỗi đã thực sự xảy ra (phân quyền export, sinh trùng mã NVL, N+1, chỉ lấy trang đầu danh sách, refresh token, blob error...) kèm quy tắc phòng tránh. Bắt buộc đọc trước khi code.

10. **[07. Kiểm thử (Testing)](.agents/rules/07-testing.md):**
   - Bảng chọn công cụ theo tình huống: Django `TestCase` (API, quyền, nghiệp vụ, service), Vitest + Testing Library (hàm thuần, hook, component có hành vi), Playwright (luồng chính end-to-end).
   - Sửa lỗi → viết test tái hiện trước; quy tắc nghiệp vụ / logic thuần mới → test cùng commit.

---

## 🛠️ 3. DANH MỤC CÁC SPECIALIZED SKILLS (TÍCH HỢP TRONG REPO)

Mọi Agent trước khi thực hiện tác vụ liên quan đều **bắt buộc phải đọc và sử dụng đúng Skill tương ứng**:

1. **[antd](.agents/skills/antd/SKILL.md):** *(không áp dụng cho stack hiện tại)*
   - Frontend đã chuyển sang Tailwind v4 + shadcn/ui; skill này chỉ giữ lại cho dự án khác còn dùng Ant Design.
   - Thêm primitive shadcn: `npx shadcn@latest add <component>` (vào `client/src/components/ui`).

2. **[frontend-design](.agents/skills/frontend-design/SKILL.md):**
   - Thiết kế giao diện web ứng dụng hiện đại, mang tính thẩm mỹ cao, bảng màu công nghiệp Enterprise 2.0 (Precision Navy `#1E40AF`, Emerald `#059669`, Amber `#D97706`).

3. **[ui-ux-pro-max](.agents/skills/ui-ux-pro-max/SKILL.md):**
   - Kho tri thức 79 UI styles, 192 color palettes, responsive layouts, data density và chuẩn tương tác người dùng cho hệ thống quản trị dữ liệu lớn.

4. **[brainstorming](.agents/skills/brainstorming/SKILL.md):**
   - Quy trình tư duy & trao đổi: Phân loại tác vụ (Spike / Bounded / Architectural), làm rõ mục tiêu và đề xuất phương án trước khi viết code.

5. **[django-patterns](.agents/skills/django-patterns/SKILL.md):**
   - Best practices cho Django REST Framework, Base ViewSets, Base Services, Serializers, ORM Caching và Transaction Management.

---

## 🔍 4. TÀI LIỆU THAM CHIẾU NGỮ CẢNH DỰ ÁN

- **File Thiết kế CSDL DBML Duy nhất:** [server/database.dbml](server/database.dbml)
- **Hướng dẫn Template:** [docs/TEMPLATE.md](docs/TEMPLATE.md)
- **Tác giả:** ERICSS — GitHub [@nguyenphat006](https://github.com/nguyenphat006)
