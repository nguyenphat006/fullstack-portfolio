from drf_spectacular.utils import extend_schema
from rest_framework import mixins, permissions, serializers, status, viewsets
from rest_framework.throttling import ScopedRateThrottle

from apps.core.responses import success_response

from .models import Contact

TAG = "Công khai - Liên hệ"


class PublicContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['name', 'email', 'message']

    def validate_name(self, value):
        return value.strip()

    def validate_message(self, value):
        return value.strip()


@extend_schema(tags=[TAG], summary="Gửi liên hệ từ landing (công khai, giới hạn tần suất)")
class PublicContactViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Nhận form liên hệ từ landing: không cần đăng nhập, chỉ cho phép tạo mới."""
    queryset = Contact.objects.none()
    serializer_class = PublicContactSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'public_contact'

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(data=None, message="Đã gửi liên hệ", status_code=status.HTTP_201_CREATED)
