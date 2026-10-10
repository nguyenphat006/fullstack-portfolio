from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions, serializers, viewsets

from .models import Project

TAG = "Công khai - Dự án"


class PublicProjectSerializer(serializers.ModelSerializer):
    """Chỉ các trường landing cần hiển thị (không lộ thông tin audit)."""

    class Meta:
        model = Project
        fields = ['slug', 'title', 'summary', 'stack', 'year', 'image', 'color', 'role', 'content', 'live_url', 'github_url', 'featured']
        read_only_fields = fields


@extend_schema_view(
    list=extend_schema(tags=[TAG], summary="Danh sách projects công khai"),
    retrieve=extend_schema(tags=[TAG], summary="Chi tiết project công khai (theo slug)"),
)
class PublicProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """API công khai cho landing: không cần đăng nhập, chỉ đọc, chỉ bản ghi đang hoạt động."""
    queryset = Project.objects.filter(is_active=True).order_by('-created_at', 'id')
    serializer_class = PublicProjectSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []
    lookup_field = 'slug'
    filterset_fields = ['featured']
    ordering_fields = ['created_at', 'year']
