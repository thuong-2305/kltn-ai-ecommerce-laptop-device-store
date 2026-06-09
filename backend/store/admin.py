from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import Category, Brand, Product, ProductImageFeature, ProductThumbnail, Review, SaleEvent, ProductSpecificationKey, ProductSpecification, ProductVariant
from auth_api.models import Profile
from payment.admin import custom_admin_site

User = get_user_model()

class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 1

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

class ProductThumbnailInline(admin.TabularInline):
    model = ProductThumbnail
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductThumbnailInline, ProductSpecificationInline, ProductVariantInline]

custom_admin_site.register(Category)
custom_admin_site.register(Brand)
custom_admin_site.register(Product, ProductAdmin)
custom_admin_site.register(SaleEvent)
custom_admin_site.register(Profile)
custom_admin_site.register(Review)
custom_admin_site.register(ProductThumbnail)
custom_admin_site.register(ProductImageFeature)
custom_admin_site.register(ProductSpecificationKey)


# Mix profile info and user info
class ProfileInline(admin.StackedInline):
    model = Profile


# Extend User model
class UserAdmin(admin.ModelAdmin):
    model = User
    fields = ['username', 'first_name', 'last_name', 'email']
    inlines = [ProfileInline]


# Register the custom UserAdmin to custom admin site
custom_admin_site.register(User, UserAdmin)
