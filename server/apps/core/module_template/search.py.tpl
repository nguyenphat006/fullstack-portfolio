"""
Nguồn tìm kiếm toàn cục của phân hệ __label__ — apps/core/search_registry.py tự gom file này.
Có trang chi tiết thì đổi url thành '__ROUTE__/{id}'.
"""
from apps.core.search_registry import SearchProvider

from .models import __Model__

SEARCH_PROVIDERS = [
    SearchProvider(
        module_code='__MODULE_CODE__',
        model=__Model__,
        code_field='code',
        title_field='name',
        url='__ROUTE__?q={code}',
    ),
]
