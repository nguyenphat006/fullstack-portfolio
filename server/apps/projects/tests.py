"""Test hợp đồng API cho projects."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.authentication.models import Permission, Role, RolePermission
from apps.core.permissions import invalidate_user_permissions

from .models import Project

User = get_user_model()
URL = '/api/v1/projects/'

PAYLOAD = {
    'slug': 'My-Portfolio', 'title': 'Portfolio', 'summary': 'Trang cá nhân', 'stack': ['Next.js', 'Django'],
    'year': '2026', 'image': '/images/p.png', 'color': '#10b981', 'role': 'Fullstack', 'content': '# Nội dung',
}


class ProjectApiTests(TestCase):
    def setUp(self):
        invalidate_user_permissions()
        self.client = APIClient()
        self.admin = User.objects.create_superuser(username='admin_projects', email='a_projects@example.com', password='Password123!')
        self.client.force_authenticate(self.admin)

    def test_create_list_update_delete(self):
        resp = self.client.post(URL, PAYLOAD, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        body = resp.json()
        self.assertTrue(body['success'])
        self.assertEqual(body['data']['slug'], 'my-portfolio')
        self.assertEqual(body['data']['stack'], ['Next.js', 'Django'])
        item_id = body['data']['id']

        self.assertEqual(self.client.get(URL).json()['data']['count'], 1)

        resp = self.client.patch(f'{URL}{item_id}/', {'title': 'Portfolio (sửa)'}, format='json')
        self.assertEqual(resp.json()['data']['title'], 'Portfolio (sửa)')

        self.assertEqual(self.client.delete(f'{URL}{item_id}/').status_code, status.HTTP_200_OK)
        self.assertTrue(Project.all_objects.filter(id=item_id, deleted_at__isnull=False).exists())

    def test_duplicate_slug_is_validation_error(self):
        self.client.post(URL, PAYLOAD, format='json')
        body = self.client.post(URL, {**PAYLOAD, 'slug': 'my-portfolio'}, format='json').json()
        self.assertEqual(body['code'], 'validation_error')
        self.assertIn('slug', body['errors'])

    def test_requires_module_permission(self):
        role = Role.objects.create(role_code='VIEWER_PROJECT', role_name='Viewer')
        perm = Permission.objects.create(permission_code='PROJECT_READ', permission_name='Read', module='PROJECT')
        RolePermission.objects.create(role=role, permission=perm)
        viewer = User.objects.create_user(username='viewer_projects', email='v_projects@example.com', password='Password123!')
        viewer.roles.add(role)
        self.client.force_authenticate(viewer)

        self.assertEqual(self.client.get(URL).status_code, status.HTTP_200_OK)
        resp = self.client.post(URL, PAYLOAD, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

class PublicProjectApiTests(TestCase):
    """API công khai cho landing: không cần đăng nhập, chỉ đọc, ẩn bản ghi ngừng hoạt động."""

    def setUp(self):
        self.client = APIClient()
        Project.objects.create(**{**PAYLOAD, 'slug': 'hien-thi'})
        Project.objects.create(**{**PAYLOAD, 'slug': 'da-an', 'is_active': False})

    def test_list_and_detail_without_login(self):
        body = self.client.get('/api/v1/public/projects/').json()
        self.assertEqual([p['slug'] for p in body['data']['results']], ['hien-thi'])
        self.assertNotIn('created_by_name', body['data']['results'][0])
        self.assertEqual(self.client.get('/api/v1/public/projects/hien-thi/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get('/api/v1/public/projects/da-an/').status_code, status.HTTP_404_NOT_FOUND)

    def test_public_is_read_only(self):
        resp = self.client.post('/api/v1/public/projects/', PAYLOAD, format='json')
        self.assertEqual(resp.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
