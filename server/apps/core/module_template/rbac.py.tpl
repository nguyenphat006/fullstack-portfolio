"""
Phân quyền phân hệ __label__ — seed_core tự gom file này (apps/core/rbac_registry.py).
Sửa quyền mặc định theo vai trò ở ROLE_PERMISSIONS; ADMIN luôn có toàn bộ quyền.
"""
from apps.core.rbac_registry import crud_permissions, perm_codes

MODULES = [
    {
        'module_code': '__MODULE_CODE__',
        'module_name': '__Label__',
        'module_name_en': __LABEL_EN__,  # trống -> menu tiếng Anh dùng tên tiếng Việt
        'icon': '__ICON__',
        'route_path': '__ROUTE__',
        'parent_code': __PARENT__,
        'sort_order': __SORT_ORDER__,
        'is_navigation': True,
        'is_active': True,
        'description': 'Quản lý danh mục __label__',
        'description_en': None,
    },
]

PERMISSIONS = crud_permissions('__MODULE_CODE__', '__label__')

ROLE_PERMISSIONS = {
    'MANAGER': perm_codes('__MODULE_CODE__', 'VIEW', 'READ', 'CREATE', 'UPDATE', 'EXPORT'),
    'STAFF': perm_codes('__MODULE_CODE__', 'VIEW', 'READ'),
}
