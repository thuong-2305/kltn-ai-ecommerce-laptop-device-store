# 📊 KLTN AI E-Commerce Database Schema Documentation

**Project:** KLTN AI E-Commerce  
**Backend:** Django + MySQL  
**Date:** May 12, 2026  
**Status:** Current Production Schema

---

## 📋 Table of Contents

1. [Database Overview](#database-overview)
2. [Complete Schema Definition](#complete-schema-definition)
3. [Entity Relationships](#entity-relationships)
4. [Modules & Functional Areas](#modules--functional-areas)
5. [Quality Analysis](#quality-analysis)
6. [Optimization Recommendations](#optimization-recommendations)
7. [ERD & Visual Mapping](#erd--visual-mapping)

---

## Database Overview

### Technology Stack
- **Database Engine:** MySQL
- **ORM Framework:** Django ORM
- **Python Version:** 3.x
- **Charset:** utf8mb4 (Unicode support for Vietnamese)

### Active Django Apps
```
✅ store        → Products, Categories, Reviews, Sales
✅ payment      → Orders, Order Items, Shipping
✅ cart         → Session-based (not DB-persisted)
✅ wishlist     → Session-based (not DB-persisted)
⚠️  recommend    → Disabled (requires pandas, sklearn)
```

### Authentication Model
- **Base User Model:** Django's `auth_user` (extends with Profile)
- **JWT Authentication:** Rest Framework SimpleJWT
- **Session Management:** Django Sessions (for cart/wishlist)

---

## Complete Schema Definition

### 🔐 Core Tables (Django Auth)

#### Table: `auth_user`
```
id                  BIGINT(20)      PK, AUTO_INCREMENT
username            VARCHAR(150)    UNIQUE, NOT NULL
email               VARCHAR(254)    
first_name          VARCHAR(150)    
last_name           VARCHAR(150)    
password            VARCHAR(128)    
is_active           BOOLEAN         DEFAULT TRUE
is_staff            BOOLEAN         DEFAULT FALSE
is_superuser        BOOLEAN         DEFAULT FALSE
last_login          DATETIME        NULLABLE
date_joined         DATETIME        DEFAULT NOW()
```

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (username)

---

### 📦 Product Management Module

#### Table: `store_category`
```
id                  BIGINT(20)      PK, AUTO_INCREMENT
name                VARCHAR(50)     NOT NULL
image               ImageField      NULLABLE
                                    → Stored as: media/uploads/category/{filename}
```

**Constraints:**
- NOT NULL: name
- NULLABLE: image
- Meta: verbose_name_plural = 'categories'

**Indexes:**
- PRIMARY KEY (id)

---

#### Table: `store_product`
```
id                  BIGINT(20)      PK, AUTO_INCREMENT
name                VARCHAR(50)     NOT NULL
price               DECIMAL(20,0)   NOT NULL, DEFAULT 0
category_id         BIGINT(20)      FK → store_category.id
                                    ON DELETE CASCADE
short_description   VARCHAR(10000)  NULLABLE, DEFAULT ''
description         VARCHAR(10000)  NULLABLE, DEFAULT ''
image               ImageField      NOT NULL
                                    → Stored as: media/uploads/product/{filename}
config              VARCHAR(10000)  NULLABLE, DEFAULT ''
                                    → JSON/Text for product specs
is_sale             BOOLEAN         DEFAULT FALSE
sale_price          DECIMAL(20,0)   DEFAULT 0
```

**Constraints:**
- NOT NULL: name, price, image, category_id
- NULLABLE: short_description, description, config
- FK: category_id → store_category(id)
- Decimal places: 0 (for Vietnamese currency)

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (category_id)
- Likely index on (category_id)
- Likely index on (is_sale)

**Business Logic:**
- Method: `get_discounted_price()` → Auto-calculates sale_price based on active SaleEvent
- Relationship: 1 Product → Many Reviews, Many Thumbnails

---

#### Table: `store_productthumbnail`
```
id                  BIGINT(20)      PK, AUTO_INCREMENT
product_id          BIGINT(20)      FK → store_product.id
                                    ON DELETE CASCADE
image               ImageField      NOT NULL
                                    → Stored as: media/uploads/product/thumbnails/{filename}
```

**Constraints:**
- NOT NULL: product_id, image
- FK: product_id → store_product(id)

**Purpose:** Store multiple images per product for gallery view

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (product_id)

---

#### Table: `store_producimagefeature`
```
id                  BIGINT(20)      PK, AUTO_INCREMENT
product_id          BIGINT(20)      FK/OneToOne → store_product.id
                                    ON DELETE CASCADE, UNIQUE
vector_json         LONGTEXT        
                                    → JSON embeddings for ML/recommendation
```

**Constraints:**
- NOT NULL: product_id, vector_json
- UNIQUE OneToOne: product_id

**Purpose:** ML feature embeddings (for recommendation engine - currently disabled)

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE FOREIGN KEY (product_id)

---

#### Table: `store_saleevent`
```
id                  BIGINT(20)      PK, AUTO_INCREMENT
category_id         BIGINT(20)      FK → store_category.id
                                    ON DELETE CASCADE
discount_percentage DECIMAL(5,2)    DEFAULT 0
start_date          DATETIME        NOT NULL
end_date            DATETIME        NOT NULL
```

**Constraints:**
- NOT NULL: category_id, start_date, end_date
- DEFAULT: discount_percentage = 0

**Purpose:**
- Define discount campaigns per category
- Time-bound sales events

**Business Logic:**
- Method: `is_active()` → Checks if current time is between start_date and end_date
- Signal Handlers: Auto-update all products in category when SaleEvent is saved/deleted

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (category_id)
- Likely index on (start_date, end_date) for time-range queries

---

### ⭐ Review & Rating Module

#### Table: `store_review`
```
id                  BIGINT(20)      PK, AUTO_INCREMENT
product_id          BIGINT(20)      FK → store_product.id
                                    ON DELETE CASCADE
user_id             BIGINT(20)      FK → auth_user.id
                                    ON DELETE CASCADE
rating              POSITIVE INT    NOT NULL (1-5 likely)
comment             TEXT            NULLABLE
sentiment           VARCHAR(10)     NULLABLE
                                    CHOICES: 'positive', 'negative'
score_analysis      DECIMAL(6,5)    NULLABLE, NOT editable
review_date         DATETIME        DEFAULT NOW()
is_spam             BOOLEAN         DEFAULT FALSE
```

**Constraints:**
- NOT NULL: product_id, user_id, rating
- NULLABLE: comment, sentiment, score_analysis
- UNIQUE TOGETHER: (user_id, product_id)
  → One review per user per product

**Purpose:**
- User product reviews with ratings
- Sentiment analysis tracking
- Spam detection

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (product_id)
- FOREIGN KEY (user_id)
- UNIQUE CONSTRAINT (user_id, product_id)

---

### 👤 User Profile Module

#### Table: `store_profile`
```
id                  BIGINT(20)      PK, AUTO_INCREMENT
user_id             BIGINT(20)      FK/OneToOne → auth_user.id
                                    ON DELETE CASCADE, UNIQUE
date_modified       DATETIME        AUTO_NOW
phone               VARCHAR(20)     NULLABLE
address             VARCHAR(200)    NULLABLE
old_cart            VARCHAR(200)    NULLABLE
                                    → JSON string of previous cart items
                                      Format: {'product_id': quantity}
```

**Constraints:**
- NOT NULL: user_id
- UNIQUE OneToOne: user_id
- NULLABLE: phone, address, old_cart

**Purpose:**
- Extended user profile with contact & cart history
- Auto-created on User signup

**Signal Handlers:**
- `post_save` on `auth_user` → Auto-create Profile

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE FOREIGN KEY (user_id)

---

### 📦 Order & Shipping Module

#### Table: `payment_shippingaddress`
```
id                  BIGINT(20)      PK, AUTO_INCREMENT
user_id             BIGINT(20)      FK → auth_user.id
                                    ON DELETE CASCADE, NULLABLE
shipping_full_name  VARCHAR(255)    NOT NULL
shipping_phone      VARCHAR(255)    NOT NULL
shipping_address    VARCHAR(255)    NULLABLE
```

**Constraints:**
- NOT NULL: shipping_full_name, shipping_phone
- NULLABLE: user_id, shipping_address
- FK: user_id → auth_user(id)

**Purpose:** Store customer shipping details per user

**Signal Handlers:**
- `post_save` on `auth_user` → Auto-create default ShippingAddress

**Meta:**
- verbose_name_plural = "Shipping Address"

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id)

---

#### Table: `payment_order`
```
id                  BIGINT(20)      PK, AUTO_INCREMENT
user_id             BIGINT(20)      FK → auth_user.id
                                    ON DELETE CASCADE, NULLABLE
full_name           VARCHAR(255)    NOT NULL
phone               VARCHAR(255)    NOT NULL
shipping_address    TEXT(1500)      NOT NULL
amount_paid         DECIMAL(20,0)   NOT NULL
date_ordered        DATETIME        AUTO_NOW_ADD
shipped             BOOLEAN         DEFAULT FALSE
date_shipped        DATETIME        NULLABLE
```

**Constraints:**
- NOT NULL: full_name, phone, shipping_address, amount_paid
- NULLABLE: user_id, date_shipped
- FK: user_id → auth_user(id)
- Auto timestamps: date_ordered (creation), date_shipped (on shipped=True)

**Purpose:**
- Master order record
- Tracks payment amount and shipping status

**Signal Handlers:**
- `pre_save` on `payment_order` → Auto-set date_shipped when shipped status changes to True

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (user_id)
- Likely index on (shipped) for status queries
- Likely index on (date_ordered) for date range queries

---

#### Table: `payment_orderitem`
```
id                  BIGINT(20)      PK, AUTO_INCREMENT
order_id            BIGINT(20)      FK → payment_order.id
                                    ON DELETE CASCADE
product_id          BIGINT(20)      FK → store_product.id
                                    ON DELETE CASCADE
user_id             BIGINT(20)      FK → auth_user.id
                                    ON DELETE CASCADE, NULLABLE
quantity            POSITIVE INT    DEFAULT 1
price               DECIMAL(20,0)   NOT NULL
```

**Constraints:**
- NOT NULL: order_id, product_id, price, quantity
- NULLABLE: user_id
- FK: order_id → payment_order(id)
- FK: product_id → store_product(id)
- FK: user_id → auth_user(id)

**Purpose:**
- Line items for each order
- Denormalizes product price (captured at purchase time)

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (order_id)
- FOREIGN KEY (product_id)
- FOREIGN KEY (user_id)

---

### 🔄 Session-Based Features (Not DB-Persisted)

#### Cart System (Session-based)
```
✓ Session Key: 'session_key'
  Format: {'product_id': quantity, ...}
  Example: {'1': 2, '5': 1}

✓ Session Key: 'shipping_method'
  Values: 'normal' (20,000 VND) or 'express' (100,000 VND)
  
✓ Storage: Django Session Framework (database-backed)
  Table: django_session (Django internal)
```

**Logic:**
- Cart stored in user session during browsing
- Synced to `store_profile.old_cart` when user is authenticated
- Session destroyed on logout

---

#### Wishlist System (Session-based)
```
✓ Session Key: 'wishlist'
  Format: {'product_id': 'product_price', ...}
  Example: {'1': '25000000', '3': '15000000'}
  
✓ Storage: Django Session Framework
```

**Logic:**
- Wishlist maintained per session
- Can add to cart from wishlist

---

---

## Entity Relationships

### 🔗 Relationship Map

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. ONE-TO-ONE RELATIONSHIPS                               │
│  ───────────────────────────────────                       │
│                                                             │
│  auth_user (1) ──── (1) store_profile                      │
│      ↓                                                       │
│  • Auto-created on user signup                             │
│  • Cascade delete: user → profile deleted                  │
│                                                             │
│  auth_user (1) ──── (1) payment_shippingaddress            │
│      ↓                                                       │
│  • Auto-created on user signup                             │
│  • Can be NULL (guest checkout)                            │
│  • Cascade delete: user → address deleted                  │
│                                                             │
│  store_product (1) ──── (1) store_producimagefeature       │
│      ↓                                                       │
│  • ML embeddings (currently unused)                         │
│  • Cascade delete: product → feature deleted               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  2. ONE-TO-MANY RELATIONSHIPS                              │
│  ────────────────────────────────────                      │
│                                                             │
│  store_category (1) ──── (N) store_product                 │
│      ↓                                                       │
│  • Many products per category                              │
│  • Cascade delete: category → products deleted             │
│  • Index on product.category_id                            │
│                                                             │
│  store_category (1) ──── (N) store_saleevent               │
│      ↓                                                       │
│  • Multiple sales per category                             │
│  • Can overlap in time (logic handles this)                │
│  • Cascade delete: category → sales deleted                │
│                                                             │
│  store_product (1) ──── (N) store_productthumbnail         │
│      ↓                                                       │
│  • Gallery images per product                              │
│  • Cascade delete: product → thumbnails deleted            │
│                                                             │
│  store_product (1) ──── (N) store_review                   │
│      ↓                                                       │
│  • Multiple reviews per product                            │
│  • Unique: one review per user per product                 │
│  • Cascade delete: product → reviews deleted               │
│                                                             │
│  auth_user (1) ──── (N) store_review                       │
│      ↓                                                       │
│  • User writes multiple reviews                            │
│  • Cascade delete: user → reviews deleted                  │
│                                                             │
│  auth_user (1) ──── (N) payment_order                      │
│      ↓                                                       │
│  • User places multiple orders                             │
│  • Can be NULL (guest checkout)                            │
│  • Cascade delete: user → orders deleted                   │
│                                                             │
│  payment_order (1) ──── (N) payment_orderitem              │
│      ↓                                                       │
│  • Order contains multiple items                           │
│  • Cascade delete: order → items deleted                   │
│  • Index on orderitem.order_id                             │
│                                                             │
│  store_product (1) ──── (N) payment_orderitem              │
│      ↓                                                       │
│  • Product appears in multiple orders                       │
│  • Price denormalized (historical record)                  │
│  • Cascade delete: product → orderitems deleted (risky!)   │
│                                                             │
│  auth_user (1) ──── (N) payment_orderitem                  │
│      ↓                                                       │
│  • User's order history                                     │
│  • Optional (many items without direct user link)          │
│  • Cascade delete: user → items deleted (risky!)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  3. IMPLICIT RELATIONSHIPS (Business Logic)                │
│  ──────────────────────────────────────────               │
│                                                             │
│  store_product → store_saleevent (implicit N-N)            │
│  ├─ Through: category_id matching                          │
│  ├─ Logic: product linked to active sales by category      │
│  └─ Method: Product.get_discounted_price()                 │
│                                                             │
│  auth_user → store_profile → session_cart (implicit)       │
│  ├─ Storage: session + old_cart field                      │
│  ├─ Sync: on add/update/delete cart actions                │
│  └─ Format: JSON string in old_cart                        │
│                                                             │
│  auth_user → session_wishlist (implicit session)           │
│  └─ Storage: Django session only                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Cascade Delete Analysis

**⚠️ Critical:** CASCADE rules mean deleting a parent deletes all children:

| Parent → Child | Cascade? | Risk |
|---|---|---|
| Category → Product | YES | ✅ Acceptable (orphaned products removed) |
| Category → SaleEvent | YES | ✅ Acceptable (orphaned sales removed) |
| Product → Review | YES | ⚠️ Medium (loses review history) |
| Product → OrderItem | YES | 🔴 HIGH (loses historical orders!) |
| User → Order | YES | 🔴 HIGH (loses customer history!) |
| User → Review | YES | ⚠️ Medium (loses review history) |
| Order → OrderItem | YES | ✅ Acceptable (orphaned items removed) |

---

## Modules & Functional Areas

### 1️⃣ Authentication & User Management
```
Module: store
Tables:
  └─ auth_user (Django core)
  └─ store_profile

Key Functions:
  • User registration/login (JWT + Session)
  • Profile management (phone, address)
  • Cart history (old_cart field)
  • Session management

API Endpoints:
  POST /api/auth/register
  POST /api/auth/login
  GET  /api/user/profile
```

---

### 2️⃣ Product Catalog
```
Module: store
Tables:
  └─ store_category
  └─ store_product
  └─ store_productthumbnail
  └─ store_producimagefeature

Key Functions:
  • Product CRUD
  • Category hierarchy
  • Product gallery (thumbnails)
  • ML embeddings (disabled)
  • Dynamic price calculation

API Endpoints:
  GET  /api/products
  GET  /api/products/<id>
  GET  /api/categories
  POST /api/products (admin)
  PUT  /api/products/<id> (admin)
```

---

### 3️⃣ Sales & Promotions
```
Module: store
Tables:
  └─ store_saleevent

Key Functions:
  • Category-wide discount campaigns
  • Time-bound promotions
  • Auto price recalculation
  • Active sale detection

Business Logic:
  • Signal: Update products when sale changes
  • Method: Product.get_discounted_price()
  • Check: SaleEvent.is_active()

API Endpoints:
  GET  /api/sales/active
  POST /api/sales (admin)
  DELETE /api/sales/<id> (admin)
```

---

### 4️⃣ Reviews & Ratings
```
Module: store
Tables:
  └─ store_review

Key Functions:
  • Product reviews with 1-5 ratings
  • Sentiment analysis (positive/negative)
  • Spam detection
  • One review per user per product constraint
  • ML scoring (score_analysis field)

Data Flow:
  User → Product → Review
         └─ Sentiment analysis
         └─ ML scoring

API Endpoints:
  GET  /api/products/<id>/reviews
  POST /api/reviews
  PUT  /api/reviews/<id>
  DELETE /api/reviews/<id>
```

---

### 5️⃣ Shopping Cart (Session-based)
```
Module: cart
Storage: Django Session (not DB models)

Key Functions:
  • Session-based cart (stateless)
  • Add/remove/update items
  • Quantity management
  • Shipping method selection
  • Cart persistence (old_cart in Profile)

Data Format:
  session_key: {'1': 2, '5': 1}  # product_id: quantity
  shipping_method: 'normal' or 'express'

Costs:
  • normal: 20,000 VND
  • express: 100,000 VND

API Endpoints:
  GET  /api/cart
  POST /api/cart/add
  POST /api/cart/update
  POST /api/cart/delete
  POST /api/cart/shipping-method
```

---

### 6️⃣ Wishlist (Session-based)
```
Module: wishlist
Storage: Django Session (not DB models)

Key Functions:
  • Session-based wishlist
  • Add/remove items
  • Move to cart
  • Price tracking

Data Format:
  wishlist: {'1': '25000000', '3': '15000000'}  # id: price

API Endpoints:
  GET  /api/wishlist
  POST /api/wishlist/add
  POST /api/wishlist/remove
  POST /api/wishlist/to-cart
```

---

### 7️⃣ Orders & Checkout
```
Module: payment
Tables:
  └─ payment_order
  └─ payment_orderitem
  └─ payment_shippingaddress

Key Functions:
  • Order creation from cart
  • Order tracking
  • Shipping address management
  • Order status (shipped/not shipped)
  • Payment integration (VNPay)

Data Flow:
  Cart → Order → OrderItems
         └─ Shipping Address
         └─ Payment Processing

Order Lifecycle:
  1. User checkout (create Order)
  2. Add OrderItems
  3. Process payment (VNPay callback)
  4. Mark shipped
  5. Customer receives

API Endpoints:
  GET  /api/orders
  GET  /api/orders/<id>
  POST /api/checkout
  PUT  /api/orders/<id>/shipped
  GET  /api/orders/<id>/items
```

---

### 8️⃣ Payment Integration
```
Module: payment
Integration: VNPay Gateway

Key Functions:
  • VNPay payment gateway
  • Payment status tracking
  • Order → Payment mapping
  • Refund handling

Flow:
  1. User submits payment
  2. Redirect to VNPay
  3. User enters card details
  4. VNPay callback to backend
  5. Verify signature & update order
  6. Redirect to frontend result page

API Endpoints:
  POST /api/payment/vnpay-create
  POST /api/payment/vnpay-callback
  GET  /api/payment/status/<order_id>
```

---

### ❓ Recommendation Engine (Currently Disabled)
```
Module: recommend
Status: ⚠️ DISABLED (requires pandas, sklearn)

Tables:
  └─ store_producimagefeature (unused)
  └─ No models in recommend app

Intended Functions:
  • ML-based product recommendations
  • User behavior analysis
  • Collaborative filtering
  • Content-based filtering

Why Disabled:
  • Heavy dependencies (pandas, scikit-learn)
  • Not implemented in backend
  • Could be enabled later with proper setup
```

---

## Quality Analysis

### ✅ Strengths

1. **Clear Separation of Concerns**
   - Distinct modules: store, payment, cart, wishlist
   - Single responsibility per model

2. **Proper Foreign Key Usage**
   - All relationships clearly defined
   - CASCADE deletes prevent orphaned records

3. **User Profile Extension**
   - Extends Django User model cleanly
   - Tracks cart history

4. **Timestamping**
   - Auto-added creation/modification dates
   - Useful for auditing

5. **Unique Constraints**
   - One-to-One relationships properly defined
   - User can only review product once

6. **Business Logic Signals**
   - Auto-update prices on sales changes
   - Auto-create shipping address on signup
   - Good use of Django signals

### ⚠️ Medium Issues

1. **Session-based Cart/Wishlist**
   - ❌ No order history if user not logged in
   - ❌ Can't retrieve old wishlist after logout
   - ✅ But: Simpler implementation, no cart table
   - **Fix:** Add Cart & Wishlist models if persistence needed

2. **Price Denormalization**
   - OrderItem stores price (good for historical accuracy)
   - But Product has both price and sale_price
   - **Risk:** Confusion about "current" vs "sale" price
   - **Fix:** Add clear logic for which to use

3. **Decimal Precision**
   - `DECIMAL(20,0)` means NO decimal places
   - Vietnamese currency (₫) typically doesn't need cents
   - ✅ Fine for currency, but inflexible
   - **Fix:** Use `DECIMAL(19,2)` for better precision

4. **User ID in OrderItem**
   - Redundant: Can be derived from Order.user_id
   - ✅ But: Useful for denormalization/caching
   - **Issue:** Adds complexity for little benefit

5. **Missing Timestamps**
   - OrderItem: No creation/modification time
   - ShippingAddress: No modification tracking
   - **Fix:** Add auto_now_add and auto_now fields

### 🔴 Critical Issues

1. **Product Deletion Cascade**
   - ❌ CRITICAL: Deleting product deletes all OrderItems
   - ❌ Loses historical order data
   - **Fix:** Change to `on_delete=models.PROTECT` or `SET_NULL`
   ```python
   product = models.ForeignKey(Product, 
       on_delete=models.PROTECT,  # Prevent deletion
       null=False)
   ```

2. **User Deletion Cascade**
   - ❌ CRITICAL: Deleting user deletes all orders
   - ❌ Loses customer transaction history
   - **Fix:** Change to `on_delete=models.SET_NULL`
   ```python
   user = models.ForeignKey(User,
       on_delete=models.SET_NULL,
       null=True, blank=True)
   ```

3. **No Admin Registration for Store Models**
   - ❌ Can't manage products/categories through Django admin
   - **Fix:** Add admin.py registrations:
   ```python
   admin.site.register(Category)
   admin.site.register(Product, ProductAdmin)
   admin.site.register(Review, ReviewAdmin)
   ```

4. **Inconsistent Null Handling**
   - Some ForeignKeys nullable (Order.user_id)
   - Others not (Product.category_id)
   - ❓ Unclear intent: guest vs auth requirements
   - **Fix:** Document null=True/False convention

5. **No Data Validation Constraints**
   - Rating: Marked `PositiveIntegerField` but no max_value=5
   - Price: Could be negative (no validators)
   - Phone: No format validation
   - **Fix:** Add validators:
   ```python
   rating = models.IntegerField(
       validators=[MinValueValidator(1), MaxValueValidator(5)]
   )
   ```

6. **Missing Indexes on Common Queries**
   - No index on `product.is_sale` (frequent filtering)
   - No index on `review.review_date` (time-range queries)
   - No index on `order.date_ordered` (user dashboard)
   - **Fix:** Add `db_index=True` or explicit indexes

---

## Optimization Recommendations

### 🎯 Priority 1: Fix Critical Issues

```python
# ❌ BEFORE (payment/models.py - OrderItem)
class OrderItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

# ✅ AFTER
class OrderItem(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,  # Prevent product deletion
        null=False
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,  # Preserve order history
        null=True,
        blank=True
    )
```

### 🎯 Priority 2: Add Missing Indexes

```python
class Product(models.Model):
    # ...
    is_sale = models.BooleanField(default=False, db_index=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        default=1,
        db_index=True
    )

class Review(models.Model):
    # ...
    review_date = models.DateTimeField(
        default=datetime.now,
        db_index=True
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        db_index=True
    )

class Order(models.Model):
    # ...
    date_ordered = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )
    shipped = models.BooleanField(
        default=False,
        db_index=True
    )
```

### 🎯 Priority 3: Add Data Validation

```python
from django.core.validators import MinValueValidator, MaxValueValidator

class Review(models.Model):
    rating = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )

class Product(models.Model):
    price = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    sale_price = models.DecimalField(
        max_digits=20,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
```

### 🎯 Priority 4: Add Missing Timestamps

```python
class OrderItem(models.Model):
    # ...
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ShippingAddress(models.Model):
    # ...
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 🎯 Priority 5: Normalize Sales Logic

```python
# Create view or property to clarify pricing
class Product(models.Model):
    def get_current_price(self):
        """Returns sale_price if product on sale, else price"""
        return self.sale_price if self.is_sale else self.price
    
    def get_discount_percentage(self):
        """Calculate discount from original vs sale price"""
        if not self.is_sale or self.price == 0:
            return 0
        return ((self.price - self.sale_price) / self.price) * 100
```

### 🎯 Priority 6: Add Proper Admin

```python
# store/admin.py
from django.contrib import admin
from .models import Category, Product, Review, SaleEvent

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'product_count']
    search_fields = ['name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'sale_price', 'is_sale', 'category']
    list_filter = ['is_sale', 'category', 'created_at']
    search_fields = ['name', 'description']
    fieldsets = (
        ('Basic Info', {'fields': ('name', 'category', 'image')}),
        ('Pricing', {'fields': ('price', 'is_sale', 'sale_price')}),
        ('Details', {'fields': ('short_description', 'description', 'config')}),
    )

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'sentiment', 'review_date']
    list_filter = ['rating', 'sentiment', 'is_spam']
    search_fields = ['product__name', 'user__username']
    readonly_fields = ['score_analysis']
```

### 🎯 Priority 7: Migrate to Persistent Cart (Optional)

```python
# If high cart abandonment, add Cart models:

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=20, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## ERD & Visual Mapping

### ER Diagram (Text-based)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          KLTN AI E-Commerce                              │
│                      Entity Relationship Diagram                          │
└──────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │  auth_user  │
                              ├─────────────┤
                              │ id (PK)     │
                              │ username    │
                              │ email       │
                              │ password    │
                              └────┬────────┘
                    ┌──────┬────────┼────────┬──────┐
                    │      │        │        │      │
                    │ 1:1  │ 1:1    │ 1:N    │ 1:N  │
                    ▼      ▼        ▼        ▼      ▼
        ┌──────────────┐  ┌─────────────────┐  ┌────────┐  ┌─────────┐
        │store_profile │  │payment_shipping │  │store_  │  │payment_ │
        ├──────────────┤  │address          │  │review  │  │order    │
        │id (PK)       │  ├─────────────────┤  ├────────┤  ├─────────┤
        │user_id (FK)  │  │id (PK)          │  │id (PK) │  │id (PK)  │
        │phone         │  │user_id (FK)     │  │product_│  │user_id  │
        │address       │  │shipping_address │  │id (FK) │  │(FK)     │
        │old_cart      │  └─────────────────┘  │user_id │  │shipped  │
        └──────────────┘                       │(FK)    │  │date_ord │
                                               │rating  │  └────┬────┘
                                               └────────┘       │
                                                              1:N│
                                                                 ▼
                                    ┌──────────────────────────────────┐
                                    │   payment_orderitem              │
                                    ├──────────────────────────────────┤
                                    │ id (PK)                          │
                                    │ order_id (FK) ───────────────┐   │
                                    │ product_id (FK) ─────────┐   │   │
                                    │ user_id (FK) ────────┐    │   │   │
                                    │ quantity              │    │   │   │
                                    │ price                 │    │   │   │
                                    └──────────────────┬────┘    │   │   │
                                                      │         │   │   │
                                    ┌─────────────────┴─────┐    │   │   │
                                    │                       │    │   │   │
                    ┌───────────────┴──────────┐   ┌────────┴────┼───┼───┴─────────┐
                    │                          │   │             │   │             │
            ┌───────▼─────────┐    ┌───────────▼──▼──┐   ┌───────▼──▼──────┐     │
            │ store_category  │    │ store_product   │   │   store_review  │     │
            ├─────────────────┤    ├─────────────────┤   │                 │     │
            │ id (PK)         │    │ id (PK)         │   │ (Already shown) │     │
            │ name            │ 1:N│ category_id(FK)◄─┼───┤                 │     │
            │ image           │◄───│ price           │   └─────────────────┘     │
            └─────────────────┘    │ sale_price      │                          │
                    │              │ is_sale         │                          │
                    │              │ image           │                          │
                    │            1:N└─────────────────┘                          │
                    │              │                                            │
                    │              ├─ 1:1 ──► product_imagefeature              │
                    │              │          (ML embeddings, unused)           │
                    │              │                                            │
                    │              └─ 1:N ──► product_thumbnail                │
                    │                         (gallery images)                  │
                    │                                                           │
                    │                                                           │
            1:N ┌───▼─────────────────────┐                                    │
    ┌───────────►│ store_saleevent       │                                    │
    │   ┌────────│ ├─────────────────────┤                                    │
    │   │        │ id (PK)               │                                    │
    │   │        │ category_id (FK)      │                                    │
    │   │        │ discount_percentage   │◄──────────────────────────────────┘
    │   │        │ start_date            │
    │   │        │ end_date              │
    │   │        └─────────────────────────┘
    │   │
    │   └─ Signal: Update Product prices
    │      when SaleEvent changes
    │
    └─ Signal: Auto-create SaleEvent
       for new Category


Legend:
  PK   = Primary Key
  FK   = Foreign Key
  1:1  = One-to-One Relationship
  1:N  = One-to-Many Relationship
  ◄──► = Bidirectional relationship
```

---

### Module Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  FRONTEND (React + Vite)                                    │
│  └─ Components consume API endpoints                        │
│                                                             │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API (DRF)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                                                             │
│  BACKEND (Django)                                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ store (Product Catalog)                             │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ • Product, Category, Review                         │   │
│  │ • ProductThumbnail, ProductImageFeature             │   │
│  │ • SaleEvent                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│           │                          │                      │
│           │                          └──► (optional)        │
│           │                              recommend          │
│           │                          (ML features, unused)  │
│           │                                                 │
│           ├────────────────────────────────────┐            │
│           │                                    │            │
│  ┌────────▼──────────┐         ┌──────────────▼──────┐    │
│  │ cart (Session)    │         │ payment (Orders)    │    │
│  ├───────────────────┤         ├─────────────────────┤    │
│  │ • Session-based   │         │ • Order             │    │
│  │ • No DB models    │         │ • OrderItem         │    │
│  │ • Stored in       │         │ • ShippingAddress   │    │
│  │   Profile.old_cart│◄────────│                     │    │
│  └───────────────────┘         │ • VNPay gateway     │    │
│           │                    └─────────────────────┘    │
│           │                                                │
│  ┌────────▼──────────┐                                     │
│  │ wishlist (Session)│                                     │
│  ├───────────────────┤                                     │
│  │ • Session-based   │                                     │
│  │ • No DB models    │                                     │
│  │ • Move to cart    │                                     │
│  └───────────────────┘                                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SHARED                                              │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ • auth_user (Django core)                           │   │
│  │ • Django Sessions (cart, wishlist)                  │   │
│  │ • Django admin                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                      │ MySQL
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                                                             │
│  DATABASE (MySQL)                                           │
│  • InnoDB storage engine                                    │
│  • UTF8MB4 charset (Vietnamese support)                     │
│  • 13 main tables                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary Statistics

### Database Footprint

| Metric | Value |
|--------|-------|
| **Total Django Apps** | 5 active + 1 disabled |
| **Active Models** | 13 |
| **Tables** | 16+ (including Django core tables) |
| **Primary Relationships** | 8 (1:1, 1:N) |
| **Foreign Keys** | 12 |
| **Unique Constraints** | 3 |
| **Auto-timestamped Tables** | 4 |
| **Session-based Features** | 2 (cart, wishlist) |

### App Breakdown

| App | Models | Tables | Status |
|-----|--------|--------|--------|
| store | 7 | 7 | ✅ Active |
| payment | 3 | 3 | ✅ Active |
| cart | 0 | 1 (session) | ✅ Session-based |
| wishlist | 0 | 1 (session) | ✅ Session-based |
| recommend | 0 | 0 | ⚠️ Disabled |
| django.auth | 2 | 3+ | ✅ Core |

### Query Performance Considerations

**Slow Query Risk Areas:**
1. Product list with sales + reviews (multiple JOINs)
2. Order history with items + products (nested relations)
3. Review aggregation (GROUP BY rating, sentiment)
4. Search products by name (LIKE on long text)

**Recommendations:**
- Add database indexes on frequently filtered fields
- Use select_related/prefetch_related in views
- Consider denormalization for review stats
- Implement caching for product lists

---

## Conclusion

### Current State
The database schema is **well-structured for a mid-scale e-commerce platform** with clear separation of concerns and proper use of Django ORM patterns. The implementation demonstrates good understanding of relationships and signals.

### Immediate Needs
1. **Fix CASCADE delete issues** (CRITICAL)
2. **Add missing indexes** (Performance)
3. **Complete admin interface** (Usability)
4. **Add data validation** (Reliability)

### Future Roadmap
1. Implement persistent cart/wishlist if needed
2. Enable recommendation engine with proper setup
3. Add payment history/refund tracking
4. Implement product variants (sizes, colors)
5. Add inventory management
6. Implement customer service/ticket system
7. Add analytics/reporting module

---

**Document Generated:** May 12, 2026  
**Framework:** Django 5.2  
**Database:** MySQL (utf8mb4)  
**ORM:** Django ORM  
**Prepared By:** AI Code Analyst
