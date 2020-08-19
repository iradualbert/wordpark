from django.urls import path
from knox import views as knox_views
from . import views

urlpatterns = [
    path('api/auth/user', views.UserAPI.as_view()),
    path('api/auth/register', views.RegisterAPI.as_view()),
    path('api/auth/login', views.LoginAPI.as_view()),
    path('api/auth/logout', knox_views.LogoutView.as_view(), name='knox_logout'),
]