# Server — Django 5.2 LTS + DRF + PostgreSQL

Quy chuẩn chi tiết: `../.claude/rules/backend-django.md` và `../.claude/rules/security-rbac.md` (tự nạp khi làm việc với `server/**`).
Thiết kế CSDL: `database.dbml` — đọc trước khi đụng model.

## Lệnh (chạy trong `server/`, dùng venv `server/venv`)
```bash
# Windows PowerShell: .\venv\Scripts\Activate.ps1   |   Git Bash: source venv/Scripts/activate
python manage.py runserver                 # http://localhost:8000
python manage.py makemigrations
python manage.py migrate
python manage.py check                     # phải 0 issues
python manage.py bootstrap --demo          # migrate + seed_core + seed_demo (máy mới)
python manage.py seed_core                 # module registry + quyền + vai trò + admin (idempotent)
python manage.py seed_core --reset-role-permissions  # đưa quyền vai trò mặc định về ROLE_PERMISSION_MAP
python manage.py seed_portfolio            # nạp dự án / bài viết của landing (không ghi đè bản ghi đã có)
celery -A config worker --loglevel=info    # tác vụ xuất/nhập nền (cần Redis)
```
Docker (từ thư mục gốc): `docker compose up -d db redis` rồi chạy Django local, hoặc `docker compose up` cả stack.
Env: `.env` (mẫu `.env.example`); có `DATABASE_URL` → dùng Neon/Postgres đó.

## Bản đồ nhanh
- `config/` — settings, urls (`/api/v1/`, Swagger `/api/schema/swagger-ui/`), celery.
- `apps/core/` — `AuditModel`, `SoftDeleteManager`, `BaseERPViewSet`, `StandardResultsSetPagination`, `success_response`/`error_response`, `ModulePermissionChecker`, `excel_service`, Attachment, DataTransferJob.
- `apps/authentication/` — CustomUser, Role, Permission, ModuleRegistry, JWT, seed commands.
- `apps/audit/` — API đọc lịch sử `django-pghistory`.
- `apps/dashboard/` — API trang Tổng quan (KPI theo quyền).
- `apps/projects/`, `apps/blogs/`, `apps/contacts/` — nội dung portfolio (CRUD cho admin + API công khai `views_public.py` dưới `/api/v1/public/`). `projects` chứa nhóm menu `CONTENT`, lệnh `seed_portfolio` và `seed_data/portfolio.json`.
