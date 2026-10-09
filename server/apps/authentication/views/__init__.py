"""Views của app authentication, tách theo nhóm chức năng."""
from .auth import CustomTokenObtainPairView, UserProfileView, ChangePasswordView, LogoutView
from .rbac import PermissionViewSet, RoleViewSet
from .modules import ModuleRegistryViewSet
from .users import UserViewSet

__all__ = [
    "CustomTokenObtainPairView", "UserProfileView", "ChangePasswordView", "LogoutView",
    "PermissionViewSet", "RoleViewSet", "ModuleRegistryViewSet", "UserViewSet",
]
