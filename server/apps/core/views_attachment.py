import mimetypes
from django.utils.translation import gettext as _

from django.http import FileResponse
from rest_framework import status
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from .models import Attachment
from .serializers import AttachmentSerializer
from .viewsets import BaseERPViewSet
from .attachment_access import AttachmentPermission, verify_file_signature
from .exceptions import BusinessError
from .responses import success_response, error_response

@extend_schema_view(
    list=extend_schema(
        tags=['Tệp Đính Kèm (Attachments)'],
        summary="Lấy danh sách tệp đính kèm theo thực thể",
        parameters=[
            OpenApiParameter('entity_type', str, description="Loại thực thể: USER, PRODUCT_BASE, MATERIAL, WORK_ORDER..."),
            OpenApiParameter('entity_id', int, description="ID của thực thể"),
            OpenApiParameter('file_category', str, description="Phân loại tệp: IMAGE, CAD_DRAWING, SPEC_SHEET, CONTRACT, DOCUMENT, OTHER"),
        ]
    ),
    retrieve=extend_schema(tags=['Tệp Đính Kèm (Attachments)'], summary="Xem chi tiết thông tin tệp đính kèm"),
    create=extend_schema(tags=['Tệp Đính Kèm (Attachments)'], summary="Tải lên tệp đính kèm mới (Multipart Form-Data)"),
    update=extend_schema(tags=['Tệp Đính Kèm (Attachments)'], summary="Cập nhật ghi chú / phân loại tệp"),
    partial_update=extend_schema(tags=['Tệp Đính Kèm (Attachments)'], summary="Cập nhật một phần thông tin tệp"),
    destroy=extend_schema(tags=['Tệp Đính Kèm (Attachments)'], summary="Xóa tệp (xóa mềm)"),
)
class AttachmentViewSet(BaseERPViewSet):
    """
    ViewSet quản lý tệp đính kèm đa hình (Polymorphic Attachment Storage).
    Hỗ trợ upload ảnh, bản vẽ CAD, PDF, tài liệu Word/Excel cho bất kỳ thực thể nào trong hệ thống.
    """
    queryset = Attachment.objects.all().order_by('-updated_at', 'id')
    serializer_class = AttachmentSerializer
    # Quyền theo thực thể cha (xem apps/core/attachment_access.py)
    permission_classes = [AttachmentPermission]
    filterset_fields = ['entity_type', 'entity_id', 'file_category', 'is_active']
    search_fields = ['file_name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'file_size', 'file_name']

    def get_queryset(self):
        queryset = super().get_queryset()
        entity_type = self.request.query_params.get('entity_type')
        entity_id = self.request.query_params.get('entity_id')
        if entity_type:
            queryset = queryset.filter(entity_type__iexact=entity_type)
        if entity_id:
            queryset = queryset.filter(entity_id=entity_id)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return success_response(
            data=serializer.data,
            message=_("Tải lên tệp đính kèm thành công"),
            status_code=status.HTTP_201_CREATED
        )

    @extend_schema(tags=['Tệp Đính Kèm (Attachments)'], summary="Xóa vĩnh viễn tệp đính kèm khỏi hệ thống (Hard Delete)")
    @action(detail=True, methods=['delete'], url_path='hard-delete')
    def hard_delete(self, request, pk=None):
        """Xóa vĩnh viễn file vật lý và bản ghi khỏi cơ sở dữ liệu."""
        try:
            attachment = Attachment.all_objects.get(pk=pk)
        except Attachment.DoesNotExist:
            return error_response(message=_("Không tìm thấy tệp đính kèm"), status_code=status.HTTP_404_NOT_FOUND)

        self.check_object_permissions(request, attachment)

        file_name = attachment.file_name
        # Xóa file vật lý khỏi media storage nếu có
        if attachment.file:
            attachment.file.delete(save=False)
        attachment.delete()

        return success_response(message=_("Đã xóa vĩnh viễn tệp '%(name)s' thành công.") % {"name": file_name})

    @extend_schema(tags=['Tệp Đính Kèm (Attachments)'], summary="Tải nội dung tệp qua link có chữ ký (hết hạn sau 1 giờ)")
    @action(detail=True, methods=['get'], url_path='file', authentication_classes=[])
    def file(self, request, pk=None):
        """Link lấy từ `file_url` (đã kiểm tra quyền khi sinh link) — dùng được cho <img>, xem trước, tải xuống."""
        if not verify_file_signature(pk, request.query_params.get('sig')):
            raise BusinessError(_("Link tệp không hợp lệ hoặc đã hết hạn. Vui lòng tải lại trang."))
        attachment = Attachment.objects.filter(pk=pk).first()
        if attachment is None or not attachment.file:
            from rest_framework.exceptions import NotFound
            raise NotFound(_("Không tìm thấy tệp."))
        content_type = attachment.mime_type or mimetypes.guess_type(attachment.file_name)[0] or 'application/octet-stream'
        response = FileResponse(attachment.file.open('rb'), content_type=content_type)
        response['Content-Disposition'] = f'inline; filename="{attachment.file_name}"'
        response['Cache-Control'] = 'private, max-age=300'
        response['X-Content-Type-Options'] = 'nosniff'
        return response
