from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LandingSectionViewSet, PublicLandingView

router = DefaultRouter()
router.register(r'landing-sections', LandingSectionViewSet, basename='landing-section')

urlpatterns = [
    path('public/landing/', PublicLandingView.as_view(), name='public-landing'),
    path('', include(router.urls)),
]
