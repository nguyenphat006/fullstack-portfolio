import pghistory
from django.db import models

from apps.core.models import AuditModel


@pghistory.track(
    pghistory.InsertEvent(),
    pghistory.UpdateEvent(),
    pghistory.DeleteEvent(),
)
class Contact(AuditModel):
    """Tin nhắn từ form liên hệ trên landing (bảng Contacts theo DBML). `description` dùng làm ghi chú nội bộ."""
    name = models.CharField(max_length=150, verbose_name="Họ tên")
    email = models.EmailField(max_length=255, verbose_name="Email")
    message = models.TextField(verbose_name="Nội dung")

    class Meta:
        db_table = "Contacts"
        verbose_name = "liên hệ"
        verbose_name_plural = "Liên hệ"
        ordering = ['-created_at', 'id']
        indexes = [
            models.Index(fields=['-created_at', 'id']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f"{self.name} <{self.email}>"
