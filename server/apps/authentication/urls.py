from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserProfileView,
    UserViewSet,
    RoleViewSet,
    PermissionViewSet,
    ModuleRegistryViewSet,
    ChangePasswordView,
    LogoutView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'modules', ModuleRegistryViewSet, basename='module')

urlpatterns = [
    # Auth endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', UserProfileView.as_view(), name='user_me'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),

    # Users, Roles, Permissions, Modules CRUD endpoints
    path('', include(router.urls)),
]
