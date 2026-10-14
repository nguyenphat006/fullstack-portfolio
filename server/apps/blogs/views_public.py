from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions, serializers, viewsets

from .models import Blog

TAG = "Công khai - Bài viết"


# Trường có bản tiếng Anh (cột *_en); bản tiếng Anh để trống thì dùng tiếng Việt
TRANSLATED_FIELDS = ('title', 'excerpt', 'published_date', 'category', 'read_time', 'content')


class PublicBlogSerializer(serializers.ModelSerializer):
    """Chỉ các trường landing cần hiển thị (không lộ thông tin audit). `?lang=en` trả bản tiếng Anh (fallback tiếng Việt)."""

    class Meta:
        model = Blog
        fields = ['slug', 'title', 'excerpt', 'published_date', 'category', 'read_time', 'image', 'content']
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
    list=extend_schema(tags=[TAG], summary="Danh sách blogs công khai"),
    retrieve=extend_schema(tags=[TAG], summary="Chi tiết blog công khai (theo slug)"),
)
class PublicBlogViewSet(viewsets.ReadOnlyModelViewSet):
    """API công khai cho landing: không cần đăng nhập, chỉ đọc, chỉ bản ghi đang hoạt động."""
    queryset = Blog.objects.filter(is_active=True).order_by('created_at', 'id')
    serializer_class = PublicBlogSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []
    lookup_field = 'slug'
    filterset_fields = ['category']
    ordering_fields = ['created_at']
