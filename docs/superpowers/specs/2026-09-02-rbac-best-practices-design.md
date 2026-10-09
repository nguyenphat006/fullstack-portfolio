# Kiến Trúc Phân Quyền RBAC & Bảo Mật API Call Chuẩn Enterprise (Admin Template)

**Ngày lập**: 2026-09-02  
**Phiên bản**: 2.0 (Type-Safe & Caching Engine)  
**Phạm vi hiện tại**: Phân hệ Người dùng & Quản trị Hệ thống (`USER` & `SYSTEM`)

---

## 1. Mục Tiêu & Nguyên Tắc Cốt Lõi (Core Principles)

1. **Type-Safe Permissions (Chống Magic Strings)**:
   - Toàn bộ mã quyền được quản lý tập trung qua `PERMISSIONS` constant (`as const` trong TypeScript và `AppPermissions` Enum trong Python).
   - Bắt buộc kiểm tra kiểu compile-time; gõ sai chính tả mã quyền sẽ bị IDE và `npm run build` chặn ngay lập tức.

2. **Phân tách Rõ ràng `VIEW` (Route/Page) vs `READ` (Data API) vs Actions**:
   - `VIEW`: Quyền điều hướng và truy cập màn hình/menu trên Frontend.
   - `READ`: Quyền gọi API lấy dữ liệu chi tiết.
   - `CREATE / UPDATE / DELETE`: Quyền ghi và biến đổi dữ liệu.
   - `SPECIAL_ACTIONS`: `EXPORT`, `MANAGE_ROLE`, `CONFIG`.

3. **Progressive Disclosure trên Frontend (UX Zero Confusion)**:
   - Ẩn hoàn toàn các nút thao tác mà người dùng không có quyền (thay vì disable mờ gây hiểu lầm).
   - Component `<Can permission={...}>` và Hook `usePermission()` nhận `PermissionCode` kiểu mạnh.

4. **Zero-Overhead Realtime Caching Engine (Backend Security)**:
   - Danh sách quyền của User được lưu trên Caching Layer (Redis / Memory Cache) với độ trễ ~0.1ms.
   - Tự động Invalidate Cache ngay khi Admin thay đổi quyền của Role hoặc thay đổi Role của User.

5. **Phạm vi Tinh gọn (YAGNI Scope)**:
   - Trước mắt chỉ khai báo và thực thi quyền cho `USER` và `SYSTEM`.
   - Dọn dẹp các permission giả định của các module chưa phát triển; khi làm đến module nào sẽ mở rộng permission module đó.

---

## 2. Danh Mục Phân Quyền Chuẩn Hóa (`USER` & `SYSTEM`)

| Mã Quyền (Permission Code) | Tên Quyền Hạn | Phân Hệ | Mục Đích Bảo Mật & Hành Động Ánh Xạ |
|-----------------------------|----------------|---------|--------------------------------------|
| `USER_VIEW` | Truy cập Màn hình Quản lý Người dùng | `USER` | Hiển thị menu Sidebar `/users`, cho phép Route Guard mở trang. |
| `USER_READ` | Truy vấn Dữ liệu Người dùng | `USER` | API `GET /users/`, `GET /users/{id}/`, `GET /users/statistics/`. |
| `USER_CREATE` | Tạo Tài khoản Mới | `USER` | Hiển thị nút "Tạo tài khoản", API `POST /users/`. |
| `USER_UPDATE` | Cập nhật Thông tin & Trạng thái | `USER` | Nút "Sửa", API `PUT/PATCH /users/{id}/`, API `POST /users/batch-status/`. |
| `USER_DELETE` | Xóa & Đưa vào Thùng rác | `USER` | Nút "Xóa", API `DELETE /users/{id}/`, API `POST /users/batch-delete/`. |
| `USER_EXPORT` | Xuất Danh sách Tài khoản | `USER` | Nút "Xuất Excel/CSV", API xuất file. |
| `USER_MANAGE_ROLE` | Quản lý Ma trận Phân quyền | `USER` | Nút "Ma trận Phân quyền", API `POST /roles/{id}/set-permissions/`. |
| `SYSTEM_CONFIG` | Cấu hình Tham số Hệ thống | `SYSTEM` | Truy cập cài đặt tham số toàn cục. |

---

## 3. Kiến Trúc Backend (Django + Caching Engine)

### 3.1 Constants Phía Backend (`server/apps/core/constants.py`)
```python
class AppPermissions:
    class User:
        VIEW = "USER_VIEW"
        READ = "USER_READ"
        CREATE = "USER_CREATE"
        UPDATE = "USER_UPDATE"
        DELETE = "USER_DELETE"
        EXPORT = "USER_EXPORT"
        MANAGE_ROLE = "USER_MANAGE_ROLE"

    class System:
        CONFIG = "SYSTEM_CONFIG"
```

### 3.2 Cache-Aware Permission Checker (`server/apps/core/permissions.py`)
```python
from django.core.cache import cache
from rest_framework.permissions import BasePermission
from apps.authentication.models import RolePermission

CACHE_TIMEOUT = 1800  # 30 phút

def get_user_permissions(user) -> set:
    if not user or not user.is_authenticated:
        return set()
    cache_key = f"user_perms_{user.id}"
    perms = cache.get(cache_key)
    if perms is None:
        perms = set(
            RolePermission.objects.filter(
                role__users=user,
                role__is_active=True
            ).values_list('permission__permission_code', flat=True)
        )
        cache.set(cache_key, perms, CACHE_TIMEOUT)
    return perms

def invalidate_user_permissions(user_id=None):
    if user_id:
        cache.delete(f"user_perms_{user_id}")
    else:
        cache.clear()

class HasPermission(BasePermission):
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        user_perms = get_user_permissions(request.user)
        return self.required_permission in user_perms
```

### 3.3 Tự Động Ánh Xạ Trên `BaseERPViewSet`
```python
class UserViewSet(BaseERPViewSet):
    permission_module = 'USER'
    custom_action_permissions = {
        'statistics': 'USER_READ',
        'export': 'USER_EXPORT',
        'batch_delete': 'USER_DELETE',
        'batch_status': 'USER_UPDATE',
    }
```

---

## 4. Kiến Trúc Frontend (Next.js + TypeScript)

### 4.1 Single Source of Truth Constants (`client/src/constants/permissions.ts`)
```typescript
export const PERMISSIONS = {
  USER: {
    VIEW: "USER_VIEW",
    READ: "USER_READ",
    CREATE: "USER_CREATE",
    UPDATE: "USER_UPDATE",
    DELETE: "USER_DELETE",
    EXPORT: "USER_EXPORT",
    MANAGE_ROLE: "USER_MANAGE_ROLE",
  },
  SYSTEM: {
    CONFIG: "SYSTEM_CONFIG",
  },
} as const;

type ValueOf<T> = T[keyof T];
export type PermissionCode =
  | ValueOf<typeof PERMISSIONS.USER>
  | ValueOf<typeof PERMISSIONS.SYSTEM>;
```

### 4.2 Component `<Can />` Type-Safe
```tsx
<Can permission={PERMISSIONS.USER.CREATE}>
  <Button type="primary" icon={<UserAddOutlined />}>Tạo tài khoản mới</Button>
</Can>
```

---

## 5. Kế Hoạch Seed Dữ Liệu (`seed_rbac.py`)

Cập nhật command `python manage.py seed_rbac` để khởi tạo chính xác 8 mã quyền cho `USER` & `SYSTEM`, gán đầy đủ cho Role `ADMIN`, tạo Role mẫu `MANAGER` (có quyền Xem, Đọc, Sửa, Xuất), và dọn dẹp các quyền cũ chưa dùng.
