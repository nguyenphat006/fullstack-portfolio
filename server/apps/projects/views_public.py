from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions, serializers, viewsets

from .models import Project

TAG = "Công khai - Dự án"


# Trường có bản tiếng Anh (cột *_en); bản tiếng Anh để trống thì dùng tiếng Việt
TRANSLATED_FIELDS = ('title', 'summary', 'year', 'role', 'content')


class PublicProjectSerializer(serializers.ModelSerializer):
    """Chỉ các trường landing cần hiển thị (không lộ thông tin audit). `?lang=en` trả bản tiếng Anh (fallback tiếng Việt)."""

    class Meta:
        model = Project
        fields = ['slug', 'title', 'summary', 'stack', 'year', 'image', 'color', 'role', 'content', 'live_url', 'github_url', 'featured']
        read_only_fields = fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request is not None and request.query_params.get('lang') == 'en':
            for name in TRANSLATED_FIELDS:
                english = getattr(instance, f'{name}_en', '')
                if english:
                    data[name] = english
        return data


@extend_schema_view(
    list=extend_schema(tags=[TAG], summary="Danh sách projects công khai"),
    retrieve=extend_schema(tags=[TAG], summary="Chi tiết project công khai (theo slug)"),
)
class PublicProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """API công khai cho landing: không cần đăng nhập, chỉ đọc, chỉ bản ghi đang hoạt động."""
    queryset = Project.objects.filter(is_active=True).order_by('created_at', 'id')
    serializer_class = PublicProjectSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []
    lookup_field = 'slug'
    filterset_fields = ['featured']
    ordering_fields = ['created_at', 'year']
