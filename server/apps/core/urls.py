from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_attachment import AttachmentViewSet
from .views_jobs import DataTransferJobViewSet
from .views_health import HealthCheckView
from .views_notifications import NotificationViewSet
from .views_search import GlobalSearchView
from .views_settings import SystemLogoView, SystemSettingsPublicView, SystemSettingsView

router = DefaultRouter()
router.register(r'attachments', AttachmentViewSet, basename='attachment')
router.register(r'jobs', DataTransferJobViewSet, basename='job')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health'),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('system-settings/public/', SystemSettingsPublicView.as_view(), name='system-settings-public'),
    path('system-settings/', SystemSettingsView.as_view(), name='system-settings'),
    path('system-settings/logo/', SystemLogoView.as_view(), name='system-settings-logo'),
    path('', include(router.urls)),
]
