from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import __Model__ViewSet

router = DefaultRouter()
router.register(r'__resource__', __Model__ViewSet, basename='__basename__')

urlpatterns = [
    path('', include(router.urls)),
]
