from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import ProfileSerializer, UserUpdateSerializer, ChangePasswordSerializer
from .models import Profile
from shared.utils import format_serializer_error

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile)
        return Response({'profile': serializer.data})

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            profile = Profile.objects.get(user=user)
            profile_serializer = ProfileSerializer(profile)
            return Response({
                'profile': profile_serializer.data,
                'message': 'Cập nhật thành công'
            })
        
        return format_serializer_error(serializer)

    def put(self, request):
        return self.patch(request)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['current_password']):
                return Response({'error': 'Mật khẩu hiện tại không đúng'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        
        return format_serializer_error(serializer)
