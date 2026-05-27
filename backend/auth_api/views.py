import json
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken


def _user_payload(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'full_name': user.get_full_name() or user.username,
        'is_staff': user.is_staff,
    }


def _jwt_response(user):
    refresh = RefreshToken.for_user(user)
    return {
        'user': _user_payload(user),
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


# ─── POST /api/auth/register/ ────────────────────────────────────
@csrf_exempt
@require_POST
def register_view(request):
    try:
        body = json.loads(request.body)
    except (ValueError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)

    username = body.get('username', '').strip()
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    first_name = body.get('first_name', '').strip()
    last_name = body.get('last_name', '').strip()

    # Validation
    if not username or not email or not password:
        return JsonResponse({'error': 'Vui lòng điền đầy đủ thông tin bắt buộc'}, status=400)
    if len(password) < 8:
        return JsonResponse({'error': 'Mật khẩu phải có ít nhất 8 ký tự'}, status=400)
    if User.objects.filter(username=username).exists():
        return JsonResponse({'error': 'Tên đăng nhập đã được sử dụng'}, status=400)
    if User.objects.filter(email=email).exists():
        return JsonResponse({'error': 'Email đã được đăng ký'}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    return JsonResponse(_jwt_response(user), status=201)


# ─── POST /api/auth/login/ ───────────────────────────────────────
@csrf_exempt
@require_POST
def login_view(request):
    try:
        body = json.loads(request.body)
    except (ValueError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)

    username_or_email = body.get('username', '').strip()
    password = body.get('password', '')

    if not username_or_email or not password:
        return JsonResponse({'error': 'Vui lòng nhập tên đăng nhập và mật khẩu'}, status=400)

    # Allow login with email or username
    user = None
    if '@' in username_or_email:
        try:
            user_obj = User.objects.get(email=username_or_email.lower())
            user = user_obj if user_obj.check_password(password) else None
        except User.DoesNotExist:
            pass
    else:
        try:
            user_obj = User.objects.get(username=username_or_email)
            user = user_obj if user_obj.check_password(password) else None
        except User.DoesNotExist:
            pass

    if user is None:
        return JsonResponse({'error': 'Tên đăng nhập hoặc mật khẩu không đúng'}, status=401)
    if not user.is_active:
        return JsonResponse({'error': 'Tài khoản đã bị khóa'}, status=403)

    return JsonResponse(_jwt_response(user))


# ─── POST /api/auth/token/refresh/ ──────────────────────────────
@csrf_exempt
@require_POST
def token_refresh_view(request):
    try:
        body = json.loads(request.body)
        refresh_token = body.get('refresh', '')
    except (ValueError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)

    try:
        refresh = RefreshToken(refresh_token)
        return JsonResponse({'access': str(refresh.access_token)})
    except Exception:
        return JsonResponse({'error': 'Refresh token không hợp lệ hoặc đã hết hạn'}, status=401)


# ─── POST /api/auth/logout/ ─────────────────────────────────────
@csrf_exempt
@require_POST
def logout_view(request):
    try:
        body = json.loads(request.body)
        refresh_token = body.get('refresh', '')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass  # Even if blacklist fails, clear on frontend
    return JsonResponse({'message': 'Đăng xuất thành công'})


# ─── GET /api/auth/me/ ──────────────────────────────────────────
@require_GET
def me_view(request):
    from rest_framework_simplejwt.authentication import JWTAuthentication
    jwt_auth = JWTAuthentication()
    try:
        validated = jwt_auth.authenticate(request)
        if validated is None:
            return JsonResponse({'error': 'Chưa xác thực'}, status=401)
        user, _ = validated
        return JsonResponse({'user': _user_payload(user)})
    except Exception:
        return JsonResponse({'error': 'Token không hợp lệ'}, status=401)


# ─── POST /api/auth/google/ ─────────────────────────────────────
@csrf_exempt
@require_POST
def google_oauth_view(request):
    """
    Verify Google id_token from frontend GSI, create/get user, return JWT.
    Requires GOOGLE_CLIENT_ID in settings.
    """
    try:
        body = json.loads(request.body)
        id_token_str = body.get('id_token', '')
    except (ValueError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)

    if not id_token_str:
        return JsonResponse({'error': 'Thiếu Google id_token'}, status=400)

    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests
        from django.conf import settings

        client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
        if not client_id:
            return JsonResponse({'error': 'Google OAuth chưa được cấu hình trên server'}, status=503)

        idinfo = google_id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            client_id,
        )

        email = idinfo.get('email', '').lower()
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        google_id = idinfo.get('sub', '')

        if not email:
            return JsonResponse({'error': 'Không lấy được email từ Google'}, status=400)

        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
                'first_name': first_name,
                'last_name': last_name,
            }
        )
        if created:
            user.set_unusable_password()
            user.save()

        return JsonResponse({**_jwt_response(user), 'created': created})

    except ImportError:
        return JsonResponse({'error': 'Thư viện google-auth chưa được cài đặt trên server'}, status=503)
    except ValueError as e:
        return JsonResponse({'error': f'Token Google không hợp lệ: {str(e)}'}, status=401)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
