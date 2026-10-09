"""
Phân quyền phân hệ dự án — seed_core tự gom file này (apps/core/rbac_registry.py).
Sửa quyền mặc định theo vai trò ở ROLE_PERMISSIONS; ADMIN luôn có toàn bộ quyền.
"""
from apps.core.rbac_registry import crud_permissions, perm_codes

MODULES = [
    {
        'module_code': 'CONTENT',
        'module_name': 'Quản Lý Nội Dung',
        'module_name_en': 'Content',
        'icon': 'AppstoreOutlined',
        'route_path': None,
        'parent_code': None,
        'sort_order': 20,
        'is_navigation': True,
        'is_active': True,
        'description': 'Nội dung hiển thị trên landing page: dự án, bài viết, liên hệ',
        'description_en': 'Landing page content: projects, blog posts, contacts',
    },
    {
        'module_code': 'PROJECT',
        'module_name': 'Dự án',
        'module_name_en': 'Projects',  # trống -> menu tiếng Anh dùng tên tiếng Việt
        'icon': 'AppstoreOutlined',
        'route_path': '/content/projects',
        'parent_code': 'CONTENT',
        'sort_order': 10,
        'is_navigation': True,
        'is_active': True,
        'description': 'Quản lý dự án portfolio',
        'description_en': None,
    },
]

PERMISSIONS = crud_permissions('PROJECT', 'dự án')

ROLE_PERMISSIONS = {
    'MANAGER': perm_codes('PROJECT', 'VIEW', 'READ', 'CREATE', 'UPDATE', 'EXPORT'),
    'STAFF': perm_codes('PROJECT', 'VIEW', 'READ'),
}
