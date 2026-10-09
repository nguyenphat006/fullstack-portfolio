import pghistory
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from apps.core.models import AuditModel, TimeStampedModel, SoftDeleteModel

@pghistory.track(
    pghistory.InsertEvent(),
    pghistory.UpdateEvent(),
    pghistory.DeleteEvent(),
)
class Role(AuditModel):
    """
    0.2 Danh mục Vai trò / Chức danh Hệ thống (Bảng Roles theo database.dbml).
    Ví dụ: ADMIN, CHIEF_ENGINEER, BOM_DESIGNER, PRODUCTION_PLANNER, WORKSHOP_SUPERVISOR, WAREHOUSE_KEEPER.
    """
    role_code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_("Mã vai trò")
    )
    role_name = models.CharField(
        max_length=255,
        verbose_name=_("Tên hiển thị vai trò")
    )

    class Meta:
        db_table = "Roles"
        verbose_name = _("Vai trò người dùng")
        verbose_name_plural = _("Danh mục Vai trò người dùng")
        ordering = ['-updated_at', 'id']
        indexes = [
            models.Index(fields=['-updated_at', 'id']),
            models.Index(fields=['role_code']),
        ]

    def __str__(self):
        return f"{self.role_name} ({self.role_code})"


class Permission(models.Model):
    """
    0.3 Danh mục Quyền hạn Chi tiết (Bảng Permissions theo database.dbml).
    Ví dụ: BOM_CREATE, BOM_APPROVE, FINISH_APPROVE, WO_RELEASE, MATERIAL_EXPORT, VIEW_COST_PRICE.
    """
    permission_code = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_("Mã quyền hạn")
    )
    permission_name = models.CharField(
        max_length=255,
        verbose_name=_("Tên quyền hạn")
    )
    module = models.CharField(
        max_length=50,
        verbose_name=_("Thuộc phân hệ")
    )
    description = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("Mô tả chi tiết quyền hạn")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Thời điểm tạo")
    )

    class Meta:
        db_table = "Permissions"
        verbose_name = _("Quyền hạn chi tiết")
        verbose_name_plural = _("Danh mục Quyền hạn chi tiết")
        ordering = ['module', 'permission_code']
        indexes = [
            models.Index(fields=['module', 'permission_code']),
        ]

    def __str__(self):
        return f"[{self.module}] {self.permission_name} ({self.permission_code})"


@pghistory.track(
    pghistory.InsertEvent(),
    pghistory.UpdateEvent(),
    pghistory.DeleteEvent(),
)
class ModuleRegistry(TimeStampedModel):
    """
    0.6 Danh mục Phân hệ & Cấu hình Điều hướng Navigation (Bảng ModuleRegistries theo database.dbml).
    Quản lý metadata của từng Module: Icon, Route, Cây phân cấp Parent-Child, thứ tự trên Sidebar.
    """
    module_code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_("Mã phân hệ")
    )
    module_name = models.CharField(
        max_length=255,
        verbose_name=_("Tên hiển thị phân hệ")
    )
    module_name_en = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name=_("Tên hiển thị tiếng Anh")
    )
    icon = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name=_("Khóa icon (constants/iconMap)")
    )
    route_path = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name=_("Đường dẫn Route Frontend")
    )
    parent_code = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name=_("Mã phân hệ cha")
    )
    sort_order = models.IntegerField(
        default=0,
        verbose_name=_("Thứ tự hiển thị trên Sidebar")
    )
    is_navigation = models.BooleanField(
        default=True,
        verbose_name=_("Hiển thị trên Sidebar")
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Trạng thái kích hoạt")
    )
    description = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("Mô tả phạm vi phân hệ")
    )
    description_en = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("Mô tả tiếng Anh")
    )

    class Meta:
        db_table = "ModuleRegistries"
        verbose_name = _("Cấu hình Phân hệ & Điều hướng")
        verbose_name_plural = _("Danh mục Cấu hình Phân hệ & Điều hướng")
        ordering = ['sort_order', 'id']
        indexes = [
            models.Index(fields=['sort_order', 'id']),
            models.Index(fields=['module_code']),
            models.Index(fields=['parent_code']),
        ]

    def __str__(self):
        return f"{self.module_name} ({self.module_code})"

    def localized_name(self, lang: str | None = None) -> str:
        """Tên theo ngôn ngữ đang dùng (mặc định ngôn ngữ của request); thiếu bản tiếng Anh -> tiếng Việt."""
        from django.utils import translation
        lang = lang or translation.get_language() or 'vi'
        return (self.module_name_en or self.module_name) if lang.startswith('en') else self.module_name

    def localized_description(self, lang: str | None = None) -> str | None:
        from django.utils import translation
        lang = lang or translation.get_language() or 'vi'
        return (self.description_en or self.description) if lang.startswith('en') else self.description


@pghistory.track(
    pghistory.InsertEvent(),
    pghistory.UpdateEvent(),
    pghistory.DeleteEvent(),
    exclude=['password'],
)
class CustomUser(AbstractUser, SoftDeleteModel):
    """
    0.1 Tài khoản Đăng nhập & Xác thực Hệ thống (Bảng Users theo database.dbml).
    Quản lý thông tin định danh, bảo mật tài khoản, quyền hạn RBAC.
    """
    full_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_("Họ và tên hiển thị")
    )
    phone_number = models.CharField(
        max_length=30,
        blank=True,
        null=True,
        verbose_name=_("Số điện thoại liên hệ")
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        verbose_name=_("Ảnh đại diện")
    )
    description = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("Ghi chú tài khoản")
    )
    
    # Quan hệ N-N với Roles qua bảng trung gian UserRoles
    roles = models.ManyToManyField(
        Role,
        through='UserRole',
        through_fields=('user', 'role'),
        related_name='users',
        blank=True,
        verbose_name=_("Các vai trò đảm nhiệm")
    )
    
    # Tự động ghi nhận thời gian
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Thời điểm tạo")
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Thời điểm cập nhật gần nhất")
    )

    class Meta:
        db_table = "Users"
        verbose_name = _("Tài khoản Người dùng")
        verbose_name_plural = _("Danh sách Tài khoản Người dùng")
        ordering = ['-updated_at', 'id']
        indexes = [
            models.Index(fields=['-updated_at', 'id']),
            models.Index(fields=['username']),
            models.Index(fields=['email']),
        ]

    def save(self, *args, **kwargs):
        # Tự động đồng bộ full_name nếu chưa nhập
        if not self.full_name and (self.first_name or self.last_name):
            self.full_name = f"{self.last_name} {self.first_name}".strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} - {self.full_name or self.email}"


class UserRole(models.Model):
    """
    0.4 Bảng trung gian Gán Vai trò cho Người dùng (Bảng UserRoles theo database.dbml).
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_role_assignments",
        verbose_name=_("Người dùng")
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="user_role_assignments",
        verbose_name=_("Vai trò")
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_user_roles",
        verbose_name=_("Người phân quyền")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Thời điểm gán vai trò")
    )

    class Meta:
        db_table = "UserRoles"
        verbose_name = _("Phân quyền Người dùng - Vai trò")
        verbose_name_plural = _("Danh sách Phân quyền Người dùng - Vai trò")
        unique_together = ('user', 'role')
        indexes = [
            models.Index(fields=['user', 'role']),
        ]

    def __str__(self):
        return f"User '{self.user.username}' -> Role '{self.role.role_code}'"


class RolePermission(models.Model):
    """
    0.5 Bảng trung gian Gán Quyền hạn cho Vai trò (Bảng RolePermissions theo database.dbml).
    """
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="role_permission_assignments",
        verbose_name=_("Vai trò")
    )
    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE,
        related_name="role_permission_assignments",
        verbose_name=_("Quyền hạn")
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Thời điểm gán quyền")
    )

    class Meta:
        db_table = "RolePermissions"
        verbose_name = _("Phân quyền Vai trò - Quyền hạn")
        verbose_name_plural = _("Danh sách Phân quyền Vai trò - Quyền hạn")
        unique_together = ('role', 'permission')
        indexes = [
            models.Index(fields=['role', 'permission']),
        ]

    def __str__(self):
        return f"Role '{self.role.role_code}' -> Perm '{self.permission.permission_code}'"
