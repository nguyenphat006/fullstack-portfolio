# Backend — Django REST API

API cho template quản trị: xác thực JWT, phân quyền RBAC động, nhật ký thao tác, tệp đính kèm, xuất/nhập Excel chạy nền và nền tảng CRUD dùng chung (`BaseERPViewSet`). Tổng quan toàn dự án: [`../README.md`](../README.md).

## 1. Công nghệ

| Thành phần | Thư viện | Phiên bản |
|---|---|---|
| Ngôn ngữ | Python | 3.12 |
| Framework | Django (LTS) | 5.2 |
| REST API | Django REST Framework | 3.17 |
| Xác thực | djangorestframework-simplejwt (access + refresh, blacklist) | 5.5 |
| Tài liệu API | drf-spectacular (OpenAPI 3, Swagger UI, ReDoc) | 0.30 |
| Lọc / tìm kiếm | django-filter | 25 |
| Nhật ký thay đổi | django-pghistory + django-pgtrigger (PostgreSQL trigger) | 3.9 / 4.17 |
| CSDL | PostgreSQL (psycopg2, dj-database-url) — **bắt buộc**, không hỗ trợ SQLite | 16 |
| Cache / hàng đợi | Redis + Celery | 7 / 5.6 |
| Excel / ảnh | openpyxl, Pillow | 3.1 / 12 |
| Production | gunicorn, whitenoise | 26 / 6.12 |

## 2. Cấu trúc

```text
server/
├── config/
│   ├── settings.py              # Cấu hình theo biến môi trường (DEBUG, DB, cache, JWT, bảo mật production)
│   ├── urls.py                  # /api/v1/ + Swagger + admin — có marker [startmodule]
│   └── celery.py
├── apps/
│   ├── core/                    # NỀN TẢNG DÙNG CHUNG
│   │   ├── models.py            #   TimeStampedModel, SoftDeleteModel, AuditModel, Attachment, DataTransferJob
│   │   ├── managers.py          #   SoftDeleteManager (objects bỏ bản ghi đã xóa, all_objects lấy tất cả)
│   │   ├── viewsets.py          #   BaseERPViewSet: CRUD + statistics + batch + export Excel
│   │   ├── responses.py         #   Hợp đồng response + success_response()
│   │   ├── renderers.py         #   EnvelopeJSONRenderer (tự bọc mọi response)
│   │   ├── exceptions.py        #   custom_exception_handler, BusinessError, ConflictError
│   │   ├── permissions.py       #   ModulePermissionChecker (fail-closed), cache quyền
│   │   ├── pagination.py        #   StandardResultsSetPagination
│   │   ├── excel_service.py · tasks.py   # Xuất/nhập Excel, tác vụ Celery
│   │   ├── views_health.py      #   GET /api/v1/health/
│   │   ├── module_template/     #   Khuôn sinh phân hệ mới
│   │   └── management/commands/startmodule.py
│   ├── authentication/          # Người dùng, vai trò, quyền, phân hệ/menu, JWT
│   │   ├── views/               #   auth.py, users.py, rbac.py, modules.py
│   │   └── management/commands/ #   bootstrap, seed_core, seed_rbac (tương thích cũ)
│   ├── audit/                   # API đọc nhật ký thao tác (pghistory)
│   ├── projects/ blogs/ contacts/   # Nội dung portfolio (CRUD admin + API công khai /public/)
├── database.dbml       # Thiết kế CSDL — nguồn chuẩn duy nhất
├── schema.yml                   # OpenAPI sinh bởi spectacular (frontend sinh types từ file này)
├── Dockerfile · Dockerfile.prod
└── requirements.txt
```

## 3. Cấu hình (`server/.env`, mẫu ở `.env.example`)

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `DEBUG` | `False` | Bật `True` khi dev |
| `SECRET_KEY` | — | **Bắt buộc** khi `DEBUG=False` |
| `DATABASE_URL` | — | Chuỗi kết nối PostgreSQL (Neon hoặc `postgres://postgres:postgres@db:5432/portfolio_db`) |
| `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, `CORS_ALLOWED_ORIGINS` | localhost | Tên miền được phép |
| `REDIS_CACHE_URL` | — | Cache dùng chung giữa các process (bắt buộc khi chạy nhiều worker) |
| `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND` | redis local | Hàng đợi tác vụ nền |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES`, `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | 60 / 7 | Thời hạn token |
| `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | admin | Tài khoản quản trị đầu tiên (`ADMIN_PASSWORD` bắt buộc khi `DEBUG=False`) |
| `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS` | True / 0 | Bảo mật HTTPS khi production |
| `TEST_DATABASE_URL` | Postgres local | CSDL cho unit test (không dùng CSDL cloud dùng chung) |

## 4. Chạy

```bash
# Docker (khuyên dùng): api + db + redis + celery_worker
docker compose up -d
docker compose exec api python manage.py bootstrap --demo

# Hoặc local
python -m venv venv && source venv/Scripts/activate   # Windows Git Bash
pip install -r requirements.txt
python manage.py bootstrap --demo
python manage.py runserver
```

| Lệnh | Tác dụng |
|---|---|
| `bootstrap [--demo]` | `migrate` + `seed_core` (+ `seed_demo`) — dùng cho máy mới và khi container production khởi động |
| `seed_core` | Phân hệ, quyền, vai trò, admin. Idempotent: **không** ghi đè mật khẩu admin hay ma trận quyền đã chỉnh trên UI |
| `seed_core --reset-role-permissions` | Đưa quyền các vai trò mặc định về `ROLE_PERMISSION_MAP` |
| `seed_portfolio` | Nạp dự án / bài viết của landing (từ `apps/projects/seed_data/portfolio.json`), không ghi đè bản ghi đã có |
| `startmodule <app> <Model> ...` | Sinh phân hệ CRUD mới (mục 7) |
| `spectacular --file schema.yml` | Sinh lại hợp đồng OpenAPI (phải 0 cảnh báo) |

## 5. Hợp đồng API

Mọi response JSON được bọc tự động:

```json
{ "success": true,  "message": "Thêm mới đơn vị tính thành công", "data": { "...": "..." }, "errors": null, "code": null }
{ "success": false, "message": "Mã ĐVT đã tồn tại.", "data": null, "errors": { "code": ["Mã ĐVT đã tồn tại."] }, "code": "validation_error" }
```

- Danh sách: `data = { count, total_pages, current_page, page_size, next, previous, results }` — query `page`, `page_size` (≤ 100), `search`, `ordering`, bộ lọc.
- Lỗi luôn `raise`: `ValidationError` (dữ liệu), `BusinessError` (quy tắc nghiệp vụ), `NotFound`, `ConflictError`.
- `code` ổn định: `validation_error`, `business_rule`, `not_found`, `permission_denied`, `not_authenticated`, `token_not_valid`, `conflict`, `server_error`.
- Endpoint chính: `/auth/login/`, `/auth/token/refresh/`, `/auth/me/`, `/auth/change-password/`, `/auth/logout/`, `/users/`, `/roles/`, `/permissions/grouped/`, `/modules/`, `/modules/navigation/`, `/audit-logs/`, `/attachments/`, `/jobs/`, `/health/`.

## 6. Viết một ViewSet

```python
class UnitOfMeasureViewSet(BaseERPViewSet):
    queryset = UnitOfMeasure.objects.select_related('created_by', 'updated_by').order_by('-updated_at', 'id')
    serializer_class = UnitOfMeasureSerializer                   # đọc — dùng cho mọi response
    write_serializer_class = UnitOfMeasureCreateUpdateSerializer  # ghi
    permission_classes = [IsAuthenticated, ModulePermissionChecker]
    permission_module = 'UNIT'
    filterset_fields = ['is_active']
    search_fields = ['code', 'name']

    def check_can_destroy(self, instance):          # áp dụng cho xóa đơn lẫn hàng loạt
        if instance.materials.exists():
            raise BusinessError("Không thể xóa ĐVT đang được sử dụng.")
```

- Có sẵn: CRUD, `statistics`, `batch-delete`, `batch-status`, `export-columns`, `export-excel`, `excel-template`. Payload hàng loạt: `{"ids": [...]}`.
- Hook: `check_can_destroy`, `check_can_change_status`, `after_write`, `get_statistics`.
- Model nghiệp vụ kế thừa `AuditModel` (thời gian, người tạo/sửa, mô tả, xóa mềm) và gắn `@pghistory.track(...)`.

## 7. Phân quyền (RBAC)

- **Phân hệ** (`ModuleRegistry`) → **quyền** `<MODULE>_<ACTION>` (VIEW, READ, CREATE, UPDATE, DELETE, EXPORT, IMPORT) → **vai trò** → **người dùng**. Superuser và vai trò `ADMIN` có mọi quyền.
- `ModulePermissionChecker` suy ra quyền từ action (`list` → `_READ`, `export_excel` → `_EXPORT`...). Chỉ khai `custom_action_permissions` cho action riêng.
- Quyền được cache (Redis) và tự làm mới khi đổi vai trò / ma trận.
- Khai báo phân hệ + quyền mặc định trong `seed_core.py` (`crud_permissions('CODE', 'nhãn')` sinh đủ 7 quyền). Mã quyền ngừng dùng → `OBSOLETE_PERMISSIONS` (seed tự xóa).
- `custom_action_permissions` nhận 1 mã hoặc danh sách mã thay thế (có 1 là đủ).
- Tài khoản: chỉ Quản trị viên được gán vai trò `ADMIN` và sửa tài khoản Quản trị viên; không ai tự đổi vai trò của mình; tạo / nhập người dùng bắt buộc mật khẩu ≥ 8 ký tự (không có mật khẩu mặc định).
- Tệp đính kèm: quyền theo thực thể cha (`entity_type` → `<MODULE>_READ` / `_UPDATE`); tải tệp qua link ký hết hạn 1 giờ (`file_url`), không qua `/media/` trực tiếp.

## 8. Sinh phân hệ mới

```bash
python manage.py startmodule <app> <Model> --label "<nhãn>" --route content/<route> --parent CONTENT
```

Tạo `apps/<app>/` (model, serializer đọc/ghi, ViewSet, urls, admin, test), tự đăng ký vào `settings.py`, `urls.py`, `seed_core.py`, và in ra bảng DBML cần bổ sung. Sau đó: thêm trường nghiệp vụ → `makemigrations` → `migrate` → `seed_core` → test → `spectacular`. (`--route` viết không có "/" đầu.)

## 9. Test

```bash
docker compose exec -e TEST_DATABASE_URL=postgres://postgres:postgres@db:5432/app_db api python manage.py test --noinput
```

Mẫu: `apps/projects/tests.py` (hợp đồng API, phân quyền, API công khai), `apps/authentication/tests_seed.py` (lệnh seed). Module mới bắt buộc có test cho quy tắc nghiệp vụ và service tính toán.

## 10. Production

`Dockerfile.prod`: build nhiều tầng, chạy bằng user không phải root, `collectstatic` (whitenoise), khởi động bằng `bootstrap` rồi `gunicorn`, healthcheck `/api/v1/health/`. Toàn bộ stack: [`../docker-compose.prod.yml`](../docker-compose.prod.yml) — xem [`../docs/TEMPLATE.md`](../docs/TEMPLATE.md).
