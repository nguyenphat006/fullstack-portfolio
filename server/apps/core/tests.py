import io
from django.test import TestCase, override_settings
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from apps.core.models import Attachment
from apps.core.excel_service import ExcelService

User = get_user_model()

class CoreUtilitiesTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin_core_test',
            email='admin_core@example.com',
            password='Password123!'
        )
        self.client.force_authenticate(user=self.admin)

    # =========================================================================
    # 1. ATTACHMENTS (TỆP ĐÍNH KÈM ĐA HÌNH)
    # =========================================================================

    def test_upload_attachment_polymorphic(self):
        """Upload tệp đính kèm đa hình cho thực thể USER."""
        file_content = b"Mock content of technical drawing or document"
        uploaded_file = SimpleUploadedFile("drawing.pdf", file_content, content_type="application/pdf")

        data = {
            'entity_type': 'USER',
            'entity_id': self.admin.id,
            'file': uploaded_file,
            'file_category': 'DOCUMENT',
            'description': 'Bản scan hồ sơ nhân viên',
        }
        response = self.client.post('/api/v1/attachments/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['data']['entity_type'], 'USER')
        self.assertEqual(response.data['data']['entity_id'], self.admin.id)
        self.assertEqual(response.data['data']['file_name'], 'drawing.pdf')
        file_url = response.data['data']['file_url']
        self.assertIn('/file/?sig=', file_url)
        # Link có chữ ký tải được mà không cần đăng nhập (dùng cho <img>, xem trước)
        self.assertEqual(APIClient().get(file_url).status_code, 200)

    def test_filter_attachments_by_entity(self):
        """Lọc danh sách tệp theo entity_type và entity_id."""
        f1 = SimpleUploadedFile("spec1.txt", b"spec 1 content")
        f2 = SimpleUploadedFile("spec2.txt", b"spec 2 content")

        Attachment.objects.create(
            entity_type='PRODUCT_BASE',
            entity_id=101,
            file=f1,
            file_name='spec1.txt',
            file_size=len(b"spec 1 content")
        )
        Attachment.objects.create(
            entity_type='PRODUCT_BASE',
            entity_id=102,
            file=f2,
            file_name='spec2.txt',
            file_size=len(b"spec 2 content")
        )

        resp = self.client.get('/api/v1/attachments/?entity_type=PRODUCT_BASE&entity_id=101')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.data.get('results', resp.data.get('data', []))
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['file_name'], 'spec1.txt')

    def test_soft_delete_and_hard_delete_attachment(self):
        """Kiểm tra xóa mềm và xóa vĩnh viễn tệp đính kèm."""
        f = SimpleUploadedFile("sample.png", b"image bytes", content_type="image/png")
        att = Attachment.objects.create(
            entity_type='MATERIAL',
            entity_id=5,
            file=f,
            file_name='sample.png',
            file_size=11
        )

        # 1. Xóa mềm qua DELETE thông thường
        del_resp = self.client.delete(f'/api/v1/attachments/{att.id}/')
        self.assertIn(del_resp.status_code, [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT])
        att.refresh_from_db()
        self.assertIsNotNone(att.deleted_at)

        # 2. Xóa vĩnh viễn (Hard Delete)
        hard_resp = self.client.delete(f'/api/v1/attachments/{att.id}/hard-delete/')
        self.assertEqual(hard_resp.status_code, status.HTTP_200_OK)
        self.assertFalse(Attachment.all_objects.filter(id=att.id).exists())

    # =========================================================================
    # 2. EXCEL SERVICE (XUẤT FILE & SINH TEMPLATE)
    # =========================================================================

    def test_excel_service_export_and_template(self):
        """Xuất file Excel và sinh file mẫu có định dạng chuẩn."""
        cols = [
            {'key': 'sku', 'label': 'Mã SKU', 'required': True, 'width': 20},
            {'key': 'name', 'label': 'Tên sản phẩm', 'required': True, 'width': 30},
            {'key': 'price', 'label': 'Giá bán', 'type': 'number', 'width': 15},
        ]
        data = [
            {'sku': 'SKU-001', 'name': 'Bàn cafe chân sắt', 'price': 1500000},
            {'sku': 'SKU-002', 'name': 'Ghế mây đan dây dù', 'price': 850000},
        ]

        # Test Export
        export_resp = ExcelService.export_to_response(cols, data, filename="Test_Export")
        self.assertEqual(export_resp.status_code, 200)
        self.assertEqual(export_resp['Content-Type'], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        self.assertGreater(len(export_resp.content), 1000)

        # Test Template
        template_resp = ExcelService.generate_template_response(cols, filename="Test_Template")
        self.assertEqual(template_resp.status_code, 200)
        self.assertGreater(len(template_resp.content), 1000)

        # Test Parse
        parsed = ExcelService.parse_excel_file(io.BytesIO(export_resp.content))
        self.assertEqual(parsed['total_rows'], 2)
        self.assertIn('Mã SKU', parsed['headers'])
        self.assertEqual(parsed['rows'][0]['Mã SKU'], 'SKU-001')

    # =========================================================================
    # 3. BASE ERP VIEWSET GENERIC ENDPOINTS
    # =========================================================================

    def test_base_viewset_export_excel_and_template(self):
        """Kiểm tra các endpoint generic export-excel và excel-template trên ViewSet."""
        # Gọi thử trên attachment ViewSet
        exp_resp = self.client.get('/api/v1/attachments/export-excel/')
        self.assertEqual(exp_resp.status_code, 200)
        self.assertEqual(exp_resp['Content-Type'], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

        tpl_resp = self.client.get('/api/v1/attachments/excel-template/')
        self.assertEqual(tpl_resp.status_code, 200)
        self.assertEqual(tpl_resp['Content-Type'], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

    def test_base_viewset_batch_actions(self):
        """batch-delete xóa mềm; không có batch-restore / batch-hard-delete (đã bỏ thùng rác)."""
        f1 = SimpleUploadedFile("batch1.txt", b"content 1")
        f2 = SimpleUploadedFile("batch2.txt", b"content 2")

        a1 = Attachment.objects.create(entity_type='TEST', entity_id=1, file=f1, file_name='b1')
        a2 = Attachment.objects.create(entity_type='TEST', entity_id=2, file=f2, file_name='b2')

        bdel_resp = self.client.post('/api/v1/attachments/batch-delete/', {'ids': [a1.id, a2.id]}, format='json')
        self.assertEqual(bdel_resp.status_code, 200)
        self.assertEqual(bdel_resp.data['data']['count'], 2)
        self.assertEqual(Attachment.all_objects.filter(id__in=[a1.id, a2.id], deleted_at__isnull=False).count(), 2)

        for path in ('batch-restore', 'batch-hard-delete', 'trash'):
            method = self.client.get if path == 'trash' else self.client.post
            # Không còn route riêng -> rơi vào route chi tiết (404 / 405)
            self.assertIn(method(f'/api/v1/attachments/{path}/', {'ids': [a1.id]}, format='json').status_code, (404, 405))

    # =========================================================================
    # 3. DATA TRANSFER JOBS (XUẤT DỮ LIỆU BẤT ĐỒNG BỘ - CELERY ASYNC)
    # =========================================================================

    def test_base_viewset_export_excel_async(self):
        """Kiểm tra export-excel khi truyền cờ is_async=True trả về HTTP 202 và tạo DataTransferJob."""
        from apps.core.models import DataTransferJob
        from apps.core.tasks import execute_data_export_job

        payload = {
            'is_async': True,
            'format': 'xlsx',
            'scope': 'all',
        }
        resp = self.client.post('/api/v1/attachments/export-excel/', payload, format='json')
        self.assertEqual(resp.status_code, 202)
        self.assertIn('job_id', resp.data['data'])
        self.assertTrue(resp.data['data']['is_async'])

        job_id = resp.data['data']['job_id']
        job = DataTransferJob.objects.filter(id=job_id).first()
        self.assertIsNotNone(job)
        self.assertEqual(job.job_type, 'EXPORT_EXCEL')

        # Gọi task thực thi và kiểm tra hoàn tất
        execute_data_export_job(job.id)
        job.refresh_from_db()
        self.assertEqual(job.status, 'COMPLETED')
        self.assertEqual(job.progress, 100)
        self.assertIsNotNone(job.file_url)

        # Kiểm tra endpoint polling status
        status_resp = self.client.get(f'/api/v1/jobs/{job.id}/status/')
        self.assertEqual(status_resp.status_code, 200)
        self.assertEqual(status_resp.data['data']['progress'], 100)
        self.assertEqual(status_resp.data['data']['status'], 'COMPLETED')

        # Kiểm tra endpoint tải file
        download_resp = self.client.get(f'/api/v1/jobs/{job.id}/download/')
        self.assertEqual(download_resp.status_code, 200)
        self.assertIn('attachment', download_resp['Content-Disposition'])


class HealthCheckTests(TestCase):
    def test_health_is_public_and_reports_components(self):
        resp = APIClient().get('/api/v1/health/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()['data']
        self.assertEqual(data['status'], 'ok')
        self.assertEqual(data['database']['status'], 'ok')
        self.assertEqual(data['cache']['status'], 'ok')


class AttachmentPermissionTests(TestCase):
    """Tệp đính kèm kế thừa quyền của thực thể cha: xem cần <MODULE>_READ, thêm/xóa cần <MODULE>_UPDATE."""

    def setUp(self):
        from apps.authentication.models import Permission, Role, RolePermission
        from apps.core.permissions import invalidate_user_permissions
        invalidate_user_permissions()
        role = Role.objects.create(role_code='USER_VIEWER', role_name='Xem người dùng')
        perm = Permission.objects.create(permission_code='USER_READ', permission_name='Xem', module='USER')
        RolePermission.objects.create(role=role, permission=perm)
        self.viewer = User.objects.create_user(username='viewer_att', email='va@x.vn', password='Password123!')
        self.viewer.roles.add(role)
        self.outsider = User.objects.create_user(username='outsider_att', email='oa@x.vn', password='Password123!')
        self.att = Attachment.objects.create(
            entity_type='User', entity_id=self.viewer.id, file_name='hop-dong.pdf',
            file=SimpleUploadedFile('hop-dong.pdf', b'%PDF-1.4 test'),
        )
        self.client = APIClient()

    def test_outsider_cannot_list_or_delete(self):
        self.client.force_authenticate(self.outsider)
        self.assertEqual(self.client.get('/api/v1/attachments/?entity_type=User').status_code, 403)
        self.assertEqual(self.client.get('/api/v1/attachments/').status_code, 403)
        self.assertEqual(self.client.delete(f'/api/v1/attachments/{self.att.id}/').status_code, 403)
        self.assertEqual(self.client.delete(f'/api/v1/attachments/{self.att.id}/hard-delete/').status_code, 403)

    def test_reader_can_view_but_not_modify(self):
        self.client.force_authenticate(self.viewer)
        resp = self.client.get('/api/v1/attachments/?entity_type=User')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['data']['count'], 1)
        self.assertEqual(self.client.delete(f'/api/v1/attachments/{self.att.id}/').status_code, 403)
        upload = self.client.post('/api/v1/attachments/', {
            'entity_type': 'User', 'entity_id': self.viewer.id,
            'file': SimpleUploadedFile('x.txt', b'x'),
        }, format='multipart')
        self.assertEqual(upload.status_code, 403)
        self.assertEqual(self.client.post('/api/v1/attachments/batch-delete/', {'ids': [self.att.id]}, format='json').status_code, 403)

    def test_file_link_requires_valid_signature(self):
        anon = APIClient()
        self.assertEqual(anon.get(f'/api/v1/attachments/{self.att.id}/file/?sig=gia-mao').status_code, 400)
        from apps.core.attachment_access import signed_file_url
        other = Attachment.objects.create(entity_type='User', entity_id=1, file_name='b.txt', file=SimpleUploadedFile('b.txt', b'b'))
        forged = signed_file_url(other.id).replace(f'/{other.id}/', f'/{self.att.id}/')  # chữ ký của tệp khác
        self.assertEqual(anon.get(forged).status_code, 400)
        self.assertEqual(anon.get(signed_file_url(self.att.id)).status_code, 200)


# =========================================================================
# THÔNG BÁO TRONG ỨNG DỤNG
# =========================================================================
from apps.core.models import Notification  # noqa: E402
from apps.core.notifications import cleanup_read_notifications, notify  # noqa: E402


@override_settings(DEBUG=True)
class NotificationTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.alice = User.objects.create_user(username='alice', email='alice@x.vn', password='Password123!')
        self.bob = User.objects.create_user(username='bob', email='bob@x.vn', password='Password123!')
        self.client = APIClient()
        self.client.force_authenticate(self.alice)

    def test_only_own_notifications_and_unread_count(self):
        notify(self.alice, "A1")
        notify(self.alice, "A2", level='SUCCESS')
        other = notify(self.bob, "B1")
        resp = self.client.get('/api/v1/notifications/')
        self.assertEqual(resp.json()['data']['count'], 2)
        self.assertEqual(self.client.get('/api/v1/notifications/unread-count/').json()['data']['count'], 2)
        # Không đọc / đánh dấu được thông báo của người khác
        self.assertEqual(self.client.post(f'/api/v1/notifications/{other.id}/read/').status_code, 404)

    def test_mark_read_and_read_all(self):
        n1 = notify(self.alice, "A1")
        notify(self.alice, "A2")
        self.assertTrue(self.client.post(f'/api/v1/notifications/{n1.id}/read/').json()['data']['is_read'])
        self.assertEqual(self.client.get('/api/v1/notifications/?unread=true').json()['data']['count'], 1)
        self.client.post('/api/v1/notifications/read-all/')
        self.assertEqual(self.client.get('/api/v1/notifications/unread-count/').json()['data']['count'], 0)

    def test_admin_reset_password_notifies_owner(self):
        admin = get_user_model().objects.create_superuser(username='root2', email='r2@x.vn', password='Password123!')
        self.client.force_authenticate(admin)
        resp = self.client.patch(f'/api/v1/users/{self.bob.id}/', {'password': 'NewPass@2026'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(Notification.objects.filter(recipient=self.bob, level='WARNING').exists())

    def test_cleanup_removes_old_read(self):
        n = notify(self.alice, "cũ")
        Notification.objects.filter(pk=n.pk).update(read_at=timezone.now() - timezone.timedelta(days=40))
        notify(self.alice, "mới")
        self.assertEqual(cleanup_read_notifications(30), 1)
        self.assertEqual(Notification.objects.filter(recipient=self.alice).count(), 1)


# =========================================================================
# CẤU HÌNH HỆ THỐNG
# =========================================================================
from apps.core.models import SystemSettings  # noqa: E402


@override_settings(DEBUG=True)
class SystemSettingsTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        User = get_user_model()
        self.admin = User.objects.create_superuser(username='sysadm', email='sa@x.vn', password='Password123!')
        self.staff = User.objects.create_user(username='staff2', email='st2@x.vn', password='Password123!')
        self.client = APIClient()

    def test_public_endpoint_without_login(self):
        resp = self.client.get('/api/v1/system-settings/public/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()['data']
        self.assertEqual(data['app_name'], SystemSettings.DEFAULTS['app_name'])
        self.assertNotIn('updated_by_name', data)

    def test_staff_cannot_update(self):
        self.client.force_authenticate(self.staff)
        self.assertEqual(self.client.get('/api/v1/system-settings/').status_code, 403)
        self.assertEqual(self.client.patch('/api/v1/system-settings/', {'app_name': 'X'}, format='json').status_code, 403)

    def test_admin_update_refreshes_public_cache(self):
        self.client.get('/api/v1/system-settings/public/')  # nạp cache
        self.client.force_authenticate(self.admin)
        resp = self.client.patch('/api/v1/system-settings/', {'app_name': 'Xưởng ABC', 'number_format': 'VN'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(APIClient().get('/api/v1/system-settings/public/').json()['data']['app_name'], 'Xưởng ABC')
        bad = self.client.patch('/api/v1/system-settings/', {'timezone': 'Mars/Base'}, format='json')
        self.assertEqual(bad.status_code, 400)

    def test_logo_upload_validation(self):
        self.client.force_authenticate(self.admin)
        bad = self.client.post('/api/v1/system-settings/logo/', {'file': SimpleUploadedFile('x.exe', b'x')}, format='multipart')
        self.assertEqual(bad.status_code, 400)
        ok = self.client.post('/api/v1/system-settings/logo/', {'file': SimpleUploadedFile('logo.svg', b'<svg xmlns="http://www.w3.org/2000/svg"/>', content_type='image/svg+xml')}, format='multipart')
        self.assertEqual(ok.status_code, 200)
        self.assertIn('/branding/', ok.json()['data']['logo_url'])
