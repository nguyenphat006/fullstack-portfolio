import os
from django.conf import settings
from django.http import FileResponse, Http404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import DataTransferJob
from .exceptions import BusinessError
from .responses import success_response
from .serializers import DataTransferJobSerializer
from django.utils.translation import gettext as _


class DataTransferJobViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet quản lý các tác vụ nền (Background Tasks): Xuất/Nhập dữ liệu Excel/CSV.
    Cho phép kiểm tra tiến độ (% progress) và tải file kết quả về máy.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = DataTransferJobSerializer
    queryset = DataTransferJob.objects.all()

    def get_queryset(self):
        qs = super().get_queryset()
        # Chỉ người dùng tạo job hoặc superuser mới được xem job của mình
        if not self.request.user.is_superuser:
            qs = qs.filter(created_by=self.request.user)
        return qs.order_by('-created_at')

    @action(detail=True, methods=['get'], url_path='status')
    def job_status(self, request, pk=None):
        """API Polling: Kiểm tra trạng thái và % tiến độ của một tác vụ cụ thể."""
        return success_response(data=self.get_serializer(self.get_object()).data)

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        """API Tải file kết quả của tác vụ đã hoàn tất."""
        job = self.get_object()
        if job.status != 'COMPLETED' or not job.file_url:
            raise BusinessError(_("Tác vụ chưa hoàn tất hoặc file kết quả không tồn tại."))

        clean_path = job.file_url.replace(settings.MEDIA_URL, '').lstrip('/')
        absolute_path = os.path.join(settings.MEDIA_ROOT, clean_path)

        if not os.path.exists(absolute_path):
            raise Http404(_("File kết quả không tồn tại trên máy chủ."))

        filename = os.path.basename(absolute_path)
        content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        if filename.endswith('.csv'):
            content_type = 'text/csv'

        response = FileResponse(open(absolute_path, 'rb'), content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
