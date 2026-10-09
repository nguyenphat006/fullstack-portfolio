"""Nguồn tìm kiếm toàn cục của phân hệ Contact — apps/core/search_registry.py tự gom file này."""
from apps.core.search_registry import SearchProvider

from .models import Contact

SEARCH_PROVIDERS = [
    SearchProvider(
        module_code='CONTACT',
        model=Contact,
        code_field='email',
        title_field='name',
        url='/content/contacts?q={code}',
    ),
]
