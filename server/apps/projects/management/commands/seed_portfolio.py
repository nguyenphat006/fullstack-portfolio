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
DATA_FILE_EN = Path(__file__).resolve().parents[2] / 'seed_data' / 'portfolio_en.json'


class Command(BaseCommand):
    help = "Nạp dự án / bài viết mẫu của landing vào CSDL (không ghi đè bản ghi đã có)"

    def handle(self, *args, **options):
        data = json.loads(DATA_FILE.read_text(encoding='utf-8'))
        data_en = json.loads(DATA_FILE_EN.read_text(encoding='utf-8'))
        en_projects = {item['id']: item for item in data_en['projects']}
        en_blogs = {item['slug']: item for item in data_en['blogs']}

        created = 0
        for item in data['projects']:
            obj, is_new = Project.objects.get_or_create(
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
            self._fill_english(obj, en_projects.get(item['id']), {'title': 'title', 'summary': 'summary', 'year': 'year', 'role': 'role', 'content': 'content'})
        self.stdout.write(f"  -> Du an: them moi {created}/{len(data['projects'])}")

        created = 0
        for item in data['blogs']:
            obj, is_new = Blog.objects.get_or_create(
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
            self._fill_english(obj, en_blogs.get(item['slug']), {'title': 'title', 'excerpt': 'excerpt', 'published_date': 'date', 'category': 'category', 'read_time': 'readTime', 'content': 'content'})
        self.stdout.write(f"  -> Bai viet: them moi {created}/{len(data['blogs'])}")
        self.stdout.write(self.style.SUCCESS("[SUCCESS] seed_portfolio hoan tat."))

    @staticmethod
    def _fill_english(obj, english, mapping):
        """Điền các cột *_en còn trống từ dữ liệu tiếng Anh của landing (không ghi đè bản đã chỉnh trên admin)."""
        if not english:
            return
        changed = []
        for field, key in mapping.items():
            if not getattr(obj, f'{field}_en') and english.get(key):
                setattr(obj, f'{field}_en', english[key])
                changed.append(f'{field}_en')
        if changed:
            obj.save(update_fields=changed)
