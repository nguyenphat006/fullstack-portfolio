"""Test dịch tự động VI -> EN: giữ nguyên Markdown/code/URL và API chỉ cho người có quyền."""
from unittest import mock

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase
from rest_framework.test import APIClient

from apps.authentication.models import Permission, Role, RolePermission
from apps.core import translation
from apps.core.permissions import invalidate_user_permissions

User = get_user_model()
URL = '/api/v1/translate/'


def fake_provider(text, source, target):
    return f'[{target}] {text}'


class TranslateTextTests(SimpleTestCase):
    def setUp(self):
        translation._disabled_until.clear()

    def test_keeps_code_inline_code_and_urls(self):
        md = 'Xem `NestJS` tại https://shopsifu.live/ nhé\n```ts\nconst x = 1;\n```\n![ảnh](/images/a.webp)'
        with mock.patch.dict(translation.PROVIDERS, {'google': fake_provider}, clear=False):
            out = translation.translate_text(md)
        self.assertIn('`NestJS`', out)
        self.assertIn('https://shopsifu.live/', out)
        self.assertIn('```ts\nconst x = 1;\n```', out)
        self.assertIn('(/images/a.webp)', out)

    def test_keeps_list_markers_and_headings(self):
        with mock.patch.dict(translation.PROVIDERS, {'google': fake_provider}, clear=False):
            out = translation.translate_text('## Tiêu đề\n- Mục một\n1. Mục hai')
        self.assertEqual(out.split('\n')[0], '## [en] Tiêu đề')
        self.assertTrue(out.split('\n')[1].startswith('- [en] '))
        self.assertTrue(out.split('\n')[2].startswith('1. [en] '))

    def test_empty_returns_empty_and_falls_back_to_next_provider(self):
        self.assertEqual(translation.translate_text('   '), '')

        def broken(*_args):
            raise RuntimeError('blocked')

        with mock.patch.dict(translation.PROVIDERS, {'google': broken, 'mymemory': fake_provider}):
            self.assertEqual(translation.translate_text('Xin chào'), '[en] Xin chào')

    def test_all_providers_failing_raises(self):
        def broken(*_args):
            raise RuntimeError('blocked')

        with mock.patch.dict(translation.PROVIDERS, {'google': broken, 'mymemory': broken}):
            with self.assertRaises(translation.TranslationError):
                translation.translate_text('Xin chào')


class TranslateApiTests(TestCase):
    def setUp(self):
        invalidate_user_permissions()
        translation._disabled_until.clear()
        self.client = APIClient()

    def test_requires_login(self):
        self.assertEqual(self.client.post(URL, {'texts': {'title': 'Xin chào'}}, format='json').status_code, 401)

    def test_user_without_content_permission_is_forbidden(self):
        user = User.objects.create_user(username='nope_tr', email='nope_tr@example.com', password='Password123!')
        self.client.force_authenticate(user)
        self.assertEqual(self.client.post(URL, {'texts': {'title': 'Xin chào'}}, format='json').status_code, 403)

    def test_user_with_project_update_can_translate(self):
        role = Role.objects.create(role_code='EDITOR_TR', role_name='Editor')
        perm = Permission.objects.create(permission_code='PROJECT_UPDATE', permission_name='Update', module='PROJECT')
        RolePermission.objects.create(role=role, permission=perm)
        user = User.objects.create_user(username='editor_tr', email='editor_tr@example.com', password='Password123!')
        user.roles.add(role)
        self.client.force_authenticate(user)
        with mock.patch.dict(translation.PROVIDERS, {'google': fake_provider}):
            body = self.client.post(URL, {'texts': {'title': 'Xin chào', 'summary': ''}}, format='json').json()
        self.assertTrue(body['success'])
        self.assertEqual(body['data']['translations'], {'title': '[en] Xin chào', 'summary': ''})

    def test_provider_failure_returns_business_error(self):
        admin = User.objects.create_superuser(username='admin_tr', email='admin_tr@example.com', password='Password123!')
        self.client.force_authenticate(admin)

        def broken(*_args):
            raise RuntimeError('blocked')

        with mock.patch.dict(translation.PROVIDERS, {'google': broken, 'mymemory': broken}):
            body = self.client.post(URL, {'texts': {'title': 'Xin chào'}}, format='json').json()
        self.assertFalse(body['success'])
        self.assertEqual(body['code'], 'business_rule')

    def test_same_source_and_target_rejected(self):
        admin = User.objects.create_superuser(username='admin_tr2', email='admin_tr2@example.com', password='Password123!')
        self.client.force_authenticate(admin)
        body = self.client.post(URL, {'texts': {'a': 'x'}, 'source': 'vi', 'target': 'vi'}, format='json').json()
        self.assertEqual(body['code'], 'validation_error')
