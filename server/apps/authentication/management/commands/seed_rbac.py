"""Tương thích ngược: seed_rbac = seed_core + seed_demo. Dùng trực tiếp seed_core / seed_demo / bootstrap."""
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "[Deprecated] Goi seed_core va seed_demo"

    def handle(self, *args, **options):
        call_command('seed_core')
        call_command('seed_demo')
