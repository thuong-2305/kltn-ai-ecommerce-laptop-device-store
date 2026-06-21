import json
import logging
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone

logger = logging.getLogger(__name__)



# ------------------------ Product -------------------------
#Categories of products
class Category(models.Model):
    name = models.CharField(max_length=50)
    image = models.ImageField(upload_to='uploads/category/', blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'categories'

#Brands of products
class Brand(models.Model):
    name = models.CharField(max_length=50, unique=True)
    image = models.ImageField(upload_to='uploads/brand/', blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

#All of our product
class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(default=0, decimal_places=0, max_digits=20)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, default=1)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    short_description = models.TextField(default='', blank=True, null=True)
    description = models.TextField(default='', blank=True, null=True)
    image = models.ImageField(upload_to='uploads/product/')
    #configure
    config = models.TextField(default='', blank=True, null=True)
    #sale
    is_sale = models.BooleanField(default=False, db_index=True)
    sale_price = models.DecimalField(default=0, decimal_places=0, max_digits=20)
    def __str__(self):
        return self.name
    
    def calculate_discounted_price(self):
        """Calculate the effective price based on active SaleEvents.
        Returns (price, is_sale, sale_price) tuple WITHOUT saving to DB.
        """
        active_sales = SaleEvent.objects.filter(
            category=self.category,
            start_date__lte=timezone.now(),
            end_date__gte=timezone.now()
        ).order_by('-discount_percentage')

        if active_sales.exists():
            sale = active_sales.first()
            discounted_price = self.price * (1 - sale.discount_percentage / 100)
            return discounted_price, True, discounted_price

        return self.price, False, 0



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
    
# Tự động cập nhật giá sản phẩm sau khi thêm/sửa/xóa SaleEvent (bulk_update).
@receiver(post_save, sender=SaleEvent)
@receiver(post_delete, sender=SaleEvent)
def update_product_prices(sender, instance, **kwargs):
    products = list(Product.objects.filter(category=instance.category))
    updated = []
    for product in products:
        _, is_sale, sale_price = product.calculate_discounted_price()
        if product.is_sale != is_sale or product.sale_price != sale_price:
            product.is_sale = is_sale
            product.sale_price = sale_price
            updated.append(product)
    if updated:
        Product.objects.bulk_update(updated, ['is_sale', 'sale_price'])
        logger.info(f"Updated sale prices for {len(updated)} products in category '{instance.category.name}'")


# --------------------------------- Review ---------------------------------------
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)
    sentiment = models.CharField(max_length=10, choices=[('positive', 'Positive'), ('neutral', 'Neutral'), ('negative', 'Negative')], null=True)
    score_analysis = models.DecimalField(max_digits=6, decimal_places=5, null=True, editable=False)
    review_date = models.DateTimeField(default=timezone.now)
    is_spam = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f'Review by {self.user.username} for {self.product.name}'

class ReviewImage(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='reviews/gallery/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Image for Review {self.review.id}'

# ----------------------------- Product Specifications & Variants ----------------------
class ProductSpecificationKey(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class ProductSpecification(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='specifications')
    key = models.ForeignKey(ProductSpecificationKey, on_delete=models.PROTECT)
    value = models.CharField(max_length=255, db_index=True)

    class Meta:
        unique_together = ('product', 'key')

    def __str__(self):
        return f"{self.product.name} - {self.key.name}: {self.value}"

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=255)  # e.g., "Intel Core i7 / 16GB / 512GB SSD"
    price = models.DecimalField(default=0, decimal_places=0, max_digits=20)
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.product.name} - {self.name}"


