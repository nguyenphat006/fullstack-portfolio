---
description: "Quy chuẩn phát triển Backend Django 5, DRF, PostgreSQL, Query Optimization & Transaction"
globs: ["server/**/*", "docker-compose.yml"]
always_apply: true
---

# ⚙️ QUY CHUẨN PHÁT TRIỂN BACKEND (DJANGO + POSTGRESQL)

## 1. Cấu trúc Domain-Driven Apps (`server/apps/`)
- Tất cả các app chức năng đều nằm trong `server/apps/` (ví dụ: `apps/core`, `apps/authentication`, `apps/audit`, `apps/master_data`, `apps/customers`, `apps/suppliers`).
- Sử dụng Custom User model: `AUTH_USER_MODEL = 'authentication.CustomUser'`.

## 2. Quy chuẩn Cơ sở Dữ liệu (Database Naming Conventions)
- **Tên Bảng:** `PascalCase` số nhiều (ví dụ: `Users`, `ProductBases`, `ProductVariants`, `Materials`, `Finishes`).
- **Tên Cột trong DBML:** `PascalCase` (ví dụ: `Id`, `Sku`, `CustomerCode`, `StandardCost`, `CreatedAt`).
  - **Django thực tế:** `db_table` = tên bảng DBML (PascalCase số nhiều), field viết `snake_case` (`MaterialCode` ↔ `material_code`), không dùng `db_column`.
- **Khóa chính (PK):** `Id int [primary key, increment]`.
- **Khóa ngoại (FK):** `<TargetEntitySingular>Id` (ví dụ: `ProductBaseId`, `BaseUomId`, `CustomerId`).
- **Bộ trường Audit bắt buộc trên mọi Model (`apps/core/models.py`):**
  - `Description`: Text mô tả / ghi chú kỹ thuật.
  - `IsActive`: Boolean (mặc định `True`).
  - `CreatedById`: FK tới `Users.Id`.
  - `UpdatedById`: FK tới `Users.Id`.
  - `CreatedAt`: DateTime tự động tạo (`auto_now_add=True`).
  - `UpdatedAt`: DateTime tự động cập nhật (`auto_now=True`).
  - `DeletedAt`: DateTime cho cơ chế **Soft Delete** (`null` nếu còn dùng, có giá trị khi đã xóa mềm).

## 3. Quy chuẩn Xóa mềm (Soft Delete)
- **TUYỆT ĐỐI KHÔNG** xóa cứng (`Hard Delete`) dữ liệu nghiệp vụ, danh mục hoặc lịch sử sản xuất khỏi Database.
- Mọi model phải kế thừa lớp `SoftDeleteModel` và sử dụng `SoftDeleteManager`.

## 4. Tối ưu hóa Truy vấn & Chống N+1 Query
- Mọi ViewSet / QuerySet có khóa ngoại (Foreign Key) **bắt buộc** phải dùng:
  - `select_related(...)` cho quan hệ One-to-One và Many-to-One (ví dụ: `category`, `unit`, `customer`) — **kể cả `created_by`, `updated_by`** khi serializer đọc `created_by.full_name`.
  - Đếm quan hệ con (vd. `children_count`) dùng `annotate(Count(...))`, không dùng `source='children.count'`.
  - `prefetch_related(...)` cho quan hệ One-to-Many và Many-to-Many (ví dụ: `items`, `formula_items`).
  - *Ví dụ chuẩn:* `ProductVariants.objects.select_related('product_base', 'customer', 'base_uom')`.

## 5. Toàn vẹn Dữ liệu với Transaction Atomic
- Mọi tác vụ ghi dữ liệu liên bảng phức tạp (ví dụ: Tạo Cây BOM gồm Header + nhiều Items, hoặc Import bảng tính) **bắt buộc** phải bọc trong:
  ```python
  from django.db import transaction

  with transaction.atomic():
      # Ghi dữ liệu bảng cha và các bảng con
  ```
- Nếu có bất kỳ lỗi nào xảy ra ở bảng con, toàn bộ giao dịch sẽ tự động rollback, bảo vệ tính nhất quán của Database.

## 6. Mô hình Service Layer (Tách biệt Nghiệp vụ Tính toán)
- Các hàm tính toán kỹ thuật nặng (Bóc tách vật tư tự động `BOMExplosionService`, Tính diện tích sơn bề mặt, Tính giá thành định mức) **không viết dồn vào `views.py` hay `serializers.py`** mà phải tách thành các file `services/*.py` riêng biệt trong từng app.
- Khi sinh hàng loạt chi tiết linh kiện BOM, sử dụng `bulk_create()` / `bulk_update()` thay vì vòng lặp `for item in items: item.save()`.

## 7. API, Response & Phân trang Chuẩn Hóa
- **Hợp đồng response, BaseERPViewSet, phân quyền theo action, test:** xem [03b. Hợp đồng API chuẩn](./03b-backend-api-contract.md).
- Mọi response JSON có dạng `{success, message, data, errors, code}` (tự động qua renderer); danh sách phân trang `StandardResultsSetPagination` nằm trong `data`: `{count, total_pages, current_page, page_size, next, previous, results}`.
- Lỗi luôn `raise` (`ValidationError`, `BusinessError`, `NotFound`), không tự `return Response(errors, 400)`.

## 8. Xác thực JWT & Phân quyền Role-Based (RBAC)
- Sử dụng SimpleJWT (`/api/v1/auth/login/`).
- Token trả về luôn bao gồm cả `tokens` (access, refresh) và `user` profile.
- Vai trò mặc định khai báo ở `DEFAULT_ROLES` (`seed_core`): `ADMIN`, `MANAGER`, `STAFF` + các vai trò mẫu của dự án gốc (`CHIEF_ENGINEER`, `BOM_DESIGNER`, ...). Dự án mới sửa danh sách này cho khớp nghiệp vụ.

## 9. Quy tắc Import & Tránh Lỗi AppRegistryNotReady
- **TUYỆT ĐỐI KHÔNG** import Model trực tiếp trong file `__init__.py` của bất kỳ app nào nằm trong `INSTALLED_APPS` (tránh lỗi `AppRegistryNotReady: Apps aren't loaded yet`).
- Các module khác khi cần dùng Core Patterns hãy import trực tiếp từ file cụ thể:
  `from apps.core.models import AuditModel, SoftDeleteModel`, `from apps.core.viewsets import BaseERPViewSet`.

## 10. Quy Chuẩn Sắp Xếp Mặc Định & Đánh Index Cho API Get Danh Sách
- **Thứ tự sắp xếp bắt buộc:** Mọi API Get danh sách và QuerySet mặc định **phải luôn sắp xếp theo thời gian cập nhật mới nhất trước (`-updated_at` hoặc `-UpdatedAt`), trường hợp trùng nhau thì sắp xếp theo Mã Id tăng dần (`id` hoặc `Id`)**.
- **Đánh Index tối ưu hiệu năng:** Bắt buộc khai báo Composite Index trên Model `class Meta`:
  ```python
  class Meta:
      ordering = ['-updated_at', 'id']
      indexes = [
          models.Index(fields=['-updated_at', 'id']),
      ]
  ```
  Giúp PostgreSQL / Neon DB quét dữ liệu tức thì (Index Scan) mà không bị chậm khi dữ liệu lên đến hàng trăm nghìn bản ghi.

## 11. Quy Trình Xác Thực Môi Trường Backend Bắt Buộc (Auto-Migration & Health Check)
- **BẮT BUỘC:** Sau mỗi lần tạo mới hoặc chỉnh sửa Models Django, Agent phải luôn thực thi chuỗi lệnh kiểm tra môi trường:
  1. `python manage.py makemigrations` (Tạo file migration)
  2. `python manage.py migrate` (Áp dụng migration vào CSDL thực tế PostgreSQL / Neon DB)
  3. `python manage.py check` (Đảm bảo 0 issues hệ thống)
- **Console Encoding:** `manage.py` đã ép stdout/stderr UTF-8 nên lệnh quản trị in được tiếng Việt; script chạy ngoài `manage.py` vẫn nên dùng ASCII (console Windows `cp1252`).
- **Phân quyền theo app:** phân hệ / quyền / quyền mặc định theo vai trò khai trong `apps/<app>/rbac.py` (`MODULES`, `PERMISSIONS = crud_permissions(...)`, `ROLE_PERMISSIONS`); `seed_core` tự gom (`apps/core/rbac_registry.py`) và chỉ giữ phần lõi. `startmodule` tự sinh `rbac.py`. Code lõi không phụ thuộc cứng app mẫu `master_data`.
- **Tìm kiếm toàn cục:** nguồn tìm của app khai trong `apps/<app>/search.py` (`SEARCH_PROVIDERS = [SearchProvider(module_code, model, code_field, title_field, url, ...)]`), `apps/core/search_registry.py` tự gom; `/search/` lọc RBAC `<MODULE>_READ` + phân hệ đang bật theo từng nguồn. `startmodule` sinh sẵn `search.py`. Chi tiết: `docs/GLOBAL_SEARCH.md`.

## Đa ngôn ngữ (vi mặc định, en)
- `LocaleMiddleware` chọn ngôn ngữ theo `Accept-Language` (frontend gửi theo cookie `NEXT_LOCALE`). Chuỗi tiếng Việt là **khóa** (msgid); bản dịch ở `server/locale/en/LC_MESSAGES/django.po`.
- Bọc mọi chuỗi trả cho client: thông điệp CRUD / batch, lỗi (`ValidationError`, `BusinessError`, `NotFound`…), `verbose_name`, nhãn `TextChoices`, tiêu đề cột Excel. Cấp module / class: `gettext_lazy as _`; trong hàm: `gettext`. Thông điệp dùng chung ở `apps/core/messages.py`.
- Tham số dùng placeholder có tên, **không** f-string trong `_()`: `_("Mã '%(code)s' đã tồn tại.") % {"code": code}`.
- Không dịch: summary / tag Swagger, `help_text`, docstring, log, output lệnh quản trị, dữ liệu seed / dữ liệu người dùng. Thông báo (`notify`) lưu theo ngôn ngữ của request tạo ra nó.
- Sau khi thêm chuỗi: `makemessages -l en --no-location --ignore='venv/*' --ignore='*/migrations/*' --ignore='*/module_template/*'` → dịch msgstr trống → `compilemessages` (container `api` có gettext). CI đỏ khi còn chuỗi chưa dịch / fuzzy; `tests_i18n.py` đỏ khi `.mo` cũ.
- Cache có chữ theo ngôn ngữ (vd. cây menu) phải thêm mã ngôn ngữ vào khóa cache (`user_nav_tree_{id}_{lang}`).

## 12. Quy Tắc Bảo Vệ Tuyệt Đối Tài Khoản & Vai Trò Quản Trị Viên (Superadmin / Admin Protection)
- **Cấm Xóa Admin:** Hệ thống Backend (cả API đơn lẻ `destroy` và API hàng loạt `batch_delete`) **tuyệt đối không cho phép xóa** bất kỳ tài khoản nào là `is_superuser=True`, có vai trò `ADMIN`, hoặc có `username='admin'`.
- **Cấm Xóa Role ADMIN:** Vai trò hệ thống `ADMIN` là vai trò cốt lõi và không thể bị xóa khỏi hệ thống.
- **Phía Frontend:** Nút xóa tài khoản Admin phải luôn ở trạng thái disabled và checkbox chọn hàng loạt bị vô hiệu hóa kèm Tooltip giải thích rõ ràng.

## 13. Quy Chuẩn Thiết Kế API Options (Metadata Filter Endpoint) vs Thực Thể Động
- **Phạm vi của API `/options/`:** Các API tùy chọn bộ lọc dạng `.../options/` (ví dụ: `/api/v1/audit-logs/options/`...) **chỉ được phép chứa các danh mục metadata cố định, số lượng ít và hiếm khi thay đổi** (ví dụ: danh sách Model hệ thống, danh mục Actions thao tác theo chuẩn RBAC).
- **Tuyệt đối KHÔNG gộp các thực thể động (Users, Customers, Products...):**
  - Không nhúng danh sách các thực thể động có số lượng lớn, thay đổi thường xuyên vào API `/options/`.
  - Các thực thể này **bắt buộc phải được phục vụ độc lập bằng API danh sách riêng** (ví dụ: `/api/v1/users/`) có đầy đủ cơ chế phân trang (`page`, `page_size`) và tìm kiếm (`search`).
  - Phía Frontend sẽ sử dụng component chọn lọc hỗ trợ tìm kiếm từ xa (Remote Search with Debounce) và tải thêm khi cuộn (Infinite Scroll Pagination) từ API riêng đó.

## 14. Quy Chuẩn Tinh Gọn Payload Serializer & Bảo Mật Quyền Hạn (Clean Serializer & Zero N+1)
- **Cấm trả về danh sách `permissions` trong API danh sách Người dùng (`GET /api/v1/users/`):**
  - Danh sách tài khoản người dùng chỉ gói gọn các trường thông tin cốt lõi: `id`, `username`, `name`, `full_name`, `email`, `phone_number`, `avatar`, `is_active`, `is_superuser`, `roles` (tinh gọn: `id`, `role_code`, `role_name`), `role_codes`, `last_login`, `description`, `created_at`, `updated_at`.
  - **Tuyệt đối KHÔNG** nhúng mảng `permissions` hay các nested role permission arrays (`permission_ids`, `permission_codes`) vào từng đối tượng user trong danh sách. Điều này vừa làm lộ cấu trúc phân quyền hệ thống, vừa gây phình to payload JSON (hàng chục KB cho mỗi trang phân trang).
- **Tách biệt Serializer Hồ sơ Đăng nhập vs Serializer Danh sách:**
  - Danh sách quyền hạn (`permissions`) **chỉ được phép xuất hiện tại API của chính người dùng đang đăng nhập** (`/api/v1/auth/me/` qua `CurrentUserProfileSerializer`) phục vụ kiểm soát giao diện phía Frontend (`usePermission`).
- **Triệt tiêu N+1 Query trong Serializer Method Field:**
  - Khi cần lấy danh sách mã (như `role_codes`) trên đối tượng cha, bắt buộc tận dụng quan hệ đã được nạp sẵn qua `prefetch_related('roles')` trong bộ nhớ:
    ```python
    def get_role_codes(self, obj):
        # Sử dụng obj.roles.all() trong bộ nhớ, KHÔNG dùng values_list() hay filter()
        return [r.role_code for r in obj.roles.all()]
    ```
  - Tuyệt đối không gọi `values_list()` hay `filter()` trực tiếp trong `SerializerMethodField` vì sẽ bypass bộ nhớ đệm prefetch và sinh thêm một câu truy vấn SQL riêng biệt cho từng dòng bản ghi.

## 15. Quy Chuẩn Xuất Dữ Liệu Excel / CSV & Nhúng Hình Ảnh (Openpyxl & Pillow)
- **Hỗ trợ Song song GET và POST:**
  - Endpoint `.../export-excel/` hỗ trợ:
    - `GET`: Xuất nhanh toàn bộ dữ liệu đang lọc theo query params.
    - `POST`: Nhận payload JSON chứa danh sách cột tùy chọn (`columns`), phạm vi ID (`ids`), định dạng (`format`: `xlsx` / `csv`), và cờ `include_images: bool`.
- **Nhúng Hình ảnh vào Ô tính Excel:**
  - Sử dụng thư viện `Pillow` kết hợp `openpyxl.drawing.image.Image`.
  - Bắt buộc chuẩn hóa kích thước thumbnail (khuyến nghị `44x44px`), tự động căn giữa cột và tăng chiều cao dòng (`42pt`) để hình ảnh không bị đè lên văn bản.
  - Phải dùng buffer bộ nhớ `io.BytesIO` và bọc xử lý ngoại lệ (try/except). Khi file ảnh bị lỗi hoặc không tồn tại, hiển thị chuỗi fallback `[Ảnh lỗi]` hoặc để trống, tuyệt đối không để crash luồng xuất file.
- **Chuẩn hóa Định dạng CSV Tiếng Việt:**
  - Khi xuất file `.csv`, bắt buộc xuất kèm tiền tố UTF-8-BOM (`charset=utf-8-sig`) để Microsoft Excel trên Windows tự động nhận diện đúng dấu tiếng Việt không bị vỡ font.