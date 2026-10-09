from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Role, Permission, UserRole, RolePermission

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'full_name', 'email', 'phone_number', 'is_active', 'is_staff', 'is_superuser')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'roles')
    search_fields = ('username', 'full_name', 'email', 'phone_number')
    ordering = ('-updated_at', 'id')

    fieldsets = UserAdmin.fieldsets + (
        ('Thông tin bổ sung ERP', {
            'fields': ('full_name', 'phone_number', 'avatar', 'description')
        }),
    )

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('role_code', 'role_name', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('role_code', 'role_name', 'description')
    ordering = ('-updated_at', 'id')

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('permission_code', 'permission_name', 'module', 'created_at')
    list_filter = ('module',)
    search_fields = ('permission_code', 'permission_name', 'description')
    ordering = ('module', 'permission_code')

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'created_by', 'created_at')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__full_name', 'role__role_code')

@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ('role', 'permission', 'created_at')
    list_filter = ('role', 'permission__module')
    search_fields = ('role__role_code', 'permission__permission_code')
