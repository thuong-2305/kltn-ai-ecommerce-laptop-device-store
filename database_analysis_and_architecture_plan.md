# BÁO CÁO PHÂN TÍCH DATABASE VÀ THIẾT KẾ KIẾN TRÚC DJANGO BACKEND SYSTEM
## Hệ Thống E-commerce Bán Laptop & Thiết Bị Công Nghệ Chuẩn Production

> [!NOTE]  
> Báo cáo này được thực hiện bởi Senior Django Backend Architect nhằm đánh giá hiện trạng database, đề xuất giải pháp tối ưu hóa, tái cấu trúc hệ thống và xây dựng lộ trình phát triển backend hoàn chỉnh bằng **Django, Django REST Framework (DRF), PostgreSQL, JWT Authentication và AI Integration**.

---

## BƯỚC 1: PHÂN TÍCH DATABASE HIỆN TẠI

### 1.1 Tổng quan hệ thống
* **Loại hệ thống:** Thương mại điện tử B2C chuyên biệt cho Laptop và Thiết bị Công nghệ.
* **Nghiệp vụ chính:**
  * Quản lý danh mục sản phẩm (Laptop, Linh kiện, Phụ kiện) với các thông số cấu hình chi tiết.
  * Quản lý các chiến dịch khuyến mãi (Sale Events) theo danh mục sản phẩm trong thời gian nhất định.
  * Giỏ hàng và quy trình đặt hàng, giao nhận sản phẩm.
  * Thanh toán trực tuyến tích hợp cổng thanh toán nội địa (VNPAY, PayPal).
  * Đánh giá sản phẩm tích hợp AI tự động phân tích cảm xúc (Sentiment Analysis) và phát hiện thư rác (Spam Detection).
  * Hệ thống gợi ý sản phẩm thông minh dựa trên đặc trưng hình ảnh (Image Embedding Vectors).
* **Các module hiện có:**
  * `store`: Quản lý danh mục, sản phẩm, hình ảnh thu nhỏ, đặc trưng vector của ảnh, đánh giá và sự kiện giảm giá.
  * `payment`: Quản lý địa chỉ giao hàng, đơn hàng và các chi tiết đơn hàng (Order Items).
  * `cart`: Quản lý giỏ hàng tạm thời thông qua Django Session và lưu trữ chuỗi JSON trong Profile.
  * `wishlist`: Quản lý danh sách sản phẩm yêu thích thông qua Session tạm thời.
  * `auth_api`: Xử lý đăng ký, đăng nhập JWT, đổi mật khẩu và liên kết tài khoản Google.
  * `recommend`: Sử dụng thuật toán so sánh độ tương đồng Cosine trên ma trận TF-IDF của mô tả sản phẩm để đưa ra gợi ý.
* **Luồng dữ liệu tổng thể:**
  ```mermaid
  graph TD
      A[Guest/User] -->|Xem Catalog| B(Product List / Details)
      B -->|Gợi ý sản phẩm| C(AI Recommend System)
      B -->|Đánh giá sản phẩm| D(Review & AI Sentiment)
      A -->|Thêm sản phẩm| E(Cart / Wishlist Session)
      E -->|Đăng nhập| F(Sync Cart to Profile DB)
      F -->|Đặt hàng| G(Checkout Process)
      G -->|Thanh toán COD| H(Create Order & Shipping Address)
      G -->|Thanh toán Online| I(VNPAY Gateway)
      I -->|IPN Callback| H
      H -->|Xử lý đơn hàng| J(Admin / Shipment Management)
  ```

---

### 1.2 Phân tích chi tiết từng bảng hiện tại

#### Bảng 1: `auth_user` (Bảng Auth mặc định của Django)
* **Mục đích:** Lưu trữ thông tin tài khoản đăng nhập của người dùng và quản trị viên.
* **Các cột chính:**
  * `id` (bigint, PK, Auto Increment): Định danh duy nhất.
  * `password` (varchar(128)): Hash mật khẩu bảo mật (PBKDF2).
  * `username` (varchar(150), Unique, Index): Tên đăng nhập.
  * `email` (varchar(254)): Email liên hệ và đăng nhập dự phòng.
  * `is_superuser`, `is_staff`, `is_active` (tinyint(1)/boolean): Quyền hạn và trạng thái tài khoản.
  * `date_joined`, `last_login` (datetime(6)): Thời gian tham gia và đăng nhập cuối.
* **Quan hệ:** 
  * OneToOne với `store_profile` (qua `user_id` ở bảng Profile).
  * OneToMany với `store_review` (`user_id`).
  * OneToMany với `payment_order` (`user_id`).
  * OneToMany với `payment_shippingaddress` (`user_id`).
* **Django Model tương ứng:** `django.contrib.auth.models.User` (Sẽ được đề xuất ghi đè bằng Custom User Model).

#### Bảng 2: `store_category`
* **Mục đích:** Lưu danh mục sản phẩm (Laptop, Phụ kiện, Chuột, Bàn phím...).
* **Các cột chính:**
  * `id` (bigint, PK, Auto Increment)
  * `name` (varchar(50)): Tên danh mục.
  * `image` (varchar(100)): Đường dẫn ảnh đại diện danh mục.
* **Quan hệ:** OneToMany với `store_product` và `store_saleevent`.
* **Django Model tương ứng:** `store.models.Category`

#### Bảng 3: `store_product`
* **Mục đích:** Lưu thông tin cơ bản của sản phẩm.
* **Các cột chính:**
  * `id` (bigint, PK, Auto Increment)
  * `name` (varchar(50)): Tên sản phẩm.
  * `price` (decimal(20,0)): Giá bán gốc.
  * `category_id` (bigint, FK -> `store_category.id`): Thuộc danh mục nào.
  * `short_description` (varchar(10000)): Mô tả ngắn gọn.
  * `description` (varchar(10000)): Mô tả chi tiết sản phẩm.
  * `image` (varchar(100)): Ảnh chính sản phẩm.
  * `config` (varchar(10000)): Cấu hình máy tính dạng text thô.
  * `is_sale` (tinyint(1)): Trạng thái đang giảm giá.
  * `sale_price` (decimal(20,0)): Giá sau khi giảm.
* **Khóa & Index:**
  * Foreign Key: `category_id` liên kết `store_category(id)`.
  * Index: `idx_product_category_sale` (tổng hợp `category_id`, `is_sale`) nhằm tối ưu việc lọc sản phẩm khuyến mãi theo danh mục.
* **Quan hệ:** OneToMany với `store_productthumbnail`, OneToOne với `store_producimagefeature`.
* **Django Model tương ứng:** `store.models.Product`

#### Bảng 4: `store_productthumbnail`
* **Mục đích:** Lưu các hình ảnh phụ (album ảnh) của sản phẩm.
* **Các cột chính:**
  * `id` (bigint, PK)
  * `product_id` (bigint, FK -> `store_product.id`): Sản phẩm sở hữu ảnh.
  * `image` (varchar(100)): Đường dẫn file ảnh phụ.
* **Django Model tương ứng:** `store.models.ProductThumbnail`

#### Bảng 5: `store_producimagefeature` *(Lỗi chính tả tên bảng: produc -> product)*
* **Mục đích:** Lưu trữ đặc trưng vector trích xuất từ hình ảnh của sản phẩm phục vụ AI tìm kiếm tương đồng.
* **Các cột chính:**
  * `id` (bigint, PK)
  * `product_id` (bigint, Unique, FK -> `store_product.id`): Liên kết 1-1 với sản phẩm.
  * `vector_json` (longtext): Chuỗi JSON lưu mảng số thực biểu diễn đặc trưng vector của ảnh (tạo bởi CLIP/CNN).
* **Django Model tương ứng:** `store.models.ProductImageFeature`

#### Bảng 6: `store_saleevent`
* **Mục đích:** Định nghĩa chiến dịch giảm giá theo Category trong một khoảng thời gian.
* **Các cột chính:**
  * `id` (bigint, PK)
  * `category_id` (bigint, FK -> `store_category.id`)
  * `discount_percentage` (decimal(5,2)): % giảm giá.
  * `start_date`, `end_date` (datetime(6)): Thời hạn áp dụng.
* **Index:** `store_saleevent_dates` (tổng hợp `start_date`, `end_date`) giúp truy vấn nhanh sự kiện đang hoạt động.
* **Django Model tương ứng:** `store.models.SaleEvent`

#### Bảng 7: `store_profile`
* **Mục đích:** Mở rộng thông tin người dùng.
* **Các cột chính:**
  * `id` (bigint, PK)
  * `user_id` (bigint, Unique, FK -> `auth_user.id`)
  * `phone` (varchar(20))
  * `address` (varchar(200))
  * `old_cart` (varchar(200)): Chuỗi lưu trữ dữ liệu giỏ hàng cũ dạng text JSON (Ví dụ: `"{'1': 2}"`).
* **Django Model tương ứng:** `store.models.Profile`

#### Bảng 8: `store_review`
* **Mục đích:** Người dùng đánh giá sản phẩm.
* **Các cột chính:**
  * `id` (bigint, PK)
  * `product_id` (bigint, FK -> `store_product.id`)
  * `user_id` (bigint, FK -> `auth_user.id`)
  * `rating` (int unsigned): Điểm đánh giá (1-5 sao).
  * `comment` (longtext): Nội dung đánh giá.
  * `sentiment` (varchar(10)): Cảm xúc tự động phân tích bởi AI (positive/negative).
  * `score_analysis` (decimal(6,5)): Điểm số phân tích cảm xúc từ AI.
  * `review_date` (datetime(6)): Ngày viết đánh giá.
  * `is_spam` (tinyint(1)): Đánh dấu review rác để ẩn đi.
* **Unique Key:** `store_review_unique` (`user_id`, `product_id`) nhằm ràng buộc mỗi người dùng chỉ được đánh giá một sản phẩm một lần duy nhất.
* **Django Model tương ứng:** `store.models.Review`

#### Bảng 9: `payment_shippingaddress`
* **Mục đích:** Lưu thông tin địa chỉ giao nhận hàng mặc định hoặc lịch sử của khách hàng.
* **Các cột chính:**
  * `id` (bigint, PK)
  * `user_id` (bigint, FK -> `auth_user.id`)
  * `shipping_full_name` (varchar(255)): Tên người nhận.
  * `shipping_phone` (varchar(255)): Số điện thoại nhận hàng.
  * `shipping_address` (varchar(255)): Địa chỉ chi tiết.
* **Django Model tương ứng:** `payment.models.ShippingAddress`

#### Bảng 10: `payment_order`
* **Mục đích:** Lưu thông tin tổng quan của đơn đặt hàng.
* **Các cột chính:**
  * `id` (bigint, PK)
  * `user_id` (bigint, FK -> `auth_user.id`, Nullable): Có thể mua không cần đăng nhập (Guest) hoặc xử lý khi xóa User.
  * `full_name`, `phone` (varchar(255)): Thông tin liên hệ đơn hàng.
  * `shipping_address` (text): Địa chỉ nhận hàng tại thời điểm đặt.
  * `amount_paid` (decimal(20,0)): Tổng số tiền thanh toán của đơn hàng.
  * `date_ordered` (datetime(6)): Thời gian đặt hàng.
  * `shipped` (tinyint(1)): Trạng thái đã giao hàng hay chưa.
  * `date_shipped` (datetime(6), Nullable): Thời gian giao hàng thực tế.
* **Django Model tương ứng:** `payment.models.Order`

#### Bảng 11: `payment_orderitem`
* **Mục đích:** Chi tiết các sản phẩm trong đơn hàng.
* **Các cột chính:**
  * `id` (bigint, PK)
  * `order_id` (bigint, FK -> `payment_order.id`)
  * `product_id` (bigint, FK -> `store_product.id`)
  * `user_id` (bigint, FK -> `auth_user.id`, Nullable)
  * `quantity` (int unsigned): Số lượng mua.
  * `price` (decimal(20,0)): Giá bán tại thời điểm mua (Snapshot Price).
* **Django Model tương ứng:** `payment.models.OrderItem`

---

## BƯỚC 2: ĐÁNH GIÁ THIẾT KẾ DATABASE & ĐỀ XUẤT TỐI ƯU HÓA

### 2.1 Các lỗi thiết kế nghiêm trọng và giải pháp khắc phục

#### Lỗi 1: Lưu trữ Giỏ hàng (Cart) và Danh sách yêu thích (Wishlist) không chuẩn hóa
* **Hiện trạng:** 
  * Giỏ hàng của người dùng đăng nhập được đồng bộ bằng cách lưu chuỗi JSON thô vào trường `old_cart` của bảng `store_profile` (ví dụ: `"{'3': 1}"`).
  * Wishlist lưu hoàn toàn trên session của Django (`request.session['wishlist_session_key']`), dữ liệu sẽ biến mất khi người dùng xóa cookie hoặc chuyển sang thiết bị khác.
* **Hậu quả:** 
  * Không thể truy vấn danh sách giỏ hàng thông qua SQL thông thường để phân tích hành vi người dùng (ví dụ: tìm các sản phẩm bị bỏ quên trong giỏ hàng để gửi email nhắc nhở).
  * Không thể thực hiện ràng buộc toàn vẹn dữ liệu (nếu sản phẩm bị xóa hoặc hết hàng, chuỗi JSON cũ vẫn trỏ tới ID không tồn tại dẫn đến lỗi hệ thống).
  * Hiệu năng kém khi phải parse JSON liên tục trong code Python mỗi khi cập nhật giỏ hàng.
* **Giải pháp đề xuất:** 
  * Xóa bỏ trường `old_cart` trong bảng Profile.
  * Thiết kế bảng `Cart` và `CartItem` liên kết khóa ngoại chặt chẽ với `Product` và `User`.
  * Thiết kế bảng `Wishlist` liên kết `User` và `Product`.

#### Lỗi 2: Ràng buộc xóa dữ liệu (On Delete Action) sai nghiệp vụ thương mại điện tử
* **Hiện trạng:**
  * Ở file `payment/models.py`, các mối quan hệ khoá ngoại từ đơn hàng trỏ tới sản phẩm đang thiết lập: `product = models.ForeignKey(Product, on_delete=models.CASCADE)`.
* **Hậu quả:** 
  * Nếu quản trị viên xóa một sản phẩm đã ngừng kinh doanh khỏi database, **tất cả các chi tiết đơn hàng cũ chứa sản phẩm đó sẽ bị xóa theo (Cascade)**. Điều này trực tiếp làm sai lệch báo cáo doanh thu, lịch sử mua hàng và hệ thống đối soát tài chính.
* **Giải pháp đề xuất:**
  * Đổi tất cả quan hệ `OrderItem.product` thành `on_delete=models.PROTECT`. Khi xóa sản phẩm, hệ thống sẽ ngăn chặn nếu sản phẩm đó đã nằm trong đơn hàng. (Hoặc có thể dùng giải pháp Soft Delete cho `Product`).
  * Đổi `OrderItem.user` thành `on_delete=models.SET_NULL` để bảo toàn đơn hàng khi khách hàng yêu cầu xóa tài khoản.

#### Lỗi 3: Lỗi cú pháp và Naming trong Django Model / SQL DDL
* **Lỗi 1 (Sai cú pháp Django Model):** 
  ```python
  class Profile(models.Model):
      date_modified = models.DateTimeField(User, auto_now=True)
  ```
  Tham số đầu tiên của `DateTimeField` trong Django không được phép là một Model (`User`). Nó phải là một chuỗi mô tả (verbose_name) hoặc để trống. Đoạn code này chắc chắn sẽ gây lỗi hoặc hành vi không xác định khi build migration. 
  👉 *Sửa lại:* `date_modified = models.DateTimeField(auto_now=True)`
* **Lỗi 2 (Sai cú pháp SQL DDL trong file schema):**
  Ở bảng `payment_order`:
  ```sql
  `date_ordered` datetime(6) NOT NULL AUTO_NOW_ADD
  ```
  `AUTO_NOW_ADD` là cú pháp của Python Django ORM, không phải cú pháp DDL SQL của MySQL hay PostgreSQL. 
  👉 *Sửa lại:* `DEFAULT CURRENT_TIMESTAMP(6)`
* **Lỗi 3 (Lỗi chính tả đặt tên bảng):** Bảng `store_producimagefeature` bị thiếu ký tự `t` (phải là `store_productimagefeature`).

#### Lỗi 4: Lưu trữ cấu hình kỹ thuật (Config) thô sơ
* **Hiện trạng:** Cấu hình Laptop đang được lưu dưới dạng chuỗi thô dài (`config = models.CharField(...)`) với format tự quy ước: `"- CPU + Intel Core i7: 1235U + RAM + 8GB"`.
* **Hậu quả:** Không thể lọc sản phẩm theo cấu hình chi tiết (ví dụ: Khách hàng muốn lọc Laptop có RAM 16GB, Card đồ họa RTX 4060). Hệ thống không thể phân tích và so sánh kỹ thuật giữa 2 thiết bị.
* **Giải pháp đề xuất:** Xây dựng mô hình EAV (Entity-Attribute-Value) hoặc sử dụng trường `JSONField` của PostgreSQL để lưu trữ cấu hình có cấu trúc.

---

### 2.2 Đề xuất chuẩn hóa kiểu dữ liệu & Indexing (PostgreSQL)

| Bảng | Tên cột | Kiểu dữ liệu cũ | Kiểu dữ liệu mới đề xuất | Lý do tối ưu |
| :--- | :--- | :--- | :--- | :--- |
| `store_product` | `price` | `decimal(20,0)` | `decimal(15,2)` | Tiết kiệm bộ nhớ, hỗ trợ tốt tiền tệ có phần thập phân nếu cần quy đổi tỷ giá. |
| `store_product` | `sale_price` | `decimal(20,0)` | `decimal(15,2)` | Đồng bộ với cột giá gốc. |
| `payment_order` | `amount_paid` | `decimal(20,0)` | `decimal(15,2)` | Đồng bộ dữ liệu tài chính toàn hệ thống. |
| `payment_orderitem`| `price` | `decimal(20,0)` | `decimal(15,2)` | Lưu trữ chính xác giá của sản phẩm tại thời điểm mua. |
| `store_product` | `short_description`| `varchar(10000)`| `text` | Hạn chế kích thước dòng trong DB, tối ưu lưu trữ chuỗi dài. |
| `store_product` | `description` | `varchar(10000)`| `text` | Cho phép định dạng HTML/Markdown của mô tả chi tiết sản phẩm. |

#### Đề xuất bổ sung Index:
1. `CREATE INDEX idx_product_name_trgm ON store_product USING gin (name gin_trgm_ops);` (Hỗ trợ tìm kiếm gần đúng/fuzzy search cực nhanh trên PostgreSQL).
2. `CREATE INDEX idx_review_sentiment_spam ON store_review (sentiment, is_spam);` (Tối ưu hóa hiển thị các đánh giá tích cực/tiêu cực không phải rác).
3. `CREATE INDEX idx_order_date_status ON payment_order (date_ordered DESC, shipped);` (Tối ưu hóa câu lệnh lấy danh sách đơn hàng mới cần xử lý ở Dashboard).

---

## BƯỚC 3: PHÂN TÍCH WEBSITE THƯƠNG MẠI ĐIỆN TỬ LAPTOP (CÁC BẢNG CẦN BỔ SUNG)

Hệ thống bán Laptop và thiết bị công nghệ có tính chất đặc thù: giá trị đơn hàng cao, thông số kỹ thuật phức tạp, khách hàng đòi hỏi tính năng so sánh và bảo hành chặt chẽ. Để hệ thống đạt chuẩn production, ta cần bổ sung 23 bảng sau:

### Nhóm 1: Quản lý giỏ hàng & Sản phẩm yêu thích (Thay thế Session)
1. **`wishlist` & `wishlist_item` (Wishlist):** Lưu trữ vĩnh viễn danh sách yêu thích của người dùng trên database, hỗ trợ phân tích sản phẩm khách hàng đang quan tâm để gửi chiến dịch email marketing.
2. **`cart` & `cart_item` (Cart):** Quản lý giỏ hàng nhất quán giữa các thiết bị. Giúp thực hiện tính năng "Abandon Cart" (giỏ hàng bị bỏ quên) để kích cầu.

### Nhóm 2: Đặc thù phân loại & Biến thể sản phẩm (Laptop)
3. **`store_brand` (Brand):** Đối với Laptop, thương hiệu (Dell, Asus, Apple, HP, Lenovo...) là yếu tố tiên quyết khi khách hàng chọn mua. Cần bảng riêng để quản lý thông tin thương hiệu, logo, và tối ưu SEO.
4. **`store_productvariant` (Product Variant):** Một mẫu Laptop (ví dụ: Dell XPS 13) thường có nhiều phiên bản cấu hình (Core i5 vs Core i7, 8GB RAM vs 16GB RAM). Biến thể giúp quản lý giá tiền, số lượng tồn kho riêng biệt cho từng cấu hình mà không phải tạo nhiều Product trùng tên.
5. **`store_specificationkey` & `store_specificationvalue` (Product Specification):** Lưu trữ thông số kỹ thuật chi tiết dưới dạng cặp Key-Value có cấu trúc (ví dụ: Key="Dung lượng RAM", Value="16 GB LPDDR5"). Phục vụ tính năng bộ lọc thuộc tính nâng cao và so sánh cấu hình giữa các dòng Laptop.

### Nhóm 3: Quản lý kho hàng & Chuỗi cung ứng
6. **`store_inventory` (Inventory):** Quản lý số lượng tồn kho thực tế của từng biến thể sản phẩm tại các chi nhánh/kho hàng. Ngăn chặn tình trạng Overselling (bán quá số lượng tồn kho).

### Nhóm 4: Khuyến mãi & Giảm giá (Marketing)
7. **`marketing_coupon` (Coupon):** Quản lý mã giảm giá trực tiếp (ví dụ: `LAPTOPNEW2026`) theo giá tiền hoặc theo phần trăm, giới hạn số lần sử dụng và tổng ngân sách khuyến mãi.
8. **`marketing_couponusage` (Coupon Usage):** Lưu vết lịch sử áp dụng mã giảm giá của từng user, ngăn ngừa hành vi gian lận dùng mã quá số lần quy định.

### Nhóm 5: Thanh toán & Đối soát tài chính (Payments)
9. **`payment_transaction` (Payment Transaction):** Lưu thông tin chi tiết phản hồi từ các cổng thanh toán (VNPAY, PayPal) như: Mã giao dịch của cổng, mã ngân hàng, trạng thái thanh toán (Success, Fail, Pending), chữ ký số bảo mật phục vụ đối soát.

### Nhóm 6: Vận chuyển & Giao hàng (Shipment)
10. **`shipment` (Shipment):** Lưu thông tin đơn vị vận chuyển (Giao Hàng Nhanh, Viettel Post...), phí vận chuyển thực tế và trạng thái tổng quan của gói hàng.
11. **`shipment_tracking` (Shipment Tracking):** Lưu lịch sử cập nhật vị trí gói hàng (ví dụ: Đang lấy hàng -> Đã nhập kho -> Đang giao -> Giao thành công) để khách hàng theo dõi realtime.

### Nhóm 7: Trải nghiệm người dùng (UX/UI & Blog)
12. **`store_useraddress` (User Address):** Cho phép một khách hàng lưu nhiều địa chỉ giao hàng khác nhau (Nhà riêng, Văn phòng công ty) để lựa chọn nhanh khi checkout.
13. **`notification` (Notification):** Gửi thông báo tự động (thông báo đẩy Web/Email) khi đơn hàng thay đổi trạng thái, có chương trình khuyến mãi lớn hoặc khi sản phẩm yêu thích được giảm giá.
14. **`store_reviewimage` (Review Image):** Cho phép khách hàng tải ảnh chụp thực tế sản phẩm Laptop khi đánh giá. Tăng độ uy tín và nâng cao tỷ lệ chốt đơn của khách sau.
15. **`blog_post` & `blog_comment` (Blog & Comment):** Đăng tải bài viết đánh giá công nghệ, tin tức phần cứng mới. Đây là kênh thu hút SEO Organic Traffic cực kỳ quan trọng cho các website bán Laptop.
16. **`store_banner` (Banner):** Quản lý các hình ảnh trình chiếu (carousel) ở trang chủ để hiển thị các chương trình khuyến mãi theo mùa của cửa hàng.

### Nhóm 8: Trí tuệ nhân tạo (AI & Recommendations)
17. **`ai_sentiment_log` (AI Sentiment Log):** Lưu trữ lịch sử phân tích sâu của AI đối với các đánh giá của khách hàng, giúp hệ thống quản trị lọc nhanh các sản phẩm bị phàn nàn nhiều nhất về phần cứng (pin, màn hình...).
18. **`ai_recommendation_log` (Recommendation):** Ghi nhận lịch sử click chuột và gợi ý sản phẩm được mua kèm để tối ưu hóa thuật toán học máy (Collaborative Filtering).

---

## BƯỚC 4: THIẾT KẾ KIẾN TRÚC DJANGO CHUẨN PRODUCTION

Để dự án dễ bảo trì, mở rộng và tuân thủ nguyên tắc Single Responsibility, toàn bộ mã nguồn backend sẽ được tổ chức thành các Django App chuyên biệt dưới thư mục `apps/`:

```
backend/
├── config/                 # Cấu hình chính của dự án (settings, urls, wsgi, asgi)
├── apps/                   # Thư mục gốc chứa các Django Apps
│   ├── users/              # Custom User Model, Authentication (JWT), Profiles, Addresses
│   ├── products/           # Products, Variants, Specifications, Thumbnails, Inventory
│   ├── categories/         # Categories management
│   ├── brands/             # Brands management
│   ├── carts/              # Database-driven Cart và CartItems
│   ├── orders/             # Order và OrderItems management
│   ├── payments/           # Tích hợp VNPay, PayPal, lưu trữ Transactions
│   ├── reviews/            # Reviews, Review Images và AI Sentiment analysis
│   ├── wishlist/           # User Wishlists
│   ├── notifications/      # Notification system (Database & WebSockets)
│   ├── blogs/              # Tin tức công nghệ, bài viết đánh giá, Comments
│   ├── marketing/          # Coupons, Banners quảng cáo
│   └── ai_analysis/        # AI Service (CLIP Vector Search, Sentiment Analysis Service)
├── common/                 # Thư mục dùng chung (BaseModels, Mixins, Exceptions)
│   ├── models.py           # TrackingModel (created_at, updated_at)
│   └── exceptions.py       # Custom API Exceptions
├── utils/                  # Thư mục chứa các hàm tiện ích trợ giúp độc lập
│   ├── vnpay.py            # SDK tích hợp thanh toán VNPAY
│   └── file_helpers.py     # Xử lý upload file, chuẩn hóa tên file ảnh
├── permissions/            # Các lớp phân quyền DRF (IsOwner, IsAdminOrReadOnly)
├── services/               # Lớp nghiệp vụ ngoài (Email Service, AI API Wrapper)
└── tests/                  # Thư mục chứa các test suites tích hợp hệ thống
```

### Chi tiết nhiệm vụ của từng Django App trong hệ thống:
1. **`users`:** Quản lý tài khoản khách hàng và nhân viên. Kế thừa `AbstractUser` của Django. Quản lý thông tin liên hệ và danh sách các địa chỉ nhận hàng của người dùng.
2. **`products`:** Quản lý toàn bộ danh mục sản phẩm Laptop, các thông số kỹ thuật chi tiết, hình ảnh sản phẩm, biến thể cấu hình (RAM, CPU, SSD) và tồn kho thực tế.
3. **`categories`:** Quản lý cấu trúc cây danh mục sản phẩm (sử dụng MPTT nếu có danh mục đa cấp).
4. **`brands`:** Quản lý thông tin nhà sản xuất (Apple, Asus, Dell...), hỗ trợ tối ưu SEO.
5. **`carts`:** Xử lý logic giỏ hàng trên DB. Đồng bộ giỏ hàng từ Local Storage của Frontend lên Database khi người dùng đăng nhập thành công.
6. **`orders`:** Quản lý quy trình đặt hàng, tính toán thuế, phí ship, và chuyển trạng thái đơn hàng (Chờ xác nhận, Đang xử lý, Đang giao, Hoàn thành, Đã hủy).
7. **`payments`:** Xử lý tích hợp với cổng thanh toán trực tuyến. Nhận webhook (IPN) từ VNPAY để cập nhật tự động trạng thái đơn hàng.
8. **`reviews`:** Cho phép người dùng viết đánh giá kèm ảnh sản phẩm thực tế. Gọi API AI (Hugging Face / OpenAI / local model) để chấm điểm cảm xúc (Sentiment Score).
9. **`wishlist`:** Lưu danh sách các sản phẩm ưa thích của khách hàng để gửi thông báo khi có đợt giảm giá.
10. **`notifications`:** Quản lý thông báo trong hệ thống, gửi tin nhắn thời gian thực qua WebSockets (Django Channels) hoặc Firebase Cloud Messaging.
11. **`blogs`:** Hệ quản trị nội dung (CMS) đơn giản cho nhóm marketing viết bài chuẩn SEO.
12. **`marketing`:** Quản lý mã giảm giá Coupon và các chiến dịch banner khuyến mãi hiển thị trên trang chủ.
13. **`ai_analysis`:** Đóng gói các logic AI phức tạp như trích xuất đặc trưng ảnh (CLIP) để thực hiện tìm kiếm sản phẩm bằng hình ảnh và gợi ý sản phẩm tương tự.

---

## BƯỚC 5: XÂY DỰNG DJANGO MODELS CHUẨN PRODUCTION

Dưới đây là thiết kế chi tiết hệ thống Models của các App cốt lõi được viết theo chuẩn **DRF-ready** (sử dụng clean code, định dạng tối ưu và quan hệ chặt chẽ).

### 5.1 Common App (Common/models.py)
```python
# common/models.py
from django.db import models

class TrackingModel(models.Model):
    """
    Abstract Model cung cấp timestamp cho tất cả các bảng kế thừa
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
```

### 5.2 Users App (apps/users/models.py)
```python
# apps/users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from common.models import TrackingModel

class User(AbstractUser):
    """
    Ghi đè User mặc định của Django để dễ dàng mở rộng sau này.
    Đăng nhập bằng Email làm chính thay thế Username.
    """
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True)
    
    # Thiết lập email làm trường đăng nhập chính
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class UserAddress(TrackingModel):
    """
    Lưu trữ danh sách địa chỉ nhận hàng của người dùng.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    recipient_name = models.CharField(max_length=255)
    recipient_phone = models.CharField(max_length=20)
    street_address = models.CharField(max_length=255)
    ward = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "User Addresses"
        ordering = ['-is_default', '-created_at']

    def save(self, *args, **kwargs):
        # Đảm bảo chỉ có duy nhất một địa chỉ mặc định
        if self.is_default:
            UserAddress.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
```

### 5.3 Products App (apps/products/models.py)
```python
# apps/products/models.py
from django.db import models
from common.models import TrackingModel
from apps.categories.models import Category
from apps.brands.models import Brand

class Product(TrackingModel):
    """
    Model lưu thông tin chính của sản phẩm công nghệ (Laptop)
    """
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, unique=True)
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    price = models.DecimalField(max_digits=15, decimal_places=2)
    short_description = models.TextField(blank=True, default='')
    description = models.TextField(blank=True, default='')
    main_image = models.ImageField(upload_to='products/images/')
    is_active = models.BooleanField(default=True, db_index=True)
    
    # Dùng cho các sản phẩm sale trực tiếp thủ công
    is_sale_manual = models.BooleanField(default=False)
    sale_price_manual = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return self.name

class ProductThumbnail(models.Model):
    """
    Album ảnh chi tiết của sản phẩm Laptop
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='thumbnails')
    image = models.ImageField(upload_to='products/thumbnails/')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

class ProductSpecificationKey(models.Model):
    """
    Định nghĩa tên thông số kỹ thuật (ví dụ: RAM, CPU, GPU, Kích thước màn hình)
    """
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class ProductSpecification(models.Model):
    """
    Lưu trữ giá trị thông số kỹ thuật cho từng sản phẩm cụ thể.
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='specifications')
    key = models.ForeignKey(ProductSpecificationKey, on_delete=models.PROTECT)
    value = models.CharField(max_length=255)

    class Meta:
        unique_together = ('product', 'key')

class ProductVariant(TrackingModel):
    """
    Các biến thể cấu hình và giá của Laptop (Ví dụ: Dell XPS 13 i5-8GB-512GB vs i7-16GB-1TB)
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=255) # Ví dụ: Core i7 / 16GB RAM / 512GB SSD
    price_modifier = models.DecimalField(max_digits=15, decimal_places=2, default=0) # Giá cộng thêm so với giá gốc
    stock = models.PositiveIntegerField(default=0)

    @property
    def final_price(self):
        return self.product.price + self.price_modifier

    def __str__(self):
        return f"{self.product.name} - {self.name}"
```

### 5.4 Carts App (apps/carts/models.py)
```python
# apps/carts/models.py
from django.db import models
from common.models import TrackingModel
from apps.users.models import User
from apps.products.models import ProductVariant

class Cart(TrackingModel):
    """
    Bảng quản lý Giỏ hàng trên Database thay thế lưu Session
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart', null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True, db_index=True) # Dùng cho Guest Cart

    def __str__(self):
        return f"Cart of {self.user.email if self.user else self.session_key}"

class CartItem(TrackingModel):
    """
    Chi tiết các sản phẩm (biến thể) có trong giỏ hàng
    """
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('cart', 'variant')
```

### 5.5 Orders App (apps/orders/models.py)
```python
# apps/orders/models.py
from django.db import models
from common.models import TrackingModel
from apps.users.models import User
from apps.products.models import ProductVariant
from apps.marketing.models import Coupon

class Order(TrackingModel):
    """
    Quản lý thông tin đơn đặt hàng tổng quan
    """
    STATUS_CHOICES = [
        ('pending', 'Chờ xác nhận'),
        ('processing', 'Đang xử lý'),
        ('shipped', 'Đang giao hàng'),
        ('completed', 'Đã hoàn thành'),
        ('cancelled', 'Đã hủy'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='orders')
    order_number = models.CharField(max_length=50, unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    shipping_address = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    
    # Tài chính
    subtotal = models.DecimalField(max_digits=15, decimal_places=2)
    discount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Vận chuyển
    date_shipped = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Order #{self.order_number}"

class OrderItem(models.Model):
    """
    Lưu chi tiết từng sản phẩm trong hóa đơn đơn hàng.
    Lưu ý: product_variant trỏ PROTECT để đảm bảo an toàn báo cáo doanh thu lịch sử.
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=15, decimal_places=2) # Giá snapshot tại thời điểm mua

    def __str__(self):
        return f"Item {self.variant.sku} in Order {self.order.order_number}"
```

### 5.6 Reviews App (apps/reviews/models.py)
```python
# apps/reviews/models.py
from django.db import models
from common.models import TrackingModel
from apps.users.models import User
from apps.products.models import Product

class Review(TrackingModel):
    """
    Đánh giá sản phẩm Laptop của khách hàng tích hợp phân tích Sentiment AI
    """
    SENTIMENT_CHOICES = [
        ('positive', 'Tích cực'),
        ('neutral', 'Trung lập'),
        ('negative', 'Tiêu cực'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField() # 1-5 sao
    comment = models.TextField()
    
    # AI Fields
    sentiment = models.CharField(max_length=15, choices=SENTIMENT_CHOICES, null=True, blank=True, db_index=True)
    sentiment_score = models.DecimalField(max_digits=6, decimal_places=5, null=True, blank=True)
    is_spam = models.BooleanField(default=False, db_index=True)

    class Meta:
        unique_together = ('user', 'product') # Giới hạn 1 review/sản phẩm/người dùng
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.user.email} for {self.product.name}"

class ReviewImage(models.Model):
    """
    Ảnh chụp thực tế đính kèm của sản phẩm do khách hàng chụp
    """
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='reviews/gallery/')
```

---

## BƯỚC 6: API ROADMAP (RESTful API ROUTES)

Toàn bộ backend sẽ cung cấp hệ thống APIs chuẩn RESTful được phân loại cụ thể theo từng Django App:

### 6.1 Users & Authentication (`/api/auth/` & `/api/users/`)
* `POST /api/auth/register/` - Đăng ký tài khoản mới (trả về JWT Tokens).
* `POST /api/auth/login/` - Đăng nhập bằng Email và Password (trả về Access & Refresh Token).
* `POST /api/auth/logout/` - Đăng xuất (đưa Refresh Token vào Blacklist).
* `POST /api/auth/refresh/` - Refresh Access Token mới.
* `POST /api/auth/google/` - Đăng nhập/Đăng ký nhanh bằng Google OAuth2 ID Token.
* `POST /api/auth/password/forgot/` - Yêu cầu gửi link reset mật khẩu qua Email.
* `POST /api/auth/password/reset/` - Đặt lại mật khẩu mới bằng token.
* `GET /api/users/me/` - Lấy thông tin tài khoản hiện tại (yêu cầu JWT).
* `PATCH /api/users/me/` - Cập nhật thông tin cá nhân.
* `GET|POST /api/users/addresses/` - Lấy danh sách hoặc tạo mới địa chỉ giao hàng.
* `PUT|PATCH|DELETE /api/users/addresses/{id}/` - Cập nhật/Xóa địa chỉ nhận hàng.

### 6.2 Products Catalog (`/api/products/` & `/api/categories/`)
* `GET /api/categories/` - Lấy toàn bộ danh mục sản phẩm (Hỗ trợ cache 5 phút).
* `GET /api/brands/` - Lấy toàn bộ danh sách thương hiệu Laptop.
* `GET /api/products/` - Lấy danh sách sản phẩm với các bộ lọc:
  * Query params: `category`, `brand`, `search`, `min_price`, `max_price`, `sort_by` (newest, popular, price-asc, price-desc, rating), `page`, `page_size`.
* `GET /api/products/{id}/` - Lấy thông tin chi tiết Laptop bao gồm danh sách ảnh, các biến thể (Variant), thông số kỹ thuật (Spec) và các sản phẩm liên quan.
* `POST /api/products/search-image/` - Tải lên ảnh, dùng AI so khớp Vector và trả về danh sách sản phẩm tương đồng.

### 6.3 Cart & Wishlist (`/api/cart/` & `/api/wishlist/`)
* `GET /api/cart/` - Lấy thông tin giỏ hàng hiện tại (Hỗ trợ cả Guest Cart thông qua `Session-Key` header).
* `POST /api/cart/items/` - Thêm một biến thể sản phẩm Laptop vào giỏ hàng.
* `PATCH /api/cart/items/{id}/` - Cập nhật số lượng của một Item trong giỏ hàng.
* `DELETE /api/cart/items/{id}/` - Xóa sản phẩm khỏi giỏ hàng.
* `POST /api/cart/merge/` - Đồng bộ giỏ hàng từ Client-side (Local Storage) vào Database khi người dùng vừa Login.
* `GET|POST /api/wishlist/` - Xem hoặc thêm sản phẩm vào danh sách yêu thích.
* `DELETE /api/wishlist/{product_id}/` - Xóa sản phẩm khỏi danh sách yêu thích.

### 6.4 Orders & Checkout (`/api/orders/`)
* `POST /api/orders/preview/` - Gửi thông tin sản phẩm và mã Coupon để nhận tính toán thử tiền hàng, tiền giảm giá và phí ship trước khi đặt.
* `POST /api/orders/` - Tạo đơn hàng mới (Trừ tồn kho của Variant tạm thời, trả về thông tin Order và link thanh toán online nếu chọn VNPAY).
* `GET /api/orders/` - Lấy lịch sử đơn hàng của người dùng đang đăng nhập.
* `GET /api/orders/{order_number}/` - Xem chi tiết một đơn đặt hàng.
* `POST /api/orders/{order_number}/cancel/` - Khách hàng tự hủy đơn hàng (Chỉ được phép khi trạng thái đang là `pending`).

### 6.5 Payments Integration (`/api/payments/`)
* `POST /api/payments/vnpay/create-payment/` - Tạo URL chuyển tiếp tới cổng VNPAY.
* `GET /api/payments/vnpay/payment-return/` - Nhận phản hồi kết quả giao dịch VNPAY (Khách hàng quay lại từ cổng thanh toán).
* `GET /api/payments/vnpay/ipn/` - Địa chỉ nhận thông báo giao dịch tự động của VNPAY (Server-to-Server) dùng để cập nhật DB nội bộ an toàn.

### 6.6 Reviews & AI Analysis (`/api/reviews/`)
* `GET /api/products/{id}/reviews/` - Lấy danh sách đánh giá của một sản phẩm Laptop (Loại bỏ các review bị gắn cờ `is_spam`).
* `POST /api/reviews/` - Viết đánh giá sản phẩm mới (Hệ thống tự động kích hoạt Celery Task gọi AI Sentiment phân tích).

---

## BƯỚC 7: CẤU TRÚC CHI TIẾT DRF CHO MỖI APP (DJANGO REST FRAMEWORK)

Mỗi App Django trong thư mục `apps/` sẽ tuân thủ cấu trúc thiết kế Module chuẩn của Django REST Framework như sau:

```
apps/products/
├── models.py       # Khai báo các mô hình Database (Product, Specification, Variant)
├── serializers.py  # Lớp chuyển đổi dữ liệu và thực thi Validation
├── views.py        # ViewSets/APIViews xử lý HTTP request và trả về response JSON
├── urls.py         # Định tuyến URL cục bộ của App
├── services.py     # Nơi xử lý Business Logic nghiệp vụ phức tạp
├── signals.py      # Lắng nghe các sự kiện (ví dụ: Cập nhật tồn kho khi hủy đơn)
└── admin.py        # Cấu hình giao diện Admin Dashboard riêng của App
```

### Cách thức hoạt động và phân chia vai trò:
* **`models.py`:** Chỉ chứa định nghĩa cấu trúc dữ liệu, các thuộc tính ảo `@property`, các phương thức thao tác dữ liệu cơ bản.
* **`serializers.py`:** 
  * Sử dụng `ModelSerializer` của DRF để serialize dữ liệu từ DB thành định dạng JSON.
  * Validation dữ liệu đầu vào thông qua các phương thức `validate_<field_name>()` hoặc `validate()`.
  * Hỗ trợ Nested Serializers (ví dụ: `ProductDetailSerializer` sẽ nhúng `ProductSpecificationSerializer` và `ProductVariantSerializer` bên trong).
* **`views.py`:**
  * Sử dụng `ReadOnlyModelViewSet` cho các API chỉ đọc (như xem danh sách sản phẩm) và `ModelViewSet` cho các API quản trị.
  * Tích hợp các bộ lọc lọc nâng cao `django-filter`, phân trang `LimitOffsetPagination` và tìm kiếm `SearchFilter`.
* **`services.py`:**
  * Toàn bộ business logic lớn không nên để ở views hoặc serializers để tránh code phình to ("Fat Models, Thin Views").
  * Ví dụ: `ProductRecommendationService` sẽ gọi model Torch tải đặc trưng vector để tính toán Cosine Similarity và trả về danh sách gợi ý.
* **`signals.py`:**
  * Quản lý các logic phụ sinh tự động (Side effects) để tách biệt mã nguồn.
  * Ví dụ: Khi một đối tượng `Review` được lưu, một signal `post_save` sẽ được kích hoạt để cập nhật điểm đánh giá trung bình `average_rating` của `Product` tương ứng trong cơ sở dữ liệu.

---

## BƯỚC 8: JWT & AUTHENTICATION FLOW

Kiến trúc bảo mật của hệ thống backend được thiết kế dựa trên cơ chế phân quyền phi tập trung qua **JSON Web Token (JWT)**:

### 8.1 JWT Cấu hình
* Sử dụng thư viện `djangorestframework-simplejwt`.
* Cấu hình thời gian sống của token an toàn:
  * **Access Token Lifetime:** 1 giờ (Dùng để xác thực các yêu cầu gửi đến API).
  * **Refresh Token Lifetime:** 7 ngày (Dùng để cấp lại Access Token mới khi đã hết hạn).
  * **Rotate Refresh Tokens:** `True` (Cấp Refresh Token mới mỗi khi Refresh thành công giúp ngăn chặn tấn công phát lại).
  * **Blacklist After Rotation:** `True` (Refresh Token cũ lập tức bị vô hiệu hóa khi đổi Token mới).

### 8.2 Quy trình xác thực của hệ thống

#### 1. Đăng ký & Đăng nhập truyền thống:
```
Khách hàng ---> [Gửi Email & Password] ---> Backend (Kiểm tra & So khớp Hash)
Khách hàng <--- [Cấp Access + Refresh Token] <--- Backend
```

#### 2. Tích hợp Đăng nhập bằng Google (OAuth2):
```
1. Khách hàng bấm đăng nhập Google trên Frontend React.
2. Google SDK xác thực tài khoản và trả về một `id_token` (JWT có chữ ký số của Google).
3. Frontend gửi `id_token` này lên Backend qua endpoint: POST /api/auth/google/.
4. Backend sử dụng thư viện google-auth để verify chữ ký số của token với Google Server.
5. Sau khi verify thành công:
   - Nếu email của User chưa tồn tại trong DB: Tạo tài khoản User mới với mật khẩu không thể sử dụng (set_unusable_password).
   - Nếu email đã tồn tại: Lấy thông tin User.
6. Backend ký phát hành bộ đôi Access Token + Refresh Token của hệ thống gửi về cho Frontend.
```

#### 3. Quên mật khẩu & Đổi mật khẩu bảo mật:
* Quên mật khẩu: Gửi request chứa email -> Backend sinh một token ngẫu nhiên, lưu vào bộ nhớ tạm Redis/Cache có thời hạn 15 phút, gửi một email chứa link reset kèm token đó cho người dùng.
* Xác nhận đặt lại mật khẩu: Người dùng gửi mật khẩu mới và token lên -> Backend xác thực token hợp lệ và thay đổi mật khẩu thông qua `user.set_password()`.

---

## BƯỚC 9: ADMIN DASHBOARD CONFIGURATION & MONITORING

Trang quản trị (Django Admin) dành cho người quản trị cửa hàng Laptop sẽ được tùy biến sâu sắc để quản trị viên dễ dàng theo dõi và xử lý đơn hàng:

### 9.1 Các Model cần quản trị
* **Users & Permissions:** Quản lý nhóm phân quyền (Nhân viên bán hàng, Nhân viên kho, Nhân viên kỹ thuật).
* **Products Catalog:** Quản lý sản phẩm, cấu hình biến thể (Inline Variant), ảnh sản phẩm, duyệt bình luận.
* **Orders:** Xem danh sách đơn hàng, cập nhật thủ công trạng thái thanh toán và in hóa đơn giao hàng.
* **Marketing:** Tạo mã giảm giá Coupon, quản lý hình ảnh banner hiển thị trên website.

### 9.2 Thiết kế Tối ưu hóa Django Admin

```python
# apps/products/admin.py
from django.contrib import admin
from .models import Product, ProductVariant, ProductSpecification, ProductThumbnail

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ('sku', 'name', 'price_modifier', 'stock')

class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 3

class ProductThumbnailInline(admin.StackedInline):
    model = ProductThumbnail
    extra = 2

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'category', 'price', 'is_active', 'created_at')
    list_filter = ('brand', 'category', 'is_active')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductVariantInline, ProductSpecificationInline, ProductThumbnailInline]
```

### 9.3 Dashboard Thống kê thời gian thực (Custom Admin View)
Tích hợp thư viện đồ thị ở trang chủ Django Admin để hiển thị báo cáo:
* **Các chỉ số KPI cốt lõi:** Doanh thu hôm nay, Số đơn hàng mới chưa xử lý, Tỷ lệ đơn hàng thành công.
* **Biểu đồ đường:** Doanh thu theo tháng/tuần.
* **Biểu đồ tròn:** Cơ cấu doanh số Laptop theo Thương hiệu (Apple vs Asus vs Dell vs MSI).
* **Top sản phẩm bán chạy nhất:** Xếp hạng theo số lượng đơn hàng hoàn thành.
* **AI Sentiment Monitor:** Biểu đồ hiển thị chỉ số phản hồi của khách hàng (Tỷ lệ Review Tích cực / Tiêu cực theo từng tuần).

---

## BƯỚC 10: LỘ TRÌNH TRIỂN KHAI BACKEND CHI TIẾT (API ROADMAP)

Để dự án được bàn giao đúng hạn và giảm thiểu rủi ro tích hợp, lộ trình xây dựng backend được chia làm 10 Pha cuốn chiếu (Agile Sprints):

```mermaid
gantt
    title Lộ trình triển khai backend Django
    dateFormat  YYYY-MM-DD
    section Core Infrastructure
    Phase 1: Users & Auth           :active, p1, 2026-06-01, 7d
    Phase 2: Category & Brand       :p2, after p1, 3d
    Phase 3: Products & Variants    :p3, after p2, 7d
    section Commerce Core
    Phase 4: Database Cart          :p4, after p3, 5d
    Phase 5: Order & Inventory      :p5, after p4, 7d
    Phase 6: VNPay Integration      :p6, after p5, 5d
    section Engagement & AI
    Phase 7: Review & AI Sentiment  :p7, after p6, 6d
    Phase 8: Wishlist & Notify      :p8, after p7, 4d
    Phase 9: AI Image Search        :p9, after p8, 7d
    section Production Ready
    Phase 10: Admin & Deployment    :p10, after p9, 5d
```

### Chi tiết các Pha triển khai:

#### Phase 1: Users & Authentication (7 ngày)
* **Công việc:** Khởi tạo cấu trúc project Django Backend, cài đặt PostgreSQL. Xây dựng Custom User Model, tích hợp SimpleJWT, viết API Đăng ký, Đăng nhập, Đăng xuất, Refresh Token, Đổi mật khẩu và Google OAuth2.
* **Kết quả đầu ra:** Hệ thống đăng nhập bảo mật bằng Token hoạt động tốt trên Postman.

#### Phase 2: Categories & Brands (3 ngày)
* **Công việc:** Tạo các mô hình Category, Brand. Viết APIs lấy danh sách phục vụ việc hiển thị ở thanh Menu điều hướng của frontend. Cấu hình Redis Cache cho các endpoints này.
* **Kết quả đầu ra:** API lấy danh mục và hãng sản xuất ổn định, thời gian phản hồi < 50ms.

#### Phase 3: Products Catalog & Specifications (7 ngày)
* **Công việc:** Triển khai các Model Product, ProductSpecification, ProductVariant (quản lý biến thể cấu hình RAM/CPU) và ProductThumbnail. Viết API danh sách sản phẩm với bộ lọc phức tạp và phân trang.
* **Kết quả đầu ra:** Hệ thống hiển thị danh sách sản phẩm, chi tiết cấu hình Laptop hoàn chỉnh.

#### Phase 4: Database-driven Cart (5 ngày)
* **Công việc:** Xây dựng bảng Cart và CartItem trên Database. Viết APIs thêm, sửa, xóa giỏ hàng. Phát triển logic hợp nhất giỏ hàng (Merge Cart) khi khách hàng chuyển từ trạng thái ẩn danh sang đăng nhập.
* **Kết quả đầu ra:** Giỏ hàng đồng bộ hoàn toàn với database, đảm bảo không mất giỏ hàng khi đổi thiết bị.

#### Phase 5: Orders & Stock Management (7 ngày)
* **Công việc:** Tạo bảng Order, OrderItem. Xây dựng dịch vụ sinh mã số đơn hàng tự động. Viết logic giao dịch: kiểm tra hàng tồn kho thực tế, khóa tạm thời số lượng sản phẩm (Pessimistic locking) để tránh overselling, tạo bản ghi đơn hàng mới.
* **Kết quả đầu ra:** API đặt hàng và quản lý kho hoàn chỉnh.

#### Phase 6: Online Payment Gateway (5 ngày)
* **Công việc:** Viết SDK tích hợp cổng thanh toán VNPAY (kèm kiểm tra checksum an toàn). Xử lý endpoint IPN để nhận thông báo thanh toán tự động từ VNPAY và chuyển trạng thái đơn hàng sang "Đã thanh toán".
* **Kết quả đầu ra:** Quy trình thanh toán tự động qua VNPAY hoàn chỉnh.

#### Phase 7: Reviews, Images & AI Sentiment (6 ngày)
* **Công việc:** Tạo bảng Review và ReviewImage. Cấu hình hàng đợi Celery + Redis. Khi có review mới, đẩy tác vụ phân tích bình luận sang worker để gọi mô hình AI phân tích tự động gắn tag cảm xúc (Tích cực/Tiêu cực) và gắn cờ spam.
* **Kết quả đầu ra:** Đánh giá sản phẩm hoạt động kèm tính năng tự động phân loại của AI.

#### Phase 8: Wishlist & Notifications (4 ngày)
* **Công việc:** Phát triển API Wishlist lưu trên DB. Viết hệ thống thông báo đa kênh (WebSockets + Database) để báo trạng thái đơn hàng cho người dùng.
* **Kết quả đầu ra:** Tính năng lưu sản phẩm yêu thích và nhận thông báo thời gian thực.

#### Phase 9: AI Image Feature Extraction & Product Search (7 ngày)
* **Công việc:** Sử dụng mô hình Torch (CLIP/ResNet) để trích xuất đặc trưng hình ảnh của sản phẩm dạng vector khi admin tải ảnh lên. Lưu trữ vector vào bảng `ProductImageFeature`. Viết API tìm kiếm sản phẩm bằng cách tải ảnh lên, so khớp khoảng cách Euclid/Cosine và trả về danh sách sản phẩm tương đồng nhất.
* **Kết quả đầu ra:** API tìm kiếm sản phẩm bằng ảnh của hệ thống đạt độ chính xác cao.

#### Phase 10: Admin Dashboard Customization & Production Deployment (5 ngày)
* **Công việc:** Tùy biến giao diện Admin Django, nhúng biểu đồ doanh thu và báo cáo thống kê. Thực hiện các cấu hình bảo mật production (tắt DEBUG, cấu hình CORS, thiết lập bảo mật SSL, cài đặt Gunicorn và Nginx).
* **Kết quả đầu ra:** Hệ thống backend hoàn chỉnh được deploy lên môi trường Production (AWS/DigitalOcean).
