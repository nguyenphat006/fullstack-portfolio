"""Cấu hình hệ thống (1 dòng): bản công khai cho trang đăng nhập / layout và bản quản trị để sửa."""
import os
import uuid
from django.utils.translation import gettext as _

from django.conf import settings as django_settings
from django.core.cache import cache
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, serializers, status
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView

from .models import SystemSettings
from .permissions import get_user_permissions
from .responses import success_response

TAG = 'Cấu hình hệ thống (System Settings)'
CACHE_KEY = 'system_settings_public'
LOGO_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.webp', '.svg')
LOGO_MAX_MB = 1


class SystemSettingsPublicSerializer(serializers.ModelSerializer):
    """Trường an toàn để công khai (trang đăng nhập chưa có token)."""
    class Meta:
        model = SystemSettings
        fields = ['app_name', 'app_badge', 'tagline', 'company_name', 'logo_url', 'timezone', 'date_format', 'number_format']


class SystemSettingsSerializer(serializers.ModelSerializer):
    updated_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)
    updated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = SystemSettings
        fields = [
            'app_name', 'app_badge', 'tagline', 'company_name', 'logo_url',
            'timezone', 'date_format', 'number_format', 'updated_at', 'updated_by_name',
        ]
        read_only_fields = ['logo_url', 'updated_at', 'updated_by_name']

    def get_updated_by_name(self, obj) -> str | None:
        return (obj.updated_by.full_name or obj.updated_by.username) if obj.updated_by else None

    def validate_timezone(self, value):
        import zoneinfo
        if value not in zoneinfo.available_timezones():
            raise ValidationError(_("Múi giờ không hợp lệ."))
        return value


def _public_data():
    data = cache.get(CACHE_KEY)
    if data is None:
        data = SystemSettingsPublicSerializer(SystemSettings.load()).data
        cache.set(CACHE_KEY, data, 300)
    return data


class SystemSettingsPublicView(APIView):
    """Không cần đăng nhập: tên, logo, định dạng mặc định."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    @extend_schema(tags=[TAG], summary="Cấu hình hệ thống (công khai)", responses=SystemSettingsPublicSerializer)
    def get(self, request):
        return success_response(data=_public_data())


class _SettingsPermission(permissions.BasePermission):
    """GET cần SETTINGS_READ, PATCH / POST / DELETE cần SETTINGS_UPDATE."""
    def has_permission(self, request, view):
        code = 'SETTINGS_READ' if request.method in permissions.SAFE_METHODS else 'SETTINGS_UPDATE'
        perms = get_user_permissions(request.user)
        return '*' in perms or code in perms


class SystemSettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated, _SettingsPermission]

    @extend_schema(tags=[TAG], summary="Xem cấu hình hệ thống", responses=SystemSettingsSerializer)
    def get(self, request):
        return success_response(data=SystemSettingsSerializer(SystemSettings.load()).data)

    @extend_schema(tags=[TAG], summary="Cập nhật cấu hình hệ thống", request=SystemSettingsSerializer, responses=SystemSettingsSerializer)
    def patch(self, request):
        obj = SystemSettings.load()
        serializer = SystemSettingsSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        cache.delete(CACHE_KEY)
        return success_response(data=serializer.data, message=_("Đã lưu cấu hình hệ thống"))


class LogoUploadSerializer(serializers.Serializer):
    file = serializers.FileField()


class SystemLogoView(APIView):
    """Tải logo (≤ 1MB, png/jpg/webp/svg); DELETE = về logo mặc định."""
    permission_classes = [permissions.IsAuthenticated, _SettingsPermission]
    parser_classes = [MultiPartParser]

    @extend_schema(tags=[TAG], summary="Tải logo ứng dụng", request={'multipart/form-data': LogoUploadSerializer}, responses=SystemSettingsSerializer)
    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            raise ValidationError({'file': [_("Vui lòng chọn tệp ảnh.")]})
        ext = os.path.splitext(file_obj.name)[1].lower()
        if ext not in LOGO_EXTENSIONS:
            raise ValidationError({'file': [_("Chỉ chấp nhận %(types)s.") % {"types": ', '.join(LOGO_EXTENSIONS)}]})
        if file_obj.size > LOGO_MAX_MB * 1024 * 1024:
            raise ValidationError({'file': [_("Dung lượng logo tối đa %(size)sMB.") % {"size": LOGO_MAX_MB}]})

        filename = f"logo_{uuid.uuid4().hex[:10]}{ext}"
        folder = os.path.join(django_settings.MEDIA_ROOT, 'branding')
        os.makedirs(folder, exist_ok=True)
        with open(os.path.join(folder, filename), 'wb+') as dest:
            for chunk in file_obj.chunks():
                dest.write(chunk)

        obj = SystemSettings.load()
        obj.logo_url = f"{django_settings.MEDIA_URL}branding/{filename}"
        obj.updated_by = request.user
        obj.save(update_fields=['logo_url', 'updated_by', 'updated_at'])
        cache.delete(CACHE_KEY)
        return success_response(data=SystemSettingsSerializer(obj).data, message=_("Đã cập nhật logo"), status_code=status.HTTP_200_OK)

    @extend_schema(tags=[TAG], summary="Bỏ logo (dùng logo mặc định)", responses=SystemSettingsSerializer)
    def delete(self, request):
        obj = SystemSettings.load()
        obj.logo_url = None
        obj.updated_by = request.user
        obj.save(update_fields=['logo_url', 'updated_by', 'updated_at'])
        cache.delete(CACHE_KEY)
        return success_response(data=SystemSettingsSerializer(obj).data, message=_("Đã bỏ logo"))
