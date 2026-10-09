"""Test hợp đồng API cho __label__ (sinh bởi startmodule — bổ sung test cho mọi quy tắc nghiệp vụ)."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.authentication.models import Permission, Role, RolePermission
from apps.core.permissions import invalidate_user_permissions

from .models import __Model__

User = get_user_model()
URL = '/api/v1/__resource__/'


class __Model__ApiTests(TestCase):
    def setUp(self):
        invalidate_user_permissions()
        self.client = APIClient()
        self.admin = User.objects.create_superuser(username='admin___app__', email='a___app__@example.com', password='Password123!')
        self.client.force_authenticate(self.admin)

    def test_create_list_update_delete(self):
        resp = self.client.post(URL, {'code': 'x01', 'name': 'Mẫu 1'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        body = resp.json()
        self.assertTrue(body['success'])
        self.assertEqual(body['data']['code'], 'X01')
        item_id = body['data']['id']

        listing = self.client.get(URL).json()
        self.assertEqual(listing['data']['count'], 1)

        resp = self.client.patch(f'{URL}{item_id}/', {'name': 'Mẫu 1 (sửa)'}, format='json')
        self.assertEqual(resp.json()['data']['name'], 'Mẫu 1 (sửa)')

        self.assertEqual(self.client.delete(f'{URL}{item_id}/').status_code, status.HTTP_200_OK)
        self.assertTrue(__Model__.all_objects.filter(id=item_id, deleted_at__isnull=False).exists())

    def test_duplicate_code_is_validation_error(self):
        __Model__.objects.create(code='DUP', name='Có sẵn')
        body = self.client.post(URL, {'code': 'dup', 'name': 'Trùng'}, format='json').json()
        self.assertEqual(body['code'], 'validation_error')
        self.assertIn('code', body['errors'])

    def test_requires_module_permission(self):
        role = Role.objects.create(role_code='VIEWER___MODULE_CODE__', role_name='Viewer')
        perm = Permission.objects.create(permission_code='__MODULE_CODE___READ', permission_name='Read', module='__MODULE_CODE__')
        RolePermission.objects.create(role=role, permission=perm)
        viewer = User.objects.create_user(username='viewer___app__', email='v___app__@example.com', password='Password123!')
        viewer.roles.add(role)
        self.client.force_authenticate(viewer)

        self.assertEqual(self.client.get(URL).status_code, status.HTTP_200_OK)
        resp = self.client.post(URL, {'code': 'NO', 'name': 'Không quyền'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
