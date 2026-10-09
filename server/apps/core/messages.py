"""
Thông điệp dùng chung (đa ngôn ngữ) — module sinh bằng `startmodule` dùng lại để không phải dịch lại mỗi lần.
Chuỗi có tham số dùng placeholder có tên: `DUPLICATE_CODE % {"code": code}`.
"""
from django.utils.translation import gettext_lazy as _

DUPLICATE_CODE = _("Mã '%(code)s' đã tồn tại.")
NAME_REQUIRED = _("Tên không được để trống.")
