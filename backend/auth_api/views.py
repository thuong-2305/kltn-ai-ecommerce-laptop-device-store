from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from .models import OTPVerification
from .serializers import (
    UserRegisterSerializer, UserSerializer, ForgotPasswordSerializer,
    ResetPasswordSerializer, SendOTPSerializer
)
from shared.utils import format_serializer_error

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        
        return format_serializer_error(serializer)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username_or_email or not password:
            return Response({'error': 'Vui lòng nhập tên đăng nhập/email và mật khẩu'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate by email or username
        user = None
        if '@' in username_or_email:
            try:
                user = User.objects.get(email=username_or_email.lower())
            except User.DoesNotExist:
                pass
        else:
            try:
                user = User.objects.get(username=username_or_email)
            except User.DoesNotExist:
                pass

        if user is None or not user.check_password(password):
            return Response({'error': 'Tên đăng nhập hoặc mật khẩu không đúng'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'error': 'Tài khoản đã bị khóa'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh', '')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Đăng xuất thành công'}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'error': 'Refresh token không hợp lệ hoặc đã hết hạn'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'user': UserSerializer(request.user).data})


class GoogleOAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        id_token_str = request.data.get('id_token', '')
        if not id_token_str:
            return Response({'error': 'Thiếu Google id_token'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from google.oauth2 import id_token as google_id_token
            from google.auth.transport import requests as google_requests
            from django.conf import settings

            client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
            if not client_id:
                return Response({'error': 'Google OAuth chưa được cấu hình trên server'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            idinfo = google_id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                client_id,
            )

            email = idinfo.get('email', '').lower()
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')

            if not email:
                return Response({'error': 'Không lấy được email từ Google'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(email=email)
                created = False
            except User.DoesNotExist:
                base_username = email.split('@')[0]
                username = base_username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1

                user = User.objects.create(
                    email=email,
                    username=username,
                    first_name=first_name,
                    last_name=last_name
                )
                user.set_unusable_password()
                user.save()
                created = True

            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'created': created
            }, status=status.HTTP_200_OK)

        except ImportError:
            return Response({'error': 'Thư viện google-auth chưa được cài đặt trên server'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except ValueError as e:
            return Response({'error': f'Token Google không hợp lệ: {str(e)}'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            from django.conf import settings
            
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            reset_url = f"{frontend_url}/reset-password?token={token}&email={email}"
            
            subject = "Yêu cầu khôi phục mật khẩu"
            message = f"Xin chào,\n\nBạn nhận được email này vì đã yêu cầu khôi phục mật khẩu cho tài khoản của mình. Vui lòng truy cập liên kết sau để đặt lại mật khẩu của bạn:\n\n{reset_url}\n\nLiên kết này sẽ hết hạn sau khi sử dụng hoặc sau khi yêu cầu mới được tạo."
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
            except Exception as e:
                return Response({'error': f'Không thể gửi email khôi phục mật khẩu: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({'message': 'Mã reset mật khẩu đã được gửi đến email của bạn.'}, status=status.HTTP_200_OK)
        
        return format_serializer_error(serializer)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({'error': 'Người dùng không tồn tại.'}, status=status.HTTP_400_BAD_REQUEST)

            if not default_token_generator.check_token(user, token):
                return Response({'error': 'Mã xác nhận không hợp lệ hoặc đã hết hạn.'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            return Response({'message': 'Mật khẩu đã được thay đổi thành công.'}, status=status.HTTP_200_OK)
        
        return format_serializer_error(serializer)


class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']

            # Rate limiting check: Limit to at most 1 OTP per 60 seconds
            from django.utils import timezone
            from datetime import timedelta
            try:
                existing = OTPVerification.objects.get(email=email)
                if timezone.now() < existing.created_at + timedelta(seconds=60):
                    return Response(
                        {'error': 'Vui lòng đợi 60 giây trước khi yêu cầu mã OTP mới.'},
                        status=status.HTTP_429_TOO_MANY_REQUESTS
                    )
            except OTPVerification.DoesNotExist:
                pass

            import secrets
            import hashlib

            # Secure random generation using CSPRNG
            otp = f"{secrets.SystemRandom().randint(100000, 999999)}"
            hashed_otp = hashlib.sha256(otp.encode('utf-8')).hexdigest()

            # Upsert OTP Verification record
            OTPVerification.objects.update_or_create(
                email=email,
                defaults={'otp': hashed_otp, 'attempts': 0}
            )

            # Send Email
            subject = "Mã xác thực OTP đăng ký tài khoản"
            message = f"Mã OTP của bạn là: {otp}. Mã này sẽ hết hạn sau 5 phút."
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                
                response_data = {'message': 'Mã OTP đã được gửi đến email của bạn.'}
                return Response(response_data, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({'error': f'Không thể gửi email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return format_serializer_error(serializer)
