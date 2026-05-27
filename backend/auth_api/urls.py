from django.urls import path
from . import views
from . import profile_views

urlpatterns = [
    path('register/', views.register_view, name='auth_register'),
    path('login/', views.login_view, name='auth_login'),
    path('logout/', views.logout_view, name='auth_logout'),
    path('token/refresh/', views.token_refresh_view, name='auth_token_refresh'),
    path('me/', views.me_view, name='auth_me'),
    path('google/', views.google_oauth_view, name='auth_google'),
    path('profile/', profile_views.profile_view, name='auth_profile'),
    path('change-password/', profile_views.change_password_view, name='auth_change_password'),
]
