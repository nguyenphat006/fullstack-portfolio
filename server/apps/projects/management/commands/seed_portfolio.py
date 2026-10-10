"""
seed_portfolio — nạp dữ liệu dự án / bài viết hiện có của landing (client/src/config) vào CSDL.

    python manage.py seed_portfolio

Chạy lại an toàn: bản ghi đã có (theo slug) được giữ nguyên, không ghi đè chỉnh sửa trên trang quản trị.
Nguồn: apps/projects/seed_data/portfolio.json (xuất từ client/src/config/projects.ts và blogs.ts).
"""
import json
from pathlib import Path

from django.core.management.base import BaseCommand

from apps.blogs.models import Blog
from apps.projects.models import Project

DATA_FILE = Path(__file__).resolve().parents[2] / 'seed_data' / 'portfolio.json'


class Command(BaseCommand):
    help = "Nạp dự án / bài viết mẫu của landing vào CSDL (không ghi đè bản ghi đã có)"

    def handle(self, *args, **options):
        data = json.loads(DATA_FILE.read_text(encoding='utf-8'))

        created = 0
        for item in data['projects']:
            _, is_new = Project.objects.get_or_create(
                slug=item['id'],
                defaults={
                    'title': item['title'],
                    'summary': item['summary'],
                    'stack': item.get('stack', []),
                    'year': item['year'],
                    'image': item['image'],
                    'color': item['color'],
                    'role': item['role'],
                    'content': item['content'],
                    'live_url': item.get('liveUrl'),
                    'github_url': item.get('githubUrl'),
                    'featured': item.get('featured', False),
                },
            )
            created += is_new
        self.stdout.write(f"  -> Du an: them moi {created}/{len(data['projects'])}")

        created = 0
        for item in data['blogs']:
            _, is_new = Blog.objects.get_or_create(
                slug=item['slug'],
                defaults={
                    'title': item['title'],
                    'excerpt': item['excerpt'],
                    'published_date': item['date'],
                    'category': item['category'],
                    'read_time': item['readTime'],
                    'image': item['image'],
                    'content': item['content'],
                },
            )
            created += is_new
        self.stdout.write(f"  -> Bai viet: them moi {created}/{len(data['blogs'])}")
        self.stdout.write(self.style.SUCCESS("[SUCCESS] seed_portfolio hoan tat."))
