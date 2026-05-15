-- KLTN AI E-Commerce Database Schema
-- MySQL Dump (DDL - Data Definition Language)
-- For reference and documentation purposes
-- Generated: May 12, 2026

-- ============================================================================
-- CORE AUTHENTICATION TABLES (Django built-in)
-- ============================================================================

CREATE TABLE `auth_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL UNIQUE,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `auth_user_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- STORE MODULE - PRODUCT CATALOG
-- ============================================================================

CREATE TABLE `store_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `image` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `store_product` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `price` decimal(20,0) NOT NULL,
  `category_id` bigint NOT NULL,
  `short_description` varchar(10000) DEFAULT '',
  `description` varchar(10000) DEFAULT '',
  `image` varchar(100) NOT NULL,
  `config` varchar(10000) DEFAULT '',
  `is_sale` tinyint(1) NOT NULL DEFAULT 0,
  `sale_price` decimal(20,0) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `store_product_category_id` (`category_id`),
  KEY `store_product_is_sale` (`is_sale`),
  CONSTRAINT `store_product_category_id_fk` 
    FOREIGN KEY (`category_id`) 
    REFERENCES `store_category` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `store_productthumbnail` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `image` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `store_productthumbnail_product_id` (`product_id`),
  CONSTRAINT `store_productthumbnail_product_id_fk` 
    FOREIGN KEY (`product_id`) 
    REFERENCES `store_product` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `store_producimagefeature` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL UNIQUE,
  `vector_json` longtext NOT NULL,
  PRIMARY KEY (`id`),
  KEY `store_producimagefeature_product_id` (`product_id`),
  CONSTRAINT `store_producimagefeature_product_id_fk` 
    FOREIGN KEY (`product_id`) 
    REFERENCES `store_product` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `store_saleevent` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint NOT NULL,
  `discount_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `start_date` datetime(6) NOT NULL,
  `end_date` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `store_saleevent_category_id` (`category_id`),
  KEY `store_saleevent_dates` (`start_date`, `end_date`),
  CONSTRAINT `store_saleevent_category_id_fk` 
    FOREIGN KEY (`category_id`) 
    REFERENCES `store_category` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- STORE MODULE - USER EXTENSION & REVIEWS
-- ============================================================================

CREATE TABLE `store_profile` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL UNIQUE,
  `date_modified` datetime(6) NOT NULL,
  `phone` varchar(20) DEFAULT '',
  `address` varchar(200) DEFAULT '',
  `old_cart` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `store_profile_user_id` (`user_id`),
  CONSTRAINT `store_profile_user_id_fk` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `auth_user` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `store_review` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `rating` int unsigned NOT NULL,
  `comment` longtext,
  `sentiment` varchar(10) DEFAULT NULL,
  `score_analysis` decimal(6,5) DEFAULT NULL,
  `review_date` datetime(6) NOT NULL,
  `is_spam` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `store_review_unique` (`user_id`, `product_id`),
  KEY `store_review_product_id` (`product_id`),
  KEY `store_review_user_id` (`user_id`),
  KEY `store_review_date` (`review_date`),
  KEY `store_review_rating` (`rating`),
  CONSTRAINT `store_review_product_id_fk` 
    FOREIGN KEY (`product_id`) 
    REFERENCES `store_product` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `store_review_user_id_fk` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `auth_user` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PAYMENT MODULE - ORDERS & SHIPPING
-- ============================================================================

CREATE TABLE `payment_shippingaddress` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `shipping_full_name` varchar(255) NOT NULL,
  `shipping_phone` varchar(255) NOT NULL,
  `shipping_address` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT NOW(),
  `updated_at` datetime(6) NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`),
  KEY `payment_shippingaddress_user_id` (`user_id`),
  CONSTRAINT `payment_shippingaddress_user_id_fk` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `auth_user` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payment_order` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `shipping_address` text NOT NULL,
  `amount_paid` decimal(20,0) NOT NULL,
  `date_ordered` datetime(6) NOT NULL AUTO_NOW_ADD,
  `shipped` tinyint(1) NOT NULL DEFAULT 0,
  `date_shipped` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payment_order_user_id` (`user_id`),
  KEY `payment_order_shipped` (`shipped`),
  KEY `payment_order_date_ordered` (`date_ordered`),
  CONSTRAINT `payment_order_user_id_fk` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `auth_user` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payment_orderitem` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `quantity` int unsigned NOT NULL DEFAULT 1,
  `price` decimal(20,0) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`),
  KEY `payment_orderitem_order_id` (`order_id`),
  KEY `payment_orderitem_product_id` (`product_id`),
  KEY `payment_orderitem_user_id` (`user_id`),
  CONSTRAINT `payment_orderitem_order_id_fk` 
    FOREIGN KEY (`order_id`) 
    REFERENCES `payment_order` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `payment_orderitem_product_id_fk` 
    FOREIGN KEY (`product_id`) 
    REFERENCES `store_product` (`id`) 
    ON DELETE PROTECT,
  CONSTRAINT `payment_orderitem_user_id_fk` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `auth_user` (`id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DJANGO SESSION TABLE (for cart/wishlist session storage)
-- ============================================================================

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DJANGO CONTENT TYPE & PERMISSIONS (Django built-in)
-- ============================================================================

CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_model` (`app_label`, `model`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- VIEWS & AGGREGATIONS (Optional - for performance)
-- ============================================================================

-- View: Product with average rating
CREATE OR REPLACE VIEW `product_stats` AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.sale_price,
    p.is_sale,
    c.name as category_name,
    COUNT(DISTINCT r.id) as review_count,
    ROUND(AVG(r.rating), 2) as average_rating,
    COUNT(CASE WHEN r.sentiment = 'positive' THEN 1 END) as positive_count,
    COUNT(CASE WHEN r.sentiment = 'negative' THEN 1 END) as negative_count
FROM store_product p
LEFT JOIN store_category c ON p.category_id = c.id
LEFT JOIN store_review r ON p.id = r.product_id AND r.is_spam = 0
GROUP BY p.id, p.name, p.price, p.sale_price, p.is_sale, c.name;

-- View: Active sales
CREATE OR REPLACE VIEW `active_sales` AS
SELECT 
    se.id,
    c.name as category_name,
    se.discount_percentage,
    se.start_date,
    se.end_date,
    NOW() >= se.start_date AND NOW() <= se.end_date as is_active_now
FROM store_saleevent se
JOIN store_category c ON se.category_id = c.id
WHERE NOW() >= se.start_date AND NOW() <= se.end_date;

-- ============================================================================
-- INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Performance indexes (add if not already created by FK relationships)
ALTER TABLE `store_product` ADD INDEX `idx_product_category_sale` (`category_id`, `is_sale`);
ALTER TABLE `store_review` ADD INDEX `idx_review_product_rating` (`product_id`, `rating`);
ALTER TABLE `payment_order` ADD INDEX `idx_order_user_shipped` (`user_id`, `shipped`);
ALTER TABLE `payment_orderitem` ADD INDEX `idx_orderitem_order_product` (`order_id`, `product_id`);

-- ============================================================================
-- NOTES FOR OPTIMIZATION
-- ============================================================================

/*
CRITICAL CHANGES RECOMMENDED:

1. OrderItem.product_id should be ON DELETE PROTECT (not CASCADE)
   - Protects historical orders when products are deleted

2. OrderItem.user_id should be ON DELETE SET NULL (not CASCADE)
   - Preserves order history when users are deleted

3. Add indexes on frequently filtered columns:
   - product.is_sale
   - product.category_id
   - review.rating, review.review_date
   - order.shipped, order.date_ordered

4. Consider adding audit table for price changes:
   CREATE TABLE product_price_history (
     id BIGINT PRIMARY KEY AUTO_INCREMENT,
     product_id BIGINT,
     old_price DECIMAL(20,0),
     new_price DECIMAL(20,0),
     changed_at DATETIME DEFAULT NOW()
   );

5. For better performance on large datasets:
   - Implement database connection pooling
   - Use read replicas for reporting queries
   - Archive old orders (>1 year)
   - Cache popular products

SESSION-BASED DATA STRUCTURE:

Cart (stored in django_session):
  session_key: {
    'session_key': {'1': 2, '5': 1},  # product_id: quantity
    'shipping_method': 'normal'
  }

Wishlist (stored in django_session):
  session_key: {
    'wishlist': {'1': '25000000', '3': '15000000'}  # product_id: price
  }
*/
