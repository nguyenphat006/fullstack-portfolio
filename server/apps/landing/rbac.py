"""Phân quyền phân hệ Cấu hình landing — seed_core tự gom file này."""
from apps.core.rbac_registry import crud_permissions, perm_codes

MODULES = [
    {
        'module_code': 'LANDING',
        'module_name': 'Cấu hình landing',
        'module_name_en': 'Landing settings',
        'icon': 'SettingOutlined',
        'route_path': '/content/landing',
        'parent_code': 'CONTENT',
        'sort_order': 5,
        'is_navigation': True,
        'is_active': True,
        'description': 'Nội dung trang chủ: giới thiệu, kinh nghiệm, học vấn, kỹ năng, nhận xét, liên hệ, SEO',
        'description_en': 'Home page content: hero, experience, education, skills, testimonials, contact, SEO',
    },
]

PERMISSIONS = crud_permissions('LANDING', 'cấu hình landing')

ROLE_PERMISSIONS = {
    'MANAGER': perm_codes('LANDING', 'VIEW', 'READ', 'UPDATE'),
    'STAFF': perm_codes('LANDING', 'VIEW', 'READ'),
}
