from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, UserChangeForm, SetPasswordForm
from django import forms
from .models import Profile, Review
from . import views

class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ['rating', 'comment']

class UserInfoForm(forms.ModelForm):
	phone = forms.CharField(label="", widget=forms.TextInput(attrs={'class':'form-control', 'style':'width:100%', 'placeholder':'Phone number'}), required=False)
	address = forms.CharField(label="", widget=forms.TextInput(attrs={'class':'form-control', 'style':'width:100%', 'placeholder':'Address'}), required=False)

	class Meta:
		model = Profile
		fields = ('phone', 'address')


class ChangePasswordForm(SetPasswordForm):
	current_password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'style': 'width: 40%; margin-bottom: 15px',
            'placeholder': 'Current password'
        }),
        label="Current Password",
        required=True
    )

	class Meta:
		model = User
		fields = ['current_password', 'new_password1', 'new_password2']

	def __init__(self, *args, **kwargs):
		self.user = kwargs.pop('user')  # Lấy user hiện tại
		super(ChangePasswordForm, self).__init__(self.user, *args, **kwargs)

		self.fields['new_password1'].widget.attrs['style'] = 'width: 40%'
		self.fields['new_password1'].widget.attrs['placeholder'] = 'New password'

		self.fields['new_password2'].widget.attrs['style'] = 'width: 40%'
		self.fields['new_password2'].widget.attrs['placeholder'] = 'Confirm new password'

	def clean_current_password(self):
		current_password = self.cleaned_data.get('current_password')
		if not self.user.check_password(current_password):
			raise forms.ValidationError("Current password is incorrect.")
		return current_password


class UpdateUserForm(UserChangeForm):
	email = forms.EmailField(label="", widget=forms.TextInput(attrs={'placeholder':'Email Address'}))
	first_name = forms.CharField(label="", max_length=100, widget=forms.TextInput(attrs={'placeholder':'First Name'}))
	last_name = forms.CharField(label="", max_length=100, widget=forms.TextInput(attrs={'placeholder':'Last Name'}))

	class Meta:
		model = User
		fields = ('username', 'first_name', 'last_name', 'email')

	def __init__(self, *args, **kwargs):
		super(UpdateUserForm, self).__init__(*args, **kwargs)

		self.fields['username'].widget.attrs['placeholder'] = 'User Name'
		self.fields['username'].label = ''


class SignUpForm(UserCreationForm):
	email = forms.EmailField(label="", widget=forms.TextInput(attrs={'placeholder':'Email Address'}))
	first_name = forms.CharField(label="", max_length=100, widget=forms.TextInput(attrs={'placeholder':'First Name'}))
	last_name = forms.CharField(label="", max_length=100, widget=forms.TextInput(attrs={'placeholder':'Last Name'}))

	class Meta:
		model = User
		fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2')

	def __init__(self, *args, **kwargs):
		super(SignUpForm, self).__init__(*args, **kwargs)

		self.fields['username'].widget.attrs['placeholder'] = 'User Name'
		self.fields['username'].label = ''

		self.fields['password1'].widget.attrs['placeholder'] = 'Password'
		self.fields['password1'].label = ''

		self.fields['password2'].widget.attrs['placeholder'] = 'Confirm Password'
		self.fields['password2'].label = ''

	def clean_email(self):
		email = self.cleaned_data.get('email')
		if User.objects.filter(email=email).exists():
			raise forms.ValidationError("Email is already in use.")
		return email

class ImageUploadForm(forms.Form):
    image = forms.ImageField()