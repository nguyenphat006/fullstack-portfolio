"""Test hồi quy bảo mật phân quyền: chống tự nâng quyền, bảo vệ tài khoản quản trị, mật khẩu ban đầu."""
from io import StringIO

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient

from apps.authentication.models import Role
from apps.core.permissions import invalidate_user_permissions

User = get_user_model()
URL = '/api/v1/users/'


@override_settings(DEBUG=True)
class UserPrivilegeEscalationTests(TestCase):
    def setUp(self):
        call_command('seed_core', stdout=StringIO())
        invalidate_user_permissions()
        self.admin_role = Role.objects.get(role_code='ADMIN')
        self.manager_role = Role.objects.get(role_code='MANAGER')  # có USER_CREATE + USER_UPDATE
        self.admin = User.objects.get(username='admin')
        self.manager = User.objects.create_user(username='mgr', email='mgr@x.vn', password='Password123!')
        self.manager.roles.add(self.manager_role)
        self.staff = User.objects.create_user(username='staff', email='staff@x.vn', password='Password123!')
        self.client = APIClient()
        self.client.force_authenticate(self.manager)

    def test_manager_cannot_grant_admin_role_to_self(self):
        resp = self.client.patch(f'{URL}{self.manager.id}/', {'role_ids': [self.admin_role.id]}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(self.manager.roles.filter(role_code='ADMIN').exists())

    def test_manager_cannot_grant_admin_role_to_others(self):
        resp = self.client.patch(f'{URL}{self.staff.id}/', {'role_ids': [self.admin_role.id]}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        resp = self.client.post(URL, {
            'username': 'newadmin', 'email': 'na@x.vn', 'password': 'Password123!', 'role_ids': [self.admin_role.id],
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(User.objects.filter(username='newadmin').exists())

    def test_manager_cannot_modify_admin_account(self):
        resp = self.client.patch(f'{URL}{self.admin.id}/', {'password': 'Hacked@12345'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.admin.refresh_from_db()
        self.assertFalse(self.admin.check_password('Hacked@12345'))

        resp = self.client.patch(f'{URL}{self.admin.id}/', {'full_name': 'Đổi tên'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_cannot_change_own_roles(self):
        resp = self.client.patch(f'{URL}{self.manager.id}/', {'role_ids': []}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('role_ids', resp.json()['errors'])

    def test_manager_can_reset_password_of_regular_staff(self):
        resp = self.client.patch(f'{URL}{self.staff.id}/', {'password': 'NewPass@2026'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.staff.refresh_from_db()
        self.assertTrue(self.staff.check_password('NewPass@2026'))

    def test_admin_can_grant_admin_role(self):
        self.client.force_authenticate(self.admin)
        resp = self.client.patch(f'{URL}{self.staff.id}/', {'role_ids': [self.admin_role.id]}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(self.staff.roles.filter(role_code='ADMIN').exists())

    def test_create_requires_password(self):
        resp = self.client.post(URL, {'username': 'nopass', 'email': 'np@x.vn'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', resp.json()['errors'])


@override_settings(DEBUG=True)
class PermissionDataTests(TestCase):
    def setUp(self):
        from apps.authentication.models import Permission
        Permission.objects.create(permission_code='AUDIT_VIEW', permission_name='Cũ', module='AUDIT_LOGS')
        call_command('seed_core', stdout=StringIO())
        invalidate_user_permissions()

    def test_obsolete_permissions_removed(self):
        from apps.authentication.models import Permission
        self.assertFalse(Permission.objects.filter(permission_code__in=['AUDIT_VIEW', 'SYSTEM_CONFIG']).exists())
        self.assertTrue(Permission.objects.filter(permission_code='USER_IMPORT').exists())

    def test_user_creator_can_list_roles_without_settings_permission(self):
        from apps.authentication.models import Permission, RolePermission
        role = Role.objects.create(role_code='HR', role_name='Nhân sự')
        RolePermission.objects.create(role=role, permission=Permission.objects.get(permission_code='USER_CREATE'))
        hr = User.objects.create_user(username='hr', email='hr@x.vn', password='Password123!')
        hr.roles.add(role)
        client = APIClient()
        client.force_authenticate(hr)
        self.assertEqual(client.get('/api/v1/roles/').status_code, status.HTTP_200_OK)
        self.assertEqual(client.post('/api/v1/roles/', {'role_code': 'X', 'role_name': 'X'}, format='json').status_code, status.HTTP_403_FORBIDDEN)


class NavigationTreeTests(TestCase):
    def test_orphan_child_is_promoted_to_top_level(self):
        """Nhóm cha không còn (vd. đã bỏ module mẫu MASTER_DATA) -> phân hệ con vẫn hiện trên menu."""
        from django.core.cache import cache
        from apps.authentication.models import ModuleRegistry

        ModuleRegistry.objects.create(module_code='SUPPLIER', module_name='Nhà cung cấp', route_path='/suppliers',
                                      parent_code='NO_SUCH_GROUP', sort_order=10)
        admin = User.objects.create_superuser(username='nav_admin', email='nav@x.vn', password='Password123!')
        cache.clear()
        client = APIClient()
        client.force_authenticate(admin)
        tree = client.get('/api/v1/modules/navigation/').json()['data']
        self.assertIn('SUPPLIER', [item['code'] for item in tree])
