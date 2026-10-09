"""Quản lý tài khoản người dùng."""
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.db import transaction
from ..serializers import UserSerializer, UserCreateUpdateSerializer, is_admin_account
from ..services import UserService
from apps.core.permissions import ModulePermissionChecker, invalidate_user_permissions
from apps.core.viewsets import BaseERPViewSet
from apps.core.exceptions import BusinessError
from apps.core.responses import success_response
from django.utils.translation import gettext as _

User = get_user_model()


@extend_schema_view(
    list=extend_schema(tags=['Quản lý Tài khoản (Users)']),
    retrieve=extend_schema(tags=['Quản lý Tài khoản (Users)']),
    create=extend_schema(tags=['Quản lý Tài khoản (Users)']),
    update=extend_schema(tags=['Quản lý Tài khoản (Users)']),
    partial_update=extend_schema(tags=['Quản lý Tài khoản (Users)']),
    destroy=extend_schema(tags=['Quản lý Tài khoản (Users)']),
)
class UserViewSet(BaseERPViewSet):
    """
    ViewSet Quản lý Tài khoản Người dùng (Kế thừa BaseERPViewSet: hỗ trợ Soft Delete, Trash, Restore, Pagination, Filtering).
    """
    # CustomUser dùng UserManager của Django (không lọc xóa mềm) -> phải loại bản ghi đã xóa ở đây
    queryset = User.objects.filter(deleted_at__isnull=True).prefetch_related('roles').order_by('-updated_at', 'id')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, ModulePermissionChecker]
    permission_module = 'USER'
    write_serializer_class = UserCreateUpdateSerializer
    filterset_fields = {
        'is_active': ['exact'],
        'is_superuser': ['exact'],
        'username': ['icontains'],
        'full_name': ['icontains'],
        'email': ['icontains'],
        'phone_number': ['icontains'],
        'last_login': ['date__gte', 'date__lte'],
        'created_at': ['date__gte', 'date__lte'],
        'updated_at': ['date__gte', 'date__lte'],
    }
    search_fields = ['username', 'full_name', 'email', 'phone_number']
    ordering_fields = ['created_at', 'updated_at', 'username', 'full_name', 'last_login']

    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        if role and role != 'all':
            queryset = queryset.filter(roles__role_code=role)
        # Lọc theo cột "Vai trò": roles__in=1,2 (M2M -> tự tách chuỗi, distinct tránh trùng dòng)
        role_ids = [int(x) for x in self.request.query_params.get('roles__in', '').split(',') if x.strip().isdigit()]
        if role_ids:
            queryset = queryset.filter(roles__id__in=role_ids).distinct()
        return queryset

    @staticmethod
    def is_protected_admin(user) -> bool:
        return is_admin_account(user)

    def check_can_destroy(self, instance):
        if instance.id == self.request.user.id:
            raise BusinessError(_("Bạn không thể tự xóa tài khoản đang đăng nhập của chính mình."))
        if self.is_protected_admin(instance):
            raise BusinessError(_("Không thể xóa tài khoản Quản trị viên (Superadmin / Admin)."))

    def check_can_change_status(self, instance, is_active: bool):
        if is_active:
            return
        if instance.id == self.request.user.id:
            raise BusinessError(_("Bạn không thể tự khóa tài khoản đang đăng nhập của chính mình."))
        if self.is_protected_admin(instance):
            raise BusinessError(_("Không thể khóa tài khoản Quản trị viên (Superadmin / Admin)."))

    def after_write(self, instance=None):
        invalidate_user_permissions(instance.id if instance is not None else None)

    def get_statistics(self, queryset) -> dict:
        return UserService.get_statistics()

    @extend_schema(tags=['Quản lý Tài khoản (Users)'], summary="Nhập danh sách người dùng từ dữ liệu hoặc file Excel")
    @action(detail=False, methods=['post'], url_path='import-excel')
    def import_excel(self, request):
        """API Nhập danh sách tài khoản từ file Excel hoặc từ mảng JSON đã parse."""
        rows = request.data.get('rows', [])
        file_obj = request.FILES.get('file')

        if file_obj:
            from apps.core.excel_service import ExcelService
            rows = ExcelService.read_excel_file(file_obj)

        if not isinstance(rows, list) or len(rows) == 0:
            raise ValidationError({'rows': [_("Không tìm thấy dòng dữ liệu nào để nhập.")]})

        success_users = []
        errors = []
        seen_usernames = set()
        seen_emails = set()

        for idx, row in enumerate(rows, start=2):
            username = str(row.get('username') or row.get('Tên đăng nhập') or '').strip()
            email = str(row.get('email') or row.get('Email') or '').strip()
            full_name = str(row.get('full_name') or row.get('Họ và tên') or '').strip()
            phone = str(row.get('phone_number') or row.get('Số điện thoại') or '').strip()
            password = str(row.get('password') or row.get('Mật khẩu') or '').strip()

            if not username:
                errors.append(_("Dòng %(row)s: Thiếu 'Tên đăng nhập'") % {"row": idx})
                continue
            if not email:
                errors.append(_("Dòng %(row)s: Thiếu 'Email'") % {"row": idx})
                continue
            if len(password) < 8:
                errors.append(_("Dòng %(row)s: Thiếu 'Mật khẩu' hoặc mật khẩu dưới 8 ký tự") % {"row": idx})
                continue

            if username in seen_usernames:
                errors.append(_("Dòng %(row)s: Tên đăng nhập '%(username)s' bị trùng lặp trong file") % {"row": idx, "username": username})
                continue
            seen_usernames.add(username)

            if email in seen_emails:
                errors.append(_("Dòng %(row)s: Email '%(email)s' bị trùng lặp trong file") % {"row": idx, "email": email})
                continue
            seen_emails.add(email)

            if User.objects.filter(username=username).exists():
                errors.append(_("Dòng %(row)s: Tên đăng nhập '%(username)s' đã tồn tại trên hệ thống") % {"row": idx, "username": username})
                continue

            if User.objects.filter(email=email).exists():
                errors.append(_("Dòng %(row)s: Email '%(email)s' đã tồn tại trên hệ thống") % {"row": idx, "email": email})
                continue

            success_users.append({
                'username': username,
                'email': email,
                'full_name': full_name,
                'phone_number': phone,
                'password': password,
            })

        if len(success_users) == 0:
            raise ValidationError({'rows': errors or [_("Không thể nhập dữ liệu. Tất cả các dòng đều chứa lỗi!")]})

        with transaction.atomic():
            created_objs = []
            for item in success_users:
                u = User(
                    username=item['username'],
                    email=item['email'],
                    full_name=item['full_name'],
                    phone_number=item['phone_number'],
                    is_active=True,
                )
                u.set_password(item['password'])
                u.save()
                created_objs.append(u)

        invalidate_user_permissions()

        return success_response(
            data={
                "count": len(created_objs),
                "errors": errors,
            },
            message=_("Đã nhập thành công %(count)s tài khoản người dùng!") % {"count": len(created_objs)}
            + ((" " + _("(%(count)s dòng lỗi bị bỏ qua)") % {"count": len(errors)}) if errors else "")
        )
