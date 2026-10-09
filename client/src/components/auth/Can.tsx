"use client";

import React from "react";
import { usePermission } from "@/hooks/usePermission";
import type { PermissionCode } from "@/constants/permissions";

export interface CanProps {
  /** Mã quyền hạn đơn lẻ cần kiểm tra (ví dụ PERMISSIONS.USER.CREATE) */
  permission?: PermissionCode | string;
  /** Danh sách các mã quyền hạn - Người dùng chỉ cần có 1 trong các quyền này (OR) */
  anyPermissions?: (PermissionCode | string)[];
  /** Danh sách các mã quyền hạn - Người dùng bắt buộc phải có tất cả các quyền (AND) */
  allPermissions?: (PermissionCode | string)[];
  /** Mã vai trò cần kiểm tra (ví dụ 'ADMIN', 'MANAGER') */
  role?: string;
  /** Nội dung hiển thị thay thế nếu người dùng không đủ quyền */
  fallback?: React.ReactNode;
  /** Phần tử con được render nếu thỏa mãn quyền */
  children: React.ReactNode;
}

export function Can({
  permission,
  anyPermissions,
  allPermissions,
  role,
  fallback = null,
  children,
}: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = usePermission();

  let isAllowed = true;

  if (permission && !hasPermission(permission)) {
    isAllowed = false;
  }

  if (isAllowed && anyPermissions && anyPermissions.length > 0 && !hasAnyPermission(anyPermissions)) {
    isAllowed = false;
  }

  if (isAllowed && allPermissions && allPermissions.length > 0 && !hasAllPermissions(allPermissions)) {
    isAllowed = false;
  }

  if (isAllowed && role && !hasRole(role)) {
    isAllowed = false;
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default Can;
