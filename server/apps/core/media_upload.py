"""
Tải ảnh / video cho nội dung (ảnh đại diện, ảnh & video chèn vào Markdown) — dùng chung cho Dự án và Bài viết.

ViewSet kế thừa `ContentMediaUploadMixin` và khai báo `media_folder`, `media_prefix`; quyền: cần _CREATE hoặc _UPDATE của phân hệ.
"""
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import serializers, status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser

from apps.core.image_upload import RASTER_IMAGE_EXTENSIONS, save_uploaded_image
from apps.core.responses import success_response

VIDEO_EXTENSIONS = ('.mp4', '.webm')
LIMITS_MB = {'image': 5, 'video': 50}


class MediaUploadResponseSerializer(serializers.Serializer):
    image_url = serializers.CharField(help_text='URL tệp đã lưu (ảnh hoặc video)')
    file_name = serializers.CharField()


class ContentMediaUploadMixin:
    media_folder = 'content'
    media_prefix = 'media'

    @extend_schema(
        summary='Tải ảnh / video cho nội dung',
        parameters=[OpenApiParameter('kind', str, description='image (mặc định) | video')],
        request={'multipart/form-data': {'type': 'object', 'properties': {'file': {'type': 'string', 'format': 'binary'}}}},
        responses=MediaUploadResponseSerializer,
    )
    @action(detail=False, methods=['post'], url_path='upload-media', parser_classes=[MultiPartParser, FormParser])
    def upload_media(self, request):
        kind = 'video' if request.query_params.get('kind') == 'video' else 'image'
        extensions = VIDEO_EXTENSIONS if kind == 'video' else RASTER_IMAGE_EXTENSIONS
        data = save_uploaded_image(
            request, f'{self.media_folder}/{kind}s', prefix=self.media_prefix, extensions=extensions, max_size_mb=LIMITS_MB[kind],
        )
        return success_response(data=data, message='Tải tệp lên thành công', status_code=status.HTTP_201_CREATED)
