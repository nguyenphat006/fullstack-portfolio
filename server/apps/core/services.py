from django.db import transaction
from typing import List, Type, Any
from django.db.models import Model
from rest_framework.exceptions import ValidationError

class BaseService:
    """
    Lớp Service cơ sở cho toàn bộ nghiệp vụ tính toán và xử lý giao dịch nặng.
    Đảm bảo:
    - Bọc transaction.atomic để không rác Database khi xảy ra lỗi
    - Hỗ trợ bulk_create và bulk_update tối ưu hiệu năng
    """

    @staticmethod
    def run_in_transaction(func, *args, **kwargs):
        """Thực thi một hàm trong transaction atomic."""
        with transaction.atomic():
            return func(*args, **kwargs)

    @staticmethod
    def bulk_create_items(model_class: Type[Model], items: List[Any], batch_size: int = 500) -> List[Any]:
        """Tạo hàng loạt bản ghi tối ưu N+1 query."""
        if not items:
            return []
        with transaction.atomic():
            return model_class.objects.bulk_create(items, batch_size=batch_size)

    @staticmethod
    def bulk_update_items(model_class: Type[Model], items: List[Any], fields: List[str], batch_size: int = 500):
        """Cập nhật hàng loạt bản ghi tối ưu N+1 query."""
        if not items or not fields:
            return
        with transaction.atomic():
            return model_class.objects.bulk_update(items, fields=fields, batch_size=batch_size)
