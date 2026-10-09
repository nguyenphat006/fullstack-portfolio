"""
Phân quyền phân hệ liên hệ — seed_core tự gom file này (apps/core/rbac_registry.py).
Sửa quyền mặc định theo vai trò ở ROLE_PERMISSIONS; ADMIN luôn có toàn bộ quyền.
"""
from apps.core.rbac_registry import crud_permissions, perm_codes

MODULES = [
    {
        'module_code': 'CONTACT',
        'module_name': 'Liên hệ',
        'module_name_en': 'Contacts',  # trống -> menu tiếng Anh dùng tên tiếng Việt
        'icon': 'AppstoreOutlined',
        'route_path': '/content/contacts',
        'parent_code': 'CONTENT',
        'sort_order': 30,
        'is_navigation': True,
        'is_active': True,
        'description': 'Xem và xử lý liên hệ từ landing',
        'description_en': None,
    },
]

PERMISSIONS = crud_permissions('CONTACT', 'liên hệ')

ROLE_PERMISSIONS = {
    'MANAGER': perm_codes('CONTACT', 'VIEW', 'READ', 'CREATE', 'UPDATE', 'EXPORT'),
    'STAFF': perm_codes('CONTACT', 'VIEW', 'READ'),
}
