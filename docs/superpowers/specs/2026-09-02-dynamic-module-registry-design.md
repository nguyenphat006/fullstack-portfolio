# Dynamic Module Registry & RBAC Navigation System — Thiết Kế Đặc Tả Kiến Trúc

**Ngày lập**: 2026-09-02
**Phiên bản**: 3.0 (Dynamic Module Registry)
**Phân loại Brainstorming**: Architectural

---

## 1. Bối Cảnh & Vấn Đề

Hệ thống RBAC hiện tại quản lý Permissions, Navigation (Sidebar menu) và Actions theo kiểu **hardcode cứng** tại nhiều file:
- `constants/permissions.ts` & `core/constants.py`: Khai báo cứng danh sách permissions.
- `DashboardLayout.tsx`: Khai báo cứng cấu trúc menu parent-child.
- `seed_rbac.py`: Khai báo cứng danh sách permissions và roles.
- `RolePermissionMatrixModal.tsx`: Khai báo cứng `MODULE_ICONS` và `MODULE_LABELS`.

**Hậu quả**: Mỗi khi thêm 1 module mới phải sửa tay ít nhất 5-6 file. Dễ thiếu sót, không mở rộng được.

---

## 2. Quyết Định Thiết Kế (Đã Được User Phê Duyệt)

1. **Database-Driven**: Tất cả Modules, Actions, Menu Items đều lưu trên DB và có giao diện Admin CRUD.
2. **Không tạo bảng Actions riêng**: Bảng `Permissions` hiện có đã đóng vai trò quản lý Actions (mỗi permission = 1 cặp Module + Action).
3. **Chỉ thêm 1 bảng mới duy nhất**: `ModuleRegistry` — quản lý metadata module (tên, icon, route, parent-child, thứ tự).
4. **Admin tự chọn actions**: Không tự động sinh default actions. Admin tick chọn từ danh sách gợi ý.
5. **Navigation dynamic từ DB**: Sidebar đọc cấu trúc menu từ API, không hardcode trong `DashboardLayout.tsx`.
6. **Icon mapping cứng ở Frontend**: DB lưu tên icon dạng string, Frontend có bảng tra cứu map string → React Component.
7. **Trang quản lý riêng**: `/settings/modules` để quản lý ModuleRegistry và cấu hình Navigation.

---

## 3. Database Schema — Bảng `ModuleRegistry`

```sql
Table ModuleRegistry {
  Id            int          [pk, increment]
  ModuleCode    varchar(50)  [unique, not null]   -- VD: "USER", "BOM", "MANUFACTURING"
  ModuleName    varchar(255) [not null]            -- VD: "Quản lý Người dùng"
  Icon          varchar(100) [null]                -- VD: "UserOutlined" (tên Ant Design icon)
  RoutePath     varchar(255) [null]                -- VD: "/users" (null = không có trang riêng)
  ParentCode    varchar(50)  [null]                -- FK → ModuleRegistry.ModuleCode (null = top-level)
  SortOrder     int          [default: 0]          -- Thứ tự hiển thị trên Sidebar
  IsNavigation  boolean      [default: true]       -- true = hiển thị trên Sidebar
  IsActive      boolean      [default: true]
  Description   text         [null]
  CreatedAt     timestamp    [default: now()]
  UpdatedAt     timestamp
}
```

### Quan hệ:
- `ModuleRegistry.ModuleCode` ↔ `Permissions.module` (logic, không FK cứng).
- `ModuleRegistry.ParentCode` → `ModuleRegistry.ModuleCode` (self-referencing cho parent-child).

### Các trường hợp đặc biệt:

| Trường hợp | RoutePath | IsNavigation | ParentCode |
|------------|-----------|:---:|-----------|
| Module có trang (VD: `/users`) | `"/users"` | `true` | `null` (top-level) |
| Module không có trang, cần phân quyền (VD: FINANCE) | `null` | `false` | `null` |
| Nhóm cha trên Sidebar (VD: "Quản Trị Sản Xuất") | `null` | `true` | `null` |
| Module con thuộc nhóm (VD: BOM thuộc Sản Xuất) | `"/bom"` | `true` | `"MANUFACTURING"` |
| Module tạm ẩn khỏi menu | bất kỳ | `false` | bất kỳ |

---

## 4. API Endpoints

### 4.1. Navigation API (Public cho user đã đăng nhập)
- `GET /api/modules/navigation/` — Trả về cây menu đã lọc theo quyền `*_VIEW` của user hiện tại.

### 4.2. Module Management API (Admin only)
- `GET /api/modules/` — Danh sách tất cả modules (flat list).
- `POST /api/modules/` — Tạo module mới + tick chọn actions → tự động tạo Permissions.
- `PUT /api/modules/{id}/` — Cập nhật metadata module (tên, icon, route, thứ tự...).
- `DELETE /api/modules/{id}/` — Soft delete module.
- `POST /api/modules/{id}/add-action/` — Thêm action (Permission) cho module có sẵn.
- `DELETE /api/modules/{id}/remove-action/{permission_id}/` — Xóa action khỏi module.

### 4.3. Permissions API (Đã có, cần nâng cấp)
- `GET /api/permissions/grouped/` — Nâng cấp: Lấy module_name, icon từ ModuleRegistry thay vì hardcode.

---

## 5. Frontend Architecture

### 5.1. Sidebar Navigation Dynamic
- `DashboardLayout.tsx` gọi API `GET /api/modules/navigation/` khi mount.
- Render menu tree từ response data (không còn hardcode `allMenuItems`).
- Bảng tra cứu icon: `ICON_MAP: Record<string, React.ReactNode>` map string → Component.

### 5.2. Trang `/settings/modules`
- CRUD ModuleRegistry: Tạo/sửa/xóa module, kéo thả sắp xếp thứ tự.
- Tick chọn actions khi tạo module (checkbox list: VIEW, READ, CREATE, UPDATE, DELETE, EXPORT, APPROVE, IMPORT...).
- Thêm/xóa action cho module có sẵn.

### 5.3. Ma Trận Phân Quyền (Nâng cấp)
- `RolePermissionMatrixModal.tsx` lấy tên module và icon từ API thay vì hardcode `MODULE_LABELS`, `MODULE_ICONS`.

### 5.4. Frontend Constants
- `constants/permissions.ts` chuyển sang runtime: fetch từ API → cache local, không còn khai báo cứng.
- Hoặc giữ Type-Safe constants cho các module đã code xong, bổ sung runtime cho modules mới.

---

## 6. Developer Workflow

### Flow A: Thêm Module Mới Hoàn Toàn (VD: PRODUCT)
```
Admin (UI)                              Developer (Code)
─────────────────────────               ─────────────────────
1. Vào /settings/modules
2. Tạo module PRODUCT:
   - ModuleName: "Mẫu mã & Biến thể"
   - Icon: "AppstoreOutlined"
   - RoutePath: "/products"
   - ParentCode: "MANUFACTURING"
   - Actions: ☑VIEW ☑READ ☑CREATE 
              ☑UPDATE ☑DELETE
3. → DB tự sinh 5 Permissions            4. Code ProductViewSet (Backend)
   → Sidebar hiển thị menu mới           5. Code ProductsView.tsx (Frontend)
   → Ma trận hiển thị module mới         6. Tạo route page app/(dashboard)/products/page.tsx
                                          7. Bổ sung icon vào ICON_MAP (nếu chưa có)
```

### Flow B: Thêm Action Cho Module Có Sẵn (VD: APPROVE cho BOM)
```
Admin (UI)                              Developer (Code)
─────────────────────────               ─────────────────────
1. Vào /settings/modules
2. Chọn module BOM
3. Thêm action "APPROVE"
   - Name: "Phê duyệt BOM"
4. → DB tạo Permission BOM_APPROVE      5. Thêm @action approve vào ViewSet
   → Ma trận hiển thị cột APPROVE       6. Thêm <Can permission="BOM_APPROVE"> 
                                            vào nút Phê duyệt trên UI
```
