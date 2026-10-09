"""
URL configuration for Admin Template project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

# Nhóm các API router phiên bản v1
api_v1_patterns = [
    path('', include('apps.core.urls')),
    path('', include('apps.authentication.urls')),
    path('', include('apps.audit.urls')),
    path('', include('apps.dashboard.urls')),
    path('', include('apps.projects.urls')),
    path('', include('apps.blogs.urls')),
    path('', include('apps.contacts.urls')),
    # [startmodule] app mới được chèn phía trên dòng này
]

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # Master API v1
    path('api/v1/', include(api_v1_patterns)),

    # OpenAPI 3.0 & Swagger UI Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Phục vụ file tĩnh và upload media khi chạy dev
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
