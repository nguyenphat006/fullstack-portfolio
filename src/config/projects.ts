export interface ProjectItem {
  id: string;
  title: string;
  summary: string;
  stack: string[];
  year: string;
  image: string;
  color: string;
  
  // Đi sâu vào chi tiết (Trang detail)
  role: string;
  content: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "shopsifu",
    title: "ShopSifu E-commerce Platform",
    summary: "Nền tảng thương mại điện tử đa luồng (Client, Admin, Seller) tích hợp quản lý phân quyền (RBAC), thanh toán (VNPay, Sepay) và Socket.IO.",
    stack: ["Next.js", "NestJS", "Redux", "Prisma", "PostgreSQL", "Redis"],
    year: "05/2025 - 08/2025",
    color: "#FCD34D", 
    image: "/images/projects/shopsifu.png",
    role: "Fullstack Developer",
    content: `Dự án nền tảng thương mại điện tử phức tạp với 3 luồng người dùng cực lớn bám sát nghiệp vụ phân quyền RBAC.

### Yêu cầu bài toán
Hệ thống cần một giải pháp xử lý đơn hàng đa luồng thời gian thực cho hàng ngàn người dùng, hỗ trợ nhà cung cấp (Seller) đăng bán sản phẩm và thanh toán tự động không cần đối soát thủ công.

### Giải pháp Kỹ thuật
- **Kiến trúc Backend:** Tách bạch Layer Controller - Service - Repository trong NestJS. Quản lý transaction chặt chẽ khi thanh toán.
- **Realtime:** Sử dụng Web-Socket (Socket.IO) kết hợp Redis Pub/Sub để phát luồng thông báo đơn hàng cho Client ngay lập tức trong vòng chưa tới 50ms.
- **Cổng thanh toán:** Tích hợp trực tiếp VNPay API và Sepay (Webhook tự check giao dịch ngân hàng).
- **Frontend tối ưu:** Ứng dụng Next.js Server Components kết hợp Redux Toolkit để quản lý giỏ hàng mượt mà cục bộ, hạn chế Re-render tối đa.

![ShopSifu Admin Dashboard](/images/projects/shopsifu.png)
*(Minh hoạ luồng Dashboard quản trị)*`,
    liveUrl: "https://shopsifu.live/",
    featured: true,
  },
  {
    id: "song-ngu-lac-hong",
    title: "Hệ thống Trường Song Ngữ Lạc Hồng",
    summary: "Hệ thống đa tên miền trường học sử dụng kiến trúc Turborepo giúp chia sẻ UI Components (ShadCN). Tối ưu SEO và Responsive hoàn chỉnh.",
    stack: ["Turborepo", "React", "TailwindCSS", "Framer Motion"],
    year: "11/2025 - 03/2026",
    color: "#EF4444", 
    image: "/images/projects/lhs.png",
    role: "Frontend Team Lead",
    content: `Hệ thống hạ tầng giáo dục sinh thái Mẫu giáo - Tiểu học - THCS.

### Bài toán Đặt ra
Đại diện Chủ đầu tư yêu cầu một hệ sinh thái Web chia làm 4 tên miền (domain) riêng biệt phục vụ cho 4 nhóm đối tượng khác nhau, nhưng bắt buộc phải tận dụng tối đa Design System chung để duy trì bộ nhận diện thương hiệu tuyệt đối.

### Kiến trúc & Triển khai thực tế
- **Monorepo với công nghệ Turborepo:** Triển khai luồng kiến trúc gom cụm tất cả mã nguồn rời rạc vào một Repository khổng lồ, tạo ra các Shared Package như \`ui-components\`, \`configs\`, \`utils\`.
- **Cấu trúc UI System:** Tuỳ biến triệt để ShadCN UI và Tailwind CSS. Theme động hoàn toàn dựa trên quy chuẩn màu sắc phòng Marketing.
- **Hiệu năng SSG & SEO:** Áp dụng phương thức Next.js Statically Generated nhằm mang lại tốc độ tải trang cực nhanh (PageSpeed Insights luôn trên 95) và thẻ Meta chuẩn SEO cho chiến dịch quảng cáo.

<video class="w-full rounded-2xl shadow-2xl mt-8" controls autoPlay loop muted>
  <source src="/videos/lhs-demo.mp4" type="video/mp4" />
</video>
*Video trải nghiệm mượt mà Animation của hệ thống Frontend Landing Page*`,
    liveUrl: "https://lhbs-edu-vn.devdotnet.id.vn/",
    featured: true,
  }
];
