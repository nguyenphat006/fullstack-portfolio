from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import permissions
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.media_upload import ContentMediaUploadMixin
from apps.core.permissions import ModulePermissionChecker
from apps.core.viewsets import BaseERPViewSet

from .models import LandingSection
from .revalidate import trigger_revalidate
from .serializers import LandingSectionSerializer, LandingSectionUpdateSerializer

TAG = "Cấu hình landing"


@extend_schema_view(
    list=extend_schema(tags=[TAG], summary="Danh sách các phần của landing"),
    retrieve=extend_schema(tags=[TAG], summary="Chi tiết một phần (theo key)"),
    update=extend_schema(tags=[TAG], summary="Cập nhật một phần"),
    partial_update=extend_schema(tags=[TAG], summary="Cập nhật một phần"),
)
class LandingSectionViewSet(ContentMediaUploadMixin, BaseERPViewSet):
    """Chỉ xem / sửa: các phần do lệnh seed_landing tạo sẵn, không thêm / xóa qua API."""
    queryset = LandingSection.objects.select_related('updated_by').order_by('sort_order', 'id')
    serializer_class = LandingSectionSerializer
    write_serializer_class = LandingSectionUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, ModulePermissionChecker]
    permission_module = 'LANDING'
    custom_action_permissions = {'upload_media': 'LANDING_UPDATE'}
    media_folder = 'landing'
    media_prefix = 'lnd'
    lookup_field = 'key'
    pagination_class = None
    filterset_fields = ['is_active']
    search_fields = ['key']
    ordering_fields = ['sort_order']

    def create(self, request, *args, **kwargs):
        raise MethodNotAllowed('POST')

    def destroy(self, request, *args, **kwargs):
        raise MethodNotAllowed('DELETE')

    def after_write(self, instance=None):
        trigger_revalidate('landing')


class PublicLandingView(APIView):
    """API công khai cho landing: toàn bộ nội dung các phần đang bật trong 1 lần gọi (`?lang=en` -> bản tiếng Anh, thiếu thì tiếng Việt)."""
    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []

    @extend_schema(tags=['Công khai - Landing'], summary='Nội dung trang chủ theo ngôn ngữ',
                   parameters=[OpenApiParameter('lang', str, description='vi | en')], responses={200: dict})
    def get(self, request):
        english = request.query_params.get('lang') == 'en'
        data = {}
        for section in LandingSection.objects.filter(is_active=True):
            data[section.key] = (section.content_en or section.content) if english else section.content
        return Response(data)
