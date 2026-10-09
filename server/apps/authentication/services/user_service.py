from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from apps.core.services import BaseService

User = get_user_model()

class UserService(BaseService):
    """
    Domain Service Layer xử lý nghiệp vụ quản lý tài khoản người dùng & RBAC.
    """

    @classmethod
    def get_statistics(cls):
        """Tính toán nhanh số liệu thống kê người dùng cho KPI Cards."""
        now = timezone.now()
        first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        stats = User.objects.aggregate(
            total=Count('id', filter=Q(deleted_at__isnull=True)),
            active=Count('id', filter=Q(is_active=True, deleted_at__isnull=True)),
            management=Count('id', filter=Q(roles__role_code__in=['ADMIN', 'CHIEF_ENGINEER'], deleted_at__isnull=True), distinct=True),
            inactive=Count('id', filter=Q(is_active=False, deleted_at__isnull=True)),
            new_this_month=Count('id', filter=Q(created_at__gte=first_day_of_month, deleted_at__isnull=True)),
        )
        return stats
