# Authentication & RBAC Flow Design (Hybrid Approach)

**Date**: 2026-09-02
**Author**: Antigravity (AI Assistant)
**Status**: Pending Review

## Goal
Thiết kế và triển khai luồng Authentication và Role-Based Access Control (RBAC) hoàn chỉnh từ Backend (Django) đến Frontend (Next.js) cho hệ thống Admin Template, đảm bảo tuân thủ thiết kế dữ liệu DBML hiện tại và các nguyên tắc UX/UI.

## 1. Kiến trúc (Architecture)
Hệ thống sẽ sử dụng **Hybrid Approach**:
- **Frontend (UX/UI)**: Dựa vào JWT claims (`role_codes`, `permissions`) để render các UI elements nhanh chóng (sidebar, action buttons) mà không cần gọi API liên tục. Token được lưu tại `localStorage` và hydrate vào `zustand`.
- **Backend (Security/Authorization)**: Mọi API endpoint cần bảo vệ đều thực hiện lookup trực tiếp (Real-time DB query) để xác minh xem user có thực sự sở hữu permission đó không, đảm bảo không phụ thuộc 100% vào Token có thể bị stale. 

## 2. Backend (Django + PostgreSQL)

### 2.1 Cập nhật JWT Claims
- Cập nhật custom TokenSerializer (`CustomTokenObtainPairSerializer`) để đính kèm `permission_codes` bên cạnh `role_codes`. Danh sách permission_codes được lấy ra từ `roles` thông qua bảng `RolePermissions`.

### 2.2 Role & Permission Middleware
Tạo mới file `core/permissions.py` (Ghi đè file hiện tại) với các class permission chuẩn xác:
- `HasPermission(BasePermission)`: Kiểm tra cụ thể từng quyền hạn bằng cách tra cứu DB.
- Áp dụng các Rule class cho các endpoint cụ thể.

### 2.3 API Endpoints
- `POST /auth/login/`: Trả JWT (Access + Refresh) và profile chi tiết.
- `POST /auth/token/refresh/`: Làm mới access token.
- `POST /auth/logout/`: Hủy bỏ/blacklist refresh token để logout thiết bị.
- `GET /auth/profile/`: Refresh lại toàn bộ profile data.

## 3. Frontend (Next.js + Zustand)

### 3.1 Store Management (Zustand)
Cập nhật `useAuthStore`:
- Lưu `roles: string[]`, `permissions: string[]`.
- Quản lý trạng thái `isAuthenticated` dựa trên sự tồn tại hợp lệ của access token.
- Loại bỏ hardcode data.

### 3.2 Route Guard
- Chuyển `DashboardLayout` và các route bảo mật đằng sau một HOC `AuthGuard` hoặc dùng component wrapper.
- `AuthGuard` sẽ check xem user có token không. Nếu có thì cho truy cập, nếu thất bại redirect về `/login`. Lấy data từ local storage.

### 3.3 Menu/Sidebar RBAC
- Thêm `requiredPermissions?: string[]` vào từng item của Sidebar.
- Viết logic lọc Sidebar chỉ hiện những trang mà user có quyền. 
- Ẩn luôn những menu item không có quyền.

### 3.4 403 Forbidden Page Design
- Tạo một UI component `/403` hoặc component hiển thị khi cấm truy cập route.
- Thông điệp rõ ràng: "Bạn không có quyền truy cập trang này". Đi kèm CTA.

## 4. Kiểm tra, Verify
- Đảm bảo các route Backend đang được Decorator API bảo vệ không thể access qua Postman nếu token giả hoặc token không có quyền.
- Đảm bảo Frontend redirect về `/login` nếu xoá `localStorage`.
