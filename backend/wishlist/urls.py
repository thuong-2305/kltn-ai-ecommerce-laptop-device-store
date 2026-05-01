from django.urls import path
from . import views

urlpatterns = [
    path('', views.wishlist, name='wishlist'),
    path('add/', views.wishlist_add, name='wishlist_add'),
    path('remove/', views.wishlist_remove, name='wishlist_remove'),
    path('addToCart/', views.wishlist_toCart, name='wishlist_addToCart'),
]