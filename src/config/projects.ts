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
    content: "Dự án nền tảng thương mại điện tử phức tạp với 3 luồng người dùng cực lớn. Tích hợp thanh toán online trực tiếp qua VNPay và ví điện tử Sepay. Sử dụng cơ chế WebSocket (Socket.IO) để lập tức ban hành thông báo Push Notification khi có đơn hàng mới đổ về hệ thống.",
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
    content: "Nền tảng giáo dục đa cơ sở yêu cầu quản trị nội dung độc lập nhưng bắt buộc phải dùng chung hệ thống Design System gốc của nhà trường. Việc ứng dụng kiến trúc Monorepo (Turborepo) và phân chia thành các gói dùng chung (Shared Packages) giúp các team dev tiết kiệm tới 50% thời gian code giao diện lặp lại.",
    liveUrl: "https://lhbs-edu-vn.devdotnet.id.vn/",
    featured: true,
  },
  {
    id: "poly-health",
    title: "Hệ thống Quản lý Bệnh viện Đa khoa",
    summary: "Nền tảng Cloud toàn diện quản lý hồ sơ bệnh án điện tử, lên lịch khám bệnh và theo dõi điều trị nội trú với độ bảo mật chống rò rỉ hình ảnh.",
    stack: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
    year: "2025",
    color: "#2DD4BF", // Emerald-400
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
    role: "Fullstack Developer",
    content: "Đây là dự án tiên phong số hóa toàn bộ hệ thống lưu trữ bệnh án cho Bệnh viện Đa khoa. Hệ thống giải quyết bài toán tra cứu lịch sử khám bệnh chậm chạp và thường xuyên mất mát hồ sơ giấy. Bằng việc triển khai hạ tầng PostgreSQL trên Cloud kết hợp Next.js App Router, ứng dụng có khả năng phản hồi tìm kiếm 10.000+ bệnh nhân chỉ dưới 1s. Hệ thống cũng đã đạt chuẩn HIPPA thông qua xác thực đa lớp (MFA) đối với bác sĩ.",
    liveUrl: "https://demo.hospital.vn",
    githubUrl: "#",
  },
  {
    id: "b2b-supply-chain",
    title: "Sàn Thương Mại Điện Tử B2B Khách Buôn",
    summary: "Hệ thống sàn giao dịch nội bộ, giám sát tồn kho thời gian thực, điều phối chuỗi cung ứng và tự động xuất hóa đơn đỏ (e-Invoice).",
    stack: ["Next.js", "Node.js", "Prisma", "Redis"],
    year: "2024",
    color: "#818CF8", // Indigo-400
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop",
    role: "Backend Engineer Lead",
    content: "Đóng vai trò tái thiết kế toàn bộ logic xác thực báo giá biến động theo thời gian thực cho hơn 200 nhà cung cấp bán buôn. Áp dụng Redis Pub/Sub để phát luồng dữ liệu (Socket.io) giúp nhân viên kho lập tức thấy đơn đổ về. Tích hợp trực tiếp hệ thống khai báo hóa đơn điện toán đám mây cho nhà nước.",
    liveUrl: "https://b2b.platform.vn",
  },
  {
    id: "edtech-master",
    title: "Nền tảng Học trực tuyến EdTech Master",
    summary: "CMS quản lý hệ sinh thái bài giảng trực tuyến, thi trắc nghiệm và phòng live stream lên tới 50,000 học viên.",
    stack: ["React", "TypeScript", "NestJS", "Docker"],
    year: "2024",
    color: "#F472B6", // Indigo-400
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&auto=format&fit=crop",
    role: "Frontend Developer",
    content: "Nền tảng Video E-Learning sử dụng kĩ thuật HLS (HTTP Live Streaming) có khả năng mã hóa chặn tải lậu (DRM). Xây dựng trình kéo thả nội dung khóa học bằng React-Beautiful-DnD cho giáo viên. Tối ưu CSS để giao diện học tập cực mượt mà kể cả vào lúc quá tải máy chủ đợt thi cuối kỳ.",
  },
  {
    id: "theodoi-finance",
    title: "Ứng dụng Tài chính Thông minh TheoDoi",
    summary: "Mobile App phân tích chi tiêu cá nhân sử dụng các mô hình AI để tự động chấm điểm xếp hạng tài chính và cảnh báo rủi ro lạm chi.",
    stack: ["React Native", "Expo", "Firebase", "Express"],
    year: "2023",
    color: "#A78BFA", 
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop",
    role: "Mobile App Developer",
    content: "Đây là dự án đoạt giải Ý Tưởng của năm. Viết trên React Native Expo thuần Typescript với Firebase Offline-first, người dùng có thể nhập chi tiêu ngay cả khi trên máy bay không có Wifi. Back-end sử dụng một mô hình scikit-learn nhỏ để phân loại hóa đơn (Ăn uống, Giải trí, Hóa đơn).",
    githubUrl: "https://github.com/nguyenphat006",
  },
  {
    id: "cicd-autodeploy",
    title: "Kiến trúc Triển khai CI/CD AutoDeploy",
    summary: "Xây dựng Pipeline tự động hóa 100% quy trình Testing, Linting và Deploy các cụm microservices nội bộ lên máy chủ đám mây.",
    stack: ["Jenkins", "Golang", "Kubernetes", "AWS"],
    year: "2023",
    color: "#FB923C", 
    image: "https://images.unsplash.com/photo-1618401471353-b98a520ed217?q=80&w=800&auto=format&fit=crop",
    role: "DevOps Engineer",
    content: "Dự án DevOps nội bộ nhắm tới việc giảm thiểu thời gian code đưa lên production từ 3 tiếng xuống còn 15 phút. Kiến trúc bao gồm viết script cấu hình Kubernetes, sử dụng AWS EKS để auto-scale và dùng Golang xử lý Log báo lỗi lên Telegram ngay lập tức.",
  },
  {
    id: "hrm-dashboard",
    title: "Dashboard Quản trị Nhận sự Tập đoàn",
    summary: "Giao diện kiểm soát thông tin nhân sự cực kỳ trực quan với hệ thống cấp quyền phi tập trung và biểu đồ tương tác.",
    stack: ["Vue.js", "Nuxt.js", "TailwindCSS", "GraphQL"],
    year: "2022",
    color: "#38BDF8", 
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    role: "Fullstack Developer",
    content: "Phiên bản thiết kế lại (Redesign) cho hệ thống chấm công cũ kĩ. Xây dựng trang đánh giá KPI KPI 360 độ (nhân viên đánh giá xếp chéo). Sử dụng kiến trúc GraphQL để gọi các luồng dữ liệu khổng lồ của ngàn nhân viên trong 1 query duy nhất chống lag cục bộ.",
  },
];
