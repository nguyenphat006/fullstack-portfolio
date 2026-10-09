from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from drf_spectacular.utils import extend_schema_field
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import Role, Permission, UserRole, ModuleRegistry
from django.utils.translation import gettext_lazy as _, gettext_noop

User = get_user_model()

class PermissionSerializer(serializers.ModelSerializer):
    """Serializer hiển thị thông tin Quyền hạn chi tiết."""
    class Meta:
        model = Permission
        fields = [
            'id',
            'permission_code',
            'permission_name',
            'module',
            'description',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class RoleSerializer(serializers.ModelSerializer):
    """Serializer quản lý và hiển thị thông tin Vai trò (Role)."""
    permissions_count = serializers.SerializerMethodField()
    users_count = serializers.SerializerMethodField()
    permission_ids = serializers.SerializerMethodField()
    permission_codes = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)
    updated_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)

    class Meta:
        model = Role
        fields = [
            'id',
            'role_code',
            'role_name',
            'description',
            'is_active',
            'permissions_count',
            'users_count',
            'permission_ids',
            'permission_codes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_permissions_count(self, obj) -> int:
        if hasattr(obj, '_prefetched_objects_cache') and 'role_permission_assignments' in obj._prefetched_objects_cache:
            return len(obj.role_permission_assignments.all())
        return obj.role_permission_assignments.count()

    def get_users_count(self, obj) -> int:
        if hasattr(obj, '_prefetched_objects_cache') and 'user_role_assignments' in obj._prefetched_objects_cache:
            return len(obj.user_role_assignments.all())
        return obj.user_role_assignments.count()

    def get_permission_ids(self, obj) -> list[int]:
        if hasattr(obj, '_prefetched_objects_cache') and 'role_permission_assignments' in obj._prefetched_objects_cache:
            return [a.permission_id for a in obj.role_permission_assignments.all()]
        return list(obj.role_permission_assignments.values_list('permission_id', flat=True))

    def get_permission_codes(self, obj) -> list[str]:
        if hasattr(obj, '_prefetched_objects_cache') and 'role_permission_assignments' in obj._prefetched_objects_cache:
            return [a.permission.permission_code for a in obj.role_permission_assignments.all() if getattr(a, 'permission', None)]
        return list(obj.role_permission_assignments.values_list('permission__permission_code', flat=True))


class RolePermissionAssignSerializer(serializers.Serializer):
    """Serializer nhận danh sách ID quyền gán cho Role."""
    permission_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True,
        help_text="Danh sách ID các quyền gán cho vai trò"
    )


class RoleMatrixBatchSerializer(serializers.Serializer):
    """Serializer nhận ma trận phân quyền hàng loạt cho nhiều Role."""
    matrix = serializers.DictField(
        child=serializers.ListField(child=serializers.IntegerField()),
        required=True,
        help_text="Map giữa Role ID và danh sách Permission IDs: { '1': [1, 2, 3], '2': [4, 5] }"
    )


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer xử lý đổi mật khẩu cho người dùng hiện tại."""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, min_length=6, write_only=True)
    confirm_password = serializers.CharField(required=True, min_length=6, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(_("Mật khẩu hiện tại không chính xác."))
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": _("Mật khẩu xác nhận không trùng khớp.")})
        if data['old_password'] == data['new_password']:
            raise serializers.ValidationError({"new_password": _("Mật khẩu mới không được trùng với mật khẩu cũ.")})
        return data

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer cho người dùng tự cập nhật thông tin cá nhân.
    Chỉ cho phép sửa: full_name, phone_number, avatar, description.
    """
    class Meta:
        model = User
        fields = ['full_name', 'phone_number', 'avatar', 'description']


class UserRoleSimpleSerializer(serializers.ModelSerializer):
    """
    Serializer tinh gọn hiển thị thông tin Vai trò (Role) trong danh sách người dùng.
    Không nhúng danh sách permission_ids / permission_codes để tối ưu payload.
    """
    class Meta:
        model = Role
        fields = ['id', 'role_code', 'role_name']


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer tinh gọn hiển thị danh sách Tài khoản Người dùng (Users).
    Gói gọn các thông tin chính yếu (id, username, họ tên, email, sđt, avatar, roles, trạng thái, ngày tạo/cập nhật),
    loại bỏ toàn bộ permissions để đảm bảo an toàn bảo mật, giảm tải payload và loại bỏ N+1 query.
    """
    name = serializers.CharField(source='full_name', read_only=True)
    roles = UserRoleSimpleSerializer(many=True, read_only=True)
    role_codes = serializers.SerializerMethodField()
    role_names = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)
    updated_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)
    last_login = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'name',
            'full_name',
            'email',
            'phone_number',
            'avatar',
            'is_active',
            'is_superuser',
            'roles',
            'role_codes',
            'role_names',
            'last_login',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login']

    def get_role_codes(self, obj) -> list[str]:
        # Tận dụng prefetched roles trong bộ nhớ tránh N+1 Query
        return [r.role_code for r in obj.roles.all()]

    def get_role_names(self, obj) -> str:
        return ", ".join([r.role_name for r in obj.roles.all()])


class CurrentUserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer hiển thị hồ sơ cá nhân và quyền hạn của chính người dùng đang đăng nhập (/auth/me/).
    Chỉ endpoint này mới cần permissions để frontend phân quyền giao diện (usePermission hook).
    """
    name = serializers.CharField(source='full_name', read_only=True)
    roles = UserRoleSimpleSerializer(many=True, read_only=True)
    role_codes = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)
    updated_at = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)
    last_login = serializers.DateTimeField(format="%d/%m/%Y %H:%M", read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'name',
            'full_name',
            'email',
            'phone_number',
            'avatar',
            'is_active',
            'is_superuser',
            'roles',
            'role_codes',
            'permissions',
            'last_login',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login']

    def get_role_codes(self, obj) -> list[str]:
        return [r.role_code for r in obj.roles.all()]

    def get_permissions(self, obj) -> list[str]:
        from .models import RolePermission, Permission
        if obj.is_superuser or obj.roles.filter(role_code='ADMIN').exists():
            perms = list(Permission.objects.values_list('permission_code', flat=True))
            if '*' not in perms:
                perms.append('*')
            return perms

        return list(RolePermission.objects.filter(
            role__users=obj, 
            role__is_active=True
        ).values_list('permission__permission_code', flat=True).distinct())


def is_admin_account(user) -> bool:
    """Tài khoản quản trị: superuser, username 'admin' hoặc đang giữ vai trò ADMIN."""
    return bool(user.is_superuser or user.username == 'admin' or user.roles.filter(role_code='ADMIN').exists())


class UserCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer tiếp nhận tạo mới hoặc cập nhật tài khoản người dùng từ Modal Form.
    """
    # Bắt buộc khi tạo mới (không còn mật khẩu mặc định); khi cập nhật: để trống = giữ nguyên
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=8)
    role_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="Danh sách ID của các Vai trò gán cho tài khoản"
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'full_name',
            'phone_number',
            'avatar',
            'is_active',
            'password',
            'description',
            'role_ids',
        ]
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
        }

    def validate(self, attrs):
        request = self.context.get('request')
        instance = getattr(self, 'instance', None)
        actor = request.user if request and request.user and request.user.is_authenticated else None
        actor_is_admin = bool(actor and is_admin_account(actor))

        # 0. Chỉ Quản trị viên mới được gán vai trò ADMIN (kiểm tra trước mọi quy tắc khác)
        role_ids = attrs.get('role_ids')
        if role_ids and not actor_is_admin and Role.objects.filter(id__in=role_ids, role_code='ADMIN').exists():
            raise PermissionDenied(_("Chỉ Quản trị viên mới được gán vai trò Quản trị viên (ADMIN)."))

        # 1. Kiểm tra tính duy nhất của email (không tính các tài khoản đã xóa mềm)
        email = attrs.get('email')
        if email:
            email_query = User.objects.filter(email__iexact=email, deleted_at__isnull=True)
            if instance:
                email_query = email_query.exclude(id=instance.id)
            if email_query.exists():
                raise serializers.ValidationError({"email": _("Địa chỉ email này đã được sử dụng bởi một tài khoản khác.")})

        if instance:
            # 2. Không cho phép đổi tên đăng nhập của tài khoản admin mặc định
            if instance.username == 'admin' and attrs.get('username') and attrs.get('username') != 'admin':
                raise serializers.ValidationError({
                    "username": _("Không thể thay đổi tên đăng nhập của tài khoản Quản trị viên mặc định 'admin'.")
                })

            # 3. Chống tự khóa tài khoản của chính mình
            is_active = attrs.get('is_active')
            if is_active is False and request and request.user and request.user.id == instance.id:
                raise serializers.ValidationError({
                    "is_active": _("Bạn không thể tự vô hiệu hóa tài khoản đang đăng nhập của chính mình.")
                })

            # 4. Bảo vệ tuyệt đối tài khoản Quản trị viên tối cao (Superadmin / Admin / username='admin')
            if is_admin_account(instance):
                if not actor_is_admin:
                    # Người không phải quản trị viên KHÔNG được sửa bất kỳ thông tin nào (kể cả mật khẩu) của admin
                    raise PermissionDenied(_("Chỉ Quản trị viên mới được chỉnh sửa tài khoản Quản trị viên."))
                if is_active is False:
                    raise serializers.ValidationError({
                        "is_active": _("Không thể vô hiệu hóa tài khoản Quản trị viên (Admin / Superadmin).")
                    })
                role_ids = attrs.get('role_ids')
                if role_ids is not None:
                    admin_role = Role.objects.filter(role_code='ADMIN').first()
                    if admin_role and admin_role.id not in role_ids:
                        raise serializers.ValidationError({
                            "role_ids": _("Không thể tước bỏ vai trò Quản trị viên (ADMIN) khỏi tài khoản này.")
                        })

            # 5. Không tự thay đổi vai trò của chính mình (chống tự nâng quyền)
            if actor and actor.id == instance.id and attrs.get('role_ids') is not None:
                current = set(instance.roles.values_list('id', flat=True))
                if set(attrs['role_ids']) != current:
                    raise serializers.ValidationError({"role_ids": _("Bạn không thể tự thay đổi vai trò của chính mình.")})
        else:
            if not attrs.get('password'):
                raise serializers.ValidationError({"password": _("Vui lòng đặt mật khẩu ban đầu cho tài khoản (tối thiểu 8 ký tự).")})

        return super().validate(attrs)

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        role_ids = validated_data.pop('role_ids', [])

        with transaction.atomic():
            user = User(**validated_data)
            user.set_password(password)  # validate() đã bắt buộc có mật khẩu khi tạo
            user.save()

            if role_ids:
                roles = Role.objects.filter(id__in=role_ids)
                user.roles.set(roles)

            return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        role_ids = validated_data.pop('role_ids', None)
        request = self.context.get('request')
        actor = getattr(request, 'user', None)
        old_role_ids = set(instance.roles.values_list('id', flat=True))

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            if password:
                instance.set_password(password)
            instance.save()

            if role_ids is not None:
                roles = Role.objects.filter(id__in=role_ids)
                instance.roles.set(roles)

        # Báo cho chủ tài khoản khi người khác đổi mật khẩu / vai trò của họ
        if actor and actor.pk != instance.pk:
            from apps.core.notifications import notify
            if password:
                notify(instance, str(_("Mật khẩu của bạn vừa được quản trị viên đặt lại")),
                       message=str(_("Thực hiện bởi %(actor)s. Nếu không phải bạn yêu cầu, hãy liên hệ quản trị viên.")) % {"actor": actor.full_name or actor.username},
                       level='WARNING', link='/profile', source=('USER', instance.pk), actor=actor)
            if role_ids is not None and set(role_ids) != old_role_ids:
                names = ", ".join(instance.roles.values_list('role_name', flat=True)) or str(_("không còn vai trò nào"))
                notify(instance, str(_("Vai trò của bạn đã thay đổi")), message=str(_("Vai trò hiện tại: %(names)s.")) % {"names": names},
                       level='INFO', link='/profile', source=('USER', instance.pk), actor=actor)
        return instance


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT Serializer trả về Access/Refresh Token kèm thông tin User Profile & Roles.
    """
    default_error_messages = {
        'no_active_account': _('Tên đăng nhập hoặc mật khẩu không chính xác, hoặc tài khoản đã bị ngưng hoạt động.')
    }

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Kiểm tra trạng thái tài khoản
        if not self.user.is_active or self.user.is_deleted:
            raise serializers.ValidationError({
                "detail": _("Tài khoản của bạn đã bị khóa hoặc ngưng hoạt động. Vui lòng liên hệ quản trị viên.")
            })

        roles = list(self.user.roles.values('id', 'role_code', 'role_name'))
        role_codes = [r['role_code'] for r in roles]
        is_admin_or_super = bool(self.user.is_superuser or 'ADMIN' in role_codes)
        
        from .models import RolePermission, Permission
        if is_admin_or_super:
            permissions = list(Permission.objects.values_list('permission_code', flat=True))
            if '*' not in permissions:
                permissions.append('*')
        else:
            permissions = list(RolePermission.objects.filter(
                role__users=self.user, 
                role__is_active=True
            ).values_list('permission__permission_code', flat=True).distinct())

        return {
            'tokens': {
                'access': data['access'],
                'refresh': data['refresh'],
            },
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'email': self.user.email,
                'full_name': self.user.full_name or self.user.username,
                'is_superuser': is_admin_or_super,
                'roles': roles,
                'role_codes': role_codes,
                'permissions': permissions,
                'avatar': self.user.avatar.url if self.user.avatar else None,
            }
        }


class ModuleRegistrySerializer(serializers.ModelSerializer):
    """
    Serializer CRUD cho ModuleRegistry metadata.
    """
    permissions = serializers.SerializerMethodField()
    permissions_count = serializers.SerializerMethodField()

    class Meta:
        model = ModuleRegistry
        fields = [
            'id',
            'module_code',
            'module_name',
            'module_name_en',
            'icon',
            'route_path',
            'parent_code',
            'sort_order',
            'is_navigation',
            'is_active',
            'description',
            'description_en',
            'permissions',
            'permissions_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'module_code', 'created_at', 'updated_at']

    @extend_schema_field(PermissionSerializer(many=True))
    def get_permissions(self, obj):
        all_perms_map = self.context.get('all_permissions_by_module')
        if all_perms_map is not None:
            return all_perms_map.get(obj.module_code, [])
        perms = Permission.objects.filter(module=obj.module_code).order_by('permission_code')
        return PermissionSerializer(perms, many=True).data

    def get_permissions_count(self, obj) -> int:
        all_perms_map = self.context.get('all_permissions_by_module')
        if all_perms_map is not None:
            return len(all_perms_map.get(obj.module_code, []))
        return Permission.objects.filter(module=obj.module_code).count()


# Tên hiển thị hành động: chuỗi thường (dùng đặt tên quyền lưu CSDL), đánh dấu gettext_noop để trích dịch;
# nơi hiển thị cho người dùng (nhật ký) dịch lúc render bằng gettext(ACTION_NAME_MAP[code]).
ACTION_NAME_MAP = {
    'VIEW': gettext_noop('Truy cập Màn hình'),
    'READ': gettext_noop('Xem Dữ liệu & Chi tiết'),
    'CREATE': gettext_noop('Tạo Mới Dữ liệu'),
    'UPDATE': gettext_noop('Chỉnh sửa & Cập nhật'),
    'DELETE': gettext_noop('Xóa Dữ liệu'),
    'APPROVE': gettext_noop('Phê Duyệt / Ban Hành'),
    'RELEASE': gettext_noop('Phát Hành Xuống Phân Xưởng'),
    'EXECUTE': gettext_noop('Ghi Nhận & Thực Thi'),
    'EXPORT': gettext_noop('Xuất Dữ liệu Ra File'),
    'IMPORT': gettext_noop('Nhập Dữ liệu Từ File'),
    'CONFIG': gettext_noop('Cấu hình Tham số Hệ thống'),
}


class ModuleCreateSerializer(serializers.ModelSerializer):
    """
    Serializer tạo Module mới, hỗ trợ nhận danh sách actions đã tick chọn để tự động tạo Permissions.
    """
    sort_order = serializers.IntegerField(required=False, default=0)
    actions = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        default=list,
        write_only=True,
        help_text="Danh sách action codes đã tick chọn (ví dụ: ['VIEW', 'READ', 'CREATE', 'UPDATE', 'DELETE'])"
    )

    class Meta:
        model = ModuleRegistry
        fields = [
            'id',
            'module_code',
            'module_name',
            'module_name_en',
            'icon',
            'route_path',
            'parent_code',
            'sort_order',
            'is_navigation',
            'is_active',
            'description',
            'description_en',
            'actions',
        ]

    def validate_module_code(self, value):
        code = value.strip().upper()
        if ModuleRegistry.objects.filter(module_code=code).exists():
            raise serializers.ValidationError(_("Mã phân hệ '%(code)s' đã tồn tại.") % {"code": code})
        return code

    def create(self, validated_data):
        actions = validated_data.pop('actions', [])
        module_code = validated_data['module_code']
        module_name = validated_data['module_name']

        # Tự động sinh sort_order nếu không truyền hoặc bằng 0
        if not validated_data.get('sort_order'):
            from django.db.models import Max
            max_order = ModuleRegistry.objects.aggregate(m=Max('sort_order'))['m'] or 0
            validated_data['sort_order'] = max_order + 10

        with transaction.atomic():
            module_instance = ModuleRegistry.objects.create(**validated_data)

            # Tự động tạo các permissions tương ứng với actions đã tick
            for act in actions:
                act_upper = act.strip().upper()
                perm_code = f"{module_code}_{act_upper}"
                action_display = ACTION_NAME_MAP.get(act_upper, act_upper)
                perm_name = f"{action_display} ({module_name})"
                
                Permission.objects.update_or_create(
                    permission_code=perm_code,
                    defaults={
                        'permission_name': perm_name,
                        'module': module_code,
                        'description': f"Quyền {action_display} thuộc phân hệ {module_name}"
                    }
                )

        return module_instance


class ModuleReorderSerializer(serializers.Serializer):
    """Serializer sắp xếp lại danh sách Module theo thứ tự IDs."""
    ordered_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        help_text="Danh sách ID các Module theo thứ tự mong muốn từ trên xuống dưới"
    )


class ModuleAddActionSerializer(serializers.Serializer):
    """Serializer thêm Action đơn lẻ vào module có sẵn."""
    action_code = serializers.CharField(max_length=50, help_text="Mã hành động, ví dụ 'APPROVE', 'EXPORT'")
    action_name = serializers.CharField(max_length=255, required=False, allow_blank=True, help_text="Tên hành động")
    description = serializers.CharField(required=False, allow_blank=True)


class NavigationItemSerializer(serializers.Serializer):
    """Serializer trả về cây Menu Navigation cho Sidebar."""
    key = serializers.CharField(source='route_path')
    code = serializers.CharField(source='module_code')
    label = serializers.CharField(source='module_name')
    icon = serializers.CharField(allow_null=True)
    parent_code = serializers.CharField(allow_null=True)
    sort_order = serializers.IntegerField()
    is_navigation = serializers.BooleanField()
    children = serializers.ListField(child=serializers.DictField(), default=list)

