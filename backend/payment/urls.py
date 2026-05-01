from django.urls import path
from . import views

urlpatterns = [
    path('payment_success', views.payment_success, name='payment_success'),
    path('checkout', views.checkout, name='checkout'),
    path('billing_info', views.billing_info, name='billing_info'),
    path('process_order', views.process_order, name='process_order'),
    path('process_order_paypal', views.process_order_paypal, name='process_order_paypal'),
    path('process_order_upon', views.process_order_upon, name='process_order_upon'),
    path('shipped_dash', views.shipped_dash, name='shipped_dash'),
    path('not_shipped_dash', views.not_shipped_dash, name='not_shipped_dash'),
    path('orders/<int:pk>', views.orders, name='orders'),
    path('get-data/', views.get_data, name='get_data'),
    path('vnpay_checkout/', views.vnpay_checkout, name='vnpay_checkout'),
    path('vnpay_return/', views.payment_return, name='vnpay_return'),
]