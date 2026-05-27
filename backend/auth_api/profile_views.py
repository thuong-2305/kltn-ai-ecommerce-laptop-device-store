import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from store.models import Profile


def _get_auth_user(request):
    """Helper — validate JWT, return (user, error_response)."""
    jwt_auth = JWTAuthentication()
    try:
        result = jwt_auth.authenticate(request)
        if result is None:
            return None, JsonResponse({'error': 'Chưa xác thực'}, status=401)
        user, _ = result
        return user, None
    except Exception:
        return None, JsonResponse({'error': 'Token không hợp lệ'}, status=401)


def _profile_payload(user):
    profile = getattr(user, 'profile', None)
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'full_name': user.get_full_name() or user.username,
        'is_staff': user.is_staff,
        'date_joined': user.date_joined.strftime('%d/%m/%Y'),
        'phone': profile.phone if profile else '',
        'address': profile.address if profile else '',
    }


# ─── GET/PATCH /api/auth/profile/ ───────────────────────────────
@csrf_exempt
def profile_view(request):
    user, err = _get_auth_user(request)
    if err:
        return err

    if request.method == 'GET':
        return JsonResponse({'profile': _profile_payload(user)})

    if request.method in ('PATCH', 'PUT', 'POST'):
        try:
            body = json.loads(request.body)
        except (ValueError, json.JSONDecodeError):
            return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)

        # Update User fields
        changed = False
        for field in ('first_name', 'last_name', 'email'):
            val = body.get(field)
            if val is not None:
                val = val.strip()
                if field == 'email':
                    val = val.lower()
                    # Check uniqueness
                    from django.contrib.auth.models import User
                    if User.objects.filter(email=val).exclude(pk=user.pk).exists():
                        return JsonResponse({'error': 'Email đã được sử dụng bởi tài khoản khác'}, status=400)
                setattr(user, field, val)
                changed = True
        if changed:
            user.save()

        # Update Profile fields
        profile, _ = Profile.objects.get_or_create(user=user)
        profile_changed = False
        for field in ('phone', 'address'):
            val = body.get(field)
            if val is not None:
                setattr(profile, field, val.strip())
                profile_changed = True
        if profile_changed:
            profile.save()

        return JsonResponse({'profile': _profile_payload(user), 'message': 'Cập nhật thành công'})

    return JsonResponse({'error': 'Phương thức không được hỗ trợ'}, status=405)


# ─── POST /api/auth/change-password/ ────────────────────────────
@csrf_exempt
def change_password_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Phương thức không được hỗ trợ'}, status=405)

    user, err = _get_auth_user(request)
    if err:
        return err

    try:
        body = json.loads(request.body)
    except (ValueError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)

    current = body.get('current_password', '')
    new_pw = body.get('new_password', '')
    confirm = body.get('confirm_password', '')

    if not current or not new_pw or not confirm:
        return JsonResponse({'error': 'Vui lòng điền đầy đủ thông tin'}, status=400)
    if not user.check_password(current):
        return JsonResponse({'error': 'Mật khẩu hiện tại không đúng'}, status=400)
    if len(new_pw) < 8:
        return JsonResponse({'error': 'Mật khẩu mới phải có ít nhất 8 ký tự'}, status=400)
    if new_pw != confirm:
        return JsonResponse({'error': 'Mật khẩu xác nhận không khớp'}, status=400)
    if current == new_pw:
        return JsonResponse({'error': 'Mật khẩu mới không được trùng mật khẩu cũ'}, status=400)

    user.set_password(new_pw)
    user.save()

    # Invalidate all existing tokens by rotating (user must login again)
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    return JsonResponse({
        'message': 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })
