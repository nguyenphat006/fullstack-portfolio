import time
from django.utils.translation import gettext as _

from django.core.cache import cache
from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .responses import success_response

APP_VERSION = "1.0.0"


def _check(fn):
    started = time.perf_counter()
    try:
        fn()
        return {"status": "ok", "latency_ms": round((time.perf_counter() - started) * 1000, 1)}
    except Exception as exc:  # noqa: BLE001 — health check phải bắt mọi lỗi để báo trạng thái
        return {"status": "error", "detail": exc.__class__.__name__}


def _check_db():
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")


def _check_cache():
    cache.set("health_check", "1", 5)
    if cache.get("health_check") != "1":
        raise RuntimeError("cache read-back failed")


class HealthComponentSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["ok", "error"])
    latency_ms = serializers.FloatField(required=False)
    detail = serializers.CharField(required=False)


class HealthStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["ok", "degraded", "error"])
    version = serializers.CharField()
    database = HealthComponentSerializer()
    cache = HealthComponentSerializer()


class HealthCheckView(APIView):
    """
    Kiểm tra sức khỏe hệ thống (public, không cần đăng nhập) — dùng cho Docker healthcheck,
    load balancer và khung trạng thái trên Dashboard. Trả 503 nếu CSDL lỗi.
    Không lộ thông tin nhạy cảm (chỉ tên lớp lỗi, không có message/host).
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    @extend_schema(
        tags=["Hệ thống"],
        summary="Kiểm tra sức khỏe hệ thống",
        responses={200: HealthStatusSerializer, 503: HealthStatusSerializer},
    )
    def get(self, request):
        database = _check(_check_db)
        cache_state = _check(_check_cache)
        if database["status"] != "ok":
            overall = "error"
        elif cache_state["status"] != "ok":
            overall = "degraded"
        else:
            overall = "ok"

        data = {"status": overall, "version": APP_VERSION, "database": database, "cache": cache_state}
        if overall == "error":
            return Response(
                {"success": False, "message": _("Hệ thống không kết nối được CSDL"), "data": data, "errors": None, "code": "unhealthy"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return success_response(data=data, message=_("Hệ thống hoạt động bình thường"))
