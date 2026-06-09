from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from . import profile_views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='auth_register'),
    path('login/', views.LoginView.as_view(), name='auth_login'),
    path('logout/', views.LogoutView.as_view(), name='auth_logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('me/', views.MeView.as_view(), name='auth_me'),
    path('google/', views.GoogleOAuthView.as_view(), name='auth_google'),
    path('profile/', profile_views.ProfileView.as_view(), name='auth_profile'),
    path('change-password/', profile_views.ChangePasswordView.as_view(), name='auth_change_password'),
    path('password/forgot/', views.ForgotPasswordView.as_view(), name='auth_password_forgot'),
    path('password/reset/', views.ResetPasswordView.as_view(), name='auth_password_reset'),
    path('otp/send/', views.SendOTPView.as_view(), name='auth_otp_send'),
]
