import { http } from "@/lib/api/axiosClient";
import type { ChangePasswordInput, UpdateProfileInput, UserProfile } from "../types";

export const profileService = {
  getProfile: () => http.get<UserProfile>("/auth/me/"),

  /** Cập nhật thông tin cá nhân (Họ tên, SĐT, avatar, ghi chú) */
  updateProfile: (data: UpdateProfileInput) => http.patch<UserProfile>("/auth/me/", data),

  /** Trả nguyên envelope để hiển thị thông điệp server */
  changePassword: (data: ChangePasswordInput) => http.envelope.post<null>("/auth/change-password/", data),
};
