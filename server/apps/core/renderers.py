from rest_framework.renderers import JSONRenderer

from .responses import DEFAULT_ERROR_MESSAGE, DEFAULT_SUCCESS_MESSAGE, build_envelope, is_envelope


class EnvelopeJSONRenderer(JSONRenderer):
    """
    Tự động bọc mọi response JSON vào envelope chuẩn (xem `apps.core.responses`).

    Nhờ renderer này, CRUD mặc định của DRF, phân trang, APIView, SimpleJWT... đều trả cùng một định dạng
    mà không cần view nào tự bọc. Response đã là envelope (từ `success_response` / exception handler) được giữ nguyên.
    """

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = (renderer_context or {}).get("response")
        if response is None or response.status_code == 204 or is_envelope(data):
            return super().render(data, accepted_media_type, renderer_context)

        if response.status_code < 400:
            data = build_envelope(True, DEFAULT_SUCCESS_MESSAGE, data=data)
        else:
            # Lỗi trả trực tiếp bằng Response(..., status>=400) không qua exception handler
            message = data.get("detail") if isinstance(data, dict) and isinstance(data.get("detail"), str) else DEFAULT_ERROR_MESSAGE
            data = build_envelope(False, message, errors=data, code="error")

        return super().render(data, accepted_media_type, renderer_context)
