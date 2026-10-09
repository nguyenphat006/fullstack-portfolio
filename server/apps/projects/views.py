from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions

from apps.core.permissions import ModulePermissionChecker
from apps.core.viewsets import BaseERPViewSet

from .models import Project
from .serializers import ProjectCreateUpdateSerializer, ProjectSerializer

TAG = "Dự án"


@extend_schema_view(
    list=extend_schema(tags=[TAG], summary="Danh sách dự án"),
    retrieve=extend_schema(tags=[TAG], summary="Chi tiết dự án"),
    create=extend_schema(tags=[TAG], summary="Tạo mới dự án"),
    update=extend_schema(tags=[TAG], summary="Cập nhật dự án"),
    partial_update=extend_schema(tags=[TAG], summary="Cập nhật một phần dự án"),
    destroy=extend_schema(tags=[TAG], summary="Xóa mềm dự án"),
)
class ProjectViewSet(BaseERPViewSet):
    """
    Dự án portfolio.
    CRUD, statistics, batch-delete/status, export-excel có sẵn từ BaseERPViewSet.
    """
    queryset = Project.objects.select_related('created_by', 'updated_by').order_by('-updated_at', 'id')
    serializer_class = ProjectSerializer
    write_serializer_class = ProjectCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, ModulePermissionChecker]
    permission_module = 'PROJECT'
    filterset_fields = {
        'is_active': ['exact'],
        'featured': ['exact'],
        'slug': ['icontains'],
        'title': ['icontains'],
        'year': ['exact'],
        'updated_at': ['date__gte', 'date__lte'],
    }
    search_fields = ['slug', 'title', 'summary', 'description']
    ordering_fields = ['created_at', 'updated_at', 'slug', 'title', 'year']
