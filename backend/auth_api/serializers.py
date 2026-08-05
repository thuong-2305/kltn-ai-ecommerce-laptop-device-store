from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    otp = serializers.CharField(write_only=True, required=True, min_length=6, max_length=6)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'phone', 'otp')

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    def validate_email(self, value):
        email_clean = value.strip().lower()
        if User.objects.filter(email=email_clean).exists():
            raise serializers.ValidationError("Email đã được sử dụng.")
        return email_clean

    def validate_username(self, value):
        username_clean = value.strip()
        if User.objects.filter(username=username_clean).exists():
            raise serializers.ValidationError("Tên đăng nhập đã được sử dụng.")
        return username_clean

    def validate(self, data):
        email = data['email']
        otp = data['otp']

        import hashlib
        from .models import OTPVerification
        try:
            record = OTPVerification.objects.get(email=email)
            if record.is_expired():
                raise serializers.ValidationError({"otp": "Mã OTP đã hết hạn."})

            hashed_input = hashlib.sha256(otp.encode('utf-8')).hexdigest()
            if record.otp != hashed_input:
                record.attempts += 1
                record.save()
                if record.attempts >= 5:
                    record.delete()
                    raise serializers.ValidationError({"otp": "Mã OTP đã bị vô hiệu hóa do nhập sai quá 5 lần. Vui lòng yêu cầu mã mới."})
                else:
                    raise serializers.ValidationError({"otp": f"Mã OTP không đúng. Bạn còn {5 - record.attempts} lần thử lại."})
        except OTPVerification.DoesNotExist:
            raise serializers.ValidationError({"otp": "Vui lòng yêu cầu gửi mã OTP trước."})

        return data

    def create(self, validated_data):
        validated_data.pop('otp', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', '')
        )
        # Delete OTP record after successful registration
        from .models import OTPVerification
        OTPVerification.objects.filter(email=user.email).delete()
        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'is_staff', 'phone', 'date_joined')

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    address = serializers.CharField(required=False, allow_blank=True)
    order_count = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    voucher_count = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ('id', 'user', 'phone', 'address', 'date_modified', 'order_count', 'review_count', 'voucher_count')

    def get_order_count(self, obj):
        from payment.models import Order
        return Order.objects.filter(user=obj.user).count()

    def get_review_count(self, obj):
        from store.models import Review
        return Review.objects.filter(user=obj.user).count()

    def get_voucher_count(self, obj):
        from django.utils import timezone
        from payment.models import Voucher
        return Voucher.objects.filter(is_active=True, end_date__gt=timezone.now()).count()


class UserUpdateSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone', 'address')

    def validate_email(self, value):
        user = self.instance
        email_clean = value.strip().lower()
        if User.objects.filter(email=email_clean).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Email đã được sử dụng bởi tài khoản khác.")
        return email_clean

    def update(self, instance, validated_data):
        # Update User fields
        instance.first_name = validated_data.get('first_name', instance.first_name).strip()
        instance.last_name = validated_data.get('last_name', instance.last_name).strip()
        if 'email' in validated_data:
            instance.email = validated_data['email']
        if 'phone' in validated_data:
            instance.phone = validated_data['phone'].strip()
        instance.save()

        # Update Profile fields
        profile, _ = Profile.objects.get_or_create(user=instance)
        if 'address' in validated_data:
            profile.address = validated_data['address'].strip()
        profile.save()

        return instance


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Mật khẩu xác nhận không khớp."})
        if data['current_password'] == data['new_password']:
            raise serializers.ValidationError({"new_password": "Mật khẩu mới không được trùng mật khẩu cũ."})
        return data


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        email_clean = value.strip().lower()
        if not User.objects.filter(email=email_clean).exists():
            raise serializers.ValidationError("Không tìm thấy tài khoản với email này.")
        return email_clean


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Mật khẩu xác nhận không khớp."})
        return data


class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        email_clean = value.strip().lower()
        if User.objects.filter(email=email_clean).exists():
            raise serializers.ValidationError("Email đã được sử dụng.")
        return email_clean

