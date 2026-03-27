export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    slug: "huong-dan-xay-dung-design-system-voi-tailwind-css",
    title: "Hướng dẫn xây dựng Design System với Tailwind CSS",
    excerpt: "Cách thiết lập hệ thống design token, component chuẩn chỉnh và tái sử dụng hiệu quả cho các dự án Next.js lớn.",
    date: "10/03/2026",
    category: "Frontend",
    readTime: "5 phút",
    image: "/images/projects/project-dashboard.svg",
    content: `## Xây dựng hệ thống UI Nhất quán

Trong dự án thực tế, việc thiết lập một hạt nhân chung cho giao diện là bắt buộc. CSS thuần thường dính phải các lỗi như:
1. Trùng lặp Class name.
2. Thiếu quy chuẩn về khoảng cách (Spacing).
3. Hỗ trợ Dark Mode cực kỳ vất vả.

### Giải pháp với Tailwind CSS
Sử dụng Tailwind kết hợp với [shadcn/ui](https://ui.shadcn.com/) giúp triệt tiêu hoàn toàn sự lệ thuộc vào các framework thư viện CSS quá nặng nề. Bạn chỉ định nghĩa bảng màu \`Colors\` trong \`tailwind.config.ts\` một lần và dùng nó ở bất kỳ đâu trên hệ thống.`,
  },
  {
    id: "post-2",
    slug: "turborepo-giai-phap-quan-ly-du-an-da-ten-mien",
    title: "Turborepo: Giải pháp quản lý Dự án Đa tên miền",
    excerpt: "Kiến trúc Monorepo hiệu quả giúp tiết kiệm hàng chục giờ đồng hồ cho việc bảo trì framework, chia sẻ UI component.",
    date: "25/02/2026",
    category: "Architecture",
    readTime: "8 phút",
    image: "/images/projects/project-ecommerce.svg",
    content: `## Monorepo là gì?

Kiến trúc Monorepo giải quyết bài toán muôn thuở khi bạn có nhiều tên miền nhưng lại sở hữu chung một bộ nhận diện thương hiệu. Thay vì sao chép Code từ dự án này sang dự án khác (Copy - Paste), **Turborepo** cho phép bạn khởi tạo một kho chứa duy nhất.

> Trong đó, các hệ thống lõi như **UI**, **Linting**, **TypeScript Config** được đóng gói thành các \`packages\` dùng chung. Mỗi \`apps\` chỉ việc import nó như một thư viện NPM.

Việc này giúp team lead quản lý toàn bộ hệ thống frontend đồ sộ một cách hoàn hảo với zero duplication!`,
  },
  {
    id: "post-3",
    slug: "toi-uu-hoa-hinh-anh-va-font-chu-tren-nextjs",
    title: "Tối ưu hóa hình ảnh và Font chữ trên Next.js App Router",
    excerpt: "Những kỹ thuật Core Web Vitals bạn phải biết khi làm việc với framework Next.js trong năm 2026.",
    date: "14/01/2026",
    category: "Performance",
    readTime: "6 phút",
    image: "/images/projects/project-content.svg",
    content: `## Điểm 100/100 PageSpeed Insights không phải là giấc mơ

Khi load trang, Hình ảnh và Font là 2 tác nhân chính gây ra hệ quả **CLS (Cumulative Layout Shift)** - Dịch chuyển bố cục.

### Bí quyết 1: Lệnh Preload Font
Next.js tích hợp sẵn module \`next/font/google\`, bạn chỉ cần khai báo Font ở tận trên cùng \`layout.tsx\`. Framework sẽ tự tải xuống file font thật và nhúng (Inject) vào HTML ngay lúc Build. Ngay cả khi rớt mạng, font chữ vẫn hiển thị đúng chuẩn.

### Bí quyết 2: Thẻ Image Thần thánh
Quên thẻ \`<img />\` truyền thống đi, thay vào đó hãy dùng \`next/image\`. Nếu bạn không xác định được kích thước cứng, hãy dùng trick ` + "`" + `fill` + "`" + ` kết hợp với class \`object-cover\`. Framework sẽ âm thầm crop và resize tấm ảnh về định dạng WebP cực nhẹ (chỉ khoảng 50KB).`,
  }
];
