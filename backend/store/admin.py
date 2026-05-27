from django.contrib import admin
from django.contrib.auth.models import User
from .models import Category, Product, ProductImageFeature, ProductThumbnail, Profile, Review, SaleEvent

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(SaleEvent)
admin.site.register(Profile)
admin.site.register(Review)
admin.site.register(ProductThumbnail)
admin.site.register(ProductImageFeature)


# Mix profile info and user info
class ProfileInline(admin.StackedInline):
    model = Profile


# Extend User model
class UserAdmin(admin.ModelAdmin):
    model = User
    fields = ['username', 'first_name', 'last_name', 'email']
    inlines = [ProfileInline]


# Unregister the old way
admin.site.unregister(User)

# Re-register the new way
admin.site.register(User, UserAdmin)
