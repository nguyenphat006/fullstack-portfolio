"""Cấu hình phân hệ (ModuleRegistry) và cây điều hướng Sidebar."""
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from django.db import transaction
from django.utils import translation
from ..models import Permission, ModuleRegistry
from ..serializers import (
    PermissionSerializer,
    ModuleRegistrySerializer,
    ModuleCreateSerializer,
    ModuleAddActionSerializer,
    ModuleReorderSerializer,
    ACTION_NAME_MAP,
)
from apps.core.permissions import (
    ModulePermissionChecker,
    get_user_permissions,
    invalidate_user_permissions,
    CACHE_TIMEOUT,
)
from django.core.cache import cache
from apps.core.viewsets import BaseERPViewSet
from apps.core.responses import success_response, cached_etag_response
from django.utils.translation import gettext as _


@extend_schema_view(
    list=extend_schema(tags=['Cấu hình Phân hệ & Điều hướng (Module Registry)']),
    retrieve=extend_schema(tags=['Cấu hình Phân hệ & Điều hướng (Module Registry)']),
    create=extend_schema(tags=['Cấu hình Phân hệ & Điều hướng (Module Registry)']),
    update=extend_schema(tags=['Cấu hình Phân hệ & Điều hướng (Module Registry)']),
    partial_update=extend_schema(tags=['Cấu hình Phân hệ & Điều hướng (Module Registry)']),
    destroy=extend_schema(tags=['Cấu hình Phân hệ & Điều hướng (Module Registry)']),
)
class ModuleRegistryViewSet(BaseERPViewSet):
    """
    ViewSet Quản lý Danh mục Phân hệ và Điều hướng Navigation.
    Hỗ trợ tạo module + tick chọn actions tự động sinh permissions.
    """
    queryset = ModuleRegistry.objects.all().order_by('sort_order', 'id')
    serializer_class = ModuleRegistrySerializer
    permission_classes = [permissions.IsAuthenticated, ModulePermissionChecker]
    permission_module = 'SETTINGS'
    custom_action_permissions = {
        'add_action': 'SETTINGS_CREATE',
        'remove_action': 'SETTINGS_DELETE',
        'reorder': 'SETTINGS_UPDATE',
        'navigation': 'SETTINGS_VIEW',
    }
    filterset_fields = ['is_navigation', 'is_active', 'parent_code']
    search_fields = ['module_code', 'module_name', 'description', 'route_path']
    ordering_fields = ['sort_order', 'module_code', 'created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return ModuleCreateSerializer
        return ModuleRegistrySerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.action in ['list', 'retrieve']:
            from collections import defaultdict
            from ..serializers import PermissionSerializer
            all_perms = Permission.objects.all().order_by('permission_code')
            grouped = defaultdict(list)
            for p in all_perms:
                grouped[p.module].append(PermissionSerializer(p).data)
            context['all_permissions_by_module'] = grouped
        return context

    def after_write(self, instance=None):
        invalidate_user_permissions()

    def perform_destroy(self, instance):
        # Khi xóa module -> xóa luôn permissions thuộc module đó
        Permission.objects.filter(module=instance.module_code).delete()
        super().perform_destroy(instance)

    @extend_schema(
        tags=['Cấu hình Phân hệ & Điều hướng (Module Registry)'],
        request=ModuleAddActionSerializer,
        summary="Thêm một Action (Permission) mới vào Module có sẵn"
    )
    @action(detail=True, methods=['post'], url_path='add-action')
    def add_action(self, request, pk=None):
        """API Thêm Action (Permission) vào module."""
        module = self.get_object()
        serializer = ModuleAddActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action_code = serializer.validated_data['action_code'].strip().upper()
        custom_name = serializer.validated_data.get('action_name')
        description = serializer.validated_data.get('description')

        perm_code = f"{module.module_code}_{action_code}"
        action_display = custom_name or ACTION_NAME_MAP.get(action_code, action_code)
        perm_name = f"{action_display} ({module.module_name})"

        perm, created = Permission.objects.update_or_create(
            permission_code=perm_code,
            defaults={
                'permission_name': perm_name,
                'module': module.module_code,
                'description': description or f"Quyền {action_display} thuộc phân hệ {module.module_name}"
            }
        )
        invalidate_user_permissions()

        return success_response(
            data=PermissionSerializer(perm).data,
            message=_("Đã thêm quyền '%(perm)s' vào phân hệ '%(module)s' thành công") % {"perm": perm_name, "module": module.localized_name()}
        )

    @extend_schema(
        tags=['Cấu hình Phân hệ & Điều hướng (Module Registry)'],
        summary="Xóa một Action (Permission) khỏi Module",
        parameters=[OpenApiParameter('permission_id', int, OpenApiParameter.PATH)],
    )
    @action(detail=True, methods=['delete'], url_path='remove-action/(?P<permission_id>[^/.]+)')
    def remove_action(self, request, pk=None, permission_id=None):
        """API Xóa Action khỏi module."""
        module = self.get_object()
        perm = Permission.objects.filter(id=permission_id, module=module.module_code).first()
        if perm is None:
            raise NotFound(_("Không tìm thấy quyền hạn tương ứng trong phân hệ này."))
        perm_code = perm.permission_code
        perm.delete()
        invalidate_user_permissions()
        return success_response(message=_("Đã xóa quyền '%(perm)s' khỏi phân hệ thành công") % {"perm": perm_code})

    @extend_schema(
        tags=['Cấu hình Phân hệ & Điều hướng (Module Registry)'],
        request=ModuleReorderSerializer,
        summary="Sắp xếp lại thứ tự hàng loạt Module theo danh sách IDs"
    )
    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request):
        """API Sắp xếp lại thứ tự (sort_order) cho các module theo danh sách IDs."""
        serializer = ModuleReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ordered_ids = serializer.validated_data['ordered_ids']
        with transaction.atomic():
            modules_map = {m.id: m for m in ModuleRegistry.objects.filter(id__in=ordered_ids)}
            updated_modules = []
            for index, mod_id in enumerate(ordered_ids):
                mod = modules_map.get(mod_id)
                if mod:
                    mod.sort_order = (index + 1) * 10
                    updated_modules.append(mod)
            if updated_modules:
                ModuleRegistry.objects.bulk_update(updated_modules, ['sort_order'])

        invalidate_user_permissions()
        return success_response(
            message=_("Đã cập nhật thứ tự cho %(count)s phân hệ thành công") % {"count": len(updated_modules)}
        )

    @extend_schema(
        tags=['Cấu hình Phân hệ & Điều hướng (Module Registry)'],
        summary="Lấy cây Navigation Menu cho Sidebar theo phân quyền của User hiện tại"
    )
    @action(detail=False, methods=['get'], url_path='navigation', permission_classes=[permissions.IsAuthenticated])
    def navigation(self, request):
        """
        API Trả về cây Menu cho Sidebar đã được lọc theo quyền `*_VIEW` của User hiện tại.
        Hỗ trợ phân cấp Parent-Child tự động và caching siêu tốc (~0.1ms).
        """
        user = request.user
        lang = (translation.get_language() or 'vi')[:2]
        cache_key = f"user_nav_tree_{user.id if user and user.is_authenticated else 'anon'}_{lang}"
        cached_nav = cache.get(cache_key)
        if cached_nav is not None:
            return cached_etag_response(request, cached_nav, message=_("Lấy cây Navigation thành công"))

        user_perms = get_user_permissions(user)
        is_super = user.is_superuser or "*" in user_perms

        # Lấy tất cả module kích hoạt và có hiển thị navigation
        modules = list(
            ModuleRegistry.objects.filter(is_active=True, is_navigation=True).order_by('sort_order', 'id')
        )

        def is_module_allowed(mod: ModuleRegistry) -> bool:
            if is_super:
                return True
            # Dashboard luôn được vào
            if mod.module_code in ['DASHBOARD', 'HOME']:
                return True
            # Module có RoutePath -> kiểm tra quyền <MODULE>_VIEW hoặc <MODULE>_READ
            if mod.route_path:
                if f"{mod.module_code}_VIEW" in user_perms or f"{mod.module_code}_READ" in user_perms:
                    return True
                return False
            return False

        # Phân loại top-level và children. Nhóm cha không còn / đã tắt (vd. bỏ module mẫu MASTER_DATA)
        # -> phân hệ con lên cấp 1 thay vì biến mất khỏi menu
        codes = {m.module_code for m in modules}
        top_items = [m for m in modules if not m.parent_code or m.parent_code not in codes]
        child_map = {}
        for m in modules:
            if m.parent_code and m.parent_code in codes:
                child_map.setdefault(m.parent_code, []).append(m)

        nav_tree = []
        for top in top_items:
            children = child_map.get(top.module_code, [])
            # Lọc children được phép
            allowed_children = [c for c in children if is_module_allowed(c)]

            # Nếu là parent group (không có route_path)
            if not top.route_path:
                if allowed_children or is_super:
                    nav_tree.append({
                        "key": f"group-{top.module_code.lower()}",
                        "code": top.module_code,
                        "label": top.localized_name(lang),
                        "icon": top.icon,
                        "parent_code": None,
                        "sort_order": top.sort_order,
                        "is_navigation": True,
                        "description": top.localized_description(lang),
                        "children": [
                            {
                                "key": c.route_path,
                                "code": c.module_code,
                                "label": c.localized_name(lang),
                                "icon": c.icon,
                                "parent_code": top.module_code,
                                "sort_order": c.sort_order,
                                "is_navigation": True,
                                "description": c.localized_description(lang),
                            }
                            for c in allowed_children
                        ]
                    })
            else:
                # Top-level item độc lập có route
                if is_module_allowed(top):
                    nav_tree.append({
                        "key": top.route_path,
                        "code": top.module_code,
                        "label": top.localized_name(lang),
                        "icon": top.icon,
                        "parent_code": None,
                        "sort_order": top.sort_order,
                        "is_navigation": True,
                        "description": top.localized_description(lang),
                        "children": [
                            {
                                "key": c.route_path,
                                "code": c.module_code,
                                "label": c.localized_name(lang),
                                "icon": c.icon,
                                "parent_code": top.module_code,
                                "sort_order": c.sort_order,
                                "is_navigation": True,
                                "description": c.localized_description(lang),
                            }
                            for c in allowed_children
                        ] if allowed_children else []
                    })

        cache.set(cache_key, nav_tree, CACHE_TIMEOUT)
        return cached_etag_response(request, nav_tree, message=_("Lấy cây Navigation thành công"))
