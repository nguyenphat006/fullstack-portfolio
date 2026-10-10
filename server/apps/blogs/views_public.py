from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions, serializers, viewsets

from .models import Blog

TAG = "Công khai - Bài viết"


class PublicBlogSerializer(serializers.ModelSerializer):
    """Chỉ các trường landing cần hiển thị (không lộ thông tin audit)."""

    class Meta:
        model = Blog
        fields = ['slug', 'title', 'excerpt', 'published_date', 'category', 'read_time', 'image', 'content']
        read_only_fields = fields


@extend_schema_view(
    list=extend_schema(tags=[TAG], summary="Danh sách blogs công khai"),
    retrieve=extend_schema(tags=[TAG], summary="Chi tiết blog công khai (theo slug)"),
)
class PublicBlogViewSet(viewsets.ReadOnlyModelViewSet):
    """API công khai cho landing: không cần đăng nhập, chỉ đọc, chỉ bản ghi đang hoạt động."""
    queryset = Blog.objects.filter(is_active=True).order_by('-created_at', 'id')
    serializer_class = PublicBlogSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []
    lookup_field = 'slug'
    filterset_fields = ['category']
    ordering_fields = ['created_at']
