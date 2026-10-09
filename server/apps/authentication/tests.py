import json
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.authentication.models import Role, Permission, RolePermission, ModuleRegistry
from apps.core.permissions import invalidate_user_permissions

User = get_user_model()

class AuthenticationAndRBACTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Tạo Modules
        self.mod_sys = ModuleRegistry.objects.create(
            module_code='SETTINGS',
            module_name='Cấu hình Hệ thống',
            route_path='/settings'
        )
        self.mod_user = ModuleRegistry.objects.create(
            module_code='USER',
            module_name='Quản lý Người dùng',
            route_path='/users'
        )

        # Tạo Permissions
        self.perm_settings_read = Permission.objects.create(
            permission_code='SETTINGS_READ',
            permission_name='Xem Cấu hình',
            module='SETTINGS'
        )
        self.perm_settings_update = Permission.objects.create(
            permission_code='SETTINGS_UPDATE',
            permission_name='Sửa Cấu hình',
            module='SETTINGS'
        )
        self.perm_settings_delete = Permission.objects.create(
            permission_code='SETTINGS_DELETE',
            permission_name='Xóa Cấu hình',
            module='SETTINGS'
        )
        self.perm_user_read = Permission.objects.create(
            permission_code='USER_READ',
            permission_name='Xem Người dùng',
            module='USER'
        )
        self.perm_user_create = Permission.objects.create(
            permission_code='USER_CREATE',
            permission_name='Tạo Người dùng',
            module='USER'
        )
        self.perm_user_update = Permission.objects.create(
            permission_code='USER_UPDATE',
            permission_name='Sửa Người dùng',
            module='USER'
        )
        self.perm_user_delete = Permission.objects.create(
            permission_code='USER_DELETE',
            permission_name='Xóa Người dùng',
            module='USER'
        )

        # Tạo Roles
        self.role_admin = Role.objects.create(
            role_code='ADMIN',
            role_name='Quản trị viên Hệ thống',
            is_active=True
        )
        self.role_engineer = Role.objects.create(
            role_code='CHIEF_ENGINEER',
            role_name='Kỹ sư trưởng',
            is_active=True
        )
        self.role_temp = Role.objects.create(
            role_code='TEMP_ROLE',
            role_name='Vai trò tạm thời',
            is_active=True
        )

        # Gán toàn quyền cho ADMIN
        for perm in [
            self.perm_settings_read, self.perm_settings_update, self.perm_settings_delete,
            self.perm_user_read, self.perm_user_create, self.perm_user_update, self.perm_user_delete
        ]:
            RolePermission.objects.create(role=self.role_admin, permission=perm)

        # Gán quyền quản lý USER cho CHIEF_ENGINEER
        for perm in [self.perm_user_read, self.perm_user_update, self.perm_user_delete]:
            RolePermission.objects.create(role=self.role_engineer, permission=perm)

        # Tạo Users
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='Password123!',
            full_name='Hệ thống Admin'
        )
        self.admin_user.roles.add(self.role_admin)

        self.engineer_user = User.objects.create_user(
            username='engineer',
            email='engineer@example.com',
            password='Password123!',
            full_name='Kỹ sư Nguyễn Văn A'
        )
        self.engineer_user.roles.add(self.role_engineer)

        # Authenticate client as admin by default
        self.client.force_authenticate(user=self.admin_user)
        invalidate_user_permissions()

    def _assert_field_error(self, response, field_name):
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        body = response.json()
        self.assertFalse(body['success'])
        self.assertEqual(body['code'], 'validation_error')
        self.assertIn(field_name, body['errors'])

    # =========================================================================
    # 1. KIỂM THỬ BẢO VỆ TÀI KHOẢN ADMIN & TỰ KHÓA TÀI KHOẢN (USER UPDATE/SERIALIZER)
    # =========================================================================

    def test_admin_cannot_deactivate_self(self):
        """Admin không thể tự vô hiệu hóa tài khoản của chính mình."""
        url = f"/api/v1/users/{self.admin_user.id}/"
        response = self.client.patch(url, {'is_active': False}, format='json')
        self._assert_field_error(response, 'is_active')
        self.admin_user.refresh_from_db()
        self.assertTrue(self.admin_user.is_active)

    def test_cannot_deactivate_admin_user(self):
        """Người dùng khác có quyền USER_UPDATE cũng không thể vô hiệu hóa tài khoản admin."""
        self.client.force_authenticate(user=self.engineer_user)
        url = f"/api/v1/users/{self.admin_user.id}/"
        response = self.client.patch(url, {'is_active': False}, format='json')
        # Người không phải quản trị viên không được sửa bất kỳ thông tin nào của tài khoản admin
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.admin_user.refresh_from_db()
        self.assertTrue(self.admin_user.is_active)

    def test_cannot_strip_admin_role_from_admin_user(self):
        """Không thể gỡ vai trò ADMIN khỏi tài khoản admin."""
        url = f"/api/v1/users/{self.admin_user.id}/"
        response = self.client.patch(url, {'role_ids': [self.role_engineer.id]}, format='json')
        self._assert_field_error(response, 'role_ids')

    def test_cannot_change_admin_username(self):
        """Không thể thay đổi username của tài khoản admin mặc định."""
        url = f"/api/v1/users/{self.admin_user.id}/"
        response = self.client.patch(url, {'username': 'admin_modified'}, format='json')
        self._assert_field_error(response, 'username')

    def test_email_uniqueness_validation(self):
        """Không cho phép cập nhật email trùng với tài khoản khác."""
        url = f"/api/v1/users/{self.engineer_user.id}/"
        response = self.client.patch(url, {'email': 'admin@example.com'}, format='json')
        self._assert_field_error(response, 'email')

    # =========================================================================
    # 2. KIỂM THỬ XÓA VÀ THÙNG RÁC CHO USER (USERVIEWSET)
    # =========================================================================

    def test_cannot_delete_self(self):
        """Không thể tự xóa tài khoản đang đăng nhập."""
        url = f"/api/v1/users/{self.admin_user.id}/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_delete_admin_user(self):
        """Không thể xóa tài khoản Quản trị viên (Admin)."""
        self.client.force_authenticate(user=self.engineer_user)
        url = f"/api/v1/users/{self.admin_user.id}/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_soft_delete_user_cannot_be_viewed_or_restored(self):
        """Xóa mềm người dùng: không còn trong API, không có thùng rác / khôi phục."""
        self.client.force_authenticate(user=self.admin_user)
        url = f"/api/v1/users/{self.engineer_user.id}/"
        delete_resp = self.client.delete(url)
        self.assertEqual(delete_resp.status_code, status.HTTP_200_OK)

        self.engineer_user.refresh_from_db()
        self.assertIsNotNone(self.engineer_user.deleted_at)
        self.assertFalse(self.engineer_user.is_active)

        self.assertEqual(self.client.get(url).status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.get("/api/v1/users/trash/").status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.client.post(f"{url}restore/").status_code, status.HTTP_404_NOT_FOUND)

    # =========================================================================
    # 3. KIỂM THỬ ROLEVIEWSET (XÓA ROLE, N+1 QUERY, ADMIN ROLE PROTECTION)
    # =========================================================================

    def test_cannot_delete_admin_role(self):
        """Không thể xóa vai trò ADMIN tối cao."""
        url = f"/api/v1/roles/{self.role_admin.id}/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_delete_role_with_active_users(self):
        """Không thể xóa vai trò nếu đang có người dùng đảm nhiệm."""
        url = f"/api/v1/roles/{self.role_engineer.id}/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("đang có 1 tài khoản", response.data['message'])

    def test_can_delete_unused_role(self):
        """Có thể xóa mềm vai trò không có người dùng đảm nhiệm; không khôi phục lại được."""
        url = f"/api/v1/roles/{self.role_temp.id}/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.role_temp.refresh_from_db()
        self.assertIsNotNone(self.role_temp.deleted_at)
        self.assertFalse(self.role_temp.is_active)
        self.assertEqual(self.client.post(f"{url}restore/").status_code, status.HTTP_404_NOT_FOUND)

    def test_roles_list_n_plus_one_optimization(self):
        """Danh sách vai trò sử dụng prefetch_related, đúng 5 queries O(1) bất kể số lượng role."""
        with self.assertNumQueries(5):  # count + roles + prefetch perms + perms + prefetch user roles
            response = self.client.get("/api/v1/roles/")
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    # =========================================================================
    # 4. KIỂM THỬ TINH GỌN SERIALIZER & ROUTING ALIAS
    # =========================================================================

    def test_user_list_does_not_contain_permissions(self):
        """API danh sách người dùng GET /api/v1/users/ tuyệt đối không trả permissions."""
        response = self.client.get("/api/v1/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        users = response.data.get('results', response.data.get('data', []))
        self.assertGreater(len(users), 0)
        for user_data in users:
            self.assertNotIn('permissions', user_data)

    def test_auth_me_returns_permissions(self):
        """/auth/me/ là endpoint duy nhất trả về danh sách permissions của người dùng hiện tại."""
        for endpoint in ['/api/v1/auth/me/']:
            invalidate_user_permissions(self.admin_user.id)
            response = self.client.get(endpoint)
            self.assertEqual(response.status_code, status.HTTP_200_OK, f"Endpoint {endpoint} failed")
            user_data = response.data.get('data', response.data)
            self.assertIn('permissions', user_data)
            self.assertIn('*', user_data['permissions'])
