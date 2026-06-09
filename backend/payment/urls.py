from django.urls import path
from . import views

urlpatterns = [
    path('get-data/', views.get_data, name='get_data'),
    path('vnpay_checkout/', views.api_vnpay_checkout, name='vnpay_checkout'),
    path('vnpay_return/', views.api_vnpay_return, name='vnpay_return'),
    path('vnpay_ipn/', views.api_vnpay_ipn, name='vnpay_ipn'),
    path('shipping-address/', views.api_get_shipping_address, name='api_get_shipping_address'),
    path('addresses/', views.api_user_addresses, name='api_user_addresses'),
    path('addresses/<int:pk>/', views.api_user_address_detail, name='api_user_address_detail'),
    path('addresses/<int:pk>/set-default/', views.api_user_address_set_default, name='api_user_address_set_default'),

    # Order APIs
    path('orders/create/', views.api_order_create, name='api_order_create'),
    path('orders/history/', views.api_order_history, name='api_order_history'),
    path('orders/<str:pk>/detail/', views.api_order_detail, name='api_order_detail'),
    path('orders/<int:pk>/cancel/', views.api_order_cancel, name='api_order_cancel'),
]