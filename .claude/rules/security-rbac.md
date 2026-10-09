---
paths:
  - "server/**"
  - "client/src/**"
---

# Phân quyền (RBAC) & bảo mật dữ liệu — backend + frontend

Mô hình: `ModuleRegistries` → quyền `<MODULE>_<ACTION>` (`seed_core`) → `Roles` → `Users`. Superuser hoặc vai trò `ADMIN` = toàn quyền.
**API là lớp bảo mật duy nhất**; frontend chỉ ẩn thao tác để trải nghiệm khớp với quyền.

## Backend
- ViewSet: `permission_classes = [IsAuthenticated, ModulePermissionChecker]` + `permission_module` (xem `backend-django.md`).
- `custom_action_permissions[action]` nhận 1 mã hoặc **danh sách mã thay thế** (có 1 là đủ):
  ```python
  custom_action_permissions = {'list': ['SETTINGS_READ', 'USER_CREATE', 'USER_UPDATE']}  # form người dùng cần danh sách vai trò
  ```
- Tài khoản & vai trò (`UserSerializer.validate`, test ở `apps/authentication/tests_security.py`):
  - Chỉ Quản trị viên (`is_admin_account`) được gán vai trò `ADMIN` và sửa / đổi mật khẩu / khóa tài khoản Quản trị viên → người khác nhận **403**.
  - Không ai tự đổi vai trò của chính mình (400 `role_ids`).
  - Không có mật khẩu mặc định: tạo user và nhập Excel bắt buộc `password` ≥ 8 ký tự.
- Tệp đính kèm (`apps/core/attachment_access.py`):
  - Quyền theo **thực thể cha**: `entity_type` CamelCase → mã phân hệ UPPER_SNAKE (`MaterialCategory` → `MATERIAL_CATEGORY`); xem/liệt kê cần `_READ`, tải lên/xóa cần `_UPDATE`. `list` bắt buộc có `entity_type`.
  - `file_url` là link ký `TimestampSigner` hết hạn 1 giờ (`/attachments/{id}/file/?sig=`); không trả đường dẫn `/media/...` trực tiếp. Nginx chặn `/media/attachments/`.
  - Thêm `entity_type` mới → module code tương ứng phải có trong `seed_core`.
- Đổi / bỏ mã quyền: thêm mã cũ vào `OBSOLETE_PERMISSIONS` trong `seed_core` để lệnh seed xóa khỏi CSDL; cập nhật `client/src/constants/permissions.ts` cùng lúc.

## Frontend
- `RouteGuard` (trong `DashboardLayout`) chỉ cho vào route có trong cây menu (`/navigation/` đã lọc theo `_VIEW`/`_READ`); URL khác → trang 403. Trang mọi người dùng đều vào được → thêm vào `ALWAYS_ALLOWED`.
- **View quyết định quyền, component con chỉ hiển thị**:
  ```tsx
  // View
  <UserTable onEdit={can(PERMISSIONS.USER.UPDATE) ? handleEdit : undefined} onOpenExportModal={can(PERMISSIONS.USER.EXPORT) ? openExport : undefined} />
  // Component: prop handler optional, có handler mới render nút
  {onEdit && <Button variant="ghost" size="icon-sm" aria-label="Sửa" onClick={() => onEdit(record)}><Pencil /></Button>}
  ```
  Hoặc prop `canUpdate` / `canDelete`, nhưng View **phải truyền** — không dựa vào giá trị mặc định `true`.
- Checklist mỗi màn hình: tạo · sửa · xóa · hàng loạt · xuất · nhập · kéo thả sắp xếp · tệp đính kèm (`readonly`) · tab "Nhật ký hoạt động" (`AUDIT_LOGS_READ`) · ma trận/checkbox (`disabled`).
- Quy tắc riêng của backend phải phản chiếu ở UI (vd. người không phải Quản trị viên không thấy nút sửa tài khoản Quản trị viên).

## Bẫy đã gặp — không lặp lại
| Lỗi đã xảy ra | Quy tắc |
|---|---|
| User có `USER_UPDATE` tự gán vai trò `ADMIN` cho mình hoặc đặt lại mật khẩu admin → chiếm toàn quyền | Kiểm tra người thao tác trong serializer (mục Tài khoản & vai trò) + test hồi quy leo thang quyền. |
| API tệp đính kèm chỉ cần đăng nhập, `file_url` là đường dẫn media công khai → ai cũng xem / xóa được tệp của mọi thực thể | Quyền theo thực thể cha + link ký hết hạn; test "người ngoài 403, chữ ký giả 400". |
| Mật khẩu mặc định cứng (`123456`, `Abc@2026!`) khi tạo / nhập người dùng | Bắt buộc nhập mật khẩu; không hardcode mật khẩu trong code. |
| Mã quyền cũ (`AUDIT_*`, `SYSTEM_CONFIG`) còn trong ma trận sau khi đổi mã phân hệ | `OBSOLETE_PERMISSIONS` trong `seed_core`. |
| Trang chi tiết / Cài đặt hiện nút Sửa, Xóa, Xuất, ma trận quyền cho user chỉ có quyền xem; `MaterialDetailHero` có `canUpdate = true` mặc định nhưng View không truyền; nút "Nhập Excel" giả | Checklist Frontend ở trên; không để nút chưa có chức năng. |
