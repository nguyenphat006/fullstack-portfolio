"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useMounted } from "@/hooks/useMounted";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { authService } from "@/modules/auth/services/auth.service";
import { Spinner } from "@/components/feedback/Spinner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const t = useTranslations("errors");
  const router = useRouter();
  const pathname = usePathname();
  const { user, setAuth, logout } = useAuthStore();
  // Store đọc user từ localStorage ngay khi nạp module, còn server không có localStorage.
  // Chỉ render theo `user` sau khi mount -> lần render đầu ở client khớp HTML từ server (tránh hydration mismatch).
  const mounted = useMounted();
  const [isChecking, setIsChecking] = useState(!user);

  useEffect(() => {
    const checkAuth = async () => {
      // Bỏ qua check ở các route public
      if (pathname.startsWith("/login")) {
        setIsChecking(false);
        return;
      }

      const token = localStorage.getItem("access_token");
      const refresh = localStorage.getItem("refresh_token");

      if (!token || !refresh) {
        logout();
        router.push("/login");
        return;
      }

      // Nếu đã có thông tin user từ localStorage -> mở ngay giao diện 0ms
      if (user) {
        setIsChecking(false);
      }

      try {
        // Đồng bộ ngầm profile mới nhất kèm permissions realtime từ server
        const profile = await authService.getProfile();
        setAuth(profile, { access: token, refresh });
        setIsChecking(false);
      } catch (error) {
        if (!user) {
          console.error("Auth hydration failed:", error);
          logout();
          router.push("/login");
        }
      }
    };

    checkAuth();
    // Chỉ kiểm tra lại khi đổi route; thêm `user` vào deps sẽ gọi lại /profile sau mỗi setAuth
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!mounted || (isChecking && !user && !pathname.startsWith("/login"))) {
    return <Spinner fullScreen label={t("authenticating")} />;
  }

  // Nếu không vào trang login và không có user thì render null để đợi redirect
  if (!user && !pathname.startsWith("/login")) {
    return null;
  }

  return <>{children}</>;
}
