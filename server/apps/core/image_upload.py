"""
Lưu ảnh tải lên (ảnh đại diện NVL, logo khách hàng…) vào `MEDIA_ROOT/<folder>/` và trả URL.

Dùng trong action `upload-image` / `upload-logo` của ViewSet:
    return success_response(data=save_uploaded_image(request, 'customers', prefix='cus'),
                            message=IMAGE_UPLOADED, status_code=status.HTTP_201_CREATED)
"""
import os
import uuid

from django.conf import settings
from django.utils.translation import gettext as _
from django.utils.translation import gettext_lazy
from rest_framework.exceptions import ValidationError

# Ảnh raster an toàn để hiển thị trực tiếp. SVG có thể chứa script → chỉ bật khi thật cần (bản vẽ mặt cắt NVL).
RASTER_IMAGE_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp')
IMAGE_UPLOADED = gettext_lazy("Tải lên hình ảnh thành công")


def save_uploaded_image(request, folder: str, prefix: str, *, extensions=RASTER_IMAGE_EXTENSIONS, max_size_mb: int = 5) -> dict:
    """Kiểm tra đuôi tệp / dung lượng (lỗi → ValidationError ở trường `file`), lưu với tên ngẫu nhiên."""
    file_obj = request.FILES.get('file') or request.FILES.get('image')
    if not file_obj:
        raise ValidationError({'file': [_("Vui lòng đính kèm tệp ảnh.")]})

    ext = os.path.splitext(file_obj.name)[1].lower()
    if ext not in extensions:
        raise ValidationError({'file': [_("Chỉ chấp nhận %(types)s.") % {"types": ', '.join(extensions)}]})
    if file_obj.size > max_size_mb * 1024 * 1024:
        raise ValidationError({'file': [_("Dung lượng ảnh tối đa %(size)sMB.") % {"size": max_size_mb}]})

    filename = f"{prefix}_{uuid.uuid4().hex[:10]}{ext}"
    upload_dir = os.path.join(settings.MEDIA_ROOT, folder)
    os.makedirs(upload_dir, exist_ok=True)
    with open(os.path.join(upload_dir, filename), 'wb+') as destination:
        for chunk in file_obj.chunks():
            destination.write(chunk)
    return {"image_url": f"{settings.MEDIA_URL}{folder}/{filename}", "file_name": file_obj.name}
