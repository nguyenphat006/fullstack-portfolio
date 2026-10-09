"""
Kiểm soát truy cập tệp đính kèm theo THỰC THỂ CHA.

- entity_type "User" / "MaterialCategory" / "PRODUCT_BASE" -> mã phân hệ USER / MATERIAL_CATEGORY / PRODUCT_BASE.
- Xem (list, retrieve)          -> cần <MODULE>_READ
- Thêm / sửa / xóa tệp          -> cần <MODULE>_UPDATE
- Thao tác quản trị (batch-*, export, statistics...) -> chỉ Quản trị viên
Loại thực thể không có quyền tương ứng -> từ chối (fail-closed).

File tải về qua link có chữ ký, hết hạn (`signed_file_url`) thay vì /media công khai.
"""
import re
from django.utils.translation import gettext_lazy as _

from django.core import signing
from rest_framework.permissions import BasePermission

from .permissions import get_user_permissions

READ_ACTIONS = {'list', 'retrieve'}
WRITE_ACTIONS = {'create', 'update', 'partial_update', 'destroy', 'hard_delete'}
FILE_URL_SALT = 'attachment-file'
FILE_URL_MAX_AGE = 3600  # giây


def entity_module(entity_type: str) -> str:
    """'User' -> 'USER', 'MaterialCategory' -> 'MATERIAL_CATEGORY', 'PRODUCT_BASE' -> 'PRODUCT_BASE'."""
    value = (entity_type or '').strip()
    return re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', value).upper()


def has_entity_permission(user, entity_type: str, write: bool) -> bool:
    perms = get_user_permissions(user)
    if '*' in perms:
        return True
    module = entity_module(entity_type)
    if not module:
        return False
    return f"{module}_{'UPDATE' if write else 'READ'}" in perms


def signed_file_url(attachment_id: int) -> str:
    sig = signing.TimestampSigner(salt=FILE_URL_SALT).sign(str(attachment_id))
    return f"/api/v1/attachments/{attachment_id}/file/?sig={sig}"


def verify_file_signature(attachment_id, sig: str) -> bool:
    try:
        value = signing.TimestampSigner(salt=FILE_URL_SALT).unsign(sig or '', max_age=FILE_URL_MAX_AGE)
    except signing.BadSignature:  # gồm cả SignatureExpired
        return False
    return value == str(attachment_id)


class AttachmentPermission(BasePermission):
    message = _("Bạn không có quyền truy cập tệp đính kèm của đối tượng này.")

    def has_permission(self, request, view):
        if view.action == 'file':
            return True  # xác thực bằng chữ ký trong view
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if '*' in get_user_permissions(user):
            return True
        if view.action == 'list':
            entity_type = request.query_params.get('entity_type')
            return bool(entity_type) and has_entity_permission(user, entity_type, write=False)
        if view.action == 'create':
            return has_entity_permission(user, request.data.get('entity_type', ''), write=True)
        if view.action in READ_ACTIONS | WRITE_ACTIONS:
            return True  # quyết định ở has_object_permission theo entity_type của bản ghi
        return False  # batch-*, export, statistics... chỉ Quản trị viên

    def has_object_permission(self, request, view, obj):
        if view.action == 'file':
            return True
        return has_entity_permission(request.user, obj.entity_type, write=view.action in WRITE_ACTIONS)
