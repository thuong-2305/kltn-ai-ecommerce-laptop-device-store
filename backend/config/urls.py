from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from payment.admin import custom_admin_site

urlpatterns = [
    path('admin/', custom_admin_site.urls),
    path('api/auth/', include('auth_api.urls')),
    path('api/store/', include('store.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/payment/', include('payment.urls')),
    # path('api/recommend/', include('recommend.urls')),  # Temporarily disabled
    path('api/wishlist/', include('wishlist.urls')),
]

# Serve media files - static files handled by WhiteNoise middleware
# In production, media files should be served by Nginx or cloud storage (S3)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
