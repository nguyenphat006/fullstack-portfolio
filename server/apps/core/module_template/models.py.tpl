import pghistory
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import AuditModel


@pghistory.track(
    pghistory.InsertEvent(),
    pghistory.UpdateEvent(),
    pghistory.DeleteEvent(),
)
class __Model__(AuditModel):
    """
    __Label__ (bảng __Models__ theo DBML).
    Trường nghiệp vụ: bổ sung theo bảng đã chốt trong DBML (DBML trước, code sau).
    """
    code = models.CharField(max_length=50, unique=True, verbose_name=_("Mã __label__"))
    name = models.CharField(max_length=255, verbose_name=_("Tên __label__"))

    class Meta:
        db_table = "__Models__"
        verbose_name = _("__label__")
        verbose_name_plural = _("Danh mục __label__")
        ordering = ['-updated_at', 'id']
        indexes = [
            models.Index(fields=['-updated_at', 'id']),
            models.Index(fields=['code']),
        ]

    def save(self, *args, **kwargs):
        if self.code:
            self.code = self.code.strip().upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.code})"
