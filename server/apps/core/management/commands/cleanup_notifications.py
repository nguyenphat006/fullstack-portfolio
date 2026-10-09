from django.core.management.base import BaseCommand

from apps.core.notifications import RETENTION_DAYS, cleanup_read_notifications


class Command(BaseCommand):
    help = "Xóa thông báo đã đọc quá N ngày (mặc định 30). Chạy định kỳ bằng cron / Celery beat."

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=RETENTION_DAYS)

    def handle(self, *args, **options):
        deleted = cleanup_read_notifications(options['days'])
        self.stdout.write(f"Da xoa {deleted} thong bao da doc qua {options['days']} ngay")
