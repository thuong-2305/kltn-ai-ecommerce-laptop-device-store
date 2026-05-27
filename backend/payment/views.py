from datetime import datetime
import json
import os

from django.conf import settings
from django.http.response import JsonResponse
from django.shortcuts import redirect, render
from django.contrib import messages
from django.contrib.auth.models import User
from cart.cart import Cart
from payment.forms import PaymentForm, ShippingForm
from payment.models import Order, ShippingAddress, OrderItem
from store.models import Profile
from .vnpay import vnpay
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.views.decorators.csrf import csrf_exempt

def orders(request, pk):
    if request.user.is_authenticated:
        order = Order.objects.get(id=pk)
        items = OrderItem.objects.filter(order=pk)
        return render(request, 'payment/orders.html', {'order':order, 'items':items})
    else:
        messages.success(request, "Access Dinied")
        return redirect('home')

def not_shipped_dash(request):
    if request.user.is_authenticated:
        orders = Order.objects.filter(shipped=False, user=request.user).order_by('-date_ordered', '-id')
        shipping_form = request.session.get('my_shipping')
        if not shipping_form:
            # messages.error(request, "Thông tin vận chuyển không tồn tại. Vui lòng đặt hàng trước.")
            # return redirect('update_info')
            try:
                shipping_address = ShippingAddress.objects.get(user=request.user)
                # Nếu có, convert sang dict giống session để hiển thị
                shipping_form = {
                    'shipping_full_name': shipping_address.shipping_full_name,
                    'shipping_phone': shipping_address.shipping_phone,
                    'shipping_address': shipping_address.shipping_address
                }
            except ShippingAddress.DoesNotExist:
                # Không có trong database → yêu cầu cập nhật
                messages.error(request, "Thông tin vận chuyển không tồn tại. Vui lòng cập nhật trước khi tiếp tục.")
                return redirect('update_info')
        return render(request, 'payment/not_shipped_dash.html', {'orders':orders, 'shipping_form':shipping_form})
    else:
        messages.success(request, "Access Dinied")
        return redirect('home')

def shipped_dash(request):
    if request.user.is_authenticated:
        orders = Order.objects.filter(shipped=True, user=request.user).order_by('-date_shipped', '-id')
        shipping_form = request.session.get('my_shipping')
        if not shipping_form:
            # messages.error(request, "Thông tin vận chuyển không tồn tại. Vui lòng đặt hàng trước.")
            # return redirect('update_info')
            try:
                shipping_address = ShippingAddress.objects.get(user=request.user)
                # Nếu có, convert sang dict giống session để hiển thị
                shipping_form = {
                    'shipping_full_name': shipping_address.shipping_full_name,
                    'shipping_phone': shipping_address.shipping_phone,
                    'shipping_address': shipping_address.shipping_address
                }
            except ShippingAddress.DoesNotExist:
                # Không có trong database → yêu cầu cập nhật
                messages.error(request, "Thông tin vận chuyển không tồn tại. Vui lòng cập nhật trước khi tiếp tục.")
                return redirect('update_info')
        return render(request, 'payment/shipped_dash.html', {'orders': orders, 'shipping_form':shipping_form})
    else:
        messages.success(request, "Access Dinied")
        return redirect('home')

def payment_success(request):
    return render(request, 'payment/payment_success.html', {})

def checkout(request):
    cart = Cart(request)
    cart_products = cart.get_prods 
    quantities = cart.get_quants
    totals = cart.total()
    total_final = cart.total_final()
    shipping_method = cart.shipping_method

    if request.user.is_authenticated:
        shipping_user = ShippingAddress.objects.get(user__id=request.user.id)
        shipping_form = ShippingForm(request.POST or None, instance=shipping_user)
        return render(request, 'payment/checkout.html', {'cart_products':cart_products, 'quantities': quantities, 'shipping_method': shipping_method, 'totals':totals, 'shipping_form':shipping_form, 'total_final':total_final})
    else:
        shipping_form = ShippingForm(request.POST or None)
        return render(request, 'payment/checkout.html', {'cart_products':cart_products, 'quantities': quantities, 'shipping_method': shipping_method, 'totals':totals, 'shipping_form':shipping_form, 'total_final':total_final})


def billing_info(request):
    if request.POST:
        cart = Cart(request)
        cart_products = cart.get_prods 
        quantities = cart.get_quants
        totals = cart.total()
        shipping_method = cart.shipping_method
        price_ship = cart.get_shipping_cost(shipping_method)
        total_final = cart.total_final()

        #  Create a session with Shipping info
        my_shipping = request.POST
        request.session['my_shipping'] = my_shipping

        try:
            shipping_user = ShippingAddress.objects.get(user__id=request.user.id)
        except ShippingAddress.DoesNotExist:
            shipping_user = None

        if shipping_user is None:
            shipping_form = ShippingForm(request.POST or None)  
        else:
            shipping_form = ShippingForm(request.POST or None, instance=shipping_user)            

        # Chech see if user logged in
        if request.user.is_authenticated:
            # Get billing form 
            billing_form = PaymentForm()
            shipping_form.save()
            return render(request, 'payment/billing_info.html', {
                'cart_products': cart_products,
                'quantities': quantities,
                'totals': totals,
                'total_final': total_final,
                'shipping_method': shipping_method,
                'price_ship': price_ship,
                'shipping_info': shipping_form,
                'billing_form': billing_form,
            })
        else:
            billing_form = PaymentForm()
            shipping_form = ShippingForm(request.POST or None)
            return render(request, 'payment/billing_info.html', {
                'cart_products': cart_products,
                'quantities': quantities,
                'totals': totals,
                'total_final': total_final,
                'shipping_method': shipping_method,
                'price_ship': price_ship,
                'shipping_info': shipping_form,
                'billing_form': billing_form,
            })
    else:
        messages.success(request, "Access Cancled")
        return redirect('home')
    
def _create_order_from_cart(request, user, my_shipping, totals):
    """
    Extract shared order creation, item creation, and cart cleanup logic.
    Returns the created Order instance.
    """
    cart = Cart(request)
    cart_products = cart.get_prods()
    quantities = cart.get_quants()

    full_name = my_shipping['shipping_full_name']
    phone = my_shipping['shipping_phone']
    shipping_address = my_shipping['shipping_address']

    # create Order 
    create_order = Order(
        user=user,
        full_name=full_name,
        phone=phone,
        shipping_address=shipping_address,
        amount_paid=totals
    )
    create_order.save()

    # Add order item
    order_id = create_order.pk
    for product in cart_products:
        product_id = product.id
        price = product.sale_price if product.is_sale else product.price

        for key, value in quantities.items():
            if int(key) == product.id:
                create_order_item = OrderItem(
                    order_id=order_id,
                    product_id=product_id,
                    user=user,
                    quantity=value,
                    price=price
                )
                create_order_item.save()

    # Delete out of products cart when bought
    for key in list(request.session.keys()):
        if key == 'session_key':
            del request.session[key]

    if 'shipping_method' in request.session:
        del request.session['shipping_method']

    # Delete our cart from db when bought successfully
    Profile.objects.filter(user=user).update(old_cart='')

    return create_order


def process_order(request):
    if request.POST:
        cart = Cart(request)
        totals = cart.total_final()
        my_shipping = request.session.get('my_shipping')

        if request.user.is_authenticated:
            _create_order_from_cart(request, request.user, my_shipping, totals)
            messages.success(request, "Đặt hàng thành công!")
            return redirect('home')
        else:
            messages.success(request, "Xin hãy đăng nhập hoặc đăng ký để mua sản phẩm...")
            return redirect('home')
    else:
        messages.success(request, "Truy cập đã bị chặn")
        return redirect('home')
    

def process_order_paypal(request):
    if request.POST:
        cart = Cart(request)
        totals = cart.total_final()
        my_shipping = request.session.get('my_shipping')

        if request.user.is_authenticated:
            _create_order_from_cart(request, request.user, my_shipping, totals)
            messages.success(request, "Đặt hàng thành công!")
            return redirect('home')
        else:
            messages.success(request, "Xin hãy đăng nhập hoặc đăng ký để mua hàng...")
            return redirect('home')
    else:
        messages.success(request, "Truy cập đã bị chặn")
        return redirect('home')
    
    
def process_order_upon(request):
    if request.POST:
        cart = Cart(request)
        totals = cart.total_final()
        my_shipping = request.session.get('my_shipping')

        if request.user.is_authenticated:
            _create_order_from_cart(request, request.user, my_shipping, totals)
            messages.success(request, "Đặt hàng thành công!")
            return redirect('home')
        else:
            messages.success(request, "Xin hãy đăng nhập hoặc đăng ký để mua hàng...")
            return redirect('home')
    else:
        messages.success(request, "Truy cập đã bị chặn")
        return redirect('home')

# Lấy dữ liệu địa giới hành chính Việt Nam
def get_data(request):
    # Đường dẫn tuyệt đối tới file JSON
    file_path = os.path.join(settings.BASE_DIR, 'static', 'data', 'data.json')

    try:
        # Mở và đọc file JSON
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        return JsonResponse(data, safe=False)
    except FileNotFoundError:
        return JsonResponse({"error": "File not found"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Failed to decode JSON"}, status=500)

def get_location_names(data, city_id, district_id, ward_id, specific_address):
    city_name = None
    district_name = None
    ward_name = None

    # Tìm thành phố
    city = next((c for c in data if c['Id'] == city_id), None)
    if city:
        city_name = city['Name']

        # Tìm quận/huyện
        district = next((d for d in city['Districts'] if d['Id'] == district_id), None)
        if district:
            district_name = district['Name']

            # Tìm phường/xã
            ward = next((w for w in district['Wards'] if w['Id'] == ward_id), None)
            if ward:
                ward_name = ward['Name']

    return ward_name, district_name, city_name, specific_address

def get_location_ids(data, city_name, district_name, ward_name):
    city_id = None
    district_id = None
    ward_id = None

    # Tìm thành phố
    city = next((c for c in data if c['Name'] == city_name), None)
    if city:
        city_id = city['Id']

        # Tìm quận/huyện
        district = next((d for d in city['Districts'] if d['Name'] == district_name), None)
        if district:
            district_id = district['Id']

            # Tìm phường/xã
            ward = next((w for w in district['Wards'] if w['Name'] == ward_name), None)
            if ward:
                ward_id = ward['Id']

    return ward_id, district_id, city_id

def get_client_ip(request):
    return request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))

def vnpay_checkout(request):
    if request.method == "POST":
        cart = Cart(request)
        totals = cart.total_final()
        my_shipping = request.session.get('my_shipping')

        if request.user.is_authenticated:
            create_order = _create_order_from_cart(request, request.user, my_shipping, totals)
            order_id = create_order.pk

        amount = totals  
        order_desc = request.POST['description']
        bank_code = request.POST.get('bank_code', '')
        language = request.POST.get('language', 'vn')
        ipaddr = get_client_ip(request)

        vnp = vnpay()
        vnp.requestData = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': settings.VNPAY_TMN_CODE,
            'vnp_Amount': amount * 100,
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': order_id,
            'vnp_OrderInfo': order_desc,
            'vnp_OrderType': 'other',
            'vnp_Locale': language,
            'vnp_ReturnUrl': settings.VNPAY_RETURN_URL,
            'vnp_IpAddr': ipaddr,
            'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S'),
        }

        if bank_code:
            vnp.requestData['vnp_BankCode'] = bank_code

        payment_url = vnp.get_payment_url(settings.VNPAY_PAYMENT_URL, settings.VNPAY_HASH_SECRET_KEY)
        return redirect(payment_url)
    
def payment_return(request):
    inputData = request.GET.dict()
    vnp = vnpay()
    vnp.responseData = inputData
    is_valid = vnp.validate_response(settings.VNPAY_HASH_SECRET_KEY)

    if is_valid and inputData.get('vnp_ResponseCode') == '00':
        return render(request, "payment/payment_success.html", {"result": "success"})
    else:
        return render(request, "payment/payment_success.html", {"result": "fail", "message": "Sai checksum hoặc thanh toán thất bại."})

@csrf_exempt
def checkout_rest(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Phương thức không được hỗ trợ'}, status=405)

    # 1. Authenticate user using JWT
    jwt_auth = JWTAuthentication()
    try:
        validated = jwt_auth.authenticate(request)
        if validated is None:
            return JsonResponse({'error': 'Chưa xác thực hoặc token không hợp lệ'}, status=401)
        user, _ = validated
    except Exception:
        return JsonResponse({'error': 'Token không hợp lệ hoặc đã hết hạn'}, status=401)

    # 2. Parse request body
    try:
        body = json.loads(request.body)
    except (ValueError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)

    full_name = body.get('shipping_full_name', '').strip()
    phone = body.get('shipping_phone', '').strip()
    shipping_address = body.get('shipping_address', '').strip()
    payment_method = body.get('payment_method', 'cod')

    if not full_name or not phone or not shipping_address:
        return JsonResponse({'error': 'Vui lòng cung cấp đầy đủ thông tin giao nhận'}, status=400)

    # 3. Read Cart items
    cart = Cart(request)
    cart_products = cart.get_prods()
    quantities = cart.get_quants()
    totals = cart.total_final()

    if not cart_products:
        return JsonResponse({'error': 'Giỏ hàng của bạn đang trống'}, status=400)

    # 4. Create Order record
    order = Order(
        user=user,
        full_name=full_name,
        phone=phone,
        shipping_address=shipping_address,
        amount_paid=totals
    )
    order.save()

    # 5. Create OrderItem records
    for product in cart_products:
        product_id = product.id
        price = product.sale_price if product.is_sale else product.price

        for key, value in quantities.items():
            if int(key) == product.id:
                OrderItem.objects.create(
                    order=order,
                    product_id=product_id,
                    user=user,
                    quantity=value,
                    price=price
                )

    # 6. Clear session cart
    for key in list(request.session.keys()):
        if key == 'session_key':
            del request.session[key]

    if 'shipping_method' in request.session:
        del request.session['shipping_method']

    # 7. Clear old cart in database profile
    Profile.objects.filter(user=user).update(old_cart='')

    return JsonResponse({
        'success': True,
        'order_id': order.id,
        'message': 'Đặt hàng thành công!'
    })