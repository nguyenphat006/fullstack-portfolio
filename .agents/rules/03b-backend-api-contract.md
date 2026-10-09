---
description: "Hợp đồng Response API chuẩn, BaseERPViewSet (template), phân quyền theo action và quy chuẩn test Backend"
globs: ["server/**/*", "client/src/lib/api/**/*"]
always_apply: true
---

# 🔌 HỢP ĐỒNG API CHUẨN & TEMPLATE BACKEND (BaseERPViewSet)

## 1. Định dạng Response Thống nhất (Tự động — KHÔNG tự bọc)
`apps.core.renderers.EnvelopeJSONRenderer` + `apps.core.exceptions.custom_exception_handler` tự bọc **mọi** response JSON:
```json
{ "success": true,  "message": "Thêm mới đơn vị tính thành công", "data": { ... }, "errors": null, "code": null }
{ "success": false, "message": "Mã ĐVT đã tồn tại.", "data": null, "errors": { "code": ["Mã ĐVT đã tồn tại."] }, "code": "validation_error" }
```
- **Danh sách phân trang** nằm trong `data`: `{ count, total_pages, current_page, page_size, next, previous, results }`.
- View chỉ `return Response(data)` hoặc `success_response(data, message)` khi cần thông điệp riêng.
- **Lỗi luôn `raise`, không `return`:**
  - Dữ liệu sai → `serializer.is_valid(raise_exception=True)` / `raise ValidationError({'field': ['...']})`
  - Vi phạm nghiệp vụ → `raise BusinessError("...")` (`apps.core.exceptions`, code `business_rule`)
  - Không tìm thấy → `raise NotFound("...")`; Xung đột → `raise ConflictError("...")`
- **TUYỆT ĐỐI KHÔNG** `return Response(serializer.errors, status=400)` hay `error_response(...)` cho lỗi validate.
- Mã `code` ổn định cho Frontend rẽ nhánh: `validation_error`, `business_rule`, `not_found`, `permission_denied`, `not_authenticated`, `token_not_valid`, `conflict`, `server_error`.
- File tải về (Excel/CSV/FileResponse) và HTTP 204/304 không bọc envelope.

## 2. BaseERPViewSet — Khai báo tối thiểu cho module mới
```python
@crud_schema(UNIT_TAG, "đơn vị tính")
class UnitOfMeasureViewSet(BaseERPViewSet):
    queryset = UnitOfMeasure.objects.select_related('created_by', 'updated_by').order_by('-updated_at', 'id')
    serializer_class = UnitOfMeasureSerializer                   # Serializer ĐỌC — dùng cho MỌI response
    write_serializer_class = UnitOfMeasureCreateUpdateSerializer  # Serializer GHI — create/update
    permission_classes = [IsAuthenticated, ModulePermissionChecker]
    permission_module = 'UNIT'
    filterset_fields = ['is_active']
    search_fields = ['code', 'name']
    ordering_fields = ['created_at', 'updated_at', 'code', 'name']

    def check_can_destroy(self, instance):
        if instance.materials.exists():
            raise BusinessError(f"Không thể xóa ĐVT '{instance.code}' vì đang được nguyên vật liệu sử dụng.")
```
- **Có sẵn, KHÔNG viết lại:** CRUD (thông điệp tiếng Việt tự sinh từ `verbose_name`), `statistics`, `batch-delete`, `batch-status`, `export-columns`, `export-excel`, `excel-template`. **Không có thùng rác** (không `trash` / `restore` / `batch-restore` / `batch-hard-delete`): bản ghi đã xóa không xem lại / khôi phục được.
- **Payload hàng loạt duy nhất:** `{"ids": [...]}`; `batch-status` thêm `"is_active": true|false`. Response `{count, skipped: [{id, reason}]}`.
- **Hook nghiệp vụ** (áp dụng cho cả thao tác đơn lẫn hàng loạt):
  - `check_can_destroy(instance)`, `check_can_change_status(instance, is_active)` → `raise BusinessError`
  - `after_write(instance=None)` → việc phụ sau khi ghi (invalidate cache...)
  - `get_statistics(queryset)` → số liệu riêng
- Mẫu tham chiếu: `server/apps/master_data/views.py`, `server/apps/authentication/views/users.py`.

## 3. Phân quyền theo Action (`ModulePermissionChecker`)
- **Fail-closed:** ViewSet thiếu `permission_module` → từ chối truy cập.
- Action chuẩn tự map qua `DEFAULT_ACTION_PERMISSIONS` (`apps/core/permissions.py`): `list/retrieve/statistics/export_columns` → `_READ`; `create` → `_CREATE`; `update/partial_update/batch_status` → `_UPDATE`; `destroy/batch_delete` → `_DELETE`; `export_excel` → `_EXPORT`; `excel_template/import_excel` → `_IMPORT`.
- Chỉ khai báo `custom_action_permissions` cho action **riêng** của module; key là **tên method** của action (`move_order`, không phải `move-order`).
- Giá trị có thể là **danh sách mã thay thế** (có 1 là đủ), vd. `'list': ['SETTINGS_READ', 'USER_CREATE', 'USER_UPDATE']` cho danh sách vai trò.
- Tài khoản: chỉ Quản trị viên được gán vai trò `ADMIN` và sửa / đổi mật khẩu tài khoản Quản trị viên (người khác → 403); không tự đổi vai trò của mình; không có mật khẩu mặc định (tạo / nhập bắt buộc `password` ≥ 8). Test: `apps/authentication/tests_security.py`.
- Tệp đính kèm (`apps/core/attachment_access.py`): quyền theo thực thể cha (`entity_type` → `<MODULE>_READ` / `_UPDATE`); `file_url` là link ký hết hạn 1 giờ, không trả `/media/...` trực tiếp.
- Đổi / bỏ mã quyền → thêm mã cũ vào `OBSOLETE_PERMISSIONS` (`seed_core`) và cập nhật `client/src/constants/permissions.ts`.

## 4. OpenAPI & Kiểu dữ liệu Frontend
- `SerializerMethodField` bắt buộc có type hint (`-> int`, `-> list[str]`) hoặc `@extend_schema_field`; APIView khai báo `@extend_schema(request=..., responses=...)`.
- Sau khi đổi serializer/endpoint: `python manage.py spectacular --file schema.yml` (0 warning) → `client/`: `npm run gen:api` (sinh `src/types/api.generated.ts`, dùng qua `Schemas["TenSerializer"]`).

## 5. Test Bắt buộc cho Module mới
- Vị trí `apps/<app>/tests.py`, mẫu `server/apps/master_data/tests.py` (`ApiTestMixin.assertEnvelope`, `make_user_with_perms`).
- Tối thiểu: list / create / validation error theo envelope, user thiếu quyền → 403, mọi hook nghiệp vụ, mọi service tính toán (định mức, sinh mã).
- Chạy trong container (Postgres local docker-compose, **không dùng Neon**):
  `docker exec -e TEST_DATABASE_URL=postgres://postgres:postgres@db:5432/app_db app_backend python manage.py test --noinput`

## Thông báo trong ứng dụng
- Gửi: `apps.core.notifications.notify(user, title, message=None, level="INFO|SUCCESS|WARNING|ERROR", link=None, source=(type, id))` — lỗi khi gửi không làm hỏng nghiệp vụ.
- API chỉ trả thông báo của chính người đăng nhập; dọn định kỳ `cleanup_notifications` (đã đọc > 30 ngày).
- Thao tác lên tài khoản người khác (đặt lại mật khẩu, đổi vai trò) phải báo cho chủ tài khoản.

