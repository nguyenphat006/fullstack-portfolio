"""
Phân quyền phân hệ bài viết — seed_core tự gom file này (apps/core/rbac_registry.py).
Sửa quyền mặc định theo vai trò ở ROLE_PERMISSIONS; ADMIN luôn có toàn bộ quyền.
"""
from apps.core.rbac_registry import crud_permissions, perm_codes

MODULES = [
    {
        'module_code': 'BLOG',
        'module_name': 'Bài viết',
        'module_name_en': 'Blogs',  # trống -> menu tiếng Anh dùng tên tiếng Việt
        'icon': 'AppstoreOutlined',
        'route_path': '/content/blogs',
        'parent_code': 'CONTENT',
        'sort_order': 20,
        'is_navigation': True,
        'is_active': True,
        'description': 'Quản lý bài viết blog',
        'description_en': None,
    },
]

PERMISSIONS = crud_permissions('BLOG', 'bài viết')

ROLE_PERMISSIONS = {
    'MANAGER': perm_codes('BLOG', 'VIEW', 'READ', 'CREATE', 'UPDATE', 'EXPORT'),
    'STAFF': perm_codes('BLOG', 'VIEW', 'READ'),
}
