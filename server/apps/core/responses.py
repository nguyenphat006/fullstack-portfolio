"""
Hợp đồng phản hồi API chuẩn của hệ thống (API Response Contract).

Mọi response JSON đều có dạng envelope thống nhất (được `EnvelopeJSONRenderer` tự động áp dụng):

    Thành công: {"success": true,  "message": "...", "data": <payload>, "errors": null, "code": null}
    Thất bại:   {"success": false, "message": "...", "data": null, "errors": {field: [msg]} | null, "code": "<error_code>"}

- Danh sách phân trang: `data = {"results": [...], "count", "total_pages", "current_page", "page_size", "next", "previous"}`.
- Tải file (Excel/CSV/FileResponse) và HTTP 204/304 không bọc envelope.
- View chỉ cần trả `Response(data)` hoặc `success_response(data, message)`; lỗi thì `raise` exception DRF
  (ValidationError, NotFound, PermissionDenied...) để `custom_exception_handler` chuẩn hóa.
"""
import hashlib
import json

from django.http import HttpResponseNotModified
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.response import Response

DEFAULT_SUCCESS_MESSAGE = _("Thành công")
DEFAULT_ERROR_MESSAGE = _("Đã xảy ra lỗi")


def build_envelope(success: bool, message: str, data=None, errors=None, code=None) -> dict:
    return {
        "success": success,
        "message": str(message) if message is not None else None,  # chuỗi lazy (gettext) -> theo ngôn ngữ request
        "data": data,
        "errors": errors,
        "code": code,
    }


def is_envelope(data) -> bool:
    return isinstance(data, dict) and isinstance(data.get("success"), bool) and "message" in data and "data" in data


def success_response(data=None, message: str = DEFAULT_SUCCESS_MESSAGE, status_code: int = status.HTTP_200_OK) -> Response:
    """Phản hồi thành công kèm thông điệp tiếng Việt hiển thị cho người dùng."""
    return Response(build_envelope(True, message, data=data), status=status_code)


def error_response(
    message: str = DEFAULT_ERROR_MESSAGE,
    errors=None,
    status_code: int = status.HTTP_400_BAD_REQUEST,
    code: str = "error",
) -> Response:
    """
    Phản hồi lỗi nghiệp vụ trả về trực tiếp từ view.
    Ưu tiên `raise ValidationError(...)` / `raise BusinessError(...)`; chỉ dùng hàm này khi cần trả kèm `data`/`errors` tùy biến.
    """
    return Response(build_envelope(False, message, errors=errors, code=code), status=status_code)


def cached_etag_response(request, data, message: str = DEFAULT_SUCCESS_MESSAGE) -> Response:
    """
    Phản hồi kèm ETag & HTTP 304 Not Modified.
    Client gửi `If-None-Match` khớp ETag hiện tại -> HTTP 304 (0 byte). Dữ liệu đổi -> HTTP 200 kèm ETag mới.
    """
    raw_str = json.dumps(data, sort_keys=True, default=str)
    etag = f'"{hashlib.md5(raw_str.encode("utf-8")).hexdigest()}"'

    if_none_match = request.headers.get("If-None-Match") or request.META.get("HTTP_IF_NONE_MATCH")
    if if_none_match and if_none_match == etag:
        response = HttpResponseNotModified()
        response["ETag"] = etag
        response["Cache-Control"] = "private, no-cache"
        return response

    response = success_response(data=data, message=message)
    response["ETag"] = etag
    response["Cache-Control"] = "private, no-cache"
    return response
