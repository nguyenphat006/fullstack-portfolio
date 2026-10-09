"""
seed_core — dữ liệu LÕI bắt buộc của hệ thống (idempotent, chạy lại an toàn nhiều lần):
  - ModuleRegistry (menu / phân hệ), Permissions, Roles và ma trận Role -> Permission
  - Tài khoản quản trị đầu tiên (chỉ TẠO khi chưa có; KHÔNG BAO GIỜ ghi đè mật khẩu)

Phân hệ nghiệp vụ tự khai báo trong apps/<app>/rbac.py (MODULES, PERMISSIONS, ROLE_PERMISSIONS) và được gom
tự động (apps/core/rbac_registry.py). File này chỉ giữ phần lõi: Tổng quan, Người dùng, Nhật ký, Cài đặt, vai trò.
Vai trò ADMIN luôn được gán toàn bộ quyền.
Tài khoản admin lấy từ env: ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD
(DEBUG=True mà thiếu ADMIN_PASSWORD -> dùng mật khẩu dev 'Admin@123456').
"""
import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.authentication.models import ModuleRegistry, Permission, Role, RolePermission
from apps.core.permissions import invalidate_user_permissions
from apps.core.rbac_registry import collect_app_rbac, crud_permissions  # noqa: F401 (crud_permissions: tương thích ngược)

User = get_user_model()

DEV_ADMIN_PASSWORD = 'Admin@123456'

# Quyền đã ngừng dùng: seed_core xóa khỏi CSDL (kèm gán quyền) để ma trận phân quyền không còn mã rác
OBSOLETE_PERMISSIONS = ['AUDIT_VIEW', 'AUDIT_READ', 'AUDIT_EXPORT', 'SYSTEM_CONFIG']

DEFAULT_MODULES = [
    {
        'module_code': 'DASHBOARD',
        'module_name': 'Tổng quan (Dashboard)',
        'module_name_en': 'Dashboard',
        'icon': 'DashboardOutlined',
        'route_path': '/dashboard',
        'parent_code': None,
        'sort_order': 10,
        'is_navigation': True,
        'is_active': True,
        'description': 'Màn hình Tổng quan và Báo cáo KPI toàn bộ hệ thống',
        'description_en': 'System-wide overview and KPI reports',
    },
    {
        'module_code': 'USER',
        'module_name': 'Quản lý Người dùng',
        'module_name_en': 'Users',
        'icon': 'UserOutlined',
        'route_path': '/users',
        'parent_code': None,
        'sort_order': 30,
        'is_navigation': True,
        'is_active': True,
        'description': 'Quản trị danh sách người dùng, vai trò và phân quyền tài khoản',
        'description_en': 'Manage user accounts, roles and access',
    },
    {
        'module_code': 'AUDIT_LOGS',
        'module_name': 'Nhật Ký Thao Tác',
        'module_name_en': 'Audit logs',
        'icon': 'HistoryOutlined',
        'route_path': '/audit-logs',
        'parent_code': None,
        'sort_order': 80,
        'is_navigation': True,
        'is_active': True,
        'description': 'Ghi vết và giám sát toàn bộ lịch sử thao tác, thay đổi dữ liệu trên hệ thống theo thời gian thực',
        'description_en': 'Track every change made to system data',
    },
    {
        'module_code': 'SETTINGS',
        'module_name': 'Cài đặt Phân hệ & Navigation',
        'module_name_en': 'Modules & navigation',
        'icon': 'SettingOutlined',
        'route_path': '/settings/modules',
        'parent_code': None,
        'sort_order': 90,
        'is_navigation': True,
        'is_active': True,
        'description': 'Quản trị danh mục Module, cây Navigation và Permissions hệ thống',
        'description_en': 'Manage modules, navigation tree and permissions',
    },
]

DEFAULT_ROLES = [
    {
        'role_code': 'ADMIN',
        'role_name': 'Quản trị viên Hệ thống (Admin)',
        'description': 'Toàn quyền cấu hình hệ thống, quản lý tài khoản và phân quyền người dùng.',
    },
    {
        'role_code': 'MANAGER',
        'role_name': 'Trưởng bộ phận / Quản lý (Manager)',
        'description': 'Xem danh sách, xem số liệu thống kê, cập nhật thông tin và xuất báo cáo.',
    },
    {
        'role_code': 'STAFF',
        'role_name': 'Nhân viên / Chuyên viên (Staff)',
        'description': 'Xem danh sách dữ liệu và xem số liệu KPI cơ bản.',
    },
    {
        'role_code': 'CHIEF_ENGINEER',
        'role_name': 'Kỹ Sư Trưởng (Chief Engineer)',
        'description': 'Phê duyệt cấu trúc BOM, công thức sơn hoàn thiện và quy trình kỹ thuật.',
    },
    {
        'role_code': 'BOM_DESIGNER',
        'role_name': 'Kỹ Sư Thiết Kế Định Mức (BOM Designer)',
        'description': 'Thiết kế cấu trúc BOM 4 tầng, bóc tách linh kiện và định mức kỹ thuật.',
    },
    {
        'role_code': 'PRODUCTION_PLANNER',
        'role_name': 'Quản Lý Kế Hoạch Sản Xuất (Production Planner)',
        'description': 'Lập kế hoạch sản xuất, điều độ lệnh và điều phối vật tư nguồn lực.',
    },
    {
        'role_code': 'WORKSHOP_SUPERVISOR',
        'role_name': 'Quản Đốc Phân Xưởng (Workshop Supervisor)',
        'description': 'Tiếp nhận lệnh sản xuất, phân bổ công việc tại xưởng và theo dõi tiến độ.',
    },
    {
        'role_code': 'WAREHOUSE_KEEPER',
        'role_name': 'Thủ Kho (Warehouse Keeper)',
        'description': 'Quản lý xuất nhập tồn kho nguyên vật liệu, phụ kiện và thành phẩm.',
    },
]

DEFAULT_PERMISSIONS = [
    # Phân hệ USER (7 quyền chuẩn)
    {
        'permission_code': 'USER_VIEW',
        'permission_name': 'Truy cập Màn hình Quản lý Người dùng',
        'module': 'USER',
        'description': 'Hiển thị menu /users trên Sidebar và cho phép mở giao diện Quản lý Người dùng.'
    },
    {
        'permission_code': 'USER_READ',
        'permission_name': 'Xem Danh sách & Chi tiết Người dùng',
        'module': 'USER',
        'description': 'Gọi API đọc danh sách tài khoản, chi tiết người dùng và số liệu KPI.'
    },
    {
        'permission_code': 'USER_CREATE',
        'permission_name': 'Tạo Mới Tài khoản',
        'module': 'USER',
        'description': 'Mở modal và gọi API tạo mới tài khoản người dùng.'
    },
    {
        'permission_code': 'USER_UPDATE',
        'permission_name': 'Chỉnh sửa & Cập nhật Trạng thái',
        'module': 'USER',
        'description': 'Chỉnh sửa tài khoản, đổi vai trò, đổi trạng thái hoạt động.'
    },
    {
        'permission_code': 'USER_DELETE',
        'permission_name': 'Xóa dữ liệu',
        'module': 'USER',
        'description': 'Xóa tài khoản (không khôi phục trên giao diện).'
    },
    {
        'permission_code': 'USER_EXPORT',
        'permission_name': 'Xuất Danh sách Ra File',
        'module': 'USER',
        'description': 'Xuất danh sách người dùng ra định dạng Excel / CSV.'
    },
    {
        'permission_code': 'USER_IMPORT',
        'permission_name': 'Nhập Danh sách Từ File',
        'module': 'USER',
        'description': 'Nhập danh sách tài khoản hàng loạt từ file mẫu.'
    },

    # Phân hệ SETTINGS (5 quyền chuẩn)
    {
        'permission_code': 'SETTINGS_VIEW',
        'permission_name': 'Truy cập Màn hình Cài đặt Phân hệ',
        'module': 'SETTINGS',
        'description': 'Cho phép xem và cấu hình danh mục ModuleRegistry, Navigation và Ma trận Quyền.'
    },
    {
        'permission_code': 'SETTINGS_READ',
        'permission_name': 'Xem Danh mục Phân hệ & Cấu hình',
        'module': 'SETTINGS',
        'description': 'Đọc danh sách modules, chi tiết các actions và ma trận phân quyền.'
    },
    {
        'permission_code': 'SETTINGS_CREATE',
        'permission_name': 'Đăng ký Phân hệ & Thêm Quyền',
        'module': 'SETTINGS',
        'description': 'Tạo mới phân hệ và thêm action quyền hạn vào phân hệ.'
    },
    {
        'permission_code': 'SETTINGS_UPDATE',
        'permission_name': 'Chỉnh sửa Phân hệ & Cấu hình Ma trận',
        'module': 'SETTINGS',
        'description': 'Sửa thông tin module, kéo thả thứ tự và lưu cấu hình ma trận phân quyền.'
    },
    {
        'permission_code': 'SETTINGS_DELETE',
        'permission_name': 'Xóa Phân hệ & Quyền hạn',
        'module': 'SETTINGS',
        'description': 'Xóa phân hệ hoặc gỡ bỏ action quyền hạn khỏi hệ thống.'
    },

    # Phân hệ AUDIT_LOGS (Nhật ký thao tác & Giám sát - Cả chuẩn MODULE_CODE_ACTION và Alias)
    {
        'permission_code': 'AUDIT_LOGS_VIEW',
        'permission_name': 'Truy cập Màn hình Nhật Ký Thao Tác',
        'module': 'AUDIT_LOGS',
        'description': 'Hiển thị menu /audit-logs trên Sidebar và cho phép mở giao diện Nhật ký thao tác.'
    },
    {
        'permission_code': 'AUDIT_LOGS_READ',
        'permission_name': 'Xem Danh sách & Chi tiết Nhật Ký',
        'module': 'AUDIT_LOGS',
        'description': 'Gọi API đọc danh sách, chi tiết sự kiện thay đổi dữ liệu và so sánh Diffs.'
    },
    {
        'permission_code': 'AUDIT_LOGS_EXPORT',
        'permission_name': 'Xuất Nhật Ký Thao Tác Ra File',
        'module': 'AUDIT_LOGS',
        'description': 'Xuất danh sách nhật ký thao tác kiểm toán ra file Excel / CSV.'
    },
]

# Quyền lõi mặc định theo vai trò (ADMIN = toàn bộ quyền, không liệt kê)
ROLE_PERMISSION_MAP = {
    'MANAGER': [
        'USER_VIEW', 'USER_READ', 'USER_CREATE', 'USER_UPDATE', 'USER_EXPORT',
        'AUDIT_LOGS_VIEW', 'AUDIT_LOGS_READ',
        'SETTINGS_VIEW', 'SETTINGS_READ'
    ],
    'CHIEF_ENGINEER': [
        'USER_VIEW', 'USER_READ',
        'AUDIT_LOGS_VIEW', 'AUDIT_LOGS_READ',
    ],
    'BOM_DESIGNER': [
        'USER_VIEW', 'USER_READ',
    ],
    'PRODUCTION_PLANNER': [
        'USER_VIEW', 'USER_READ',
    ],
    'WORKSHOP_SUPERVISOR': [
        'USER_VIEW', 'USER_READ',
    ],
    'WAREHOUSE_KEEPER': [
        'USER_VIEW', 'USER_READ',
    ],
    'STAFF': [
        'USER_VIEW', 'USER_READ'
    ],
}


class Command(BaseCommand):
    help = "Khoi tao du lieu loi: Modules, Permissions, Roles va tai khoan quan tri dau tien"

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset-role-permissions', action='store_true',
            help='Dat lai quyen cua cac vai tro mac dinh theo ROLE_PERMISSION_MAP (ghi de chinh sua tren UI)',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        app_modules, app_permissions, app_role_permissions = collect_app_rbac()
        modules = DEFAULT_MODULES + app_modules
        permissions = DEFAULT_PERMISSIONS + app_permissions
        role_permission_map = {
            role: ROLE_PERMISSION_MAP.get(role, []) + app_role_permissions.get(role, [])
            for role in {*ROLE_PERMISSION_MAP, *app_role_permissions}
        }
        role_permission_map['ADMIN'] = [p['permission_code'] for p in permissions]

        self.stdout.write("Khoi tao ModuleRegistry...")
        for m_data in modules:
            mod, created = ModuleRegistry.objects.update_or_create(
                module_code=m_data['module_code'],
                defaults=m_data
            )
            status_text = "[NEW]" if created else "[UPDATE]"
            self.stdout.write(f"  + {status_text} Module: {mod.module_code} (Parent: {mod.parent_code})")

        self.stdout.write("\nKhoi tao danh muc Permissions...")
        perm_map = {}
        new_perms = set()
        for p_data in permissions:
            perm, created = Permission.objects.update_or_create(
                permission_code=p_data['permission_code'],
                defaults=p_data
            )
            perm_map[perm.permission_code] = perm
            if created:
                new_perms.add(perm.permission_code)
            status_text = "[NEW]" if created else "[UPDATE]"
            self.stdout.write(f"  + {status_text} Perm: {perm.permission_code}")

        removed, _ = Permission.objects.filter(permission_code__in=OBSOLETE_PERMISSIONS).delete()
        if removed:
            self.stdout.write(f"  - Da xoa {removed} ban ghi quyen ngung dung: {', '.join(OBSOLETE_PERMISSIONS)}")

        # Cấu hình hệ thống: chỉ tạo dòng mặc định khi chưa có (không ghi đè cấu hình đã sửa trên UI)
        from apps.core.models import SystemSettings
        if not SystemSettings.objects.exists():
            SystemSettings.load()
            self.stdout.write("  - Da tao cau hinh he thong mac dinh")

        self.stdout.write("\nKhoi tao Roles...")
        role_map = {}
        new_roles = set()
        for r_data in DEFAULT_ROLES:
            role, created = Role.objects.update_or_create(
                role_code=r_data['role_code'],
                defaults=r_data
            )
            role_map[role.role_code] = role
            if created:
                new_roles.add(role.role_code)
            status_text = "[NEW]" if created else "[UPDATE]"
            self.stdout.write(f"  + {status_text} Role: {role.role_code}")

        # Không ghi đè ma trận quyền đã chỉnh trên UI:
        #  - vai trò MỚI tạo -> gán toàn bộ quyền mặc định
        #  - vai trò đã có -> chỉ bổ sung các quyền VỪA tạo lần đầu (phân hệ mới thêm vào dự án)
        # Khôi phục toàn bộ về mặc định: --reset-role-permissions
        reset = options['reset_role_permissions']
        self.stdout.write("\nGan quyen han mac dinh...")
        for r_code, perm_codes in role_permission_map.items():
            role = role_map.get(r_code)
            if not role:
                continue
            if reset or r_code in new_roles:
                RolePermission.objects.filter(role=role).delete()
                codes = perm_codes
            else:
                codes = [c for c in perm_codes if c in new_perms]
            assignments = [RolePermission(role=role, permission=perm_map[c]) for c in codes if c in perm_map]
            if assignments:
                RolePermission.objects.bulk_create(assignments, ignore_conflicts=True)
                self.stdout.write(self.style.SUCCESS(f"  -> Role {r_code}: Da gan {len(assignments)} quyen"))

        self.ensure_admin(role_map.get('ADMIN'))

        # Gán role ADMIN cho mọi superuser (tài khoản tạo bằng createsuperuser)
        admin_role = role_map.get('ADMIN')
        if admin_role:
            for su in User.objects.filter(is_superuser=True):
                su.roles.add(admin_role)

        invalidate_user_permissions()
        self.stdout.write(self.style.SUCCESS("\n[SUCCESS] Hoan tat khoi tao du lieu loi (Modules, Permissions, Roles, Admin)."))

    def ensure_admin(self, admin_role):
        username = os.getenv('ADMIN_USERNAME', 'admin')
        user = User.objects.filter(username=username).first()
        if user is None:
            password = os.getenv('ADMIN_PASSWORD')
            if not password:
                if not settings.DEBUG:
                    raise CommandError("Thieu ADMIN_PASSWORD de tao tai khoan quan tri (bat buoc khi DEBUG=False).")
                password = DEV_ADMIN_PASSWORD
            user = User(
                username=username,
                email=os.getenv('ADMIN_EMAIL', f'{username}@example.com'),
                full_name='Quản Trị Viên Hệ Thống',
                is_superuser=True,
                is_staff=True,
                is_active=True,
            )
            user.set_password(password)
            user.save()
            shown = password if password == DEV_ADMIN_PASSWORD else '<tu ADMIN_PASSWORD>'
            self.stdout.write(self.style.SUCCESS(f"  -> Da tao tai khoan quan tri '{username}' (mat khau: {shown})"))
        else:
            self.stdout.write(f"  -> Tai khoan quan tri '{username}' da ton tai: giu nguyen mat khau")
        if admin_role:
            user.roles.add(admin_role)
