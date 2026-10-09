"""Test đa ngôn ngữ: API trả thông điệp theo header Accept-Language (mặc định tiếng Việt)."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.authentication.models import Role

User = get_user_model()
ROLES_URL = '/api/v1/roles/'


class ApiLanguageTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(username='i18n_admin', email='i18n@x.vn', password='Password123!')
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def test_crud_success_message_follows_accept_language(self):
        vi = self.client.post(ROLES_URL, {'role_code': 'QA_VI', 'role_name': 'Kiểm thử'}, format='json').json()
        self.assertTrue(vi['success'])
        self.assertIn('thành công', vi['message'])

        en = self.client.post(ROLES_URL, {'role_code': 'QA_EN', 'role_name': 'QA'}, format='json', HTTP_ACCEPT_LANGUAGE='en').json()
        self.assertTrue(en['success'])
        self.assertIn('created', en['message'])
        self.assertNotIn('thành công', en['message'])

    def test_business_error_follows_accept_language(self):
        admin_role = Role.objects.create(role_code='ADMIN', role_name='Quản trị viên')
        vi = self.client.delete(f'{ROLES_URL}{admin_role.id}/').json()
        self.assertEqual(vi['code'], 'business_rule')
        self.assertIn('Không thể xóa vai trò', vi['message'])

        en = self.client.delete(f'{ROLES_URL}{admin_role.id}/', HTTP_ACCEPT_LANGUAGE='en').json()
        self.assertEqual(en['code'], 'business_rule')
        self.assertEqual(en['message'], 'The system Administrator (ADMIN) role cannot be deleted.')

    def test_default_error_message_follows_accept_language(self):
        anon = APIClient()
        self.assertIn('chưa đăng nhập', anon.get(ROLES_URL).json()['message'])
        self.assertEqual(anon.get(ROLES_URL, HTTP_ACCEPT_LANGUAGE='en').json()['message'], 'You are not signed in or your session has expired.')


class TranslationCatalogTests(TestCase):
    def test_compiled_catalog_matches_po(self):
        """django.mo phải được biên dịch lại sau mỗi lần sửa django.po (quên compilemessages -> app hiện chữ cũ)."""
        import ast
        import gettext
        import re
        from pathlib import Path

        from django.conf import settings

        folder = Path(settings.BASE_DIR) / 'locale' / 'en' / 'LC_MESSAGES'
        po = (folder / 'django.po').read_text(encoding='utf-8')
        with open(folder / 'django.mo', 'rb') as fh:
            catalog = gettext.GNUTranslations(fh)._catalog

        quoted = r'"(?:[^"\\]|\\.)*"'
        entries = re.findall(rf'^msgid ((?:{quoted}\s*)+)^msgstr ((?:{quoted}\s*)+)', po, flags=re.M)
        join = lambda block: ''.join(ast.literal_eval(part) for part in re.findall(quoted, block))
        pairs = [(join(mid), join(mstr)) for mid, mstr in entries]
        stale = [mid for mid, mstr in pairs if mid and catalog.get(mid) != mstr]
        self.assertGreater(len(pairs), 100)
        self.assertEqual(stale, [], "django.mo cũ — chạy: python manage.py compilemessages")
