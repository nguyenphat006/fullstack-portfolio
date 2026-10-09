import { http } from "@/lib/api/axiosClient";
import type { ChangePasswordRequest, LoginRequest, LoginResponse, UserProfile } from "../types";

export const authService = {
  login: (data: LoginRequest) => http.post<LoginResponse>("/auth/login/", data),

  /** Hồ sơ + danh sách quyền của người dùng đang đăng nhập */
  getProfile: () => http.get<UserProfile>("/auth/me/"),

  changePassword: (data: ChangePasswordRequest) => http.post<null>("/auth/change-password/", data),

  refreshToken: (refresh: string) => http.post<{ access: string; refresh?: string }>("/auth/token/refresh/", { refresh }),

  /** Đăng xuất: blacklist refresh token phía server */
  logout: (refresh: string) => http.post<null>("/auth/logout/", { refresh }),
};
