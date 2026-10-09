"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { profileService } from "../services/profile.service";
import type { UpdateProfileInput, ChangePasswordInput } from "../types";

export const PROFILE_QUERY_KEYS = {
  profile: ["user-profile"] as const,
};

/** Hook lấy thông tin hồ sơ tài khoản đang đăng nhập */
export function useProfileQuery() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.profile,
    queryFn: () => profileService.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 phút
  });
}

/** Hook cập nhật thông tin hồ sơ cá nhân (lỗi do form xử lý: gắn vào ô nhập hoặc toast) */
export function useUpdateProfileMutation() {
  const t = useTranslations("profile");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => profileService.updateProfile(data),
    onSuccess: (res) => {
      toast.success(t("updated"));
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.profile });
      // Đồng bộ store (topbar, sidebar) + localStorage ngay, không cần tải lại trang
      const current = useAuthStore.getState().user;
      if (current && res) useAuthStore.getState().updateUser({ ...current, ...res });
    },
  });
}

/** Hook đổi mật khẩu tài khoản (lỗi do form xử lý) */
export function useChangePasswordMutation() {
  const t = useTranslations("profile");
  return useMutation({
    mutationFn: (data: ChangePasswordInput) => profileService.changePassword(data),
    onSuccess: (res) => {
      toast.success(res?.message || t("passwordChanged"));
    },
  });
}
