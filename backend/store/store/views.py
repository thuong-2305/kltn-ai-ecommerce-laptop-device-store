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

from analysis.spam_detective import isSpam
from cart.cart import Cart

from payment.forms import ShippingForm
from payment.models import Order, OrderItem, ShippingAddress

from analysis.system import getReviewEmotion
from recommend import recommend_system

# from .utils import find_similar_products
from .utils import find_similar_products
from .models import Product, Category, ProductThumbnail, Profile, Review, SaleEvent
from .forms import ImageUploadForm, ReviewForm, SignUpForm, UpdateUserForm, ChangePasswordForm, UserInfoForm
from datetime import datetime, timedelta
import json

def review(request, pk):
    update_commen_old()
    product = get_object_or_404(Product, id=pk)
    user_current = request.user
    form = ReviewForm()
    orders = Order.objects.filter(user=user_current, shipped=True)
    
    # Check if user has a recent order with the product
    has_recent_purchase = False
    orders = Order.objects.filter(user=user_current, shipped=True)
    # Lấy phần ngày, tháng, năm của ngày giao hàng và ngày hiện tại
    today = datetime.now().date()
    thirty_days_ago = today - timedelta(days=30)
    for order in orders:
        # Check if product exists in order items
        order_items = OrderItem.objects.filter(order=order, product=product)
        if order_items:  
            # Check if order is shipped within the last 30 days
            order_date = order.date_shipped.date()
            
            if order.date_shipped and order_date >= thirty_days_ago:
                has_recent_purchase = True
                break  # No need to check further orders

    # Kiểm tra xem người đó đã đánh giá sản phầm hay chưa
    if Review.objects.filter(user=user_current, product=product).exists():
        messages.success(request, "Product your reviewed...")
        return redirect('home')

    if not has_recent_purchase: 
        messages.success(request, "Please buy product")
        return redirect('home')
    
    if request.method == 'POST':
        form = ReviewForm(request.POST)
        if form.is_valid():
            review = form.save(commit=False)
            content = request.POST.get('comment')
            spam = isSpam(content)
            score = getReviewEmotion(content)
            review.score_analysis = score
            review.sentiment = 'positive' if score >= 0.2 else 'negative'
            review.user = request.user
            review.product = product
            review.is_spam = True if spam == 'spam' else False
            review.save()
            messages.success(request, "Đánh giá của bạn đã được gửi!")
            return redirect('home')
        else:
            messages.success(request, "Đánh giá thất bại")
            return redirect('home')
    else:
        return render(request, "review_product.html", {'form':form, 'product':product, 'pk':pk})

# Update reviews old with sentiment is null
def update_commen_old():
    reviews = Review.objects.filter(sentiment__isnull=True)
    for review in reviews:
        score = getReviewEmotion(review.comment)
        review.score_analysis = score
        review.sentiment = 'positive' if score >= 0.1 else 'negative'
        review.save()

def search(request):
    active_sales = SaleEvent.objects.filter(
        start_date__lte=datetime.now(),
        end_date__gte=datetime.now()
    )
    if request.method == 'POST':
        searched = request.POST['searched']
        #Query the products from db product
        searched = Product.objects.filter(name__icontains=searched)
        if not searched:
            messages.success(request, "That product not exits... please again search!")
        return render(request, "search.html", {"searched" : searched, 'active_sale': active_sales})
    else:
        return render(request, "search.html", {})
    
# Tìm kiém bằng hình ảnh
def search_by_image(request):
    products = []
    form = ImageUploadForm(request.POST or None, request.FILES or None)

    if request.method == 'POST' and form.is_valid():
        image_file = form.cleaned_data['image']

        # with tempfile.NamedTemporaryFile(delete=False, suffix=".webp") as temp_image:
        #     for chunk in image_file.chunks():
        #         temp_image.write(chunk)
        #     temp_image_path = temp_image.name
        #     saved_path = default_storage.save(f"query_images/{image_file.name}", ContentFile(image_file.read()))
        #     query_image_url = default_storage.url(saved_path)
        ext = os.path.splitext(image_file.name)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_image:
            for chunk in image_file.chunks():
                temp_image.write(chunk)
        temp_image_path = temp_image.name

        image_file.seek(0)

        saved_path = default_storage.save(
            f"query_images/{image_file.name}",
            ContentFile(image_file.read())
            )
        query_image_url = default_storage.url(saved_path)

        product_ids = find_similar_products(temp_image_path)
        # Sau khi đã có product_ids sắp xếp theo thứ tự id đã được xếp trước đó
        product_qs = Product.objects.filter(id__in=product_ids)
        product_dict = {product.id: product for product in product_qs}
        products = [product_dict[pid] for pid in product_ids if pid in product_dict]

    return render(request, "search.html", {"searched": products, "query_image_url": query_image_url})

def update_info(request):
    if request.user.is_authenticated:
        # Lấy thông tin user hiện tại
        current_user = Profile.objects.get(user__id=request.user.id)
        # Lấy thông tin vận chuyển của user hiện tại
        shipping_user = ShippingAddress.objects.get(user__id=request.user.id)

        form = UserInfoForm(request.POST or None, instance=current_user)
        shipping_form = ShippingForm(request.POST or None, instance=shipping_user)

        print(shipping_form)
        if shipping_form.is_valid():
            request.session['my_shipping'] = shipping_form.cleaned_data
            
        if form.is_valid() or shipping_form.is_valid():
            form.save()
            shipping_form.save()
            messages.success(request, "Update thành công...")
            return redirect('home')       

        return render(request, 'update_info.html', {'form':form, 'shipping_form':shipping_form})
    
    else:
        messages.success(request, 'Bạn phải đăng nhập trước...')
        return redirect('home')

def update_password(request):
    if request.user.is_authenticated:
        current_user = request.user
        # Did they fill out the form 
        if request.method == 'POST':
            form = ChangePasswordForm(user=current_user, data=request.POST)
            # Is the form valid
            if form.is_valid():
                form.save()
                messages.success(request, "Your password has been updated...")
                login(request, current_user)
                return redirect('login')
            else:
                for error in list(form.errors.values()):
                    messages.error(request, error)
                return redirect('update_password')
        else:
            form = ChangePasswordForm(user=current_user)
            return render(request, 'update_password.html', {'form':form})
    else:
        form = ChangePasswordForm(request, "Please log in to update your password.")
        return redirect('home')
    
def update_user(request):
    if request.user.is_authenticated:
        current_user = User.objects.get(id=request.user.id)
        user_form = UpdateUserForm(request.POST or None, instance=current_user)
    
        if user_form.is_valid():
            user_form.save()

            # login(request, current_user)
            messages.success(request, "Update thành công...")
            return redirect('home')
        return render(request, 'update_user.html', {'user_form':user_form})

    else:
        messages.success(request, 'Bạn phải đăng nhập trước...')
        return redirect('home')

def category_summary(request):
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
        messages.success("That category don' exits...")
        return redirect('home')

def product(request, pk):
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

    top_recommend_product = 5
    product_recommend = recommend_system.get_products_similar(pk, top_recommend_product)

    return render(request, 'product.html', 
        {'product':product, 
         'description':description, 
         'price':price, 
         'sale_price':sale_price,
         'config':processed_config,
         'reviews' : reviews,
         'average_rating': average_rating,
         'product_recommend': product_recommend,
         'thumbnails': thumbnails,
        }
    )

def home(request):
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

def about(request):
    return render(request, 'about.html', {})

def login_user(request):
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

            messages.success(request, ('Bạn đã đăng nhập thành công.'))
            return redirect('home')
        else:
            error = 'Tài khoản không đúng.'
            return render(request, 'login.html', {'error':error})
    else:
        return render(request, 'login.html', {})

def logout_user(request):
    logout(request)
    messages.success(request, ('Bạn đã đăng xuất tài khoản hiện tài!'))
    return redirect('home')

def register_user(request):
    if request.user.is_authenticated:
        return redirect('home')
    
    form = SignUpForm()
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data['username']
            password = form.cleaned_data['password1']
            user = authenticate(username=username, password=password)
            login(request, user)
            messages.success(request, ("You have register successfull! Welcome"))
            return redirect('home')
        else:
            errors = form.errors
            return render(request, 'register.html', {'form':form, 'errors':errors})
    else:        
        return render(request, 'register.html', {'form':form})
    


