/**
 * Nhận diện ứng dụng DỰ PHÒNG: giá trị thật lấy từ Cấu hình hệ thống (Cài đặt → Cấu hình hệ thống, `useSystemSettings`).
 * Dùng khi API chưa trả và cho metadata tĩnh (tiêu đề tab mặc định).
 * (Màu sắc: src/app/globals.css (biến --c-*))
 */
export const APP_CONFIG = {
  /** Tên hiển thị trên sidebar, trang đăng nhập, tiêu đề tab trình duyệt */
  name: "ERICSS Portfolio Admin",
  /** Nhãn phụ cạnh tên trên sidebar (để trống nếu không cần) */
  badge: "CMS",
  /** Dòng mô tả ngắn dưới tên trên sidebar */
  tagline: "Quản trị nội dung",
  /** Mô tả dùng cho thẻ meta / trang đăng nhập */
  description: "Khu quản trị nội dung cho Portfolio của Nguyễn Đăng Phát (Django + Next.js)",
  /** Chủ sở hữu hiển thị ở footer */
  owner: "ERICSS",
} as const;

/** Khóa localStorage dùng chung (đổi tiền tố khi clone để tránh đụng dữ liệu giữa các dự án chạy cùng domain) */
export const STORAGE_KEYS = {
  themeMode: "portfolio_admin_theme_mode",
  /** Lịch sử tìm kiếm toàn cục (mục mở gần đây + từ khóa), thêm hậu tố _<userId> */
  recentSearch: "portfolio_admin_recent_search",
} as const;
