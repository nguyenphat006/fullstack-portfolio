"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import type { PermissionCode } from "@/constants/permissions";

export function usePermission() {
  const { user } = useAuthStore();

  // Tài khoản Admin / Superadmin luôn được bypass 100% tất cả các quyền trong toàn bộ hệ thống
  const isSuperUser = Boolean(
    user?.is_superuser ||
      user?.role_codes?.includes("ADMIN") ||
      user?.roles?.some((r) => r.role_code === "ADMIN") ||
      user?.permissions?.includes("*")
  );

  /**
   * Kiểm tra người dùng có quyền cụ thể hay không (Type-Safe).
   */
  const hasPermission = (permissionCode: PermissionCode | string): boolean => {
    if (!user) return false;
    if (isSuperUser) return true;
    return user.permissions?.includes(permissionCode) ?? false;
  };

  /**
   * Kiểm tra người dùng có ÍT NHẤT MỘT trong các quyền truyền vào hay không.
   */
  const hasAnyPermission = (permissionCodes: (PermissionCode | string)[]): boolean => {
    if (!user) return false;
    if (isSuperUser) return true;
    if (!permissionCodes || permissionCodes.length === 0) return true;
    return permissionCodes.some((code) => user.permissions?.includes(code));
  };

  /**
   * Kiểm tra người dùng có TẤT CẢ các quyền truyền vào hay không.
   */
  const hasAllPermissions = (permissionCodes: (PermissionCode | string)[]): boolean => {
    if (!user) return false;
    if (isSuperUser) return true;
    if (!permissionCodes || permissionCodes.length === 0) return true;
    return permissionCodes.every((code) => user.permissions?.includes(code));
  };

  /**
   * Kiểm tra người dùng có đảm nhiệm Role cụ thể hay không.
   */
  const hasRole = (roleCode: string): boolean => {
    if (!user) return false;
    if (isSuperUser) return true;
    return (
      (user.role_codes?.includes(roleCode) ||
        user.roles?.some((r) => r.role_code === roleCode)) ??
      false
    );
  };

  return {
    user,
    isSuperUser,
    can: hasPermission,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };
}
