"""
seed_landing — tạo các phần cấu hình landing (LandingSections) từ nội dung mặc định hiện có của landing.

    python manage.py seed_landing

Chạy lại an toàn: phần đã có giữ nguyên (không ghi đè chỉnh sửa trên trang quản trị).
Nguồn: apps/landing/seed_data/landing.json (xuất từ client/src/content).
"""
import json
from pathlib import Path

from django.core.management.base import BaseCommand

from apps.landing.models import SECTION_KEYS, LandingSection

DATA_FILE = Path(__file__).resolve().parents[2] / 'seed_data' / 'landing.json'


class Command(BaseCommand):
    help = "Tạo các phần cấu hình landing từ nội dung mặc định (không ghi đè phần đã có)"

    def handle(self, *args, **options):
        data = json.loads(DATA_FILE.read_text(encoding='utf-8'))
        created = 0
        for order, key in enumerate(SECTION_KEYS):
            _, is_new = LandingSection.objects.get_or_create(
                key=key,
                defaults={'content': data['vi'].get(key, {}), 'content_en': data['en'].get(key, {}), 'sort_order': order},
            )
            created += is_new
        self.stdout.write(self.style.SUCCESS(f"[SUCCESS] seed_landing: them moi {created}/{len(SECTION_KEYS)} phan."))
