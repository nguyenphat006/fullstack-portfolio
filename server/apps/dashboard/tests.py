"""Test trang Tổng quan: số liệu gộp, khối lọc theo quyền."""
from django.apps import apps as django_apps
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.authentication.models import Permission, Role, RolePermission
from apps.core.permissions import invalidate_user_permissions

User = get_user_model()
URL = '/api/v1/dashboard/overview/'


@override_settings(DEBUG=True)
class DashboardOverviewTests(TestCase):
    def setUp(self):
        cache.clear()
        invalidate_user_permissions()
        self.admin = User.objects.create_superuser(username='root', email='root@x.vn', password='Password123!')
        self.client = APIClient()

    def _user_with(self, *codes):
        role = Role.objects.create(role_code='R_' + '_'.join(codes)[:40], role_name='Thử')
        for code in codes:
            perm, _ = Permission.objects.get_or_create(permission_code=code, defaults={'permission_name': code, 'module': code.rsplit('_', 1)[0]})
            RolePermission.objects.create(role=role, permission=perm)
        user = User.objects.create_user(username='u_' + role.role_code.lower(), email=f'{role.role_code}@x.vn', password='Password123!')
        user.roles.add(role)
        return user

    def test_requires_login(self):
        self.assertEqual(self.client.get(URL).status_code, 401)

    def test_admin_gets_all_blocks(self):
        self.client.force_authenticate(self.admin)
        resp = self.client.get(URL)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()['data']
        # Khối NVL chỉ có khi còn module mẫu master_data
        has_sample = django_apps.is_installed('apps.master_data')
        expected = {'users', 'exports', 'activity'} | ({'materials'} if has_sample else set())
        self.assertEqual({k['key'] for k in data['kpis']}, expected)
        self.assertEqual(len(data['activity']), 14)
        if has_sample:
            self.assertIsInstance(data['materials_by_category'], list)
        self.assertIsInstance(data['recent_activity'], list)

    def test_blocks_filtered_by_permission(self):
        user = self._user_with('USER_READ')
        self.client.force_authenticate(user)
        data = self.client.get(URL).json()['data']
        self.assertEqual({k['key'] for k in data['kpis']}, {'users', 'exports'})
        self.assertIsNone(data['activity'])
        self.assertIsNone(data['materials_by_category'])
        self.assertIsNone(data['recent_activity'])
