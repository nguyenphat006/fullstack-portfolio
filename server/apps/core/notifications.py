"""
Thông báo trong ứng dụng — module nghiệp vụ chỉ cần gọi `notify(...)`.

    from apps.core.notifications import notify
    notify(user, "Lệnh sản xuất LSX-001 đã được duyệt", level="SUCCESS", link="/work-orders/12",
           source=("WORK_ORDER", 12))

Lỗi khi gửi thông báo không bao giờ làm hỏng thao tác chính (chỉ ghi log).
"""
import logging

from django.utils import timezone

logger = logging.getLogger(__name__)

LEVELS = {'INFO', 'SUCCESS', 'WARNING', 'ERROR'}
RETENTION_DAYS = 30


def notify(recipient, title: str, message: str | None = None, level: str = 'INFO',
           link: str | None = None, source: tuple[str, int | None] | None = None, actor=None):
    """Tạo 1 thông báo cho `recipient` (User). Trả về Notification hoặc None nếu lỗi / không có người nhận."""
    if recipient is None or not getattr(recipient, 'pk', None):
        return None
    from .models import Notification
    try:
        return Notification.objects.create(
            recipient=recipient,
            title=title[:255],
            message=message,
            level=level if level in LEVELS else 'INFO',
            link=link,
            source_type=source[0] if source else None,
            source_id=source[1] if source else None,
            created_by=actor,
        )
    except Exception:  # noqa: BLE001 — thông báo là phụ, không được làm hỏng nghiệp vụ
        logger.exception("Không tạo được thông báo cho user %s", getattr(recipient, 'pk', None))
        return None


def cleanup_read_notifications(days: int = RETENTION_DAYS) -> int:
    """Xóa hẳn thông báo đã đọc quá `days` ngày. Trả về số bản ghi đã xóa."""
    from .models import Notification
    cutoff = timezone.now() - timezone.timedelta(days=days)
    deleted, _ = Notification.all_objects.filter(read_at__isnull=False, read_at__lt=cutoff).delete()
    return deleted
