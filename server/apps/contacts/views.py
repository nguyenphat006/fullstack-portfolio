from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import permissions

from apps.core.permissions import ModulePermissionChecker
from apps.core.viewsets import BaseERPViewSet

from .models import Contact
from .serializers import ContactCreateUpdateSerializer, ContactSerializer

TAG = "Liên hệ"


@extend_schema_view(
    list=extend_schema(tags=[TAG], summary="Danh sách liên hệ"),
    retrieve=extend_schema(tags=[TAG], summary="Chi tiết liên hệ"),
    create=extend_schema(tags=[TAG], summary="Tạo mới liên hệ"),
    update=extend_schema(tags=[TAG], summary="Cập nhật liên hệ"),
    partial_update=extend_schema(tags=[TAG], summary="Cập nhật một phần liên hệ"),
    destroy=extend_schema(tags=[TAG], summary="Xóa mềm liên hệ"),
)
class ContactViewSet(BaseERPViewSet):
    """
    Liên hệ gửi từ form landing (API công khai nhận form sẽ bổ sung khi nối landing với backend).
    CRUD, statistics, batch-delete/status, export-excel có sẵn từ BaseERPViewSet.
    """
    queryset = Contact.objects.select_related('created_by', 'updated_by').order_by('-created_at', 'id')
    serializer_class = ContactSerializer
    write_serializer_class = ContactCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, ModulePermissionChecker]
    permission_module = 'CONTACT'
    filterset_fields = {
        'is_active': ['exact'],
        'name': ['icontains'],
        'email': ['icontains'],
        'created_at': ['date__gte', 'date__lte'],
    }
    search_fields = ['name', 'email', 'message', 'description']
    ordering_fields = ['created_at', 'updated_at', 'name', 'email']
