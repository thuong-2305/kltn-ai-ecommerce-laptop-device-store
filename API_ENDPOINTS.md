# API Endpoint Mapping & Module Documentation

## Overview
This document maps all API endpoints to their underlying database models and business logic.

Generated: May 12, 2026  
Framework: Django REST Framework + SimpleJWT

---

## 1. AUTHENTICATION ENDPOINTS

### User Registration / Login (auth_user table)

```
POST /api/auth/register
├─ Request: {username, email, password}
├─ Creates: auth_user record
├─ Triggers: store_profile auto-created (signal)
├─ Triggers: payment_shippingaddress auto-created (signal)
└─ Response: {token, user_id}

POST /api/auth/login
├─ Query: auth_user (match username/email + password)
├─ Returns: JWT token (SimpleJWT)
└─ Response: {token, refresh_token}

POST /api/auth/refresh
├─ Validates: JWT refresh token
└─ Returns: New access token

POST /api/auth/logout
├─ Invalidates: Session
└─ Clears: Session data
```

**Database Operations:**
- SELECT from `auth_user` WHERE username/email
- INSERT into `store_profile` (signal)
- INSERT into `payment_shippingaddress` (signal)
- SELECT/UPDATE `django_session`

---

## 2. USER PROFILE ENDPOINTS

### Get User Profile

```
GET /api/user/profile
├─ Auth: Required (JWT)
├─ Query: store_profile WHERE user_id = current_user
├─ Response: {phone, address, old_cart}
└─ Performance: O(1)

PUT /api/user/profile
├─ Auth: Required
├─ Update: store_profile (phone, address)
├─ Note: old_cart auto-managed by cart system
└─ Response: Updated profile
```

**Database Operations:**
- SELECT from `store_profile` WHERE user_id
- UPDATE `store_profile`

---

## 3. PRODUCT CATALOG ENDPOINTS

### List Products

```
GET /api/products
├─ Query Params: ?category=1&search=laptop&page=1&limit=20
├─ Queries:
│  ├─ SELECT * FROM store_product
│  │  WHERE category_id IN (filter) AND name LIKE (search)
│  ├─ SELECT * FROM store_category (for filtering)
│  └─ SELECT AVG(rating), COUNT(*) FROM store_review
│     GROUP BY product_id (for ratings)
├─ Response: [{id, name, price, sale_price, image, category, rating, review_count}, ...]
└─ Performance: O(n*m) - optimize with select_related/prefetch_related

GET /api/products/<id>
├─ Query:
│  ├─ SELECT * FROM store_product WHERE id
│  ├─ SELECT * FROM store_productthumbnail WHERE product_id
│  ├─ SELECT * FROM store_review WHERE product_id
│  └─ SELECT AVG(rating) FROM store_review WHERE product_id
├─ Response: Complete product data with thumbnails and reviews
└─ Performance: O(n) for reviews
```

**Database Operations:**
- SELECT from `store_product`
- SELECT from `store_category`
- SELECT from `store_productthumbnail`
- SELECT from `store_review` (aggregation)

---

### Create/Update Product (Admin)

```
POST /api/products
├─ Auth: Admin only
├─ Request: {name, price, category_id, image, description, config}
├─ Creates: store_product record
├─ Returns: product_id
└─ Performance: O(1)

PUT /api/products/<id>
├─ Auth: Admin only
├─ Updates: store_product fields
├─ Triggers: SaleEvent signals (if is_sale changes)
└─ Response: Updated product

DELETE /api/products/<id>
├─ Auth: Admin only
├─ WARNING: Cascade deletes all:
│  ├─ ProductThumbnail
│  ├─ ProductImageFeature
│  ├─ Reviews
│  ├─ OrderItems (CRITICAL - loses order history!)
│  └─ Appears in CartItems
└─ Recommendation: Use SOFT DELETE instead
```

**Database Operations:**
- INSERT into `store_product`
- UPDATE `store_product`
- DELETE from `store_product` (cascade)
- Auto-update `store_profile.old_cart` if in active carts

---

### Upload Product Thumbnail

```
POST /api/products/<id>/thumbnails
├─ Auth: Admin only
├─ Request: FormData with image file
├─ Creates: store_productthumbnail record
├─ Storage: /media/uploads/product/thumbnails/{filename}
└─ Response: {thumbnail_id, url}

DELETE /api/products/<id>/thumbnails/<thumb_id>
├─ Auth: Admin only
├─ Deletes: store_productthumbnail record
└─ Removes: Physical file from storage
```

**Database Operations:**
- INSERT into `store_productthumbnail`
- DELETE from `store_productthumbnail`

---

## 4. CATEGORY ENDPOINTS

### List Categories

```
GET /api/categories
├─ Query:
│  ├─ SELECT * FROM store_category
│  └─ COUNT(*) FROM store_product WHERE category_id (per category)
├─ Response: [{id, name, image, product_count}, ...]
└─ Performance: O(n)

GET /api/categories/<id>
├─ Query:
│  ├─ SELECT * FROM store_category WHERE id
│  └─ SELECT COUNT(*) FROM store_product WHERE category_id
├─ Response: {id, name, image, product_count, products:[...]}
└─ Performance: O(m) where m = products in category
```

**Database Operations:**
- SELECT from `store_category`
- SELECT COUNT from `store_product`

---

### Create/Update Category (Admin)

```
POST /api/categories
├─ Auth: Admin only
├─ Request: {name, image}
├─ Creates: store_category
└─ Response: category_id

PUT /api/categories/<id>
├─ Updates: store_category (name, image)
└─ Note: Changing category affects all related products

DELETE /api/categories/<id>
├─ WARNING: Cascade deletes:
│  ├─ All store_product records
│  ├─ All store_saleevent records
│  └─ All related reviews, order items
└─ Recommendation: SOFT DELETE instead
```

**Database Operations:**
- INSERT into `store_category`
- UPDATE `store_category`
- DELETE from `store_category` (cascade)

---

## 5. SALES & PROMOTIONS ENDPOINTS

### List Active Sales

```
GET /api/sales/active
├─ Query:
│  └─ SELECT * FROM store_saleevent
│     WHERE start_date <= NOW() AND end_date >= NOW()
├─ Response: [{id, category_id, category_name, discount_percentage, start_date, end_date}, ...]
└─ Performance: O(n)

GET /api/sales/history
├─ Query:
│  └─ SELECT * FROM store_saleevent
│     ORDER BY start_date DESC
├─ Pagination: page, limit
└─ Response: [{...}, ...]
```

**Database Operations:**
- SELECT from `store_saleevent`
- Query by date range

---

### Create/Update Sale (Admin)

```
POST /api/sales
├─ Auth: Admin only
├─ Request: {category_id, discount_percentage, start_date, end_date}
├─ Creates: store_saleevent
├─ Triggers: Signal → Update all products in category
│  └─ For each product:
│     ├─ Call product.get_discounted_price()
│     ├─ Updates: is_sale, sale_price
│     └─ Saves: store_product
└─ Response: sale_id

PUT /api/sales/<id>
├─ Updates: store_saleevent
├─ Triggers: Recalculate all product prices
└─ Response: Updated sale

DELETE /api/sales/<id>
├─ Deletes: store_saleevent
├─ Triggers: Recalculate prices (remove sale pricing)
└─ Response: {status: 'deleted'}
```

**Database Operations:**
- INSERT into `store_saleevent`
- UPDATE `store_saleevent`
- DELETE from `store_saleevent` (triggers product updates)
- UPDATE `store_product` for each affected product

---

## 6. REVIEW & RATING ENDPOINTS

### List Product Reviews

```
GET /api/products/<id>/reviews
├─ Query:
│  └─ SELECT * FROM store_review
│     WHERE product_id = <id> AND is_spam = 0
├─ Sorting: ?sort=recent|helpful (by review_date or rating)
├─ Pagination: page, limit
├─ Response: [{id, user, rating, comment, sentiment, review_date, helpful_count}, ...]
└─ Performance: O(n)

GET /api/products/<id>/reviews/stats
├─ Query:
│  └─ SELECT rating, COUNT(*), AVG(*), sentiment FROM store_review
│     WHERE product_id = <id> AND is_spam = 0
│     GROUP BY rating, sentiment
├─ Response: {avg_rating, total_reviews, rating_distribution: {1: x, 2: y, ...}}
└─ Performance: O(n) but cacheable
```

**Database Operations:**
- SELECT from `store_review` WHERE product_id
- Aggregation (COUNT, AVG, GROUP BY)

---

### Submit Review

```
POST /api/reviews
├─ Auth: Required (JWT)
├─ Request: {product_id, rating, comment}
├─ Validation:
│  ├─ Check: User not already reviewed this product
│  │  (UNIQUE(user_id, product_id) constraint)
│  └─ Check: User purchased product (optional business rule)
├─ Creates: store_review
├─ Fields Auto-filled:
│  ├─ user_id = current_user
│  ├─ review_date = NOW()
│  └─ is_spam = 0
├─ Async: ML scoring
│  └─ Sets: sentiment, score_analysis
└─ Response: {review_id}

PUT /api/reviews/<id>
├─ Auth: Required (author only)
├─ Updates: store_review (rating, comment)
├─ Recalculates: sentiment, score_analysis
└─ Response: Updated review

DELETE /api/reviews/<id>
├─ Auth: Required (author or admin)
├─ Soft delete: is_spam = 1
└─ Alternative: Physical delete from store_review
```

**Database Operations:**
- INSERT into `store_review`
- SELECT to check uniqueness
- UPDATE `store_review`
- DELETE from `store_review` or UPDATE is_spam

---

### Review Moderation (Admin)

```
GET /api/admin/reviews/spam
├─ Query:
│  └─ SELECT * FROM store_review WHERE is_spam = 1
├─ Response: [{id, user, product, comment, flagged_date}, ...]
└─ Performance: O(n)

POST /api/admin/reviews/<id>/mark-spam
├─ Auth: Admin only
├─ Updates: store_review.is_spam = 1
└─ Effect: Review hidden from customer view

POST /api/admin/reviews/<id>/approve
├─ Auth: Admin only
├─ Updates: store_review.is_spam = 0
└─ Effect: Review visible to customers
```

**Database Operations:**
- SELECT from `store_review` WHERE is_spam
- UPDATE `store_review`.is_spam

---

## 7. CART ENDPOINTS (Session-based)

### Get Cart

```
GET /api/cart
├─ Storage: Django Session (django_session table)
├─ Session key: 'session_key'
├─ Format: {'1': 2, '5': 1}  # product_id: quantity
├─ Response: {
│  ├─ items: [{id, name, price, quantity, subtotal}, ...],
│  ├─ total: sum(price * quantity),
│  ├─ shipping_method: 'normal' or 'express',
│  ├─ shipping_cost: 20000 or 100000,
│  └─ total_final: total + shipping_cost
│ }
└─ Performance: O(n) where n = items in cart
```

**Database Operations:**
- SELECT from `django_session` WHERE session_key
- SELECT from `store_product` WHERE id IN (cart keys)

---

### Add to Cart

```
POST /api/cart/add
├─ Request: {product_id, quantity}
├─ Session Update: session_key[product_id] = quantity
├─ If Authenticated: Sync to Profile
│  └─ Update: store_profile.old_cart = JSON(session)
├─ Response: {
│  ├─ message: 'Added successfully' or 'Already in cart',
│  ├─ cart_count: len(session),
│  └─ new_total: calculated total
│ }
└─ Performance: O(1) session update
```

**Database Operations:**
- UPDATE `django_session`
- If authenticated: UPDATE `store_profile`.old_cart

---

### Update Cart Item

```
POST /api/cart/update
├─ Request: {product_id, quantity}
├─ Session Update: session_key[product_id] = new_quantity
├─ If Authenticated: Sync to Profile
├─ Response: {quantity, updated_total}
└─ Performance: O(1)

POST /api/cart/delete
├─ Request: {product_id}
├─ Session Update: DELETE session_key[product_id]
├─ If Authenticated: Sync to Profile
├─ Response: {message, updated_total}
└─ Performance: O(1)
```

**Database Operations:**
- UPDATE/DELETE from `django_session`
- If authenticated: UPDATE `store_profile`.old_cart

---

### Update Shipping Method

```
POST /api/cart/shipping-method
├─ Request: {shipping_method: 'normal' or 'express'}
├─ Session Update: session['shipping_method'] = method
├─ Costs:
│  ├─ 'normal': 20,000 VND
│  └─ 'express': 100,000 VND
├─ Response: {
│  ├─ shipping_cost: calculated,
│  ├─ total_final: total + shipping
│  └─ method: selected_method
│ }
└─ Performance: O(1)
```

**Database Operations:**
- UPDATE `django_session`

---

## 8. WISHLIST ENDPOINTS (Session-based)

### Get Wishlist

```
GET /api/wishlist
├─ Storage: Django Session
├─ Session key: 'wishlist'
├─ Format: {'1': '25000000', '3': '15000000'}  # id: price
├─ Response: {
│  ├─ items: [{id, name, price, image}, ...],
│  ├─ total_value: sum(prices),
│  └─ item_count: len(wishlist)
│ }
└─ Performance: O(n)
```

**Database Operations:**
- SELECT from `django_session` WHERE session_key
- SELECT from `store_product` WHERE id IN (wishlist keys)

---

### Add to Wishlist

```
POST /api/wishlist/add
├─ Request: {product_id}
├─ Query: GET product.price
├─ Session Update: session['wishlist'][product_id] = price
├─ Response: {message, item_count}
└─ Performance: O(1)

POST /api/wishlist/remove
├─ Request: {product_id}
├─ Session Update: DELETE session['wishlist'][product_id]
├─ Response: {message, item_count}
└─ Performance: O(1)

POST /api/wishlist/to-cart
├─ Request: {product_id}
├─ Operations:
│  ├─ Add to cart: session_key[product_id] = quantity
│  ├─ Remove from wishlist: DELETE session['wishlist'][product_id]
│  └─ Sync to profile if authenticated
├─ Response: {message}
└─ Performance: O(1)
```

**Database Operations:**
- UPDATE/DELETE from `django_session`
- SELECT from `store_product` for price

---

## 9. ORDER & CHECKOUT ENDPOINTS

### Create Order (Checkout)

```
POST /api/checkout
├─ Auth: Optional (guest checkout allowed)
├─ Request: {
│  ├─ full_name,
│  ├─ phone,
│  ├─ shipping_address,
│  └─ items: [{product_id, quantity}, ...]
│ }
├─ Creates: payment_order record
│  └─ INSERT: {user_id, full_name, phone, shipping_address, amount_paid, date_ordered}
├─ Creates: payment_orderitem records (one per cart item)
│  └─ For each item:
│     ├─ INSERT: {order_id, product_id, user_id, quantity, price}
│     └─ Price captured from store_product.sale_price or .price
├─ Clears: Django session cart
├─ Response: {
│  ├─ order_id,
│  ├─ total_amount,
│  ├─ redirect: 'payment_gateway_url'
│  └─ status: 'pending_payment'
│ }
└─ Performance: O(n) where n = cart items

GET /api/orders
├─ Auth: Required
├─ Query:
│  └─ SELECT * FROM payment_order
│     WHERE user_id = current_user
│     ORDER BY date_ordered DESC
├─ Response: [{id, total, date_ordered, shipped, status}, ...]
└─ Performance: O(n)

GET /api/orders/<id>
├─ Auth: Required (owner or admin)
├─ Query:
│  ├─ SELECT * FROM payment_order WHERE id
│  ├─ SELECT * FROM payment_orderitem WHERE order_id
│  └─ SELECT * FROM store_product WHERE id (for each item)
├─ Response: {
│  ├─ order_details: {...},
│  ├─ items: [{product_name, quantity, price}, ...],
│  └─ status: 'pending' | 'paid' | 'shipped' | 'delivered'
│ }
└─ Performance: O(m) where m = items in order
```

**Database Operations:**
- INSERT into `payment_order`
- INSERT into `payment_orderitem` (for each item)
- SELECT from `payment_order` WHERE user_id
- SELECT from `payment_orderitem` WHERE order_id
- DELETE from `django_session` (clear cart)

---

## 10. SHIPPING ENDPOINTS

### Get/Update Shipping Address

```
GET /api/shipping-address
├─ Auth: Required
├─ Query:
│  └─ SELECT * FROM payment_shippingaddress WHERE user_id
├─ Response: {id, full_name, phone, address}
└─ Auto-created on signup (signal)

PUT /api/shipping-address
├─ Auth: Required
├─ Request: {full_name, phone, address}
├─ Updates: payment_shippingaddress
├─ Response: Updated address
└─ Performance: O(1)
```

**Database Operations:**
- SELECT from `payment_shippingaddress` WHERE user_id
- UPDATE `payment_shippingaddress`

---

### Mark Order as Shipped (Admin)

```
PUT /api/admin/orders/<id>/shipped
├─ Auth: Admin only
├─ Updates: payment_order.shipped = True
├─ Triggers: Signal → set date_shipped = NOW()
├─ Response: {message, date_shipped}
└─ Performance: O(1)
```

**Database Operations:**
- UPDATE `payment_order` SET shipped, date_shipped

---

## 11. PAYMENT GATEWAY ENDPOINTS

### Initiate VNPay Payment

```
POST /api/payment/vnpay-create
├─ Auth: Optional
├─ Request: {order_id, amount, return_url}
├─ Query: SELECT * FROM payment_order WHERE id
├─ VNPay Integration:
│  ├─ Create payment URL
│  ├─ Sign with secret key
│  └─ Redirect to VNPay
├─ Response: {payment_url}
└─ Performance: O(1)
```

**Database Operations:**
- SELECT from `payment_order`

---

### VNPay Callback Handler

```
POST /api/payment/vnpay-callback
├─ Auth: None (VNPay server)
├─ Request: VNPay response with signature
├─ Validation:
│  ├─ Verify signature with secret key
│  ├─ Check amount matches
│  └─ Check order_id exists
├─ Updates: payment_order.amount_paid = confirmed_amount
├─ Business Logic:
│  ├─ If success:
│  │  └─ Create shipping notification
│  ├─ If fail:
│  │  └─ Keep order in pending
│  └─ Send confirmation email
└─ Performance: O(1)
```

**Database Operations:**
- SELECT from `payment_order` WHERE id
- UPDATE `payment_order`.amount_paid

---

## 12. ADMIN ANALYTICS ENDPOINTS

### Dashboard Stats

```
GET /api/admin/stats
├─ Queries:
│  ├─ SELECT COUNT(*) FROM auth_user
│  ├─ SELECT COUNT(*) FROM payment_order
│  ├─ SELECT SUM(amount_paid) FROM payment_order
│  ├─ SELECT COUNT(*) FROM store_product
│  ├─ SELECT COUNT(*) FROM store_review
│  └─ SELECT COUNT(*) FROM store_review WHERE is_spam = 1
├─ Response: {
│  ├─ total_users,
│  ├─ total_orders,
│  ├─ total_revenue,
│  ├─ total_products,
│  ├─ total_reviews,
│  └─ spam_reviews
│ }
└─ Performance: O(1) or O(n) depending on index
```

**Database Operations:**
- COUNT queries (should use indexes)
- SUM queries

---

### Sales Report

```
GET /api/admin/reports/sales
├─ Params: ?period=day|week|month|year&start_date=2024-01-01&end_date=2024-12-31
├─ Queries:
│  ├─ SELECT DATE(date_ordered), COUNT(*), SUM(amount_paid)
│     FROM payment_order
│     WHERE date_ordered BETWEEN start AND end
│     GROUP BY DATE(date_ordered)
│  └─ SELECT product_id, SUM(quantity) FROM payment_orderitem
│     WHERE order_id IN (matching orders)
│     GROUP BY product_id
├─ Response: {
│  ├─ daily_revenue: [{date, count, total}, ...],
│  ├─ top_products: [{product_name, quantity_sold, revenue}, ...],
│  └─ period_summary: {total_orders, total_revenue}
│ }
└─ Performance: O(n) - use date indexes
```

**Database Operations:**
- SELECT with GROUP BY on date
- JOIN between payment_order and payment_orderitem

---

## Performance Optimization Notes

### Query Optimization

1. **N+1 Query Problems:**
   - ❌ Bad: Loop through products, query reviews per product
   - ✅ Good: Use `select_related()` or `prefetch_related()`
   - ✅ Good: Use database aggregation (GROUP BY)

2. **Caching Strategy:**
   - Cache active sales (invalidate on changes)
   - Cache product listings (cache per category)
   - Cache user profiles (TTL: 5 minutes)
   - Cache review stats (TTL: 1 hour)

3. **Pagination:**
   - Always paginate product lists
   - Recommended: limit=20 per page
   - Use offset-based or cursor-based pagination

4. **Indexes Required:**
   ```
   store_product: (category_id, is_sale)
   store_review: (product_id, review_date)
   payment_order: (user_id, date_ordered, shipped)
   payment_orderitem: (order_id, product_id)
   ```

### Session Management
- Cart/Wishlist stored in Django sessions
- Session backend: Default (database-backed django_session)
- Consider Redis backend for better performance at scale
- Session expiry: Default 2 weeks

---

## Error Handling

### Common Status Codes

```
200 OK              - Successful GET, PUT, DELETE
201 Created         - Successful POST
400 Bad Request     - Invalid parameters
401 Unauthorized    - Missing/invalid JWT token
403 Forbidden       - Permission denied (not admin)
404 Not Found       - Resource doesn't exist
409 Conflict        - Duplicate review, cart item
429 Too Many        - Rate limited
500 Server Error    - Internal error
```

### Validation Errors

```json
{
  "error": "Validation Failed",
  "details": {
    "product_id": "This field is required",
    "quantity": "Must be > 0"
  }
}
```

---

**End of API Documentation**
