from django.urls import path
from . import views
from . import review_views

urlpatterns = [
  path('home/', views.home_api, name='home_api'),
  path('products/', views.products_api, name='products_api'),
  path('products/search-by-image/', views.search_by_image_api, name='search_by_image_api'),
  path('products/<int:pk>/', views.product_detail_api, name='product_detail_api'),
  path('products/<int:pk>/reviews/', review_views.product_reviews_api, name='product_reviews_api'),
  path('products/<int:pk>/sentiment-stats/', review_views.product_sentiment_stats_api, name='product_sentiment_stats_api'),
  path('products/<int:pk>/my-review/', review_views.my_review_api, name='my_review_api'),
  path('reviews/', review_views.submit_review_api, name='submit_review_api'),
  path('admin/reviews/', review_views.admin_reviews_api, name='admin_reviews_api'),
  path('categories/', views.categories_api, name='categories_api'),
  path('brands/', views.brands_api, name='brands_api'),
  path('', views.home_api, name='home')
]
