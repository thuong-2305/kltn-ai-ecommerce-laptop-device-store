from django.urls import reverse
from django.test import override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from auth_api.models import Profile

User = get_user_model()

class AuthAPITests(APITestCase):

    def setUp(self):
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.me_url = reverse('auth_me')
        self.profile_url = reverse('auth_profile')

        self.user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'StrongPassword123!',
            'first_name': 'Test',
            'last_name': 'User',
            'phone': '0987654321',
            'otp': '123456'
        }

    def test_user_registration(self):
        """Kiểm thử đăng ký người dùng mới"""
        from auth_api.models import OTPVerification
        import hashlib
        hashed_otp = hashlib.sha256('123456'.encode('utf-8')).hexdigest()
        OTPVerification.objects.create(email=self.user_data['email'], otp=hashed_otp)

        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], self.user_data['email'])

        # Kiểm tra xem user và profile đã được tạo trong DB chưa
        self.assertTrue(User.objects.filter(email=self.user_data['email']).exists())
        user = User.objects.get(email=self.user_data['email'])
        self.assertTrue(Profile.objects.filter(user=user).exists())

    def test_user_login(self):
        """Kiểm thử đăng nhập bằng email và username"""
        # Tạo người dùng
        User.objects.create_user(
            username=self.user_data['username'],
            email=self.user_data['email'],
            password=self.user_data['password']
        )

        # Đăng nhập bằng Email
        login_data_email = {
            'username': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data_email)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

        # Đăng nhập bằng Username
        login_data_username = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data_username)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_current_user_profile(self):
        """Kiểm thử lấy thông tin cá nhân hiện tại (yêu cầu JWT)"""
        user = User.objects.create_user(
            username=self.user_data['username'],
            email=self.user_data['email'],
            password=self.user_data['password']
        )
        
        # Lấy token đăng nhập
        login_response = self.client.post(self.login_url, {
            'username': self.user_data['email'],
            'password': self.user_data['password']
        })
        token = login_response.data['access']

        # Truy cập API me không có Token -> Unauthenticated
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Truy cập API me có Token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], self.user_data['email'])

    def test_profile_update(self):
        """Kiểm thử cập nhật thông tin cá nhân và địa chỉ"""
        user = User.objects.create_user(
            username=self.user_data['username'],
            email=self.user_data['email'],
            password=self.user_data['password']
        )
        
        login_response = self.client.post(self.login_url, {
            'username': self.user_data['email'],
            'password': self.user_data['password']
        })
        token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        update_data = {
            'first_name': 'NewName',
            'phone': '0123456789',
            'address': 'New Address 123'
        }
        
        response = self.client.patch(self.profile_url, update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['profile']['user']['first_name'], 'NewName')
        self.assertEqual(response.data['profile']['phone'], '0123456789')
        self.assertEqual(response.data['profile']['address'], 'New Address 123')

    def test_change_password(self):
        """Kiểm thử đổi mật khẩu (Change Password)"""
        user = User.objects.create_user(
            username=self.user_data['username'],
            email=self.user_data['email'],
            password=self.user_data['password']
        )
        
        login_response = self.client.post(self.login_url, {
            'username': self.user_data['email'],
            'password': self.user_data['password']
        })
        token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        change_data = {
            'current_password': self.user_data['password'],
            'new_password': 'NewSecurePassword123!',
            'confirm_password': 'NewSecurePassword123!'
        }
        
        response = self.client.post(reverse('auth_change_password'), change_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        
        # Thử đăng nhập lại bằng mật khẩu mới
        login_response = self.client.post(self.login_url, {
            'username': self.user_data['email'],
            'password': 'NewSecurePassword123!'
        })
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

    @override_settings(DEBUG=True)
    def test_forgot_and_reset_password(self):
        """Kiểm thử quên mật khẩu và khôi phục (Forgot/Reset Password)"""
        user = User.objects.create_user(
            username=self.user_data['username'],
            email=self.user_data['email'],
            password=self.user_data['password']
        )

        # 1. Yêu cầu mã khôi phục mật khẩu
        forgot_url = reverse('auth_password_forgot')
        response = self.client.post(forgot_url, {'email': self.user_data['email']})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        from django.contrib.auth.tokens import default_token_generator
        token = default_token_generator.make_token(user)

        # 2. Khôi phục mật khẩu bằng token nhận được
        reset_url = reverse('auth_password_reset')
        reset_data = {
            'email': self.user_data['email'],
            'token': token,
            'new_password': 'AnotherNewPassword123!',
            'confirm_password': 'AnotherNewPassword123!'
        }
        response = self.client.post(reset_url, reset_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 3. Đăng nhập với mật khẩu mới khôi phục
        login_response = self.client.post(self.login_url, {
            'username': self.user_data['email'],
            'password': 'AnotherNewPassword123!'
        })
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

    @override_settings(DEBUG=True)
    def test_send_otp(self):
        """Kiểm thử gửi mã OTP qua email"""
        send_otp_url = reverse('auth_otp_send')
        response = self.client.post(send_otp_url, {'email': 'newuser@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        from django.core import mail
        import re
        self.assertEqual(len(mail.outbox), 1)
        email_content = mail.outbox[0].body
        otp_match = re.search(r'\b\d{6}\b', email_content)
        self.assertIsNotNone(otp_match)
        
        # Kiểm tra xem bản ghi OTPVerification đã được tạo trong DB chưa
        from auth_api.models import OTPVerification
        self.assertTrue(OTPVerification.objects.filter(email='newuser@example.com').exists())

    def test_google_oauth_validation(self):
        """Kiểm thử tính hợp lệ của API Google OAuth"""
        google_url = reverse('auth_google')
        
        # 1. Test case: Thiếu token
        response = self.client.post(google_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        
        # 2. Test case: Token không hợp lệ
        response = self.client.post(google_url, {'id_token': 'invalid_token_123'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
