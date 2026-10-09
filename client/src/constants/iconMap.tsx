import React from "react";
import {
  Activity,
  BarChart3,
  Blocks,
  Boxes,
  CircleCheck,
  CircleDollarSign,
  Code2,
  Database,
  FileText,
  Folder,
  FlaskConical,
  GitBranch,
  History,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  Network,
  Palette,
  Plug,
  Settings,
  Shirt,
  ShieldCheck,
  Store,
  Users,
  User,
  Wrench,
  CalendarClock,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

/**
 * Tên icon lưu trong ModuleRegistries (giữ tên cũ kiểu antd để không phải đổi dữ liệu) -> icon lucide.
 * Thêm icon mới: thêm cặp tên -> component tại đây, rồi chọn trong form Phân hệ.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  DashboardOutlined: LayoutDashboard,
  UserOutlined: User,
  TeamOutlined: Users,
  SettingOutlined: Settings,
  AppstoreOutlined: LayoutGrid,
  BranchesOutlined: GitBranch,
  BgColorsOutlined: Palette,
  SkinOutlined: Shirt,
  ScheduleOutlined: CalendarClock,
  InboxOutlined: Inbox,
  DollarOutlined: CircleDollarSign,
  ShopOutlined: Store,
  ToolOutlined: Wrench,
  SafetyCertificateOutlined: ShieldCheck,
  FileTextOutlined: FileText,
  FolderOutlined: Folder,
  BarChartOutlined: BarChart3,
  BuildOutlined: Boxes,
  AuditOutlined: ScrollText,
  HistoryOutlined: History,
  CodeOutlined: Code2,
  DeploymentUnitOutlined: Network,
  ExperimentOutlined: FlaskConical,
  DatabaseOutlined: Database,
  ApiOutlined: Plug,
  CheckCircleOutlined: CircleCheck,
  ActivityOutlined: Activity,
  BlocksOutlined: Blocks,
};

/** Danh sách icon gợi ý để chọn trong form cấu hình Module */
export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

/** Icon lucide theo tên lưu trong CSDL; không có -> icon lưới mặc định */
export function getIconByName(iconName?: string | null, className = "size-4"): React.ReactNode {
  const Icon = (iconName && ICON_MAP[iconName]) || LayoutGrid;
  return <Icon className={className} aria-hidden />;
}
