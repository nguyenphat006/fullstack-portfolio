# Fullstack Portfolio — Django + Next.js

Portfolio cá nhân của **ERICSS**: landing page công khai (`client/src/app/(landing)`) + khu quản trị nội dung (`client/src/app/(admin)`) + API Django. Nền tảng backend/admin dựng từ template Django + Next.js (lõi: đăng nhập, RBAC, người dùng, nhật ký, đính kèm, xuất Excel, tìm kiếm, i18n). Phân hệ nghiệp vụ: `projects`, `blogs`, `contacts` (menu nhóm `CONTENT`, route `/content/*`).
Landing **giữ nguyên giao diện/nội dung**; hiện đọc dữ liệu tĩnh từ `client/src/config/`, API công khai `/api/v1/public/*` đã sẵn để nối sau. Landing và admin có root layout + CSS riêng (không dùng chung `components/ui`: landing dùng `components/landing/ui`). Trang chủ admin là `/dashboard` (không phải `/`).

Ngôn ngữ giao tiếp, UI text, docstring, commit message body: **tiếng Việt**. Tên biến/hàm/file: tiếng Anh.

## Cấu trúc monorepo

- `client/` — Next.js 16 (App Router, Turbopack, TS) + Tailwind CSS v4 + shadcn/ui (Radix, lucide-react, sonner, react-hook-form) + TanStack Query + Zustand. Xem thêm `client/AGENTS.md` (Next 16 có breaking changes, đọc `node_modules/next/dist/docs/` trước khi dùng API lạ).
- `server/` — Django 5.2 LTS + DRF + SimpleJWT + PostgreSQL (Neon hoặc Docker) + `django-pghistory` + Celery/Redis.
- `server/database.dbml` — **thiết kế CSDL duy nhất (single source of truth)**.
- `docker-compose.yml` — api, db (postgres 16), redis, celery_worker.
- `docs/GLOBAL_SEARCH.md` — tìm kiếm toàn cục (sidebar / Ctrl K): luồng, RBAC, cách thêm nguồn tìm `search.py`.
- `docs/TEMPLATE.md` — hướng dẫn gốc của template (module mẫu `master_data`/`customers`/`suppliers` đã được gỡ khỏi repo này).

## Lệnh thường dùng

```bash
# Backend (từ server/, venv tại server/venv)
python manage.py runserver
python manage.py makemigrations && python manage.py migrate && python manage.py check
python manage.py bootstrap --demo   # migrate + seed_core (module/quyền/vai trò/admin) + seed_portfolio (dự án/bài viết của landing)
python manage.py seed_core          # chạy lại an toàn: không ghi đè mật khẩu admin / quyền đã chỉnh trên UI

# Frontend (từ client/)
npm run dev
npx tsc --noEmit && npm run lint -- --max-warnings=0 && npm run build
npm test                            # unit / component test (Vitest)
E2E_BASE_URL=http://localhost:3000 E2E_PASSWORD=... npm run test:e2e   # smoke test Playwright

# Sinh phân hệ CRUD mới (backend rồi frontend) — chi tiết: docs/TEMPLATE.md
python manage.py startmodule <app> <Model> --label "<nhãn>" --route content/<route> --parent CONTENT
npm run gen:api && npm run gen:module -- --entity <Model> --label "<nhãn>" --route content/<route>

# Production
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

API base: `/api/v1/`; Swagger: `/api/schema/swagger-ui/`.

CI (`.github/workflows/ci.yml`) chạy lại toàn bộ health check trên mọi push/PR: backend (check, migration, test, schema OpenAPI) và frontend (types OpenAPI, khóa chữ vi/en, tsc, ESLint `--max-warnings=0`, Vitest, build). Dependabot (`.github/dependabot.yml`) mở 2 PR cập nhật mỗi đầu tháng (1 frontend, 1 backend; chỉ minor/patch) — chỉ merge khi CI xanh.

## Quy tắc bắt buộc

1. **DBML trước, code sau.** Không tạo model/bảng/cột nào chưa có trong `server/database.dbml`. Nếu cần thay đổi schema: đề xuất sửa DBML → chờ user duyệt → mới code.
2. **Tách lập kế hoạch và thực thi.** Khi user yêu cầu brainstorm / phân tích / lập plan / viết tài liệu, chỉ dừng ở tài liệu + phương án. Chỉ code khi user phê duyệt rõ ràng trong hội thoại.
3. **Health check trước khi báo xong** (dùng skill `/verify`):
   - Backend đổi: `makemigrations` → `migrate` → `check` = 0 issues.
   - Frontend đổi: `npx tsc --noEmit` → `npm run lint -- --max-warnings=0` → `npm run build` = 0 errors, 0 warnings.
   Báo cáo trung thực nếu có lỗi; không tuyên bố "xong" khi chưa chạy.
4. **Không tự thêm tính năng ngoài yêu cầu** (MetricCards, nút phụ...; template không có thùng rác). Xem `.claude/rules/frontend-tables.md`.
5. **Conventional Commits**: `feat(scope): ...`, `fix(...)`, `refactor(...)`, `docs(...)`. Chỉ commit khi user yêu cầu.

## Bộ rules theo phạm vi (`.claude/rules/`)

Các file có `paths:` chỉ được nạp khi làm việc với file khớp đường dẫn.

| File | Phạm vi |
|---|---|
| `workflow.md` | Luôn nạp — quy trình làm việc, cập nhật rules |
| `backend-django.md` | `server/**` |
| `frontend-architecture.md` | `client/**` |
| `frontend-forms.md` | `client/src/**` |
| `frontend-tables.md` | `client/src/**` |
| `frontend-detail-views.md` | `client/src/**` |
| `frontend-ux.md` | `client/src/**` — UI/UX gọn gàng, layout có hệ thống, chỉ tải dữ liệu đang hiển thị |
| `frontend-i18n.md` | `client/**` — đa ngôn ngữ vi / en (next-intl), không viết cứng chữ hiển thị |
| `security-rbac.md` | `server/**`, `client/src/**` — phân quyền, tài khoản admin, tệp đính kèm |
| `testing.md` | `server/**`, `client/**` — dùng công cụ test nào cho tình huống nào (Django TestCase, Vitest, Playwright) |

## Skills dự án (`.claude/skills/`)

- `new-module` — quy trình dựng 1 module CRUD end-to-end (DBML → Django → Next.js).
- `verify` — chạy health check backend/frontend.
- `antd` — chỉ dùng cho dự án còn Ant Design; stack hiện tại là shadcn/ui (thêm component: `npx shadcn@latest add <tên>`).
- `django-patterns` — pattern DRF/ORM/transaction tổng quát.
- `frontend-design`, `ui-ux-pro-max` — thiết kế giao diện (bảng màu dự án: Navy `#1E40AF`, Emerald `#059669`, Amber `#D97706`).
- `brainstorming` — làm rõ yêu cầu & thiết kế trước khi code tính năng lớn.
- `docx`, `ppt-generation` — tài liệu / báo cáo Word, PowerPoint.

## Tác giả

Dự án và template do **ERICSS** xây dựng (GitHub [@nguyenphat006](https://github.com/nguyenphat006)). Giữ mục tác giả trong `README.md` khi tạo dự án mới từ template.
