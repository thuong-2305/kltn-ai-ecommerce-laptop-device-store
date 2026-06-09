from django.urls import path
from . import views

urlpatterns = [
    path('', views.cart_summary_api, name='cart_summary_api'),
    path('add/', views.cart_add_api, name='cart_add_api'),
    path('update/', views.cart_update_api, name='cart_update_api'),
    path('delete/', views.cart_delete_api, name='cart_delete_api'),
    path('shipping/', views.cart_shipping_api, name='cart_shipping_api'),
    path('merge/', views.cart_merge_api, name='cart_merge_api'),
]