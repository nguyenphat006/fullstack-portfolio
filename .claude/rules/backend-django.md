---
paths:
  - "server/**"
  - "docker-compose.yml"
---

# Backend Django + DRF + PostgreSQL

## Cấu trúc
- Mỗi domain là một app trong `server/apps/` (`core`, `authentication`, `audit`, `master_data`, `customers`, `suppliers`, ...).
- Router đăng ký trong `apps/<app>/urls.py`, gom vào `config/urls.py` dưới `/api/v1/`.
- Custom user: `AUTH_USER_MODEL = 'authentication.CustomUser'`.
- Không import model trong `__init__.py` của app (gây `AppRegistryNotReady`). Import từ file cụ thể: `from apps.core.models import AuditModel`.

## Mapping DBML → Django
DBML dùng PascalCase; code Django dùng snake_case. Quy ước thực tế trong repo:

| DBML | Django |
|---|---|
| `Table Materials` | `class Material(AuditModel)` + `Meta.db_table = "Materials"` |
| cột `MaterialCode` | field `material_code` (không dùng `db_column`) |
| `CategoryId int [ref: > MaterialCategories.Id]` | `category = models.ForeignKey(MaterialCategory, ...)` |
| audit fields `Description, IsActive, CreatedById, UpdatedById, CreatedAt, UpdatedAt, DeletedAt` | kế thừa `AuditModel` — không khai báo lại |

## Model
- Mọi model nghiệp vụ kế thừa `apps.core.models.AuditModel` (timestamp + soft delete + created_by/updated_by + description) và gắn `@pghistory.track(InsertEvent(), UpdateEvent(), DeleteEvent())` để có tab Nhật ký hoạt động.
- `Meta` bắt buộc: `db_table`, `verbose_name(_plural)` tiếng Việt, `ordering = ['-updated_at', 'id']`, `indexes = [models.Index(fields=['-updated_at', 'id']), ...]`. Ngoại lệ có chủ đích (vd. `MaterialCategory` sắp theo `sort_order` trước) phải có index tương ứng.
- Độ chính xác số: kích thước mm `DecimalField(10, 2)`; khối lượng/thể tích/định mức `(10, 4)`; tỷ lệ % `(5, 2)`; tiền `(18, 2)`. Không dùng `FloatField` cho số kỹ thuật/tiền.
- Enum logic hệ thống cố định → `models.TextChoices`; dữ liệu user quản trị trên UI → bảng + FK.

## Soft delete
- Không hard delete dữ liệu nghiệp vụ. `Model.objects` (SoftDeleteManager) đã loại bản ghi xóa mềm; dùng `all_objects` khi cần cả bản ghi đã xóa (vd. kiểm tra trùng mã có ràng buộc `unique` ở DB).
- **Không có thùng rác**: bản ghi đã xóa không xem lại / khôi phục qua API hay UI (không action `trash`, `restore`, `batch-restore`, `batch-hard-delete`). Xóa mềm chỉ để giữ khóa ngoại, chống trùng mã và nhật ký.

## Hợp đồng response (tự động — không tự bọc)
`EnvelopeJSONRenderer` + `custom_exception_handler` (`apps/core/`) bọc **mọi** response JSON:
```json
{"success": true,  "message": "…", "data": <payload>, "errors": null, "code": null}
{"success": false, "message": "…", "data": null, "errors": {"field": ["…"]} | null, "code": "validation_error"}
```
- Danh sách: `data = {count, total_pages, current_page, page_size, next, previous, results}`.
- View chỉ `return Response(data)` hoặc `success_response(data, message)` (khi cần thông điệp riêng).
- Lỗi: **raise**, không return lỗi thủ công:
  - dữ liệu sai → `serializer.is_valid(raise_exception=True)` / `raise ValidationError({'field': ['…']})`
  - vi phạm nghiệp vụ → `raise BusinessError("…")` (`apps.core.exceptions`, code `business_rule`)
  - không tìm thấy → `raise NotFound("…")`; xung đột → `ConflictError`
- Không dùng `Response(serializer.errors, status=400)` hay `error_response(...)` cho lỗi validate.
- Mã `code` ổn định để frontend rẽ nhánh: `validation_error`, `business_rule`, `not_found`, `permission_denied`, `not_authenticated`, `token_not_valid`, `conflict`, `server_error`.
- File download (Excel/CSV/FileResponse) không bọc envelope.

## ViewSet (kế thừa `apps.core.viewsets.BaseERPViewSet`)
Khai báo tối thiểu:
```python
class UnitOfMeasureViewSet(BaseERPViewSet):
    queryset = UnitOfMeasure.objects.select_related('created_by', 'updated_by').order_by('-updated_at', 'id')
    serializer_class = UnitOfMeasureSerializer                  # serializer ĐỌC (dùng cho mọi response)
    write_serializer_class = UnitOfMeasureCreateUpdateSerializer  # serializer GHI (create/update)
    permission_classes = [IsAuthenticated, ModulePermissionChecker]
    permission_module = 'UNIT'
    filterset_fields = ['is_active']
    search_fields = ['code', 'name']
    ordering_fields = ['created_at', 'updated_at', 'code', 'name']
```
- Có sẵn: CRUD (thông điệp tiếng Việt tự sinh từ `verbose_name`), `statistics`, `batch-delete`, `batch-status`, `export-columns`, `export-excel`, `excel-template`. **Không viết lại** các action này trong module.
- Payload hàng loạt: `{"ids": [...]}`; `batch-status` thêm `"is_active": true|false`. Response `{count, skipped: [{id, reason}]}`.
- Quy tắc nghiệp vụ đặt trong hook, áp dụng cho cả thao tác đơn lẫn hàng loạt:
  - `check_can_destroy(instance)` / `check_can_change_status(instance, is_active)` → `raise BusinessError`
  - `after_write(instance=None)` → việc phụ sau khi ghi (vd. `invalidate_user_permissions`)
  - `get_statistics(queryset)` → số liệu riêng; `perform_create/perform_update` → khi cần gán thêm trường
- Phân quyền `ModulePermissionChecker` **fail-closed** (thiếu `permission_module` = từ chối). Action chuẩn tự map theo `DEFAULT_ACTION_PERMISSIONS` (`list/retrieve/statistics` → `_READ`, `export_excel` → `_EXPORT`, `excel_template/import_excel` → `_IMPORT`, `batch_*` → `_UPDATE/_DELETE`...). Chỉ khai báo `custom_action_permissions` cho action riêng của module. Module code + quyền phải có trong `seed_core`.
- Swagger: gắn tag/summary tiếng Việt (`crud_schema(tag, entity)` trong `master_data/views.py` là mẫu). `SerializerMethodField` phải có type hint trả về (`-> int`, `-> list[str]`) hoặc `@extend_schema_field` để OpenAPI sinh đúng kiểu cho frontend.

## Công cụ sinh & vận hành
- Phân hệ CRUD mới: `python manage.py startmodule <app> <Model> ...` (khuôn: `apps/core/module_template/`). Đăng ký tự động qua marker `# [startmodule]` trong `config/settings.py`, `config/urls.py` — không xóa các marker này. CI job "Khuôn sinh phân hệ" chạy lại khuôn mỗi push.
- Phân hệ / quyền / quyền mặc định theo vai trò của một app khai báo trong **`apps/<app>/rbac.py`** (`MODULES`, `PERMISSIONS = crud_permissions(...)`, `ROLE_PERMISSIONS = {'MANAGER': perm_codes(...)}`); `seed_core` tự gom (`apps/core/rbac_registry.py`). `seed_core.py` chỉ giữ phần lõi (Tổng quan, Người dùng, Nhật ký, Cài đặt, vai trò). Không thêm phân hệ nghiệp vụ vào `seed_core.py`.
- **Tìm kiếm toàn cục:** nguồn tìm của app khai trong `apps/<app>/search.py` (`SEARCH_PROVIDERS = [SearchProvider(module_code, model, code_field, title_field, url, ...)]`), `apps/core/search_registry.py` tự gom; `/search/` lọc RBAC `<MODULE>_READ` + phân hệ đang bật theo từng nguồn. `startmodule` sinh sẵn `search.py`. Chi tiết: `docs/GLOBAL_SEARCH.md`.
- `seed_core`: ADMIN luôn nhận mọi quyền; vai trò mới nhận toàn bộ quyền mặc định; vai trò đã có chỉ được bổ sung quyền **vừa tạo lần đầu** (không ghi đè chỉnh sửa trên UI).
- Code ngoài app mẫu `master_data` không được phụ thuộc cứng vào nó (import model, mã quyền `MATERIAL_*` trong test lõi…) — dùng `apps.is_installed('apps.master_data')` khi cần.
- `GET /api/v1/health/` (public): kiểm tra CSDL + cache, dùng cho Docker healthcheck và Dashboard. Không trả chi tiết lỗi nhạy cảm.
- Production: `server/Dockerfile.prod` (gunicorn, non-root, whitenoise) chạy `bootstrap` khi khởi động — vì vậy mọi lệnh seed phải idempotent.

## Test (bắt buộc cho module mới)
- Đặt tại `apps/<app>/tests.py`; mẫu: `apps/master_data/tests.py` (`ApiTestMixin.assertEnvelope`, `make_user_with_perms`).
- Tối thiểu: list/create/validation error theo envelope, phân quyền (user thiếu quyền → 403), mọi quy tắc nghiệp vụ trong hook, mọi service tính toán (định mức, sinh mã).
- Chạy trong container (Postgres local của docker-compose, không dùng Neon):
  `docker exec -e TEST_DATABASE_URL=postgres://postgres:postgres@db:5432/app_db app_backend python manage.py test --noinput`

## Truy vấn & giao dịch
- FK/1-1 → `select_related`; reverse FK/M2M → `prefetch_related`. Không để N+1.
- Trong `SerializerMethodField`, đọc dữ liệu đã prefetch (`[r.role_code for r in obj.roles.all()]`), không gọi `.filter()` / `.values_list()` (bypass cache prefetch → N+1).
- Ghi nhiều bảng (header + lines, import Excel, sinh cây BOM) bọc `with transaction.atomic():`. Sinh hàng loạt dùng `bulk_create` / `bulk_update`.
- Sinh mã tuần tự (vd. `material_code`): `transaction.atomic()` + `select_for_update()` trên bản ghi cha + retry khi `IntegrityError` (tối đa 5 lần).
- Logic tính toán nặng (BOM explosion, diện tích sơn, giá thành) đặt trong `apps/<app>/services/*.py`, không nhồi vào view/serializer.

## Endpoint `/options/` vs dữ liệu động
- `/options/` chỉ trả metadata cố định, ít thay đổi (danh sách model, action RBAC, choices).
- Thực thể động (Users, Customers, Materials...) phải qua API danh sách riêng có `page`, `page_size`, `search`; frontend dùng Select remote search + debounce.

## Bảo mật & payload
Phân quyền tài khoản / vai trò / tệp đính kèm: xem `security-rbac.md`.
- `GET /users/` chỉ trả trường cốt lõi (`id, username, full_name, email, phone_number, avatar, is_active, is_superuser, roles{id, role_code, role_name}, role_codes, last_login, description, created_at, updated_at`). Không nhúng `permissions`.
- `permissions` chỉ có ở `/auth/me/` (`CurrentUserProfileSerializer`).
- Không cho xóa (đơn lẻ lẫn batch) user `is_superuser`, có role `ADMIN`, hoặc `username='admin'`; không cho xóa role `ADMIN`.

## Thông báo trong ứng dụng
- Gửi thông báo: `from apps.core.notifications import notify` → `notify(user, "Tiêu đề", message=..., level="SUCCESS", link="/module/12", source=("MODULE", 12))`. Lỗi khi gửi không làm hỏng thao tác chính.
- Người dùng chỉ đọc được thông báo của mình (`/notifications/`, `unread-count/`, `{id}/read/`, `read-all/`). Dọn thông báo đã đọc > 30 ngày: `python manage.py cleanup_notifications`.
- Thao tác lên tài khoản người khác (đặt lại mật khẩu, đổi vai trò) phải báo cho chủ tài khoản.

## Xuất / nhập Excel
- `.../export-excel/`: `GET` xuất theo query params; `POST` nhận `{columns, ids, format: 'xlsx'|'csv', include_images}`.
- Ảnh trong Excel: Pillow + `openpyxl.drawing.image.Image`, thumbnail ~44px, row height ~42pt, dùng `io.BytesIO`, bọc try/except → fallback `[Ảnh lỗi]`, không để crash cả file.
- CSV: encoding `utf-8-sig` (BOM) để Excel Windows hiển thị đúng tiếng Việt.
- Tác vụ lớn chạy Celery qua `DataTransferJob` (theo dõi tiến độ ở `FloatingTaskWidget`).

## Đa ngôn ngữ (vi mặc định, en)
- `LocaleMiddleware` chọn ngôn ngữ theo `Accept-Language` (frontend gửi theo cookie `NEXT_LOCALE`). Chuỗi tiếng Việt là **khóa** (msgid); bản dịch ở `server/locale/en/LC_MESSAGES/django.po`.
- Bọc mọi chuỗi trả cho client: thông điệp CRUD / batch, lỗi (`ValidationError`, `BusinessError`, `NotFound`…), `verbose_name`, nhãn `TextChoices`, tiêu đề cột Excel. Cấp module / class: `gettext_lazy as _`; trong hàm: `gettext`. Thông điệp dùng chung ở `apps/core/messages.py`.
- Tham số dùng placeholder có tên, **không** f-string trong `_()`: `_("Mã '%(code)s' đã tồn tại.") % {"code": code}`.
- Không dịch: summary / tag Swagger, `help_text`, docstring, log, output lệnh quản trị, dữ liệu seed / dữ liệu người dùng. Thông báo (`notify`) lưu theo ngôn ngữ của request tạo ra nó.
- Sau khi thêm chuỗi: `makemessages -l en --no-location --ignore='venv/*' --ignore='*/migrations/*' --ignore='*/module_template/*'` → dịch msgstr trống → `compilemessages` (container `api` có gettext). CI đỏ khi còn chuỗi chưa dịch / fuzzy; `tests_i18n.py` đỏ khi `.mo` cũ.
- Cache có chữ theo ngôn ngữ (vd. cây menu) phải thêm mã ngôn ngữ vào khóa cache (`user_nav_tree_{id}_{lang}`).

## Windows
- `manage.py` ép stdout/stderr UTF-8 nên lệnh quản trị in được tiếng Việt; script chạy ngoài `manage.py` vẫn nên dùng ASCII (console Windows cp1252).
- Windows có PostgreSQL cài sẵn chiếm cổng 5432 → kết nối `localhost:5432` trúng nhầm server (sai mật khẩu). Dừng service hoặc map container sang cổng khác.

## Sau khi sửa model / API
1. `python manage.py makemigrations` → `migrate` → `check` (0 issues). Không sửa tay migration đã commit.
2. Chạy test (lệnh ở mục Test).
3. Đổi serializer/endpoint → sinh lại hợp đồng: `python manage.py spectacular --file schema.yml` (0 warning) rồi ở `client/`: `npm run gen:api`.

## Bẫy đã gặp — không lặp lại
| Lỗi đã xảy ra | Quy tắc |
|---|---|
| Nút "Xuất Excel" báo 403 với mọi user thường: map quyền khai báo key `'export'` nhưng action thật tên `export_excel` → đòi quyền `*_EXPORT_EXCEL` không tồn tại | Key trong `custom_action_permissions` phải là **tên method của action** (`export_excel`, `batch_delete`…). Action chuẩn đã có trong `DEFAULT_ACTION_PERMISSIONS`, không khai báo lại. Viết test "user chỉ có `X_EXPORT` gọi được `export-excel/`". |
| ViewSet quên `permission_module` → mọi user đăng nhập đều truy cập được (fail-open) | `ModulePermissionChecker` đã fail-closed; ViewSet dữ liệu nghiệp vụ luôn khai báo `permission_module`. API chỉ cần đăng nhập phải có lý do ghi trong docstring. |
| Sinh mã NVL cấp lại mã của bản ghi đã xóa mềm → vi phạm `unique` ở DB, cả 5 lần retry đều trùng | Với cột `unique=True`, mọi kiểm tra trùng / tìm mã lớn nhất dùng `Model.all_objects` (gồm bản ghi xóa mềm), không dùng `objects`. |
| Logic chống trùng mã trong service không bao giờ chạy vì `ModelSerializer` tự thêm `UniqueValidator` và chặn trước | Trường do hệ thống cấp giá trị: `extra_kwargs = {'field': {'validators': []}}`, kiểm tra trùng trong `validate_<field>` (khi update) và service (khi create). Có test cho nhánh "mã đã tồn tại". |
| Xóa được ĐVT / nhóm NVL đang được dùng (xóa mềm không kích hoạt `on_delete=PROTECT`) | Mọi thực thể được FK tham chiếu phải có `check_can_destroy` kiểm tra quan hệ ngược (`instance.children.exists()`, `instance.materials.exists()`…). |
| N+1: serializer đọc `created_by.full_name` / `children.count` cho từng dòng | Mọi `source='fk.field'` → `select_related('fk')` trong queryset (kể cả `created_by`, `updated_by`); đếm quan hệ → `annotate(Count(...))` + `SerializerMethodField` đọc giá trị annotate. |
| Đổi quyền ở 1 process, process khác vẫn giữ quyền cũ tới 30 phút (`LocMemCache` là bộ nhớ riêng từng process) | Cache dùng chung (quyền, navigation, profile) chạy Redis qua `REDIS_CACHE_URL`. Không dựa vào LocMemCache ngoài dev 1 process. |
| Hai dự án clone từ template dùng chung 1 Redis với `KEY_PREFIX` cố định → cache menu / quyền của user cùng id lẫn sang dự án kia | `KEY_PREFIX` = `CACHE_KEY_PREFIX` hoặc tên CSDL; mỗi dự án một tiền tố. |
| Bỏ module mẫu phải sửa tay ~30 khối trong `seed_core.py`; phân hệ con có nhóm cha đã bỏ biến mất khỏi menu | Phân quyền theo app (`rbac.py`, xem "Công cụ sinh"); `/modules/navigation/` đưa phân hệ mồ côi nhóm cha lên cấp 1. |
| `bootstrap --demo` crash `UnicodeEncodeError` trên console Windows khi in tiếng Việt | `manage.py` ép stdout UTF-8 (`reconfigure`). |
| Test chạy trên Neon dùng chung → lỗi `database "test_…" is being accessed by other users`; `localhost:5432` trên Windows trúng PostgreSQL cài sẵn thay vì container | Test chạy trong container `app_backend` với `TEST_DATABASE_URL=…@db:5432/…`. Không trỏ test vào DB cloud. |
| View tự `return Response(serializer.errors, 400)` / `error_response(...)` → lệch định dạng lỗi, frontend không map được vào form | Lỗi luôn `raise` (xem mục Hợp đồng response). |
| Payload hàng loạt mỗi module một kiểu (`unit_ids`, `category_ids`, `user_ids`) | Chỉ dùng `{"ids": [...]}` và action hàng loạt của `BaseERPViewSet`. |
| OpenAPI sinh sai kiểu (`SerializerMethodField` thành `string`, APIView bị bỏ qua) → types frontend sai | `SerializerMethodField` có type hint / `@extend_schema_field`; APIView khai báo `@extend_schema(request=..., responses=...)`; `spectacular` phải 0 warning. |
| Django 5.1 chạy tiếp sau khi hết hạn hỗ trợ, tích 7 lỗ hổng đã công bố | Backend luôn ở bản **LTS** (hiện 5.2). Dependabot không nâng được khi `requirements.txt` chặn trần phiên bản → rà `pip-audit` mỗi khi bump major/minor. |
| `DEBUG` mặc định `True`, `SECRET_KEY` có giá trị dự phòng cứng trong code | `DEBUG` mặc định `False`; thiếu `SECRET_KEY` khi `DEBUG=False` → `ImproperlyConfigured`. Cấu hình production qua env (`SECURE_*`, `CSRF_TRUSTED_ORIGINS`). |
| Chạy lại lệnh seed đặt lại mật khẩu admin về mặc định và xóa ma trận quyền đã chỉnh trên UI; `seed_data` import app không tồn tại nên luôn crash | Lệnh seed phải idempotent và **không ghi đè dữ liệu người dùng đã sửa**: chỉ tạo khi chưa có, chỉ gán quyền cho vai trò mới; ghi đè phải qua cờ tường minh (`--reset-role-permissions`). Mật khẩu admin lấy từ env `ADMIN_PASSWORD`. Mọi lệnh seed có test (`apps/authentication/tests_seed.py`). |
| Tái sử dụng một instance serializer cho 2 trường (`database = x; cache = x`) → OpenAPI chỉ còn 1 trường, types frontend thiếu `database` | Mỗi trường lồng tạo instance riêng (`HealthComponentSerializer()` hai lần) hoặc dùng class; kiểm tra lại types sinh ra sau `gen:api`. |
| Git Bash trên Windows đổi tham số `/master-data/x` thành `C:/Program Files/Git/master-data/x` khi gọi `python` / `docker exec` | Tham số đường dẫn truyền **không có "/" đầu** (`--route master-data/x`); lệnh tự kiểm tra và báo lỗi nếu nhận dạng ổ đĩa. Script gọi `docker exec` dùng `MSYS_NO_PATHCONV=1`. |
| `CustomUser` kế thừa `AbstractUser` trước `SoftDeleteModel` → `User.objects` là `UserManager` của Django, **không** lọc xóa mềm → tài khoản đã xóa vẫn hiện trong API | Model kế thừa `AbstractUser` / lớp có manager riêng: kiểm tra `Model.objects` thực tế; ViewSet lọc `deleted_at__isnull=True`. Có test "xóa xong GET chi tiết → 404". |
