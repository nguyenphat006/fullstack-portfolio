"""
Gom khai báo phân hệ / quyền / quyền mặc định theo vai trò từ từng app.

Mỗi app nghiệp vụ tự khai báo trong `apps/<app>/rbac.py` (tùy chọn):
    MODULES = [{'module_code': ..., 'module_name': ..., 'route_path': ..., ...}]
    PERMISSIONS = [*crud_permissions('SUPPLIER', 'nhà cung cấp')]
    ROLE_PERMISSIONS = {'MANAGER': perm_codes('SUPPLIER', 'VIEW', 'READ'), ...}

`seed_core` gộp phần lõi của nó với khai báo của mọi app đang có trong INSTALLED_APPS
-> thêm / bỏ một phân hệ chỉ cần thêm / xóa thư mục app, không sửa seed_core.
Vai trò ADMIN luôn được gán toàn bộ quyền, không cần khai báo.
"""
import importlib

from django.apps import apps

STANDARD_ACTIONS = [
    ('VIEW', 'Truy cập màn hình'),
    ('READ', 'Xem dữ liệu'),
    ('CREATE', 'Tạo mới'),
    ('UPDATE', 'Cập nhật'),
    ('DELETE', 'Xóa'),
    ('EXPORT', 'Xuất dữ liệu'),
    ('IMPORT', 'Nhập dữ liệu'),
]


def crud_permissions(module_code: str, label: str, actions=STANDARD_ACTIONS) -> list:
    """7 quyền chuẩn của một phân hệ CRUD: <CODE>_VIEW / _READ / _CREATE / _UPDATE / _DELETE / _EXPORT / _IMPORT."""
    return [
        {
            'permission_code': f'{module_code}_{action}',
            'permission_name': f'{name} {label}',
            'module': module_code,
            'description': f'{name} phân hệ {label}.',
        }
        for action, name in actions
    ]


def perm_codes(module_code: str, *actions: str) -> list:
    """perm_codes('UNIT', 'VIEW', 'READ') -> ['UNIT_VIEW', 'UNIT_READ']"""
    return [f'{module_code}_{action}' for action in actions]


def collect_app_rbac():
    """Trả (modules, permissions, role_permissions) gộp từ `rbac.py` của các app `apps.*` đang cài."""
    modules, permissions, role_permissions = [], [], {}
    for config in apps.get_app_configs():
        if not config.name.startswith('apps.'):
            continue
        try:
            module = importlib.import_module(f'{config.name}.rbac')
        except ModuleNotFoundError as exc:
            if exc.name == f'{config.name}.rbac':
                continue
            raise
        modules.extend(getattr(module, 'MODULES', []))
        permissions.extend(getattr(module, 'PERMISSIONS', []))
        for role, codes in getattr(module, 'ROLE_PERMISSIONS', {}).items():
            role_permissions.setdefault(role, []).extend(codes)
    return modules, permissions, role_permissions
