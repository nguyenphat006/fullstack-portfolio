"""Nguồn tìm kiếm toàn cục của phân hệ Blog — apps/core/search_registry.py tự gom file này."""
from apps.core.search_registry import SearchProvider

from .models import Blog

SEARCH_PROVIDERS = [
    SearchProvider(
        module_code='BLOG',
        model=Blog,
        code_field='slug',
        title_field='title',
        url='/content/blogs?q={code}',
    ),
]
