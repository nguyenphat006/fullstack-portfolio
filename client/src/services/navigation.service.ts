import { http } from "@/lib/api/axiosClient";

export interface NavigationItem {
  key: string;
  code: string;
  label: string;
  icon?: string | null;
  parent_code?: string | null;
  sort_order: number;
  is_navigation: boolean;
  description?: string | null;
  children?: NavigationItem[];
}

export const navigationService = {
  /**
   * Cây menu Sidebar đã lọc theo quyền `*_VIEW` của người dùng hiện tại.
   * Backend cache + ETag nên gọi lại rất nhẹ.
   */
  getNavigation: () => http.get<NavigationItem[]>("/modules/navigation/"),
};
