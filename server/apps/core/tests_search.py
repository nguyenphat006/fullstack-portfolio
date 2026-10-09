"""Tìm kiếm toàn cục: lọc theo quyền RBAC, xếp hạng theo mã, độ dài từ khóa tối thiểu. Dùng phân hệ lõi USER."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.authentication.models import ModuleRegistry, Permission, Role, RolePermission
from apps.core.permissions import invalidate_user_permissions

User = get_user_model()

SEARCH_URL = '/api/v1/search/'


class GlobalSearchTests(TestCase):
    def setUp(self):
        invalidate_user_permissions()
        ModuleRegistry.objects.get_or_create(
            module_code='USER', defaults={'module_name': 'Người dùng', 'route_path': '/users', 'is_active': True}
        )
        self.client = APIClient()
        self.target = User.objects.create_user(username='kho_an', full_name='Nguyễn Văn An', email='an@example.com', password='Password123!')

    def user_with(self, username, *perm_codes):
        role = Role.objects.create(role_code=f'R_{username.upper()}', role_name=username)
        for code in perm_codes:
            perm, _ = Permission.objects.get_or_create(permission_code=code, defaults={'permission_name': code, 'module': 'USER'})
            RolePermission.objects.create(role=role, permission=perm)
        user = User.objects.create_user(username=username, email=f'{username}@example.com', password='Password123!')
        user.roles.add(role)
        return user

    def search(self, user, q):
        self.client.force_authenticate(user)
        resp = self.client.get(SEARCH_URL, {'q': q})
        self.assertEqual(resp.status_code, 200)
        return resp.json()['data']

    def test_results_follow_rbac(self):
        reader = self.user_with('reader', 'USER_READ')
        stranger = self.user_with('stranger')

        groups = self.search(reader, 'kho_an')
        users = next(g for g in groups if g['module_code'] == 'USER')
        self.assertEqual(users['results'][0]['url'], f'/users/{self.target.id}')
        self.assertEqual(users['results'][0]['title'], 'Nguyễn Văn An')

        self.assertFalse(any(g['module_code'] == 'USER' for g in self.search(stranger, 'kho_an')))

    def test_exact_code_ranks_first_and_short_query_returns_nothing(self):
        User.objects.create_user(username='an_kho', full_name='Kho An', email='x@example.com', password='Password123!')
        admin = User.objects.create_superuser(username='root_s', email='root_s@example.com', password='Password123!')

        users = next(g for g in self.search(admin, 'kho_an') if g['module_code'] == 'USER')
        self.assertEqual(users['results'][0]['code'], 'kho_an')
        self.assertEqual(self.search(admin, 'k'), [])

    def test_inactive_module_is_hidden(self):
        ModuleRegistry.objects.filter(module_code='USER').update(is_active=False)
        admin = User.objects.create_superuser(username='root_i', email='root_i@example.com', password='Password123!')
        self.assertEqual(self.search(admin, 'kho_an'), [])
