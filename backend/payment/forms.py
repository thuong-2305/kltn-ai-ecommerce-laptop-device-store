from django import forms
from .models import ShippingAddress

class ShippingForm(forms.ModelForm):
    shipping_full_name = forms.CharField(
        label="",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'id': 'customer_name',
            'placeholder': 'Họ và tên',
            'name': 'shipping_full_name'
        }),
        required=True
    )
    shipping_phone = forms.CharField(
        label="",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'id': 'customer_phone',
            'placeholder': 'Số điện thoại',
            'name': 'shipping_phone'
        }),
        required=True
    )
    shipping_address = forms.CharField(
        label="",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'id': 'shipping_address',
            'placeholder': 'Địa chỉ',
        }),
    )

    class Meta:
        model = ShippingAddress
        fields = [
            'shipping_full_name', 'shipping_phone', 'shipping_address'
        ]

class PaymentForm(forms.Form):
    card_name = forms.CharField(label="", widget=forms.TextInput(attrs={'class':'form-control', 'style':'width:100%', 'placeholder':"Tên chủ thẻ"}), required=True)
    card_number =forms.CharField(label="", widget=forms.TextInput(attrs={'class':'form-control', 'style':'width:100%', 'placeholder':'Số thẻ'}), required=True)
    card_exp_date = forms.CharField(label="", widget=forms.TextInput(attrs={'class':'form-control', 'style':'width:100%', 'placeholder':'Ngày hết hạn'}), required=True)
    card_cvv_number =forms.CharField(label="", widget=forms.TextInput(attrs={'class':'form-control', 'style':'width:100%', 'placeholder':'CVV'}), required=True)
    card_address = forms.CharField(label="", widget=forms.TextInput(attrs={'class':'form-control', 'style':'width:100%', 'placeholder':'Địa chỉ thanh toán'}), required=True)
    card_zipcode = forms.CharField(label="", widget=forms.TextInput(attrs={'class':'form-control', 'style':'width:100%', 'placeholder':'ZIP'}), required=True)