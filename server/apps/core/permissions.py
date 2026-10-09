import logging

from django.conf import settings
from django.core.cache import cache
from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.authentication.models import RolePermission

CACHE_TIMEOUT = 1800  # 30 phút
logger = logging.getLogger(__name__)

def get_user_permissions(user) -> set:
    """
    Lấy danh sách mã quyền của User từ Cache (~0.1ms).
    Nếu Cache Miss -> Query DB RolePermission và lưu vào Cache.
    ADMIN / Superuser luôn có quyền tối cao {"*"}.
    """
    if not user or not user.is_authenticated:
        return set()
    if user.is_superuser:
        return {"*"}

    cache_key = f"user_perms_{user.id}"
    perms = cache.get(cache_key)
    if perms is None:
        if user.roles.filter(role_code='ADMIN', is_active=True).exists():
            perms = {"*"}  # ADMIN có toàn bộ quyền
        else:
            perms = set(
                RolePermission.objects.filter(
                    role__users=user,
                    role__is_active=True
                ).values_list('permission__permission_code', flat=True)
            )
        cache.set(cache_key, perms, CACHE_TIMEOUT)
    return perms


def invalidate_user_permissions(user_id=None):
    """
    Xóa cache quyền, profile và cây Navigation của User khi Admin thay đổi Role / Permission / Module.
    Nếu không truyền user_id -> Xóa toàn bộ cache phân quyền và navigation.
    """
    if user_id:
        cache.delete(f"user_perms_{user_id}")
        for lang, _name in settings.LANGUAGES:  # cây menu cache theo ngôn ngữ
            cache.delete(f"user_nav_tree_{user_id}_{lang}")
        cache.delete(f"user_profile_data_{user_id}")
    else:
        cache.clear()


class HasPermission(BasePermission):
    """
    Generic permission checker đọc quyền từ Caching Layer.
    """
    def __init__(self, required_permission: str):
        self.required_permission = required_permission
        
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
            
        user_perms = get_user_permissions(request.user)
        if "*" in user_perms:
            return True
        return self.required_permission in user_perms

    def __call__(self, *args, **kwargs):
        return self


# Action chuẩn của BaseERPViewSet -> hậu tố quyền RBAC. ViewSet chỉ cần khai báo
# `custom_action_permissions` cho action riêng hoặc khi muốn ghi đè bảng này.
DEFAULT_ACTION_PERMISSIONS = {
    'list': 'READ',
    'retrieve': 'READ',
    'statistics': 'READ',
    'export_columns': 'READ',
    'create': 'CREATE',
    'update': 'UPDATE',
    'partial_update': 'UPDATE',
    'batch_status': 'UPDATE',
    'destroy': 'DELETE',
    'batch_delete': 'DELETE',
    'export_excel': 'EXPORT',
    'excel_template': 'IMPORT',
    'import_excel': 'IMPORT',
}


class ModulePermissionChecker(BasePermission):
    """
    Suy diễn mã quyền RBAC từ action của ViewSet:
    - `custom_action_permissions[action]` nếu có: mã quyền đầy đủ ('SETTINGS_READ') hoặc danh sách
      mã thay thế (['SETTINGS_READ', 'USER_CREATE'] — có 1 trong các quyền là đủ)
    - ngược lại `{permission_module}_{DEFAULT_ACTION_PERMISSIONS[action]}`
    - action lạ: `{permission_module}_{ACTION}`
    Fail-closed: thiếu `permission_module` -> từ chối.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True

        user_perms = get_user_permissions(request.user)
        if "*" in user_perms:
            return True

        module = getattr(view, 'permission_module', None)
        if not module:
            # Fail-closed: ViewSet dùng ModulePermissionChecker bắt buộc khai báo permission_module.
            logger.error("%s thiếu permission_module -> từ chối truy cập", view.__class__.__name__)
            return False

        required = self.get_required_permission(view, module)
        if isinstance(required, (list, tuple, set)):
            return any(code in user_perms for code in required)  # chỉ cần 1 trong các quyền
        return required in user_perms

    @staticmethod
    def get_required_permission(view, module: str):
        action = getattr(view, 'action', None) or ''
        custom_perms = getattr(view, 'custom_action_permissions', None) or {}
        if action in custom_perms:
            return custom_perms[action]
        suffix = DEFAULT_ACTION_PERMISSIONS.get(action, action.upper())
        return f"{module}_{suffix}"


class IsAdminRole(BasePermission):
    """Quyền dành riêng cho Quản trị viên hệ thống (Admin)."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.roles.filter(role_code='ADMIN', is_active=True).exists()


class IsReadOnlyOrAdmin(BasePermission):
    """Cho phép mọi user xem (GET/HEAD/OPTIONS), chỉ Admin mới được ghi/xóa."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        if request.user.is_superuser:
            return True
        return request.user.roles.filter(role_code='ADMIN', is_active=True).exists()

