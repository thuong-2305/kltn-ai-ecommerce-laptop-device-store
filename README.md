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

---

## 💻 Yêu cầu hệ thống

| Thành phần | Phiên bản tối thiểu |
|---|---|
| **Python** | 3.11+ |
| **Node.js** | 18+ |
| **npm** | 9+ |
| **Git** | 2.30+ |
| **RAM** | 8GB |
| **Dung lượng trống** | ~2GB |


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
└── README.md                  
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

#### 2.3 Tạo file `.env`

Tạo file `backend/.env` với nội dung sau:

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
```

---

### 3. Cài đặt Frontend (React + Vite)

```bash
cd frontend
npm install
```


## ▶️ Chạy dự án

### Mở 2 terminal riêng biệt:

**Terminal 1 — Backend (Django):**
```bash
cd backend
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
python manage.py runserver
```
→ Trang quản trị: **http://127.0.0.1:8000/admin/**

**Terminal 2 — Frontend (React):**
```bash
cd frontend
npm run dev
```
→ Frontend chạy tại: **http://localhost:5173**

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
