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

    def render_change_form(self, request, context, *args, **kwargs):
        form = context.get('adminform').form
        if 'description' in form.fields:
            form.fields['description'].help_text = (
                "Hỗ trợ định dạng Markdown: "
                "Sử dụng **chữ in đậm** để in đậm, "
                "### Tiêu đề phụ để phân chia phần, "
                "bắt đầu dòng bằng dấu gạch ngang '-' hoặc '*' để tạo danh sách gạch đầu dòng."
            )
        if 'short_description' in form.fields:
            form.fields['short_description'].help_text = (
                "Mô tả ngắn gọn hiển thị trên trang danh sách."
            )
        return super().render_change_form(request, context, *args, **kwargs)

class ReviewAdmin(admin.ModelAdmin):
    list_select_related = ('user', 'product')
    list_display = ('id', 'user', 'product', 'rating', 'sentiment', 'review_date')
    list_filter = ('rating', 'sentiment', 'is_spam', 'review_date')
    search_fields = ('user__username', 'product__name', 'comment')

class ProfileAdmin(admin.ModelAdmin):
    list_select_related = ('user',)
    list_display = ('id', 'user', 'date_modified', 'address')
    search_fields = ('user__username', 'address', 'user__email')

custom_admin_site.register(Category)
custom_admin_site.register(Brand)
custom_admin_site.register(Product, ProductAdmin)
custom_admin_site.register(SaleEvent)
custom_admin_site.register(Profile, ProfileAdmin)
custom_admin_site.register(Review, ReviewAdmin)
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
