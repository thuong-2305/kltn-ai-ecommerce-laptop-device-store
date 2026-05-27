from django.urls import path
from . import views

urlpatterns = [
    path('', views.wishlist_summary_api, name='wishlist_summary_api'),
    path('add/', views.wishlist_add_api, name='wishlist_add_api'),
    path('remove/', views.wishlist_remove_api, name='wishlist_remove_api'),
    path('addToCart/', views.wishlist_to_cart_api, name='wishlist_to_cart_api'),
]