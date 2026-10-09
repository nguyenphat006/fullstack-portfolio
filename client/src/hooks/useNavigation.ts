"use client";

import { useQuery } from "@tanstack/react-query";
import { navigationService, type NavigationItem } from "@/services/navigation.service";
import { useAuthStore } from "@/stores/useAuthStore";

export function useNavigation() {
  const { user } = useAuthStore();

  return useQuery<NavigationItem[]>({
    queryKey: ["navigation", user?.id],
    queryFn: () => navigationService.getNavigation(),
    enabled: Boolean(user),
    staleTime: 0, // Luôn gửi query lên API, Backend Cache Server sẽ phục vụ siêu tốc (~0.1ms) và tự động trả dữ liệu mới khi có cập nhật
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
