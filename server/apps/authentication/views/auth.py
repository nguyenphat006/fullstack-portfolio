"""Xác thực: đăng nhập JWT, hồ sơ cá nhân (/auth/me/), đổi mật khẩu, đăng xuất."""
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from ..serializers import (
    CurrentUserProfileSerializer,
    UserProfileUpdateSerializer,
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer,
)
from apps.core.permissions import invalidate_user_permissions, CACHE_TIMEOUT
from django.core.cache import cache
from apps.core.exceptions import BusinessError
from apps.core.responses import success_response, cached_etag_response
from django.utils.translation import gettext as _


@extend_schema(tags=['Xác thực (Authentication)'])
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    API Đăng nhập: Trả về JWT Access Token, Refresh Token và Thông tin Người dùng kèm Roles.
    """
    serializer_class = CustomTokenObtainPairSerializer

@extend_schema(tags=['Xác thực (Authentication)'], responses={200: CurrentUserProfileSerializer})
class UserProfileView(APIView):
    """
    API Lấy và Cập nhật thông tin tài khoản đang đăng nhập từ JWT Token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        cache_key = f"user_profile_data_{user.id}"
        data = cache.get(cache_key)
        if data is None:
            serializer = CurrentUserProfileSerializer(user)
            data = serializer.data
            cache.set(cache_key, data, CACHE_TIMEOUT)

        return cached_etag_response(request, data, message=_("Lấy thông tin tài khoản thành công"))

    @extend_schema(request=UserProfileUpdateSerializer, responses={200: CurrentUserProfileSerializer})
    def patch(self, request):
        user = request.user
        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Invalidate caches
        cache.delete(f"user_profile_data_{user.id}")
        invalidate_user_permissions(user.id)

        # Trả về thông tin user mới nhất
        full_serializer = CurrentUserProfileSerializer(user)
        return success_response(data=full_serializer.data, message=_("Cập nhật hồ sơ cá nhân thành công"))

@extend_schema(tags=['Xác thực (Authentication)'], request=ChangePasswordSerializer)
class ChangePasswordView(APIView):
    """
    API Đổi mật khẩu cho người dùng hiện tại.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=ChangePasswordSerializer, responses={200: None})
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        new_password = serializer.validated_data['new_password']
        user.set_password(new_password)
        user.save()

        # Invalidate permissions cache
        invalidate_user_permissions(user.id)

        return success_response(message=_("Đổi mật khẩu thành công. Vui lòng đăng nhập lại."))

@extend_schema(tags=['Xác thực (Authentication)'])
class LogoutView(APIView):
    """
    API Đăng xuất: Blacklist Refresh Token phía máy chủ.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=inline_serializer('LogoutRequest', fields={'refresh': serializers.CharField()}),
        responses={200: None},
    )
    def post(self, request):
        from rest_framework_simplejwt.exceptions import TokenError
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh_token = request.data.get("refresh")
        if not refresh_token:
            raise ValidationError({'refresh': [_("Refresh token là bắt buộc để đăng xuất.")]})
        try:
            RefreshToken(refresh_token).blacklist()
        except TokenError:
            raise BusinessError(_("Token không hợp lệ hoặc đã bị hủy."))
        return success_response(message=_("Đăng xuất thành công."))
