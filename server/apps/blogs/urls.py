from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BlogViewSet
from .views_public import PublicBlogViewSet

router = DefaultRouter()
router.register(r'public/blogs', PublicBlogViewSet, basename='public-blog')
router.register(r'blogs', BlogViewSet, basename='blog')

urlpatterns = [
    path('', include(router.urls)),
]
