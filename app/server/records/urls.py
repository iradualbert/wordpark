from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('api/lists', views.ListViewSet)
router.register('api/words', views.WordViewSet)

urlpatterns = [
    path('', include(router.urls)),
]