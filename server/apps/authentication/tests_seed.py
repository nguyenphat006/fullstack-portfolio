"""Test lệnh khởi tạo dữ liệu: seed_core idempotent, không ghi đè mật khẩu admin / quyền đã chỉnh."""
from io import StringIO

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase, override_settings

from apps.authentication.models import Role, RolePermission

User = get_user_model()


def run(*args, **kwargs):
    call_command(*args, stdout=StringIO(), **kwargs)


@override_settings(DEBUG=True)
class SeedCommandTests(TestCase):
    def test_seed_core_creates_admin_once_and_never_resets_password(self):
        run('seed_core')
        admin = User.objects.get(username='admin')
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.roles.filter(role_code='ADMIN').exists())

        admin.set_password('Changed@2026')
        admin.save()
        run('seed_core')
        admin.refresh_from_db()
        self.assertTrue(admin.check_password('Changed@2026'))

    def test_seed_core_keeps_role_permissions_edited_on_ui(self):
        run('seed_core')
        role = Role.objects.exclude(role_code='ADMIN').first()
        RolePermission.objects.filter(role=role).delete()

        run('seed_core')
        self.assertFalse(RolePermission.objects.filter(role=role).exists())

        run('seed_core', reset_role_permissions=True)
        self.assertTrue(RolePermission.objects.filter(role=role).exists())

    def test_seed_core_grants_new_permissions_to_existing_roles(self):
        """Phân hệ mới thêm vào dự án đang chạy: vai trò có sẵn nhận quyền mặc định của quyền vừa tạo."""
        from apps.authentication.models import Permission
        run('seed_core')
        Permission.objects.filter(permission_code='USER_EXPORT').delete()  # giả lập quyền chưa từng có
        manager = Role.objects.get(role_code='MANAGER')
        self.assertFalse(RolePermission.objects.filter(role=manager, permission__permission_code='USER_EXPORT').exists())

        run('seed_core')
        self.assertTrue(RolePermission.objects.filter(role=manager, permission__permission_code='USER_EXPORT').exists())
        admin = Role.objects.get(role_code='ADMIN')
        self.assertTrue(RolePermission.objects.filter(role=admin, permission__permission_code='USER_EXPORT').exists())

    @override_settings(DEBUG=False)
    def test_seed_core_requires_admin_password_in_production(self):
        from django.core.management.base import CommandError
        with self.assertRaises(CommandError):
            run('seed_core')
