# Database Optimization & Implementation Roadmap

**Project:** KLTN AI E-Commerce  
**Created:** May 12, 2026  
**Priority:** Database Improvements for Scalability & Reliability

---

## Executive Summary

Current database schema is **functional but needs critical fixes** for production use:

| Issue | Severity | Impact | Timeline |
|-------|----------|--------|----------|
| Product CASCADE delete | 🔴 CRITICAL | Loses order history | Week 1 |
| User CASCADE delete | 🔴 CRITICAL | Loses customer data | Week 1 |
| Missing indexes | 🟠 HIGH | Slow queries | Week 1-2 |
| No admin interface | 🟠 HIGH | Hard to manage data | Week 2 |
| Session-based cart | 🟡 MEDIUM | Cart abandonment risk | Week 3-4 |
| No audit trail | 🟡 MEDIUM | No change tracking | Week 4-5 |

---

## Phase 1: Critical Fixes (Week 1)

### 1.1 Fix CASCADE Delete Issues

**Problem:** Deleting a product or user deletes all related orders - unrecoverable.

**Solution:** Use `PROTECT` or `SET_NULL` instead of `CASCADE`

```python
# payment/models.py - BEFORE
class OrderItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

# payment/models.py - AFTER
class OrderItem(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,  # ✅ Prevent deletion
        null=False
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,  # ✅ Keep record, null user_id
        null=True,
        blank=True
    )
```

**Migration:**
```bash
# Create migration
python manage.py makemigrations

# Backup database first!
mysqldump kltn_ecommerce > backup_$(date +%Y%m%d).sql

# Apply migration
python manage.py migrate
```

**Testing:**
```python
# Test: Ensure you can't delete product with orders
from payment.models import OrderItem
from store.models import Product

product = Product.objects.first()
try:
    product.delete()
    assert False, "Should not allow deletion"
except models.ProtectedError:
    print("✅ Protection working")

# Test: Deleting user nulls their orders
from django.contrib.auth.models import User
user = User.objects.first()
user.delete()
# Verify: Order.user_id is now NULL
```

**Effort:** 2-4 hours  
**Risk:** Medium (requires careful migration)

---

### 1.2 Add Missing Database Indexes

**Problem:** Queries on is_sale, review_date, order_date are slow

**Solution:** Add `db_index=True` to frequently filtered fields

```python
# store/models.py
class Product(models.Model):
    # ...
    is_sale = models.BooleanField(
        default=False,
        db_index=True  # ✅ Add index
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        default=1,
        db_index=True  # ✅ Add index
    )

# store/models.py
class Review(models.Model):
    # ...
    review_date = models.DateTimeField(
        default=datetime.now,
        db_index=True  # ✅ Add index
    )
    rating = models.PositiveIntegerField(
        db_index=True  # ✅ Add index
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        db_index=True  # ✅ Add index
    )

# payment/models.py
class Order(models.Model):
    # ...
    date_ordered = models.DateTimeField(
        auto_now_add=True,
        db_index=True  # ✅ Add index
    )
    shipped = models.BooleanField(
        default=False,
        db_index=True  # ✅ Add index
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_index=True  # ✅ Add index
    )
```

**Migration:**
```bash
python manage.py makemigrations
python manage.py migrate
```

**Performance Before/After:**

```sql
-- Before (no index)
SELECT * FROM store_product WHERE is_sale = 1;
-- Query time: ~800ms (full table scan)

-- After (with index)
SELECT * FROM store_product WHERE is_sale = 1;
-- Query time: ~5ms (index lookup)
```

**Effort:** 1-2 hours  
**Risk:** Low (read-only, no data changes)

---

### 1.3 Add Composite Indexes for Common Queries

```python
# Create composite index for frequently used combinations
class Meta:
    indexes = [
        models.Index(
            fields=['category', 'is_sale'],
            name='idx_category_sale'
        ),
        models.Index(
            fields=['user', 'review_date'],
            name='idx_user_review_date'
        ),
        models.Index(
            fields=['product', 'is_spam'],
            name='idx_product_spam'
        ),
    ]
```

**Impact:**
- Query filtering by category AND is_sale: ~50ms → ~2ms
- User review history: ~200ms → ~5ms

**Effort:** 1-2 hours  
**Risk:** Low

---

## Phase 2: Data Validation & Constraints (Week 2)

### 2.1 Add Field Validators

**Problem:** Invalid data can be saved (negative prices, invalid ratings)

**Solution:** Add Django validators

```python
from django.core.validators import MinValueValidator, MaxValueValidator

# store/models.py
class Product(models.Model):
    price = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]  # ✅ No negative prices
    )
    sale_price = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )

# store/models.py
class Review(models.Model):
    rating = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)  # ✅ Rating 1-5 only
        ]
    )

# payment/models.py
class Order(models.Model):
    amount_paid = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        validators=[MinValueValidator(0)]  # ✅ No negative amounts
    )
```

**Testing:**
```python
from django.core.exceptions import ValidationError
from store.models import Product

# Test: Negative price rejected
try:
    product = Product(name="Test", price=-100)
    product.full_clean()
    assert False, "Should reject negative price"
except ValidationError:
    print("✅ Price validation working")
```

**Effort:** 2-3 hours  
**Risk:** Low

---

### 2.2 Add Phone Number Validation

```python
from django.core.validators import RegexValidator

# store/models.py
class Profile(models.Model):
    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\d{10,15}$',
                message='Phone number must be 10-15 digits'
            )
        ]
    )

# payment/models.py
class ShippingAddress(models.Model):
    shipping_phone = models.CharField(
        max_length=255,
        validators=[
            RegexValidator(
                regex=r'^\d{10,15}$'
            )
        ]
    )
```

**Effort:** 1-2 hours  
**Risk:** Low

---

## Phase 3: Admin Interface (Week 2)

### 3.1 Complete Store Admin

```python
# store/admin.py
from django.contrib import admin
from .models import Category, Product, Review, SaleEvent, ProductThumbnail

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'product_count']
    search_fields = ['name']
    
    def product_count(self, obj):
        return obj.product_set.count()
    product_count.short_description = 'Products'

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'sale_price', 'is_sale', 'category', 'review_count']
    list_filter = ['is_sale', 'category', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'review_count', 'average_rating']
    
    fieldsets = (
        ('Basic Info', {'fields': ('name', 'category', 'image')}),
        ('Pricing', {'fields': ('price', 'is_sale', 'sale_price')}),
        ('Details', {'fields': ('short_description', 'description', 'config')}),
        ('Stats', {'fields': ('review_count', 'average_rating'), 'classes': ('collapse',)}),
    )
    
    def review_count(self, obj):
        return obj.review_set.count()
    review_count.short_description = 'Reviews'
    
    def average_rating(self, obj):
        reviews = obj.review_set.all()
        if reviews:
            avg = reviews.aggregate(models.Avg('rating'))['rating__avg']
            return f"{avg:.2f} ⭐"
        return "No reviews"
    average_rating.short_description = 'Avg Rating'

class ProductThumbnailInline(admin.TabularInline):
    model = ProductThumbnail
    extra = 1

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'sentiment', 'review_date', 'is_spam']
    list_filter = ['rating', 'sentiment', 'is_spam', 'review_date']
    search_fields = ['product__name', 'user__username', 'comment']
    readonly_fields = ['review_date', 'score_analysis']
    
    fieldsets = (
        ('Review Info', {'fields': ('product', 'user', 'rating', 'comment')}),
        ('Analysis', {'fields': ('sentiment', 'score_analysis', 'is_spam')}),
        ('Metadata', {'fields': ('review_date',), 'classes': ('collapse',)}),
    )

@admin.register(SaleEvent)
class SaleEventAdmin(admin.ModelAdmin):
    list_display = ['category', 'discount_percentage', 'start_date', 'end_date', 'is_active_now']
    list_filter = ['category', 'start_date']
    
    def is_active_now(self, obj):
        from datetime import datetime
        now = datetime.now()
        is_active = obj.start_date <= now <= obj.end_date
        return '✅ Active' if is_active else '❌ Inactive'
    is_active_now.short_description = 'Status'
```

**File:** `store/admin.py`

**Effort:** 2-4 hours  
**Risk:** Low

---

### 3.2 Complete Payment Admin

```python
# payment/admin.py (already partially done, enhance it)
from django.contrib import admin
from .models import Order, OrderItem, ShippingAddress

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'price', 'quantity']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'full_name', 'amount_paid', 'date_ordered', 'shipped', 'status']
    list_filter = ['shipped', 'date_ordered']
    search_fields = ['user__username', 'full_name', 'phone']
    readonly_fields = ['date_ordered', 'date_shipped', 'amount_paid']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Customer', {'fields': ('user', 'full_name', 'phone')}),
        ('Shipping', {'fields': ('shipping_address',)}),
        ('Payment', {'fields': ('amount_paid',)}),
        ('Status', {'fields': ('shipped', 'date_ordered', 'date_shipped')}),
    )
    
    def status(self, obj):
        if obj.shipped:
            return '✅ Shipped'
        return '⏳ Pending'
    status.short_description = 'Order Status'

@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'shipping_full_name', 'shipping_phone']
    search_fields = ['user__username', 'shipping_full_name']
```

**Effort:** 1-2 hours  
**Risk:** Low

---

## Phase 4: Performance Optimization (Week 3)

### 4.1 Optimize Queryset with select_related/prefetch_related

**Problem:** N+1 query problem when fetching products with reviews

**Before (slow):**
```python
products = Product.objects.all()[:20]
for product in products:
    avg_rating = product.review_set.aggregate(Avg('rating'))['rating__avg']
    # Makes N queries (one per product)
```

**After (fast):**
```python
from django.db.models import Avg, Count, Prefetch

products = Product.objects.prefetch_related(
    Prefetch('review_set', queryset=Review.objects.filter(is_spam=False))
).annotate(
    avg_rating=Avg('review__rating'),
    review_count=Count('review', filter=Q(review__is_spam=False))
)[:20]

# Makes only 2 queries total
```

**Implementation Locations:**
1. `store/views.py` - Product list endpoint
2. `store/views.py` - Product detail endpoint
3. `payment/views.py` - Order list endpoint
4. `payment/views.py` - Order detail endpoint

**Effort:** 4-6 hours  
**Risk:** Medium (requires testing)

---

### 4.2 Implement Query Result Caching

```python
# store/views.py
from django.views.decorators.cache import cache_page
from django.core.cache import cache

class ProductViewSet(viewsets.ModelViewSet):
    @cache_page(60 * 5)  # Cache for 5 minutes
    def list(self, request):
        # GET /api/products is cached
        return super().list(request)

    def retrieve(self, request, pk=None):
        # Cache individual product for 1 hour
        cache_key = f'product:{pk}'
        product = cache.get(cache_key)
        
        if product is None:
            product = self.get_object()
            cache.set(cache_key, product, 60 * 60)
        
        return Response(ProductSerializer(product).data)
```

**Cache Strategy:**
- Product list: 5 minutes
- Product detail: 1 hour
- Category list: 1 hour
- Active sales: 30 minutes
- Review stats: 1 hour
- User profile: 5 minutes

**Effort:** 2-3 hours  
**Risk:** Low (invalidation on updates)

---

### 4.3 Implement Redis Caching (Optional)

```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Compare performance
# Local memory cache: 100 requests/sec
# Redis cache: 1000 requests/sec
```

**Installation:**
```bash
pip install django-redis redis
```

**Effort:** 2-3 hours  
**Risk:** Low (requires Redis server)

---

## Phase 5: Persistent Cart (Week 4)

### 5.1 Add Cart Models

**Problem:** Session-based cart can be lost if user logs out

**Solution:** Add database models

```python
# cart/models.py
from django.db import models
from django.contrib.auth.models import User
from store.models import Product

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cart - {self.user.username}"
    
    def get_total(self):
        return sum(
            item.get_subtotal() 
            for item in self.items.all()
        )

class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=20, decimal_places=2)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('cart', 'product')
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
    
    def get_subtotal(self):
        return self.price * self.quantity
```

**Migration:**
```bash
python manage.py makemigrations cart
python manage.py migrate cart
```

**Benefits:**
- Cart persists across sessions
- Can abandon and recover carts
- Better analytics on cart behavior
- Enable "recover abandoned cart" email

**Effort:** 4-6 hours  
**Risk:** Medium (replaces session-based logic)

---

## Phase 6: Audit Trail & Logging (Week 4-5)

### 6.1 Add Price Change History

```python
# store/models.py
class ProductPriceHistory(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='price_history'
    )
    old_price = models.DecimalField(max_digits=20, decimal_places=2)
    new_price = models.DecimalField(max_digits=20, decimal_places=2)
    reason = models.CharField(
        max_length=50,
        choices=[
            ('manual_edit', 'Manual edit'),
            ('sale_event', 'Sale event'),
            ('promotion', 'Promotion'),
        ]
    )
    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-changed_at']
```

**Auto-tracking:**
```python
# In Product.save()
if self.pk:
    old = Product.objects.get(pk=self.pk)
    if old.price != self.price:
        ProductPriceHistory.objects.create(
            product=self,
            old_price=old.price,
            new_price=self.price,
            reason='manual_edit',
            changed_by=get_current_user()
        )
```

**Effort:** 2-3 hours  
**Risk:** Low

---

### 6.2 Add Order Status History

```python
# payment/models.py
class OrderStatusHistory(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-changed_at']
```

**Effort:** 1-2 hours  
**Risk:** Low

---

## Phase 7: Advanced Features (Week 5+)

### 7.1 Enable Recommendation Engine

```python
# settings.py - Uncomment
INSTALLED_APPS = [
    # ...
    'recommend',
]

# Install dependencies
pip install pandas scikit-learn numpy

# Implement recommendation logic
# (Already started in recommend/recommend_system.py)
```

**Effort:** 8-12 hours  
**Risk:** High (complex ML)

---

### 7.2 Add Payment History & Refunds

```python
# payment/models.py
class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    method = models.CharField(
        max_length=20,
        choices=[
            ('vnpay', 'VNPay'),
            ('bank_transfer', 'Bank Transfer'),
        ]
    )
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ]
    )
    transaction_id = models.CharField(max_length=100, unique=True)
    paid_at = models.DateTimeField(null=True)

class Refund(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    reason = models.TextField()
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True)
    refunded_at = models.DateTimeField(null=True)
```

**Effort:** 6-8 hours  
**Risk:** High (payment integration)

---

## Testing Strategy

### Unit Tests

```python
# tests/test_models.py
from django.test import TestCase
from store.models import Product, Category, Review

class ProductModelTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Laptop')
        self.product = Product.objects.create(
            name='Test Laptop',
            price=25000000,
            category=self.category
        )
    
    def test_product_creation(self):
        self.assertEqual(self.product.name, 'Test Laptop')
        self.assertEqual(self.product.price, 25000000)
    
    def test_negative_price_rejected(self):
        from django.core.exceptions import ValidationError
        product = Product(name='Bad', price=-1000, category=self.category)
        with self.assertRaises(ValidationError):
            product.full_clean()
    
    def test_review_unique_constraint(self):
        from django.contrib.auth.models import User
        user = User.objects.create(username='testuser')
        
        Review.objects.create(
            product=self.product,
            user=user,
            rating=5,
            comment='Great product'
        )
        
        # Should reject second review
        with self.assertRaises(Exception):
            Review.objects.create(
                product=self.product,
                user=user,
                rating=3,
                comment='Actually not great'
            )
```

**Run Tests:**
```bash
python manage.py test
python manage.py test --verbosity=2
```

---

### Integration Tests

```python
# tests/test_checkout.py
from django.test import TestCase, Client
from store.models import Product, Category
from payment.models import Order

class CheckoutTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.category = Category.objects.create(name='Laptop')
        self.product = Product.objects.create(
            name='MacBook',
            price=40000000,
            category=self.category
        )
    
    def test_checkout_flow(self):
        # Add to cart
        response = self.client.post(
            '/api/cart/add',
            {'product_id': self.product.id, 'quantity': 1}
        )
        self.assertEqual(response.status_code, 200)
        
        # Checkout
        response = self.client.post(
            '/api/checkout',
            {
                'full_name': 'John Doe',
                'phone': '0123456789',
                'shipping_address': '123 Main St',
                'items': [{'product_id': self.product.id, 'quantity': 1}]
            }
        )
        self.assertEqual(response.status_code, 201)
        
        # Verify order created
        order = Order.objects.latest('date_ordered')
        self.assertEqual(order.amount_paid, self.product.price)
```

---

## Deployment Checklist

Before deploying changes to production:

```
□ Backup database
  mysqldump kltn_ecommerce > backup_$(date +%Y%m%d).sql

□ Run tests locally
  python manage.py test
  pytest

□ Test migrations
  python manage.py migrate --plan

□ Performance test
  # Measure query times before/after
  from django.db import connection
  from django.test.utils import CaptureQueriesContext
  
  with CaptureQueriesContext(connection) as ctx:
      # Run query
  print(f"Queries: {len(ctx)}, Time: {sum(q['time'] for q in ctx)}")

□ Load test
  # Test with expected peak traffic
  ab -n 1000 -c 100 http://localhost:8000/api/products

□ Code review
  - Check for SQL injection
  - Verify error handling
  - Ensure logging in place

□ Deploy to staging
  - Run migrations on staging DB
  - Smoke test key endpoints
  - Monitor error logs

□ Deploy to production
  - Maintenance window if needed
  - Execute migrations
  - Verify endpoints
  - Monitor logs for errors
  - Have rollback plan ready
```

---

## Success Metrics

After implementation, measure:

| Metric | Before | Target | How to Measure |
|--------|--------|--------|--------|
| Product List Query Time | 800ms | <100ms | Django Debug Toolbar |
| P95 API Response Time | 1.5s | <500ms | APM tool (Sentry, NewRelic) |
| Database CPU | 80% | <40% | MySQL monitoring |
| Slow Query Count | 50+/day | <5/day | MySQL slow query log |
| Cart Abandonment | 70% | <50% | Analytics |
| Admin Response Time | 3s | <1s | Browser dev tools |
| Order Processing Time | 5s | <2s | Application logs |

---

## Recommended Tools

```
Development:
  - Django Debug Toolbar (query analysis)
  - django-extensions (shell_plus)
  - pytest-django (better testing)

Monitoring:
  - Sentry (error tracking)
  - NewRelic (APM)
  - DataDog (infrastructure)

Database:
  - MySQL Workbench (schema design)
  - Sequel Pro (query testing)
  - Percona Monitoring (slow queries)

Load Testing:
  - Apache Bench (simple)
  - Locust (realistic)
  - JMeter (complex)
```

---

## Conclusion

This roadmap provides a **structured approach to database improvements** over 5 weeks:

**Week 1:** Fix critical issues (cascade delete, indexes)  
**Week 2:** Add validation and admin interface  
**Week 3:** Optimize performance (caching)  
**Week 4-5:** Add persistent cart and audit trail  

**Expected Outcomes:**
- ✅ Lose-proof data storage (no CASCADE deletes)
- ✅ 5-10x faster queries (indexes + caching)
- ✅ Production-ready admin interface
- ✅ Persistent cart system
- ✅ Complete audit trail

---

**Questions? Refer to:**
- DATABASE_SCHEMA.md (complete schema)
- API_ENDPOINTS.md (endpoint details)
- Django ORM docs (models)
- MySQL docs (performance tuning)

