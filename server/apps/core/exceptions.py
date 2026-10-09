import logging

from django.conf import settings
from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.http import Http404
from django.db import IntegrityError
from django.db.models import ProtectedError
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.exceptions import APIException, NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler

from .responses import build_envelope

logger = logging.getLogger(__name__)


class BusinessError(APIException):
    """
    Lỗi vi phạm quy tắc nghiệp vụ (không phải lỗi định dạng dữ liệu).
    Ví dụ: `raise BusinessError("Không thể xóa vai trò ADMIN của hệ thống.")`
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _("Thao tác vi phạm quy tắc nghiệp vụ.")
    default_code = "business_rule"


class ConflictError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = _("Dữ liệu bị xung đột hoặc trùng lặp.")
    default_code = "conflict"


# Thông điệp tiếng Việt cho lỗi mặc định của DRF / SimpleJWT (chỉ thay khi view không tự đặt thông điệp)
DEFAULT_MESSAGES_VI = {
    'not_authenticated': _("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn."),
    'authentication_failed': _("Xác thực không thành công."),
    'token_not_valid': _("Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."),
    'permission_denied': _("Bạn không có quyền thực hiện thao tác này."),
    'not_found': _("Không tìm thấy dữ liệu yêu cầu."),
    'method_not_allowed': _("Phương thức không được hỗ trợ."),
    'unsupported_media_type': _("Định dạng dữ liệu gửi lên không được hỗ trợ."),
    'throttled': _("Bạn thao tác quá nhanh. Vui lòng thử lại sau."),
    'parse_error': _("Dữ liệu gửi lên không đúng định dạng JSON."),
}


def _flatten_messages(value) -> list:
    """Chuyển mọi dạng lỗi lồng nhau của DRF thành list[str]."""
    if isinstance(value, dict):
        out = []
        for v in value.values():
            out.extend(_flatten_messages(v))
        return out
    if isinstance(value, (list, tuple)):
        out = []
        for v in value:
            out.extend(_flatten_messages(v))
        return out
    return [str(value)]


def _normalize_validation_errors(data):
    """
    Chuẩn hóa lỗi ValidationError về `(message, errors)`:
    - `errors` = {field: [msg, ...]} để Frontend map vào từng ô Form (`form.setFields`).
    - `message` = lỗi đầu tiên, dễ đọc, hiển thị toast.
    """
    if isinstance(data, (list, tuple)):
        msgs = _flatten_messages(data)
        return (msgs[0] if msgs else str(_("Dữ liệu không hợp lệ."))), None

    if not isinstance(data, dict):
        return str(data), None

    errors = {}
    message = None
    for field, value in data.items():
        msgs = _flatten_messages(value)
        if field in ("detail", "non_field_errors", "message"):
            message = message or (msgs[0] if msgs else None)
            if field == "non_field_errors":
                errors[field] = msgs
            continue
        errors[field] = msgs

    if message is None and errors:
        first_field, first_msgs = next(iter(errors.items()))
        message = first_msgs[0] if first_msgs else str(_("Dữ liệu không hợp lệ."))
    return (message or str(_("Dữ liệu không hợp lệ."))), (errors or None)


def custom_exception_handler(exc, context):
    """Chuẩn hóa mọi lỗi API về envelope `{success: false, message, errors, code}`."""
    if isinstance(exc, Http404):
        exc = NotFound(_("Không tìm thấy dữ liệu yêu cầu."))
    elif isinstance(exc, DjangoPermissionDenied):
        exc = PermissionDenied()
    elif isinstance(exc, ProtectedError):
        exc = ConflictError(_("Không thể xóa vì bản ghi đang được dữ liệu khác tham chiếu."))
    elif isinstance(exc, IntegrityError):
        logger.warning("IntegrityError: %s", exc)
        exc = ConflictError(_("Dữ liệu vi phạm ràng buộc toàn vẹn (trùng mã hoặc tham chiếu không hợp lệ)."))

    response = exception_handler(exc, context)

    if response is None:
        # Lỗi không lường trước (500). DEBUG giữ trang lỗi Django để dễ gỡ lỗi.
        if settings.DEBUG:
            return None
        logger.exception("Unhandled API exception", exc_info=exc)
        return Response(
            build_envelope(False, _("Lỗi hệ thống. Vui lòng thử lại hoặc liên hệ quản trị viên."), code="server_error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    code = None
    if isinstance(exc, APIException):
        codes = exc.get_codes()
        code = codes if isinstance(codes, str) else getattr(exc, "default_code", "error")

    if isinstance(exc, ValidationError):
        message, errors = _normalize_validation_errors(response.data)
        code = "validation_error"
    else:
        data = response.data
        if isinstance(data, dict) and "detail" in data:
            message = str(data["detail"])
        else:
            message, _errors = _normalize_validation_errors(data)
        errors = None

    code = code or "error"
    default_detail = str(getattr(exc, 'default_detail', ''))
    if code in DEFAULT_MESSAGES_VI and (message == default_detail or code == 'token_not_valid'):
        message = str(DEFAULT_MESSAGES_VI[code])

    response.data = build_envelope(False, message, errors=errors, code=code)
    return response
