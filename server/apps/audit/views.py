from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from django.db.models import Q
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
import pghistory.models

from apps.core.pagination import StandardResultsSetPagination
from apps.core.permissions import ModulePermissionChecker
from apps.core.responses import success_response
from django.utils.translation import gettext as _

from apps.authentication.serializers import ACTION_NAME_MAP
from .serializers import AuditLogEventSerializer, MODEL_LABEL_MAP, action_label

@extend_schema(tags=['Nhật Ký Thao Tác (Audit Logs)'])
@extend_schema_view(retrieve=extend_schema(parameters=[OpenApiParameter('id', str, OpenApiParameter.PATH)]))
class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet cung cấp danh sách và chi tiết các sự kiện thay đổi dữ liệu (Audit Logs)
    được ghi lại tự động bởi PostgreSQL Triggers qua django-pghistory.
    """
    serializer_class = AuditLogEventSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated, ModulePermissionChecker]
    permission_module = 'AUDIT_LOGS'
    custom_action_permissions = {'options': 'AUDIT_LOGS_READ'}

    def get_queryset(self):
        queryset = pghistory.models.Events.objects.all().order_by('-pgh_created_at')

        # Lọc theo model gốc (e.g. authentication.customuser, master_data.unitofmeasure)
        model_param = self.request.query_params.get('model')
        if model_param:
            queryset = queryset.filter(pgh_obj_model__iexact=model_param)

        # Lọc theo loại thao tác (tương thích chuẩn RBAC: CREATE, UPDATE, DELETE, APPROVE...)
        action_param = self.request.query_params.get('action')
        if action_param:
            act_upper = action_param.upper()
            if act_upper in ['CREATE', 'INSERT']:
                queryset = queryset.filter(pgh_label__in=['insert', 'create', 'CREATE'])
            elif act_upper == 'UPDATE':
                queryset = queryset.filter(pgh_label__in=['update', 'UPDATE']).exclude(pgh_diff__has_key='deleted_at')
            elif act_upper in ['DELETE', 'DESTROY']:
                queryset = queryset.filter(
                    Q(pgh_label__in=['delete', 'DELETE']) |
                    Q(pgh_diff__has_key='deleted_at')
                )
            elif act_upper == 'APPROVE':
                queryset = queryset.filter(
                    Q(pgh_label__iexact='approve') |
                    Q(pgh_context__rbac_action__iexact='APPROVE')
                )
            elif act_upper == 'RELEASE':
                queryset = queryset.filter(
                    Q(pgh_label__iexact='release') |
                    Q(pgh_context__rbac_action__iexact='RELEASE')
                )
            elif act_upper == 'EXECUTE':
                queryset = queryset.filter(
                    Q(pgh_label__iexact='execute') |
                    Q(pgh_context__rbac_action__iexact='EXECUTE')
                )
            elif act_upper == 'EXPORT':
                queryset = queryset.filter(
                    Q(pgh_label__iexact='export') |
                    Q(pgh_context__rbac_action__iexact='EXPORT')
                )
            elif act_upper == 'IMPORT':
                queryset = queryset.filter(
                    Q(pgh_label__iexact='import') |
                    Q(pgh_context__rbac_action__iexact='IMPORT')
                )
            elif act_upper == 'CONFIG':
                queryset = queryset.filter(
                    Q(pgh_label__iexact='config') |
                    Q(pgh_context__rbac_action__iexact='CONFIG')
                )
            elif act_upper == 'VIEW':
                queryset = queryset.filter(
                    Q(pgh_label__iexact='view') |
                    Q(pgh_context__rbac_action__iexact='VIEW')
                )
            elif act_upper == 'READ':
                queryset = queryset.filter(
                    Q(pgh_label__iexact='read') |
                    Q(pgh_context__rbac_action__iexact='READ')
                )
            elif act_upper == 'SNAPSHOT':
                queryset = queryset.filter(pgh_label__iexact='snapshot')
            else:
                queryset = queryset.filter(pgh_label__iexact=action_param)

        # Lọc theo ID đối tượng cụ thể
        object_id = self.request.query_params.get('object_id')
        if object_id:
            queryset = queryset.filter(pgh_obj_id=object_id)

        # Lọc theo khoảng ngày (ISO: YYYY-MM-DD)
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(pgh_created_at__date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(pgh_created_at__date__lte=date_to)

        # Tìm kiếm theo từ khóa
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(pgh_obj_model__icontains=search) |
                Q(pgh_label__icontains=search) |
                Q(pgh_slug__icontains=search)
            )

        # Lọc theo người dùng thực hiện (ID hoặc username/full_name)
        user_param = self.request.query_params.get('user')
        if user_param:
            if str(user_param).isdigit():
                queryset = queryset.filter(
                    Q(pgh_context__user_id=int(user_param)) |
                    Q(pgh_context__user=int(user_param))
                )
            else:
                queryset = queryset.filter(
                    Q(pgh_context__username__iexact=user_param) |
                    Q(pgh_context__full_name__icontains=user_param)
                )

        # Sắp xếp theo cột (Sorting per columns)
        ordering_param = self.request.query_params.get('ordering')
        if ordering_param:
            FIELD_MAPPING = {
                'created_at': 'pgh_created_at',
                '-created_at': '-pgh_created_at',
                'object_id': 'pgh_obj_id',
                '-object_id': '-pgh_obj_id',
                'model_name': 'pgh_obj_model',
                '-model_name': '-pgh_obj_model',
                'action_code': 'pgh_label',
                '-action_code': '-pgh_label',
            }
            db_field = FIELD_MAPPING.get(ordering_param, ordering_param)
            queryset = queryset.order_by(db_field)

        return queryset

    @action(detail=False, methods=['get'], url_path='options')
    def options(self, request):
        """
        API trả về danh sách các Models và Actions cố định có trong hệ thống để làm dropdown filter trên giao diện.
        Toàn bộ Actions được đồng bộ hóa chuẩn xác theo danh mục RBAC của hệ thống.
        Danh sách Users được phục vụ độc lập qua API Users riêng (/api/v1/users/) để hỗ trợ phân trang và tìm kiếm.
        """
        AUDIT_ACTION_ORDER = {
            'CREATE': 1,
            'UPDATE': 2,
            'DELETE': 3,
            'APPROVE': 4,
            'RELEASE': 5,
            'EXECUTE': 6,
            'EXPORT': 7,
            'IMPORT': 8,
            'CONFIG': 9,
            'VIEW': 10,
            'READ': 11,
        }

        tracked_models = [
            {'value': key, 'label': str(label)}
            for key, label in MODEL_LABEL_MAP.items()
        ]

        action_items = [
            {'value': key, 'label': action_label(key)}
            for key in ACTION_NAME_MAP
        ]
        action_items.sort(key=lambda x: AUDIT_ACTION_ORDER.get(x['value'], 99))

        return success_response(
            data={
                'models': tracked_models,
                'actions': action_items,
            },
            message=_("Lấy danh mục tùy chọn lọc thành công")
        )
