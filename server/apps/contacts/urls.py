from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ContactViewSet
from .views_public import PublicContactViewSet

router = DefaultRouter()
router.register(r'public/contacts', PublicContactViewSet, basename='public-contact')
router.register(r'contacts', ContactViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
]
