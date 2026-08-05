from django.urls import path
from . import views
from . import review_views
from . import admin_views

urlpatterns = [
  path('home/', views.home_api, name='home_api'),
  path('products/', views.products_api, name='products_api'),
  path('products/search-by-image/', views.search_by_image_api, name='search_by_image_api'),
  path('products/<int:pk>/', views.product_detail_api, name='product_detail_api'),
  path('products/<int:pk>/reviews/', review_views.product_reviews_api, name='product_reviews_api'),
  path('products/<int:pk>/sentiment-stats/', review_views.product_sentiment_stats_api, name='product_sentiment_stats_api'),
  path('products/<int:pk>/my-review/', review_views.my_review_api, name='my_review_api'),
  path('reviews/', review_views.submit_review_api, name='submit_review_api'),
  
  # Admin Dashboard & Statistics
  path('admin/dashboard-stats/', admin_views.admin_dashboard_stats, name='admin_dashboard_stats'),
  path('admin/revenue-stats/', admin_views.admin_revenue_stats, name='admin_revenue_stats'),
  path('admin/sentiment-stats/', review_views.global_sentiment_stats_api, name='global_sentiment_stats_api'),
  
  # Admin Reviews management
  path('admin/reviews/', review_views.admin_reviews_api, name='admin_reviews_api'),
  path('admin/reviews/<int:pk>/', review_views.admin_review_detail_api, name='admin_review_detail_api'),
  
  # Admin CRUD
  path('admin/products/', admin_views.admin_products, name='admin_products'),
  path('admin/products/<int:pk>/', admin_views.admin_product_detail, name='admin_product_detail'),
  path('admin/categories/', admin_views.admin_categories, name='admin_categories'),
  path('admin/categories/<int:pk>/', admin_views.admin_category_detail, name='admin_category_detail'),
  path('admin/orders/', admin_views.admin_orders, name='admin_orders'),
  path('admin/orders/<int:pk>/', admin_views.admin_order_detail, name='admin_order_detail'),
  path('admin/vouchers/', admin_views.admin_vouchers, name='admin_vouchers'),
  path('admin/vouchers/<int:pk>/', admin_views.admin_voucher_detail, name='admin_voucher_detail'),
  path('admin/users/', admin_views.admin_users, name='admin_users'),
  path('admin/users/<int:pk>/', admin_views.admin_user_detail, name='admin_user_detail'),
  
  path('categories/', views.categories_api, name='categories_api'),
  path('brands/', views.brands_api, name='brands_api'),
  path('', views.home_api, name='home')
]

