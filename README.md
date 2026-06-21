# 🛒 KLTN AI E-Commerce — Laptop Device Store

Hệ thống thương mại điện tử bán laptop & phụ kiện công nghệ tích hợp AI (phân tích cảm xúc bình luận, tìm kiếm sản phẩm bằng hình ảnh).

---

## 📋 Mục lục

- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Kiến trúc dự án](#-kiến-trúc-dự-án)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Cài đặt Backend](#2-cài-đặt-backend-django)
  - [3. Cài đặt Frontend](#3-cài-đặt-frontend-react--vite)
  - [4. Tải model AI](#4-tải-model-ai-distilphobert_best)
- [Chạy dự án](#-chạy-dự-án)
- [Tài khoản mẫu](#-tài-khoản-mẫu)
- [API Endpoints chính](#-api-endpoints-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Xử lý sự cố](#-xử-lý-sự-cố)

---

## 💻 Yêu cầu hệ thống

| Thành phần | Phiên bản tối thiểu |
|---|---|
| **Python** | 3.11+ |
| **Node.js** | 18+ |
| **npm** | 9+ |
| **Git** | 2.30+ |
| **RAM** | 8GB (khuyến nghị 16GB do model AI) |
| **Dung lượng trống** | ~2GB |

> **Lưu ý:** Dự án sử dụng **PostgreSQL** (Supabase cloud). Không cần cài DB cục bộ.

---

## 🏗 Kiến trúc dự án

```
kltn-ai-ecommer/
├── backend/                    # Django REST API
│   ├── config/                 # Settings, URLs, WSGI/ASGI
│   ├── auth_api/               # Authentication (JWT, Google OAuth, OTP)
│   ├── store/                  # Sản phẩm, Đánh giá, AI Sentiment
│   ├── cart/                   # Giỏ hàng
│   ├── payment/                # Thanh toán VNPay, Đơn hàng, GHN
│   ├── wishlist/               # Danh sách yêu thích
│   ├── shared/                 # Utilities dùng chung
│   ├── distilphobert_best/     # ⚠️ Model AI (KHÔNG có trên Git)
│   ├── media/                  # Upload files (KHÔNG có trên Git)
│   ├── logs/                   # Log files (KHÔNG có trên Git)
│   ├── .env                    # ⚠️ Biến môi trường (KHÔNG có trên Git)
│   ├── requirements.txt        # Python dependencies
│   └── manage.py
│
├── frontend/                   # React + Vite + TailwindCSS v4
│   ├── src/
│   │   ├── contexts/           # AuthContext
│   │   ├── features/           # product, cart, review components
│   │   ├── pages/              # Tất cả các trang
│   │   ├── services/           # API client (axios)
│   │   ├── shared/             # Header, Footer, utils
│   │   └── hooks/              # Custom React hooks
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md                   # 📖 File này
```

---

## 🚀 Hướng dẫn cài đặt

### 1. Clone Repository

```bash
git clone https://github.com/thuong-2305/kltn-ai-ecommerce-laptop-device-store.git
cd kltn-ai-ecommerce-laptop-device-store
```

---

### 2. Cài đặt Backend (Django)

#### 2.1 Tạo Virtual Environment

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 2.2 Cài đặt Dependencies

```bash
pip install -r requirements.txt
```

> ⚠️ **Lưu ý về PyTorch:** Nếu bạn có GPU NVIDIA và muốn chạy model AI nhanh hơn, cài PyTorch với CUDA:
> ```bash
> pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
> ```
> Nếu không có GPU, phiên bản CPU mặc định trong `requirements.txt` vẫn hoạt động bình thường.

#### 2.3 Tạo file `.env`

Tạo file `backend/.env` với nội dung sau (liên hệ trưởng nhóm để lấy thông tin thực):

```env
# ─── Database (PostgreSQL - Supabase) ───
DB_URL=jdbc:postgresql://<HOST>:5432/postgres?prepareThreshold=0
DB_USER=<DB_USER>
DB_PASS=<DB_PASSWORD>
DB_NAME=web_ecommerce_kltn_2026

# ─── Django ───
SECRET_KEY=<DJANGO_SECRET_KEY>
DEBUG=True

# ─── Google OAuth ───
GOOGLE_CLIENT_ID=<GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<GOOGLE_CLIENT_SECRET>

# ─── VNPay (Sandbox) ───
VNPAY_TMN_CODE=<VNPAY_CODE>
VNPAY_HASH_SECRET_KEY=<VNPAY_SECRET>

# ─── GHN Shipping (Sandbox) ───
GHN_TOKEN=<GHN_TOKEN>
GHN_SHOP_ID=<GHN_SHOP_ID>
GHN_API_URL=https://dev-online-gateway.ghn.vn/shiip/public-api/v2/
```

#### 2.4 Tạo các folder cần thiết

```bash
# Tạo folder logs (Django sẽ ghi log vào đây)
mkdir logs

# Tạo folder media (lưu ảnh upload)
mkdir media
```

#### 2.5 Migrate Database & Tạo Superuser

```bash
python manage.py migrate
python manage.py createsuperuser
```

---

### 3. Cài đặt Frontend (React + Vite)

```bash
cd frontend
npm install
```

#### 3.1 Cấu hình API URL (nếu cần)

File cấu hình API nằm ở `frontend/src/config/api.js`. Mặc định trỏ đến `http://localhost:8000`.

---

### 4. Tải Model AI (`distilphobert_best`)

> ⚠️ **QUAN TRỌNG:** Folder `distilphobert_best/` chứa model AI phân tích cảm xúc bình luận tiếng Việt (~370MB). Folder này **KHÔNG có trên Git** vì quá nặng.

#### Cách lấy model:

**Cách 1 — Copy từ máy đồng đội:**
```
Yêu cầu đồng đội gửi cho bạn toàn bộ folder `backend/distilphobert_best/`
và đặt vào đúng vị trí: backend/distilphobert_best/
```

**Cách 2 — Tải từ Google Drive/Cloud (nếu có):**
```
Link tải: [Liên hệ trưởng nhóm để lấy link]
Sau khi tải, giải nén vào: backend/distilphobert_best/
```

#### Cấu trúc folder model phải có đủ các file sau:

```
backend/distilphobert_best/
├── added_tokens.json
├── bpe.codes              (~1.1MB)
├── config.json
├── model.safetensors      (~370MB) ← File nặng nhất
├── special_tokens_map.json
├── tokenizer_config.json
├── training_args.bin
└── vocab.txt              (~895KB)
```

> **Nếu không có model:** Hệ thống vẫn chạy được bình thường. Chức năng phân tích cảm xúc sẽ tự động fallback sang phương pháp đơn giản dựa trên số sao đánh giá (không dùng AI).

---

## ▶️ Chạy dự án

### Mở 2 terminal riêng biệt:

**Terminal 1 — Backend (Django):**
```bash
cd backend
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
python manage.py runserver
```
→ Backend chạy tại: **http://localhost:8000**
→ Trang quản trị: **http://localhost:8000/admin/**

**Terminal 2 — Frontend (React):**
```bash
cd frontend
npm run dev
```
→ Frontend chạy tại: **http://localhost:5173**

---

## 👤 Tài khoản mẫu

| Vai trò | Trang đăng nhập | Ghi chú |
|---|---|---|
| **Admin** | http://localhost:8000/admin/ | Dùng superuser đã tạo ở bước 2.5 |
| **Khách hàng** | http://localhost:5173/login | Đăng ký tài khoản mới hoặc đăng nhập Google |

---

## 📡 API Endpoints chính

| Endpoint | Method | Mô tả |
|---|---|---|
| `/api/store/home/` | GET | Trang chủ (sản phẩm, danh mục, sale) |
| `/api/store/products/` | GET | Danh sách sản phẩm (filter, sort, search) |
| `/api/store/products/<id>/` | GET | Chi tiết sản phẩm |
| `/api/store/products/search-by-image/` | POST | Tìm kiếm bằng hình ảnh (AI/CLIP) |
| `/api/store/reviews/` | POST | Gửi đánh giá sản phẩm |
| `/api/store/admin/reviews/` | GET | [Admin] Danh sách bình luận |
| `/api/store/products/<id>/sentiment-stats/` | GET | [Admin] Thống kê cảm xúc |
| `/api/auth/register/` | POST | Đăng ký tài khoản |
| `/api/auth/login/` | POST | Đăng nhập (JWT) |
| `/api/auth/google-login/` | POST | Đăng nhập Google OAuth |
| `/api/cart/` | GET/POST | Giỏ hàng |
| `/api/payment/create/` | POST | Tạo đơn hàng |
| `/api/payment/vnpay/` | POST | Thanh toán VNPay |

---

## 🛠 Công nghệ sử dụng

### Backend
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| Django | 5.1 | Web framework |
| Django REST Framework | 3.17 | REST API |
| SimpleJWT | 5.5 | JWT Authentication |
| PostgreSQL (Supabase) | — | Database |
| PyTorch | 2.5 | AI/ML framework |
| Transformers (HuggingFace) | 4.40 | Sentiment Analysis |
| CLIP + FAISS | — | Image similarity search |
| VNPay SDK | — | Online payment |
| GHN API | v2 | Shipping integration |

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool |
| TailwindCSS | 4 | Utility-first CSS |
| React Router | 7 | Client-side routing |
| Axios | 1.14 | HTTP client |
| Zustand | 5 | State management |
| Recharts | 3.8 | Charts & analytics |
| Lucide React | 1.16 | Icon library |

---

## 🔧 Xử lý sự cố

### ❌ `ModuleNotFoundError: No module named 'torch'`
Model AI yêu cầu PyTorch. Cài đặt:
```bash
pip install torch torchvision torchaudio
```

### ❌ `NameError` hoặc lỗi liên quan đến `distilphobert_best`
Folder model chưa được tải. Xem mục [4. Tải model AI](#4-tải-model-ai-distilphobert_best). Hệ thống vẫn hoạt động mà không cần model (fallback tự động).

### ❌ `mysqlclient` cài không được trên Windows
Tải bản prebuilt từ: https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient
Hoặc bỏ qua vì dự án dùng PostgreSQL (chỉ cần `psycopg2-binary`).

### ❌ `npm install` bị lỗi trên Windows
Thử xóa cache và cài lại:
```bash
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
```

### ❌ `CORS error` khi gọi API từ Frontend
Kiểm tra backend `.env` có `CORS_ALLOWED_ORIGINS` bao gồm `http://localhost:5173`. Mặc định đã được cấu hình sẵn.

### ❌ Frontend trắng trang / lỗi `useAuth`
Đảm bảo `AuthProvider` bọc ngoài `App` trong `main.jsx`. Kiểm tra console browser để xem chi tiết lỗi.

---

## 📂 Checklist sau khi Clone

Đảm bảo bạn đã hoàn thành tất cả các bước:

- [ ] Clone repository
- [ ] Tạo virtual environment (`backend/venv/`)
- [ ] Cài dependencies: `pip install -r requirements.txt`
- [ ] Tạo file `backend/.env` (lấy thông tin từ trưởng nhóm)
- [ ] Tạo folder `backend/logs/`
- [ ] Tạo folder `backend/media/`
- [ ] Copy folder `backend/distilphobert_best/` (tùy chọn, cho AI)
- [ ] Chạy `python manage.py migrate`
- [ ] Chạy `python manage.py createsuperuser`
- [ ] Cài frontend: `cd frontend && npm install`
- [ ] Chạy backend: `python manage.py runserver`
- [ ] Chạy frontend: `npm run dev`
- [ ] Truy cập http://localhost:5173 ✅

---

> 📌 **Liên hệ:** Nếu gặp vấn đề, liên hệ trưởng nhóm để được hỗ trợ.
