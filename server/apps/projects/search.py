"""Nguồn tìm kiếm toàn cục của phân hệ Project — apps/core/search_registry.py tự gom file này."""
from apps.core.search_registry import SearchProvider

from .models import Project

SEARCH_PROVIDERS = [
    SearchProvider(
        module_code='PROJECT',
        model=Project,
        code_field='slug',
        title_field='title',
        url='/content/projects?q={code}',
    ),
]
