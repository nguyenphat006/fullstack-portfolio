from django.db import models
from django.utils import timezone

class SoftDeleteQuerySet(models.QuerySet):
    """
    QuerySet tùy biến hỗ trợ cơ chế Xóa mềm (Soft Delete), tìm kiếm và lọc dữ liệu ERP.
    """

    def alive(self):
        """Chỉ lấy các bản ghi chưa bị xóa mềm."""
        return self.filter(deleted_at__isnull=True)

    def dead(self):
        """Chỉ lấy các bản ghi đã bị xóa mềm."""
        return self.filter(deleted_at__isnull=False)

    def active(self):
        """Chỉ lấy các bản ghi đang hoạt động và chưa bị xóa mềm."""
        return self.filter(is_active=True, deleted_at__isnull=True)

    def search(self, search_fields: list, query: str):
        """Tìm kiếm đa trường linh hoạt không phân biệt hoa thường."""
        if not query or not search_fields:
            return self
        
        q_object = models.Q()
        for field in search_fields:
            q_object |= models.Q(**{f"{field}__icontains": query.strip()})
        return self.filter(q_object)

    def soft_delete(self, user=None):
        """Xóa mềm hàng loạt bản ghi trong QuerySet."""
        update_kwargs = {
            'deleted_at': timezone.now(),
            'is_active': False
        }
        if user and hasattr(self.model, 'updated_by'):
            update_kwargs['updated_by'] = user
        return self.update(**update_kwargs)

    def restore(self, user=None):
        """Khôi phục hàng loạt bản ghi đã bị xóa mềm."""
        update_kwargs = {
            'deleted_at': None,
            'is_active': True
        }
        if user and hasattr(self.model, 'updated_by'):
            update_kwargs['updated_by'] = user
        return self.update(**update_kwargs)


class SoftDeleteManager(models.Manager):
    """
    Manager mặc định tự động ẩn các bản ghi đã xóa mềm khỏi các truy vấn thông thường.
    """

    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).alive()

    def all_with_deleted(self):
        """Lấy tất cả bản ghi bao gồm cả đã xóa mềm (cho Admin / Quản trị viên)."""
        return SoftDeleteQuerySet(self.model, using=self._db)

    def only_deleted(self):
        """Chỉ lấy các bản ghi đã bị xóa mềm trong thùng rác."""
        return SoftDeleteQuerySet(self.model, using=self._db).dead()

    def active(self):
        """Chỉ lấy các bản ghi đang hoạt động (active)."""
        return self.get_queryset().active()

    def search(self, search_fields: list, query: str):
        """Tìm kiếm dữ liệu trên các bản ghi chưa xóa."""
        return self.get_queryset().search(search_fields, query)
