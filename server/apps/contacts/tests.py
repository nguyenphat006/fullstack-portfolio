"""Test hợp đồng API cho contacts."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.authentication.models import Permission, Role, RolePermission
from apps.core.permissions import invalidate_user_permissions

from .models import Contact

User = get_user_model()
URL = '/api/v1/contacts/'

PAYLOAD = {'name': 'Khách', 'email': 'khach@example.com', 'message': 'Xin chào'}


class ContactApiTests(TestCase):
    def setUp(self):
        invalidate_user_permissions()
        self.client = APIClient()
        self.admin = User.objects.create_superuser(username='admin_contacts', email='a_contacts@example.com', password='Password123!')
        self.client.force_authenticate(self.admin)

    def test_create_list_update_delete(self):
        resp = self.client.post(URL, PAYLOAD, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        body = resp.json()
        self.assertTrue(body['success'])

        item_id = body['data']['id']

        self.assertEqual(self.client.get(URL).json()['data']['count'], 1)

        resp = self.client.patch(f'{URL}{item_id}/', {'description': 'Đã phản hồi'}, format='json')
        self.assertEqual(resp.json()['data']['description'], 'Đã phản hồi')

        self.assertEqual(self.client.delete(f'{URL}{item_id}/').status_code, status.HTTP_200_OK)
        self.assertTrue(Contact.all_objects.filter(id=item_id, deleted_at__isnull=False).exists())

    def test_invalid_email_is_validation_error(self):
        body = self.client.post(URL, {**PAYLOAD, 'email': 'khong-hop-le'}, format='json').json()
        self.assertEqual(body['code'], 'validation_error')
        self.assertIn('email', body['errors'])

    def test_requires_module_permission(self):
        role = Role.objects.create(role_code='VIEWER_CONTACT', role_name='Viewer')
        perm = Permission.objects.create(permission_code='CONTACT_READ', permission_name='Read', module='CONTACT')
        RolePermission.objects.create(role=role, permission=perm)
        viewer = User.objects.create_user(username='viewer_contacts', email='v_contacts@example.com', password='Password123!')
        viewer.roles.add(role)
        self.client.force_authenticate(viewer)

        self.assertEqual(self.client.get(URL).status_code, status.HTTP_200_OK)
        resp = self.client.post(URL, PAYLOAD, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

class PublicContactApiTests(TestCase):
    """Form liên hệ công khai: không cần đăng nhập, lưu bản ghi, chặn dữ liệu sai."""

    def test_anonymous_can_submit(self):
        resp = APIClient().post('/api/v1/public/contacts/', PAYLOAD, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Contact.objects.filter(email='khach@example.com').exists())

    def test_invalid_email_rejected(self):
        resp = APIClient().post('/api/v1/public/contacts/', {**PAYLOAD, 'email': 'sai'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_anonymous_cannot_read_list(self):
        self.assertIn(APIClient().get('/api/v1/public/contacts/').status_code,
                      (status.HTTP_405_METHOD_NOT_ALLOWED, status.HTTP_404_NOT_FOUND))
