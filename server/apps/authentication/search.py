"""Nguồn tìm kiếm toàn cục của authentication — `apps/core/search_registry.py` tự gom file này."""
from apps.core.search_registry import SearchProvider

from .models import CustomUser

SEARCH_PROVIDERS = [
    SearchProvider(
        module_code='USER',
        model=CustomUser,
        code_field='username',
        title_field='full_name',
        extra_fields=('email',),
        subtitle='email',
        queryset=lambda: CustomUser.objects.filter(deleted_at__isnull=True),
        url='/users/{id}',
    ),
]
