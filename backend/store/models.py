import json
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone

# ------------------------ User ---------------------------
# create customer profile
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_modified = models.DateTimeField(User, auto_now=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=200, blank=True)
    old_cart = models.CharField(max_length=200, blank=True, null=True)
    
    def __str__(self):
        return self.user.username
    
# Create a profile user by default when user sign up
def create_profile(sender, instance, created, **kwargs):
    if created:
        user_profile = Profile(user=instance)
        user_profile.save()

# Automate the profile thing
post_save.connect(create_profile, sender=User)

# ------------------------ Product -------------------------
#Categories of products
class Category(models.Model):
    name = models.CharField(max_length=50)
    image = models.ImageField(upload_to='uploads/category/', blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'categories'

#All of our product
class Product(models.Model):
    name = models.CharField(max_length=50)
    price = models.DecimalField(default=0, decimal_places=0, max_digits=20)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, default=1)
    short_description = models.CharField(max_length=10000, default='', blank=True, null=True)
    description = models.CharField(max_length=10000, default='', blank=True, null=True)
    image = models.ImageField(upload_to='uploads/product/')
    #configure
    config = models.CharField(max_length=10000, default='', blank=True, null=True)
    #sale
    is_sale = models.BooleanField(default=False)
    sale_price = models.DecimalField(default=0, decimal_places=0, max_digits=20)
    def __str__(self):
        return self.name
    
    # Xử lý giảm giá 
    def get_discounted_price(self):
        active_sales = SaleEvent.objects.filter(
            category=self.category,
            start_date__lte=timezone.now(),
            end_date__gte=timezone.now()
        ).order_by('-discount_percentage')  # Nếu có nhiều giảm giá lấy cái nào giảm nhiều nhất

        if active_sales.exists():
            sale = active_sales.first()
            discounted_price = self.price * (1 - sale.discount_percentage / 100)
            self.sale_price = discounted_price
            self.is_sale = True
            self.save()
            return discounted_price
            
        # Nếu không có đợt giảm giá, trả về giá gốc và sale_price vẫn bằng 0 trong csdl
        if self.is_sale:
            self.is_sale = False
            self.sale_price = 0  # Reset giá giảm
            self.save()

        return self.price

# Thumnails cho main Product
class ProductThumbnail(models.Model):
    product = models.ForeignKey(Product, related_name='thumbnails', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='uploads/product/thumbnails/')

    def __str__(self):
        return f"Thumbnail for {self.product.name}"


# Product Feature
class ProductImageFeature(models.Model):
    product = models.OneToOneField(Product, related_name='image_feature', on_delete=models.CASCADE)
    vector_json = models.TextField()

    def get_vector(self):
        return json.loads(self.vector_json)

    def set_vector(self, vector):
        self.vector_json = json.dumps(vector)

    def __str__(self):
        return f"Feature for {self.product.name}"

#SaleEvent
class SaleEvent(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    def __str__(self):
        return f"Sale for {self.category.name} ({self.discount_percentage}%)"
    
    def is_active(self):
        """Kiểm tra đợt giảm giá còn hiệu lực không."""
        current = timezone.now()
        return self.start_date <= current <= self.end_date
    
# Tự động cập nhật giá sản phẩm sau khi thêm/sửa/xóa SaleEvent.
@receiver(post_save, sender=SaleEvent)
@receiver(post_delete, sender=SaleEvent)
def update_product_prices(sender, instance, **kwargs):
    products = Product.objects.filter(category=instance.category)
    for product in products:
        product.get_discounted_price() 


# --------------------------------- Review ---------------------------------------
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField()  
    comment = models.TextField(blank=True, null=True)
    sentiment = models.CharField(max_length=10, choices=[('positive', 'Positive'), ('negative', 'Negative')], null=True)
    score_analysis = models.DecimalField(max_digits=6, decimal_places=5, null=True, editable=False)
    review_date = models.DateTimeField(default=timezone.now)
    is_spam = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'product')  # Đảm bảo một người chỉ đánh giá một sản phẩm một lần

    def __str__(self):
        return f'Review by {self.user.username} for {self.product.name}'
