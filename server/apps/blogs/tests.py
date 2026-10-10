"""Test hợp đồng API cho blogs."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.authentication.models import Permission, Role, RolePermission
from apps.core.permissions import invalidate_user_permissions

from .models import Blog

User = get_user_model()
URL = '/api/v1/blogs/'

PAYLOAD = {
    'slug': 'Hello-World', 'title': 'Hello', 'excerpt': 'Tóm tắt', 'published_date': 'Mar 1, 2026',
    'category': 'Tech', 'read_time': '5 min read', 'image': '/images/b.png', 'content': '# Nội dung',
}


class BlogApiTests(TestCase):
    def setUp(self):
        invalidate_user_permissions()
        self.client = APIClient()
        self.admin = User.objects.create_superuser(username='admin_blogs', email='a_blogs@example.com', password='Password123!')
        self.client.force_authenticate(self.admin)

    def test_create_list_update_delete(self):
        resp = self.client.post(URL, PAYLOAD, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        body = resp.json()
        self.assertTrue(body['success'])
        self.assertEqual(body['data']['slug'], 'hello-world')
        item_id = body['data']['id']

        self.assertEqual(self.client.get(URL).json()['data']['count'], 1)

        resp = self.client.patch(f'{URL}{item_id}/', {'title': 'Hello (sửa)'}, format='json')
        self.assertEqual(resp.json()['data']['title'], 'Hello (sửa)')

        self.assertEqual(self.client.delete(f'{URL}{item_id}/').status_code, status.HTTP_200_OK)
        self.assertTrue(Blog.all_objects.filter(id=item_id, deleted_at__isnull=False).exists())

    def test_duplicate_slug_is_validation_error(self):
        self.client.post(URL, PAYLOAD, format='json')
        body = self.client.post(URL, {**PAYLOAD, 'slug': 'hello-world'}, format='json').json()
        self.assertEqual(body['code'], 'validation_error')
        self.assertIn('slug', body['errors'])

    def test_requires_module_permission(self):
        role = Role.objects.create(role_code='VIEWER_BLOG', role_name='Viewer')
        perm = Permission.objects.create(permission_code='BLOG_READ', permission_name='Read', module='BLOG')
        RolePermission.objects.create(role=role, permission=perm)
        viewer = User.objects.create_user(username='viewer_blogs', email='v_blogs@example.com', password='Password123!')
        viewer.roles.add(role)
        self.client.force_authenticate(viewer)

        self.assertEqual(self.client.get(URL).status_code, status.HTTP_200_OK)
        resp = self.client.post(URL, PAYLOAD, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

class PublicBlogApiTests(TestCase):
    """API công khai cho landing: không cần đăng nhập, chỉ đọc, ẩn bản ghi ngừng hoạt động."""

    def setUp(self):
        self.client = APIClient()
        Blog.objects.create(**{**PAYLOAD, 'slug': 'hien-thi'})
        Blog.objects.create(**{**PAYLOAD, 'slug': 'da-an', 'is_active': False})

    def test_list_and_detail_without_login(self):
        body = self.client.get('/api/v1/public/blogs/').json()
        self.assertEqual([p['slug'] for p in body['data']['results']], ['hien-thi'])
        self.assertEqual(self.client.get('/api/v1/public/blogs/hien-thi/').status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get('/api/v1/public/blogs/da-an/').status_code, status.HTTP_404_NOT_FOUND)

    def test_public_is_read_only(self):
        resp = self.client.post('/api/v1/public/blogs/', PAYLOAD, format='json')
        self.assertEqual(resp.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
