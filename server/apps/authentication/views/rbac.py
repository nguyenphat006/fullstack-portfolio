"""Phân quyền RBAC: danh mục quyền hạn và vai trò."""
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.db import transaction
from ..models import (
    Role,
    Permission,
    RolePermission,
    ModuleRegistry,
)
from ..serializers import (
    RoleSerializer,
    RolePermissionAssignSerializer,
    RoleMatrixBatchSerializer,
    PermissionSerializer,
)
from apps.core.permissions import ModulePermissionChecker, invalidate_user_permissions
from apps.core.viewsets import BaseERPViewSet
from apps.core.exceptions import BusinessError
from apps.core.responses import success_response
from django.utils.translation import gettext as _


ACTION_ORDER = {
    'VIEW': 1,
    'READ': 2,
    'CREATE': 3,
    'UPDATE': 4,
    'DELETE': 5,
    'APPROVE': 6,
    'RELEASE': 7,
    'EXECUTE': 8,
    'EXPORT': 9,
    'IMPORT': 10,
    'CONFIG': 11,
}

def get_action_order(perm_code: str) -> int:
    parts = perm_code.split('_')
    act = parts[-1].upper() if parts else ''
    return ACTION_ORDER.get(act, 99)

@extend_schema_view(
    list=extend_schema(tags=['Danh mục Quyền hạn (Permissions)']),
    retrieve=extend_schema(tags=['Danh mục Quyền hạn (Permissions)']),
)
class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet Danh mục Quyền hạn (Read-only).
    """
    queryset = Permission.objects.all().order_by('module', 'permission_code')
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated, ModulePermissionChecker]
    permission_module = 'SETTINGS'
    custom_action_permissions = {
        'grouped': 'SETTINGS_READ',
    }
    filterset_fields = ['module']
    search_fields = ['permission_code', 'permission_name', 'description']
    ordering_fields = ['module', 'permission_code', 'created_at']

    @extend_schema(tags=['Danh mục Quyền hạn (Permissions)'], summary="Lấy danh mục quyền hạn nhóm theo phân hệ (Module) kèm Metadata")
    @action(detail=False, methods=['get'], url_path='grouped')
    def grouped(self, request):
        """API trả về danh sách quyền đã nhóm theo từng phân hệ (sắp xếp chuẩn VIEW-READ-CREATE-UPDATE-DELETE-APPROVE-EXPORT-IMPORT), kèm icon và module_name từ ModuleRegistry."""
        permissions_qs = self.filter_queryset(self.get_queryset())
        serialized_perms = PermissionSerializer(permissions_qs, many=True).data
        
        # Tạo map metadata từ ModuleRegistry
        modules_map = {
            m.module_code: m 
            for m in ModuleRegistry.objects.filter(is_active=True).order_by('sort_order', 'id')
        }
        
        grouped_data = {}
        for perm in serialized_perms:
            mod = perm['module']
            if mod not in grouped_data:
                grouped_data[mod] = []
            grouped_data[mod].append(perm)
        
        # Sắp xếp permissions trong từng nhóm theo thứ tự hành động chuẩn
        for mod_code, perms in grouped_data.items():
            perms.sort(key=lambda p: (get_action_order(p['permission_code']), p['permission_code']))
        
        result = []
        # Ưu tiên các module đã đăng ký trong ModuleRegistry theo thứ tự sort_order
        for mod_code, mod_obj in modules_map.items():
            if mod_code in grouped_data:
                result.append({
                    "module": mod_code,
                    "module_name": mod_obj.module_name,
                    "icon": mod_obj.icon,
                    "description": mod_obj.description,
                    "permissions": grouped_data.pop(mod_code)
                })
        
        # Bổ sung các module còn lại chưa có trong ModuleRegistry (nếu có)
        for mod_code, perms in grouped_data.items():
            result.append({
                "module": mod_code,
                "module_name": mod_code,
                "icon": None,
                "description": None,
                "permissions": perms
            })

        return success_response(data=result, message=_("Lấy danh mục phân quyền theo nhóm thành công"))

@extend_schema_view(
    list=extend_schema(tags=['Quản lý Vai trò (Roles)']),
    retrieve=extend_schema(tags=['Quản lý Vai trò (Roles)']),
    create=extend_schema(tags=['Quản lý Vai trò (Roles)']),
    update=extend_schema(tags=['Quản lý Vai trò (Roles)']),
    partial_update=extend_schema(tags=['Quản lý Vai trò (Roles)']),
    destroy=extend_schema(tags=['Quản lý Vai trò (Roles)']),
)
class RoleViewSet(BaseERPViewSet):
    """
    ViewSet Quản lý Danh mục Vai trò RBAC (Kế thừa BaseERPViewSet).
    """
    queryset = Role.objects.prefetch_related(
        'role_permission_assignments__permission',
        'user_role_assignments'
    ).order_by('-updated_at', 'id')
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated, ModulePermissionChecker]
    permission_module = 'SETTINGS'
    custom_action_permissions = {
        # Form tạo / sửa người dùng cần danh sách vai trò để chọn
        'list': ['SETTINGS_READ', 'USER_CREATE', 'USER_UPDATE'],
        'set_permissions': 'SETTINGS_UPDATE',
        'batch_set_permissions': 'SETTINGS_UPDATE',
    }
    filterset_fields = ['is_active']
    search_fields = ['role_code', 'role_name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'role_code', 'role_name']

    def check_can_destroy(self, instance):
        if instance.role_code == 'ADMIN':
            raise BusinessError(_("Không thể xóa vai trò Quản trị viên tối cao (ADMIN) của hệ thống."))
        user_count = instance.users.count()
        if user_count > 0:
            raise BusinessError(
                _("Không thể xóa vai trò '%(role)s' vì đang có %(count)s tài khoản người dùng đảm nhiệm.")
                % {"role": instance.role_name, "count": user_count}
            )

    def after_write(self, instance=None):
        invalidate_user_permissions()

    @extend_schema(
        tags=['Quản lý Vai trò (Roles)'],
        request=RolePermissionAssignSerializer,
        summary="Cập nhật danh sách quyền hạn cho Vai trò"
    )
    @action(detail=True, methods=['post'], url_path='set-permissions')
    def set_permissions(self, request, pk=None):
        role = self.get_object()
        serializer = RolePermissionAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        permission_ids = serializer.validated_data['permission_ids']
        with transaction.atomic():
            RolePermission.objects.filter(role=role).delete()
            perms = Permission.objects.filter(id__in=permission_ids)
            assignments = [RolePermission(role=role, permission=p) for p in perms]
            RolePermission.objects.bulk_create(assignments)

        # Xóa toàn bộ cache phân quyền để user nhận quyền mới ngay lập tức
        invalidate_user_permissions()

        return success_response(
            data=RoleSerializer(role).data,
            message=_("Đã cập nhật %(count)s quyền hạn cho vai trò '%(role)s' thành công") % {"count": len(assignments), "role": role.role_name}
        )

    @extend_schema(
        tags=['Quản lý Vai trò (Roles)'],
        request=RoleMatrixBatchSerializer,
        summary="Cập nhật ma trận phân quyền hàng loạt cho nhiều Vai trò cùng lúc"
    )
    @action(detail=False, methods=['post'], url_path='batch-set-permissions')
    def batch_set_permissions(self, request):
        serializer = RoleMatrixBatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        matrix = serializer.validated_data['matrix']
        with transaction.atomic():
            for role_id_str, permission_ids in matrix.items():
                try:
                    role_id = int(role_id_str)
                    role = Role.objects.get(id=role_id)
                    RolePermission.objects.filter(role=role).delete()
                    perms = Permission.objects.filter(id__in=permission_ids)
                    assignments = [RolePermission(role=role, permission=p) for p in perms]
                    RolePermission.objects.bulk_create(assignments)
                except (ValueError, Role.DoesNotExist):
                    continue

        # Xóa toàn bộ cache phân quyền và navigation
        invalidate_user_permissions()

        return success_response(
            message=_("Đã lưu cấu hình ma trận phân quyền cho toàn bộ vai trò thành công")
        )
