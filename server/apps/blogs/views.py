from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions

from apps.core.permissions import ModulePermissionChecker
from apps.core.viewsets import BaseERPViewSet

from .models import Blog
from .serializers import BlogCreateUpdateSerializer, BlogSerializer

TAG = "Bài viết"


@extend_schema_view(
    list=extend_schema(tags=[TAG], summary="Danh sách bài viết"),
    retrieve=extend_schema(tags=[TAG], summary="Chi tiết bài viết"),
    create=extend_schema(tags=[TAG], summary="Tạo mới bài viết"),
    update=extend_schema(tags=[TAG], summary="Cập nhật bài viết"),
    partial_update=extend_schema(tags=[TAG], summary="Cập nhật một phần bài viết"),
    destroy=extend_schema(tags=[TAG], summary="Xóa mềm bài viết"),
)
class BlogViewSet(BaseERPViewSet):
    """
    Bài viết blog.
    CRUD, statistics, batch-delete/status, export-excel có sẵn từ BaseERPViewSet.
    """
    queryset = Blog.objects.select_related('created_by', 'updated_by').order_by('-updated_at', 'id')
    serializer_class = BlogSerializer
    write_serializer_class = BlogCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, ModulePermissionChecker]
    permission_module = 'BLOG'
    filterset_fields = {
        'is_active': ['exact'],
        'slug': ['icontains'],
        'title': ['icontains'],
        'category': ['icontains'],
        'updated_at': ['date__gte', 'date__lte'],
    }
    search_fields = ['slug', 'title', 'excerpt', 'category', 'description']
    ordering_fields = ['created_at', 'updated_at', 'slug', 'title', 'category']
