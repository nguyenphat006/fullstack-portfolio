from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import mixins, permissions, serializers, viewsets
from rest_framework.decorators import action
from django.utils.translation import gettext as _

from .models import Notification
from .pagination import StandardResultsSetPagination
from .responses import success_response

TAG = 'Thông báo (Notifications)'


class NotificationSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'level', 'title', 'message', 'link', 'source_type', 'source_id', 'is_read', 'read_at', 'created_at']
        read_only_fields = fields

    def get_is_read(self, obj) -> bool:
        return obj.read_at is not None


class UnreadCountSerializer(serializers.Serializer):
    count = serializers.IntegerField()


class NotificationViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Thông báo của CHÍNH người đang đăng nhập — không cần mã quyền, không xem được của người khác.
    `?unread=true` chỉ lấy thông báo chưa đọc.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = []

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):  # sinh OpenAPI: không có user thật
            return Notification.objects.none()
        qs = Notification.objects.filter(recipient=self.request.user)
        if self.request.query_params.get('unread') in ('true', '1'):
            qs = qs.filter(read_at__isnull=True)
        return qs

    @extend_schema(tags=[TAG], summary="Danh sách thông báo của tôi",
                   parameters=[OpenApiParameter('unread', bool, description="Chỉ lấy thông báo chưa đọc")])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(tags=[TAG], summary="Số thông báo chưa đọc", responses=UnreadCountSerializer)
    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        count = Notification.objects.filter(recipient=request.user, read_at__isnull=True).count()
        return success_response(data={'count': count})

    @extend_schema(tags=[TAG], summary="Đánh dấu 1 thông báo đã đọc", request=None, responses=NotificationSerializer)
    @action(detail=True, methods=['post'], url_path='read')
    def read(self, request, pk=None):
        notification = self.get_object()  # get_queryset đã giới hạn theo người nhận -> 404 nếu của người khác
        if notification.read_at is None:
            notification.read_at = timezone.now()
            notification.save(update_fields=['read_at', 'updated_at'])
        return success_response(data=NotificationSerializer(notification).data)

    @extend_schema(tags=[TAG], summary="Đánh dấu tất cả đã đọc", request=None, responses=UnreadCountSerializer)
    @action(detail=False, methods=['post'], url_path='read-all')
    def read_all(self, request):
        updated = Notification.objects.filter(recipient=request.user, read_at__isnull=True).update(read_at=timezone.now())
        return success_response(data={'count': updated}, message=_("Đã đánh dấu %(count)s thông báo là đã đọc") % {"count": updated})
