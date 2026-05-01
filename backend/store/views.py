import os
import tempfile
from PIL import Image
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User
from django.db.models import Avg, Q, Sum, Case, When, F, Value
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

# from analysis.spam_detective import isSpam  # Temporarily disabled - requires analysis app
from cart.cart import Cart

from payment.forms import ShippingForm
from payment.models import Order, OrderItem, ShippingAddress

# from analysis.system import getReviewEmotion  # Temporarily disabled - requires analysis app
# from recommend import recommend_system  # Temporarily disabled - requires pandas, sklearn

# from .utils import find_similar_products  # Temporarily disabled - requires torch, clip, faiss
from .models import Product, Category, ProductThumbnail, Profile, Review, SaleEvent
# from .forms import ImageUploadForm, ReviewForm, SignUpForm, UpdateUserForm, ChangePasswordForm, UserInfoForm
from datetime import datetime, timedelta
import json

def product(request, pk):
    """Display a single product"""
    product = Product.objects.get(id=pk)
    thumbnails = product.thumbnails.all()

    price = f"{product.price:,}"
    sale_price = f"{product.sale_price:,}"
    description = product.description.split("- ") if product.description else []  

    if product.config:  
        config = product.config.split("- ")
    else:
        config = [] 

    processed_config =[
        {parts[0]: [{kv.split(": ")[0]: kv.split(": ")[1]} for kv in parts[1:] if ": " in kv]}
        for con in config if con
        for parts in [con.split(" + ")]]
    
    if request.user.is_authenticated:
        current_user = User.objects.get(id=request.user.id)
        reviews = Review.objects.filter(Q(product=product) & (Q(is_spam=False) | Q(user=current_user))).order_by('-review_date', 'id')
    else:
        reviews = Review.objects.filter(Q(product=product) & (Q(is_spam=False))).order_by('-review_date', 'id')

    average_rating = Review.objects.filter(product=product).aggregate(Avg('rating'))['rating__avg']
    if average_rating is None:
        average_rating = 0  

    # top_recommend_product = 5
    # product_recommend = recommend_system.get_products_similar(pk, top_recommend_product)

    return render(request, 'product.html', 
        {'product':product, 
         'description':description, 
         'price':price, 
         'sale_price':sale_price,
         'config':processed_config,
         'reviews' : reviews,
         'average_rating': average_rating,
         # 'product_recommend': product_recommend,
         'thumbnails': thumbnails,
        }
    )

def home(request):
    """Display home page with products and sales"""
    products = Product.objects.all()

    # Lấy các sự kiện giảm giá còn hiệu lực
    active_sales = SaleEvent.objects.filter(
        start_date__lte=datetime.now(),
        end_date__gte=datetime.now()
    )
    # Lấy danh sách các category được giảm giá
    discounted_categories = [sale.category for sale in active_sales]

    # Lấy top sản phẩm bán chạy nhất
    top_products = (Product.objects.annotate(total_sold=Sum('orderitem__quantity'))
        .filter(total_sold__gt=0)  
        .order_by('-total_sold')[:10]
    )

    context = {
        'products':products,
        'discounted_categories': discounted_categories,
        'active_sale': active_sales,
        'top_products': top_products
    }

    return render(request, 'home.html', context)

def category_summary(request):
    """Display all categories and products with filtering options"""
    categories = Category.objects.all()
    products = Product.objects.all()

    # Xử lý bộ lọc giá
    price_min = request.GET.get('price_min')
    price_max = request.GET.get('price_max')

    # Gộp giá sale và giá thường thành một trường chung
    products = products.annotate(
        effective_price=Case(
            When(is_sale=True, then=F('sale_price')),
            default=F('price')
        )
    )

    if price_min and price_max:
        products = products.filter(
            effective_price__gte=price_min,
            effective_price__lte=price_max
        )

    order_by = request.GET.get('order_by')
    if order_by == 'popular':
        products = products.annotate(total_sold=Sum('orderitem__quantity')).filter(total_sold__gt=0).order_by('-total_sold')
    elif order_by == 'promotion':
        products = products.filter(is_sale=True).order_by('-sale_price')
    elif order_by == 'price-asc':
        products = products.order_by('effective_price')
    elif order_by == 'price-desc':
        products = products.order_by('-effective_price')

    return render(request, 'category_summary.html', {'categories':categories, 'products':products})

def category(request, foo):
    """Display products by category"""
    # Lấy các sự kiện giảm giá còn hiệu lực
    active_sales = SaleEvent.objects.filter(
        start_date__lte=datetime.now(),
        end_date__gte=datetime.now()
    )
    try:
        category = Category.objects.get(name=foo)
        products = Product.objects.filter(category=category)
        return render(request, 'category.html', {'products':products, 'category':category, 'active_sale': active_sales})
    except:
        messages.success("That category doesn't exist...")
        return redirect('home')

def about(request):
    """Display about page"""
    return render(request, 'about.html', {})

def login_user(request):
    """Handle user login"""
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        error = ''
        if user is not None:
            login(request, user)

            current_user = Profile.objects.get(user__id=request.user.id)

            save_cart = current_user.old_cart
            if save_cart:
                converted_cart = json.loads(save_cart)
                cart = Cart(request)
                for key, value in converted_cart.items():
                    cart.db_add(product=key, quantity=value)

            messages.success(request, ('You have successfully logged in.'))
            return redirect('home')
        else:
            error = 'Invalid username or password.'
            return render(request, 'login.html', {'error':error})
    else:
        return render(request, 'login.html', {})

def logout_user(request):
    """Handle user logout"""
    logout(request)
    messages.success(request, ('You have successfully logged out!'))
    return redirect('home')

def register_user(request):
    """Handle user registration"""
    if request.user.is_authenticated:
        return redirect('home')
    
    messages.error(request, "Registration form not available yet.")
    return redirect('home')
