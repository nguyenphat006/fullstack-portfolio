import pghistory
from django.db import models

from apps.core.models import AuditModel


@pghistory.track(
    pghistory.InsertEvent(),
    pghistory.UpdateEvent(),
    pghistory.DeleteEvent(),
)
class Blog(AuditModel):
    """Bài viết hiển thị ở /blog (bảng Blogs theo DBML)."""
    slug = models.SlugField(max_length=150, unique=True, verbose_name="Slug")
    title = models.CharField(max_length=255, verbose_name="Tiêu đề")
    title_en = models.CharField(max_length=255, blank=True, default="", verbose_name="Tiêu đề (EN)")
    excerpt = models.TextField(verbose_name="Đoạn trích")
    excerpt_en = models.TextField(blank=True, default="", verbose_name="Đoạn trích (EN)")
    published_date = models.CharField(max_length=30, verbose_name="Ngày đăng")
    published_date_en = models.CharField(max_length=30, blank=True, default="", verbose_name="Ngày đăng (EN)")
    category = models.CharField(max_length=100, verbose_name="Chuyên mục")
    category_en = models.CharField(max_length=100, blank=True, default="", verbose_name="Chuyên mục (EN)")
    read_time = models.CharField(max_length=30, verbose_name="Thời gian đọc")
    read_time_en = models.CharField(max_length=30, blank=True, default="", verbose_name="Thời gian đọc (EN)")
    image = models.CharField(max_length=500, verbose_name="Ảnh đại diện")
    content = models.TextField(verbose_name="Nội dung (Markdown)")
    content_en = models.TextField(blank=True, default="", verbose_name="Nội dung (EN)")

    class Meta:
        db_table = "Blogs"
        verbose_name = "bài viết"
        verbose_name_plural = "Bài viết"
        ordering = ['-updated_at', 'id']
        indexes = [
            models.Index(fields=['-updated_at', 'id']),
            models.Index(fields=['category']),
        ]

    def save(self, *args, **kwargs):
        if self.slug:
            self.slug = self.slug.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.slug})"
