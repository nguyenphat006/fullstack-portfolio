import pghistory
from django.db import models

from apps.core.models import AuditModel


@pghistory.track(
    pghistory.InsertEvent(),
    pghistory.UpdateEvent(),
    pghistory.DeleteEvent(),
)
class Project(AuditModel):
    """Dự án hiển thị ở /projects (bảng Projects theo DBML)."""
    slug = models.SlugField(max_length=150, unique=True, verbose_name="Slug")
    title = models.CharField(max_length=255, verbose_name="Tên dự án")
    summary = models.TextField(verbose_name="Mô tả ngắn")
    stack = models.JSONField(default=list, blank=True, verbose_name="Công nghệ")
    year = models.CharField(max_length=10, verbose_name="Năm")
    image = models.CharField(max_length=500, verbose_name="Ảnh đại diện")
    color = models.CharField(max_length=30, verbose_name="Màu nhấn")
    role = models.CharField(max_length=150, verbose_name="Vai trò")
    content = models.TextField(verbose_name="Nội dung chi tiết (Markdown)")
    live_url = models.URLField(max_length=500, null=True, blank=True, verbose_name="Link demo")
    github_url = models.URLField(max_length=500, null=True, blank=True, verbose_name="Link GitHub")
    featured = models.BooleanField(default=False, verbose_name="Nổi bật")

    class Meta:
        db_table = "Projects"
        verbose_name = "dự án"
        verbose_name_plural = "Dự án"
        ordering = ['-updated_at', 'id']
        indexes = [
            models.Index(fields=['-updated_at', 'id']),
            models.Index(fields=['featured']),
        ]

    def save(self, *args, **kwargs):
        if self.slug:
            self.slug = self.slug.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.slug})"
