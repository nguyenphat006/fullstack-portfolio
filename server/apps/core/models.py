import pghistory
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone
from .managers import SoftDeleteManager

class TimeStampedModel(models.Model):
    """
    Abstract model cung cấp các trường thời gian tạo và cập nhật tự động.
    """
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Thời điểm tạo"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Thời điểm cập nhật gần nhất"))

    class Meta:
        abstract = True
        ordering = ['-updated_at', 'id']
        indexes = [
            models.Index(fields=['-updated_at', 'id']),
        ]


class SoftDeleteModel(models.Model):
    """
    Abstract model cung cấp cơ chế Xóa mềm (Soft Delete) bắt buộc cho dữ liệu ERP.
    """
    is_active = models.BooleanField(default=True, verbose_name=_("Trạng thái hoạt động"))
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Thời điểm xóa mềm"))

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    @property
    def is_deleted(self) -> bool:
        """Kiểm tra bản ghi đã bị xóa mềm hay chưa."""
        return self.deleted_at is not None

    def soft_delete(self, user=None):
        """Thực hiện xóa mềm 1 bản ghi."""
        self.deleted_at = timezone.now()
        self.is_active = False
        if user and hasattr(self, 'updated_by'):
            self.updated_by = user
        self.save(update_fields=['deleted_at', 'is_active'] + (['updated_by'] if user and hasattr(self, 'updated_by') else []))

    def restore(self, user=None):
        """Khôi phục 1 bản ghi từ thùng rác."""
        self.deleted_at = None
        self.is_active = True
        if user and hasattr(self, 'updated_by'):
            self.updated_by = user
        self.save(update_fields=['deleted_at', 'is_active'] + (['updated_by'] if user and hasattr(self, 'updated_by') else []))


class AuditModel(TimeStampedModel, SoftDeleteModel):
    """
    Abstract Model chuẩn hóa cho toàn bộ bảng nghiệp vụ.
    Bao gồm đầy đủ:
    - Time tracking: created_at, updated_at
    - User audit: created_by, updated_by
    - Soft delete: deleted_at, is_active
    - Technical notes: description
    - Ordering: Luôn dựa vào updated_at mới nhất (-updated_at), phụ theo id tăng dần
    """
    description = models.TextField(null=True, blank=True, verbose_name=_("Mô tả / Ghi chú kỹ thuật"))
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(app_label)s_%(class)s_created",
        verbose_name=_("Người tạo")
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(app_label)s_%(class)s_updated",
        verbose_name=_("Người cập nhật gần nhất")
    )

    class Meta:
        abstract = True
        ordering = ['-updated_at', 'id']
        indexes = [
            models.Index(fields=['-updated_at', 'id']),
        ]


def attachment_upload_path(instance, filename):
    import os
    entity = (instance.entity_type or 'misc').lower()
    return os.path.join('attachments', entity, filename)


@pghistory.track(
    pghistory.InsertEvent(),
    pghistory.UpdateEvent(),
    pghistory.DeleteEvent(),
)
class Attachment(AuditModel):
    """
    0.8 Quản lý Tệp Đính Kèm Đa Hình (Bảng Attachments theo database.dbml).
    Cho phép đính kèm tệp cho bất kỳ thực thể nào trong hệ thống (USER, PRODUCT_BASE, MATERIAL...).
    """
    FILE_CATEGORY_CHOICES = [
        ('DOCUMENT', _('Tài liệu chung')),
        ('IMAGE', _('Hình ảnh / Bản chụp')),
        ('CAD_DRAWING', _('Bản vẽ kỹ thuật CAD / DWG')),
        ('SPEC_SHEET', _('Bản thông số kỹ thuật')),
        ('CONTRACT', _('Hợp đồng / Đơn vị chứng từ')),
        ('OTHER', _('Khác')),
    ]

    entity_type = models.CharField(
        max_length=50,
        verbose_name=_("Loại thực thể"),
        help_text="VD: USER, PRODUCT_BASE, PRODUCT_VARIANT, MATERIAL, WORK_ORDER..."
    )
    entity_id = models.IntegerField(
        verbose_name=_("Mã Id của thực thể đính kèm")
    )
    file = models.FileField(
        upload_to=attachment_upload_path,
        max_length=500,
        verbose_name=_("Tệp đính kèm")
    )
    file_name = models.CharField(
        max_length=255,
        verbose_name=_("Tên gốc của tệp")
    )
    file_size = models.BigIntegerField(
        default=0,
        verbose_name=_("Dung lượng tệp (bytes)")
    )
    mime_type = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name=_("Định dạng MIME")
    )
    file_category = models.CharField(
        max_length=50,
        choices=FILE_CATEGORY_CHOICES,
        default='DOCUMENT',
        verbose_name=_("Phân loại tệp")
    )

    class Meta:
        db_table = "Attachments"
        verbose_name = _("Tệp đính kèm")
        verbose_name_plural = _("Danh mục Tệp đính kèm")
        ordering = ['-updated_at', 'id']
        indexes = [
            models.Index(fields=['-updated_at', 'id']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['file_category']),
        ]

    def __str__(self):
        return f"[{self.entity_type} #{self.entity_id}] {self.file_name} ({self.file_category})"

    @property
    def file_url(self):
        if self.file:
            return self.file.url
        return ""


@pghistory.track(
    pghistory.InsertEvent(),
    pghistory.UpdateEvent(),
    pghistory.DeleteEvent(),
)
class DataTransferJob(AuditModel):
    """
    0.9 Quản lý Tiến trình Xuất / Nhập Dữ liệu Tác vụ Ngầm (DataTransferJobs - Celery Async Tasks).
    Theo dõi tiến độ (0-100%), lưu trạng thái, đường dẫn file xuất và thông số lọc.
    """
    JOB_TYPE_CHOICES = [
        ('EXPORT_EXCEL', _('Xuất Excel (.xlsx)')),
        ('EXPORT_CSV', _('Xuất CSV (.csv)')),
        ('IMPORT_EXCEL', _('Nhập dữ liệu từ Excel')),
    ]

    STATUS_CHOICES = [
        ('PENDING', _('Chờ xử lý trong hàng đợi')),
        ('PROCESSING', _('Đang xử lý dữ liệu')),
        ('COMPLETED', _('Đã hoàn tất')),
        ('FAILED', _('Thất bại')),
        ('CANCELLED', _('Đã hủy bỏ')),
    ]

    job_type = models.CharField(
        max_length=30,
        choices=JOB_TYPE_CHOICES,
        default='EXPORT_EXCEL',
        verbose_name=_("Loại tác vụ")
    )
    entity_type = models.CharField(
        max_length=50,
        verbose_name=_("Tên loại thực thể"),
        help_text="VD: USER, PRODUCT_BASE, MATERIAL, CUSTOMER..."
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        verbose_name=_("Trạng thái thực thi")
    )
    progress = models.IntegerField(
        default=0,
        verbose_name=_("Tiến độ hoàn thành (%)")
    )
    total_rows = models.IntegerField(
        default=0,
        verbose_name=_("Tổng số dòng cần xử lý")
    )
    processed_rows = models.IntegerField(
        default=0,
        verbose_name=_("Số dòng đã xử lý xong")
    )
    file_url = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name=_("Đường dẫn file kết quả")
    )
    error_file_url = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name=_("Đường dẫn file tổng hợp dòng lỗi")
    )
    error_message = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("Chi tiết lỗi nếu thất bại")
    )
    query_params = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_("Tham số truy vấn (scope, filters, columns)")
    )
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Thời điểm bắt đầu thực thi")
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_("Thời điểm hoàn tất")
    )

    class Meta:
        db_table = "DataTransferJobs"
        verbose_name = _("Tác vụ truyền dữ liệu")
        verbose_name_plural = _("Danh mục Tác vụ truyền dữ liệu (Async Jobs)")
        ordering = ['-updated_at', 'id']
        indexes = [
            models.Index(fields=['-updated_at', 'id']),
            models.Index(fields=['created_by', 'status']),
            models.Index(fields=['job_type', 'status']),
        ]

    def __str__(self):
        return f"[{self.get_job_type_display()}] {self.entity_type} - {self.get_status_display()} ({self.progress}%)"


class Notification(AuditModel):
    """
    0.10 Thông báo trong ứng dụng (bảng Notifications). Tạo qua `apps.core.notifications.notify()`,
    người dùng chỉ đọc được thông báo của chính mình.
    """
    LEVEL_CHOICES = [
        ('INFO', _('Thông tin')),
        ('SUCCESS', _('Thành công')),
        ('WARNING', _('Cảnh báo')),
        ('ERROR', _('Lỗi')),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_("Người nhận"),
    )
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='INFO', verbose_name=_("Mức độ"))
    title = models.CharField(max_length=255, verbose_name=_("Tiêu đề"))
    message = models.TextField(null=True, blank=True, verbose_name=_("Nội dung"))
    link = models.CharField(max_length=500, null=True, blank=True, verbose_name=_("Đường dẫn khi bấm vào"))
    source_type = models.CharField(max_length=50, null=True, blank=True, verbose_name=_("Nguồn phát sinh"))
    source_id = models.BigIntegerField(null=True, blank=True, verbose_name=_("Mã bản ghi nguồn"))
    read_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Thời điểm đọc"))

    class Meta:
        db_table = "Notifications"
        verbose_name = _("Thông báo")
        verbose_name_plural = _("Thông báo")
        ordering = ['-created_at', '-id']
        indexes = [
            models.Index(fields=['recipient', 'read_at']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"[{self.level}] {self.title} -> {self.recipient_id}"


@pghistory.track(
    pghistory.InsertEvent(),
    pghistory.UpdateEvent(),
)
class SystemSettings(AuditModel):
    """
    0.11 Cấu hình hệ thống (bảng SystemSettings, 1 dòng duy nhất): nhận diện ứng dụng + định dạng mặc định.
    Đọc qua `SystemSettings.load()`; frontend dùng `APP_CONFIG` làm giá trị dự phòng khi API chưa trả.
    """
    DATE_FORMAT_CHOICES = [('DD/MM/YYYY', 'DD/MM/YYYY'), ('YYYY-MM-DD', 'YYYY-MM-DD'), ('MM/DD/YYYY', 'MM/DD/YYYY')]
    NUMBER_FORMAT_CHOICES = [('INTL', _('Quốc tế (1,250.50)')), ('VN', _('Việt Nam (1.250,50)'))]

    app_name = models.CharField(max_length=100, verbose_name=_("Tên ứng dụng"))
    app_badge = models.CharField(max_length=30, null=True, blank=True, verbose_name=_("Nhãn phụ"))
    tagline = models.CharField(max_length=150, null=True, blank=True, verbose_name=_("Dòng mô tả ngắn"))
    company_name = models.CharField(max_length=255, null=True, blank=True, verbose_name=_("Đơn vị sở hữu"))
    logo_url = models.CharField(max_length=500, null=True, blank=True, verbose_name=_("Logo"))
    timezone = models.CharField(max_length=50, default='Asia/Ho_Chi_Minh', verbose_name=_("Múi giờ"))
    date_format = models.CharField(max_length=20, choices=DATE_FORMAT_CHOICES, default='DD/MM/YYYY', verbose_name=_("Định dạng ngày"))
    number_format = models.CharField(max_length=10, choices=NUMBER_FORMAT_CHOICES, default='INTL', verbose_name=_("Định dạng số mặc định"))

    DEFAULTS = {
        'app_name': 'Admin Template',
        'app_badge': 'v1.0',
        'tagline': 'Django · Next.js',
        'company_name': 'ERICSS',
    }

    class Meta:
        db_table = "SystemSettings"
        verbose_name = _("Cấu hình hệ thống")
        verbose_name_plural = _("Cấu hình hệ thống")
        ordering = ['-updated_at', 'id']

    def __str__(self):
        return self.app_name

    @classmethod
    def load(cls) -> "SystemSettings":
        """Dòng cấu hình duy nhất (tạo với giá trị mặc định nếu chưa có)."""
        obj = cls.objects.order_by('id').first()
        if obj is None:
            obj = cls.objects.create(**cls.DEFAULTS)
        return obj

