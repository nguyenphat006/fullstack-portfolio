from drf_spectacular.utils import extend_schema
from rest_framework import permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import BusinessError
from apps.core.permissions import get_user_permissions
from apps.core.translation import TranslationError, translate_text

MAX_KEYS = 20
MAX_TOTAL_CHARS = 30000
# Chỉ người được tạo / sửa nội dung có song ngữ mới dùng được (chống lạm dụng dịch vụ dịch)
ALLOWED_PERMISSIONS = {'PROJECT_CREATE', 'PROJECT_UPDATE', 'BLOG_CREATE', 'BLOG_UPDATE'}


class CanTranslate(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        perms = get_user_permissions(request.user)
        return '*' in perms or bool(ALLOWED_PERMISSIONS & perms)


class TranslateRequestSerializer(serializers.Serializer):
    texts = serializers.DictField(child=serializers.CharField(allow_blank=True, trim_whitespace=False), allow_empty=False)
    # CharField (không ChoiceField) để OpenAPI không sinh 2 enum trùng tên; giá trị hợp lệ kiểm tra trong validate()
    source = serializers.CharField(default='vi', help_text='vi | en')
    target = serializers.CharField(default='en', help_text='vi | en')

    def validate(self, attrs):
        for key in ('source', 'target'):
            if attrs[key] not in ('vi', 'en'):
                raise serializers.ValidationError({key: ['Chỉ hỗ trợ vi hoặc en.']})
        if attrs['source'] == attrs['target']:
            raise serializers.ValidationError({'target': ['Ngôn ngữ đích phải khác ngôn ngữ nguồn.']})
        if len(attrs['texts']) > MAX_KEYS or sum(len(v) for v in attrs['texts'].values()) > MAX_TOTAL_CHARS:
            raise serializers.ValidationError({'texts': ['Nội dung cần dịch quá dài.']})
        return attrs


class TranslateResponseSerializer(serializers.Serializer):
    translations = serializers.DictField(child=serializers.CharField(allow_blank=True))


class TranslateView(APIView):
    """Dịch hàng loạt các trường chữ (Markdown được giữ nguyên cấu trúc) cho nút "Dịch tự động" ở trang quản trị."""
    permission_classes = [permissions.IsAuthenticated, CanTranslate]

    @extend_schema(tags=['Tiện ích'], summary='Dịch tự động các trường chữ (VI <-> EN)',
                   request=TranslateRequestSerializer, responses=TranslateResponseSerializer)
    def post(self, request):
        serializer = TranslateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            translations = {key: translate_text(text, data['source'], data['target']) for key, text in data['texts'].items()}
        except TranslationError as exc:
            raise BusinessError('Dịch vụ dịch tự động đang quá tải hoặc bị giới hạn, vui lòng thử lại sau ít phút.') from exc
        return Response({'translations': translations})
