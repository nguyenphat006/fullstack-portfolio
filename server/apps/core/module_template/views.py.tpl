from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions

from apps.core.permissions import ModulePermissionChecker
from apps.core.viewsets import BaseERPViewSet

from .models import __Model__
from .serializers import __Model__CreateUpdateSerializer, __Model__Serializer

TAG = "__Label__"


@extend_schema_view(
    list=extend_schema(tags=[TAG], summary="Danh sách __label__"),
    retrieve=extend_schema(tags=[TAG], summary="Chi tiết __label__"),
    create=extend_schema(tags=[TAG], summary="Tạo mới __label__"),
    update=extend_schema(tags=[TAG], summary="Cập nhật __label__"),
    partial_update=extend_schema(tags=[TAG], summary="Cập nhật một phần __label__"),
    destroy=extend_schema(tags=[TAG], summary="Xóa mềm __label__"),
)
class __Model__ViewSet(BaseERPViewSet):
    """
    __Label__: CRUD, statistics, batch-delete/status, export-excel có sẵn từ BaseERPViewSet.
    Quy tắc nghiệp vụ: override check_can_destroy / check_can_change_status / after_write.
    """
    queryset = __Model__.objects.select_related('created_by', 'updated_by').order_by('-updated_at', 'id')
    serializer_class = __Model__Serializer
    write_serializer_class = __Model__CreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, ModulePermissionChecker]
    permission_module = '__MODULE_CODE__'
    # Lookup cho bộ lọc theo cột ở frontend (ListColumn.filter)
    filterset_fields = {
        'is_active': ['exact'],
        'code': ['icontains'],
        'name': ['icontains'],
        'updated_at': ['date__gte', 'date__lte'],
    }
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'code', 'name']
