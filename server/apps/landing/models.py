import pghistory
from django.db import models

from apps.core.models import AuditModel

SECTION_KEYS = ['hero', 'stats', 'experiences', 'education', 'skills', 'testimonials', 'contact', 'ui', 'seo']


@pghistory.track(
    pghistory.InsertEvent(),
    pghistory.UpdateEvent(),
    pghistory.DeleteEvent(),
)
class LandingSection(AuditModel):
    """Một phần nội dung của landing (bảng LandingSections theo DBML). Nội dung JSON theo từng ngôn ngữ."""
    key = models.CharField(max_length=50, unique=True, verbose_name="Mã phần")
    content = models.JSONField(default=dict, blank=True, verbose_name="Nội dung (VI)")
    content_en = models.JSONField(default=dict, blank=True, verbose_name="Nội dung (EN)")
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")

    class Meta:
        db_table = "LandingSections"
        verbose_name = "phần landing"
        verbose_name_plural = "Cấu hình landing"
        ordering = ['sort_order', 'id']
        indexes = [models.Index(fields=['-updated_at', 'id'])]

    def __str__(self):
        return self.key
