"""
Test nhật ký thao tác: mỗi dòng có nhãn trường dễ đọc, giá trị cũ → mới và vai trò của người thực hiện.
Dùng model lõi (Role) — không phụ thuộc app mẫu master_data.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import translation
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.authentication.models import Role

User = get_user_model()

AUDIT_URL = '/api/v1/audit-logs/'


class EntityAuditLogTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(username='audit_admin', email='audit_admin@example.com', password='Password123!')
        self.admin.roles.add(Role.objects.create(role_code='AUDITOR', role_name='Kiểm soát viên'))
        self.client = APIClient()
        # Ngữ cảnh nhật ký (người thực hiện) lấy từ JWT trong middleware → dùng token thật, không force_authenticate
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(self.admin).access_token}')

    def entity_logs(self, role):
        resp = self.client.get(AUDIT_URL, {'model': 'authentication.role', 'object_id': role.id}, HTTP_ACCEPT_LANGUAGE='vi')
        self.assertEqual(resp.status_code, 200)
        return resp.json()['data']['results']

    def test_update_shows_field_label_old_new_and_user_roles(self):
        role = Role.objects.create(role_code='QC', role_name='Kiểm tra chất lượng')
        resp = self.client.patch(f'/api/v1/roles/{role.id}/', {'role_name': 'QC xưởng'}, format='json')
        self.assertEqual(resp.status_code, 200)

        update = next(log for log in self.entity_logs(role) if log['action_code'] == 'UPDATE')
        change = next(d for d in update['diff'] if d['field'] == 'role_name')
        with translation.override('vi'):
            expected_label = str(Role._meta.get_field('role_name').verbose_name)
        self.assertEqual(change['label'], expected_label[:1].upper() + expected_label[1:])
        self.assertEqual((change['old_value'], change['new_value']), ('Kiểm tra chất lượng', 'QC xưởng'))
        self.assertEqual(update['user']['username'], 'audit_admin')
        self.assertIn('Kiểm soát viên', update['user']['roles'])
        # Trường kỹ thuật không lọt vào danh sách thay đổi
        self.assertFalse({'updated_at', 'updated_by_id'} & {d['field'] for d in update['diff']})

    def test_create_lists_initial_values(self):
        resp = self.client.post('/api/v1/roles/', {'role_code': 'PLANNER', 'role_name': 'Kế hoạch'}, format='json')
        self.assertEqual(resp.status_code, 201)
        role = Role.objects.get(role_code='PLANNER')

        create = next(log for log in self.entity_logs(role) if log['action_code'] == 'CREATE')
        values = {d['field']: d['new_value'] for d in create['diff']}
        self.assertEqual(values.get('role_name'), 'Kế hoạch')
        self.assertNotIn('created_at', values)
