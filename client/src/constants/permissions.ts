/**
 * Bảng Hằng Số Phân Quyền Toàn Cục (Single Source of Truth cho Frontend RBAC).
 * Giúp chống lỗi chính tả (Zero Typos), hỗ trợ IDE IntelliSense Auto-complete 100%
 * và kiểm tra kiểu tĩnh (Compile-Time Type Safety) trên toàn bộ dự án.
 */
export const PERMISSIONS = {
  USER: {
    /** Quyền vào trang Quản lý Người dùng (/users) & hiển thị menu Sidebar */
    VIEW: "USER_VIEW",
    /** Quyền gọi API đọc danh sách, chi tiết người dùng và số liệu KPI */
    READ: "USER_READ",
    /** Quyền mở form và gọi API tạo mới tài khoản người dùng */
    CREATE: "USER_CREATE",
    /** Quyền chỉnh sửa thông tin, đổi vai trò, đổi trạng thái hoạt động */
    UPDATE: "USER_UPDATE",
    /** Quyền xóa tài khoản */
    DELETE: "USER_DELETE",
    /** Quyền xuất danh sách người dùng ra định dạng Excel / CSV */
    EXPORT: "USER_EXPORT",
    /** Quyền nhập danh sách người dùng từ file */
    IMPORT: "USER_IMPORT",
  },
  AUDIT_LOGS: {
    /** Quyền vào trang Nhật ký thao tác (/audit-logs) & hiển thị menu */
    VIEW: "AUDIT_LOGS_VIEW",
    /** Quyền đọc nhật ký (trang nhật ký + tab "Nhật ký hoạt động" ở trang chi tiết) */
    READ: "AUDIT_LOGS_READ",
    /** Quyền xuất nhật ký ra file */
    EXPORT: "AUDIT_LOGS_EXPORT",
  },
  SETTINGS: {
    /** Quyền vào trang Cài đặt Phân hệ & Ma trận Quyền */
    VIEW: "SETTINGS_VIEW",
    /** Quyền đọc danh sách phân hệ và ma trận quyền */
    READ: "SETTINGS_READ",
    /** Quyền đăng ký phân hệ mới và thêm action */
    CREATE: "SETTINGS_CREATE",
    /** Quyền chỉnh sửa phân hệ, sắp xếp và lưu cấu hình ma trận */
    UPDATE: "SETTINGS_UPDATE",
    /** Quyền xóa phân hệ và gỡ action */
    DELETE: "SETTINGS_DELETE",
  },
  PROJECT: {
    VIEW: "PROJECT_VIEW",
    READ: "PROJECT_READ",
    CREATE: "PROJECT_CREATE",
    UPDATE: "PROJECT_UPDATE",
    DELETE: "PROJECT_DELETE",
    EXPORT: "PROJECT_EXPORT",
    IMPORT: "PROJECT_IMPORT",
  },
  BLOG: {
    VIEW: "BLOG_VIEW",
    READ: "BLOG_READ",
    CREATE: "BLOG_CREATE",
    UPDATE: "BLOG_UPDATE",
    DELETE: "BLOG_DELETE",
    EXPORT: "BLOG_EXPORT",
    IMPORT: "BLOG_IMPORT",
  },
  CONTACT: {
    VIEW: "CONTACT_VIEW",
    READ: "CONTACT_READ",
    CREATE: "CONTACT_CREATE",
    UPDATE: "CONTACT_UPDATE",
    DELETE: "CONTACT_DELETE",
    EXPORT: "CONTACT_EXPORT",
    IMPORT: "CONTACT_IMPORT",
  },
  // [gen:module] Module sinh bởi `npm run gen:module` được chèn phía trên dòng này
} as const;

type ValueOf<T> = T[keyof T];

/**
 * Union Type đại diện cho tất cả các mã quyền hợp lệ trong hệ thống (tự suy ra từ PERMISSIONS).
 */
export type PermissionCode = {
  [M in keyof typeof PERMISSIONS]: ValueOf<(typeof PERMISSIONS)[M]>;
}[keyof typeof PERMISSIONS];
