import json
import logging
import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.http.response import JsonResponse
from django.shortcuts import get_object_or_404, redirect
from django.utils import timezone
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication

from cart.cart import Cart, parse_session_key
from cart.models import CartItem as DbCartItem
from payment.models import Order, ShippingAddress, OrderItem, UserAddress
from auth_api.models import Profile
from store.models import Product, ProductVariant
from .vnpay import VNPay

User = get_user_model()
logger = logging.getLogger(__name__)


class InsufficientStockException(Exception):
    pass


from shared.utils import build_media_url as _build_media_url



# ─── GET location data (Vietnam administrative data) ─────────────────────
def get_data(request):
    file_path = os.path.join(settings.BASE_DIR, 'static', 'data', 'data.json')
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        return JsonResponse(data, safe=False)
    except FileNotFoundError:
        return JsonResponse({"error": "File not found"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Failed to decode JSON"}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def api_calculate_shipping_fee(request):
    """
    Calculates shipping cost dynamically using GHN API based on selected address.
    """
    body = request.data or {}
    province = body.get('province', '').strip()
    ward = body.get('ward', '').strip()
    shipping_method = body.get('shipping_method', 'normal') # 'normal' or 'express'
    
    if not province or not ward:
        return Response({'error': 'Vui lòng chọn đầy đủ Tỉnh/Thành phố và Phường/Xã'}, status=400)

    # 1. Resolve district_id and ward_code using mapping
    from payment.ghn import ghn_mapping, calculate_ghn_shipping_cost, get_ghn_location_ids
    mapping_key = f"{province}|{ward}"
    mapping_data = ghn_mapping.get(mapping_key)
    
    if mapping_data:
        district_id = mapping_data.get('district_id')
        ward_code = mapping_data.get('ward_code')
    else:
        # Fallback to name matching
        district_id, ward_code = get_ghn_location_ids(province, province, ward)
        
    # Service type mapping
    service_type_id = 2 if shipping_method == 'normal' else 1 # GHN standard is 2, express is 1

    # 2. Call GHN Fee API
    fee = calculate_ghn_shipping_cost(
        to_district_id=district_id,
        to_ward_code=ward_code,
        weight=2000,
        service_type_id=service_type_id
    )
    
    return Response({
        'success': True,
        'shipping_cost': fee,
        'province': province,
        'ward': ward,
        'shipping_method': shipping_method
    })


def get_client_ip(request):
    return request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))


# ─── VNPay Integration ───────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def api_vnpay_checkout(request):
    user = request.user
    body = request.data or {}
    order_code = body.get('order_code')
    order_id = body.get('order_id')
    
    if not order_code and not order_id:
        return Response({'error': 'Vui lòng cung cấp order_code hoặc order_id.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        if order_code:
            order = Order.objects.get(order_code=order_code, user=user)
        else:
            order = Order.objects.get(id=order_id, user=user)
    except Order.DoesNotExist:
        return Response({'error': 'Đơn hàng không tồn tại hoặc không thuộc về bạn.'}, status=status.HTTP_404_NOT_FOUND)

    if order.is_paid:
        return Response({'error': 'Đơn hàng đã được thanh toán.'}, status=status.HTTP_400_BAD_REQUEST)

    amount = int(order.amount_paid)
    ipaddr = get_client_ip(request)
    
    vnp = VNPay()
    vnp.requestData = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': settings.VNPAY_TMN_CODE,
        'vnp_Amount': amount * 100,
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': order.order_code,
        'vnp_OrderInfo': f"Thanh toan don hang {order.order_code}",
        'vnp_OrderType': 'other',
        'vnp_Locale': 'vn',
        'vnp_ReturnUrl': settings.VNPAY_RETURN_URL,
        'vnp_IpAddr': ipaddr,
        'vnp_CreateDate': timezone.now().strftime('%Y%m%d%H%M%S'),
    }

    payment_url = vnp.get_payment_url(settings.VNPAY_PAYMENT_URL, settings.VNPAY_HASH_SECRET_KEY)
    logger.info(f"VNPAY payment URL generated for order {order.order_code}")
    return Response({'payment_url': payment_url}, status=status.HTTP_200_OK)


@api_view(['GET'])
def api_vnpay_return(request):
    input_data = request.GET.dict()
    vnp = VNPay()
    vnp.responseData = input_data
    is_valid = vnp.validate_response(settings.VNPAY_HASH_SECRET_KEY)
    
    order_code = input_data.get('vnp_TxnRef')
    response_code = input_data.get('vnp_ResponseCode')
    
    frontend_url = getattr(settings, 'FRONTEND_PAYMENT_RESULT_URL', 'http://localhost:5173/payment/result')
    
    if is_valid:
        if response_code == '00':
            try:
                with transaction.atomic():
                    order = Order.objects.select_for_update().get(order_code=order_code)
                    if not order.is_paid:
                        order.is_paid = True
                        order.save()
            except Order.DoesNotExist:
                pass
            
            redirect_url = f"{frontend_url}?success=true&order_code={order_code}"
            return redirect(redirect_url)
        else:
            redirect_url = f"{frontend_url}?success=false&order_code={order_code or ''}&message=Payment failed with response code {response_code}"
            return redirect(redirect_url)
    else:
        redirect_url = f"{frontend_url}?success=false&order_code={order_code or ''}&message=Invalid signature verification"
        return redirect(redirect_url)


@api_view(['GET'])
def api_vnpay_ipn(request):
    input_data = request.GET.dict()
    if not input_data:
        return JsonResponse({"RspCode": "99", "Message": "Input data required"})
        
    vnp = VNPay()
    vnp.responseData = input_data
    is_valid = vnp.validate_response(settings.VNPAY_HASH_SECRET_KEY)
    
    if not is_valid:
        return JsonResponse({"RspCode": "97", "Message": "Invalid Signature"})
        
    order_code = input_data.get('vnp_TxnRef')
    amount_vnp = input_data.get('vnp_Amount')
    response_code = input_data.get('vnp_ResponseCode')
    
    if not order_code:
        return JsonResponse({"RspCode": "01", "Message": "Order not found"})
        
    try:
        with transaction.atomic():
            order = Order.objects.select_for_update().get(order_code=order_code)
            
            expected_amount_cents = int(order.amount_paid) * 100
            try:
                received_amount_cents = int(amount_vnp)
            except (ValueError, TypeError):
                received_amount_cents = 0
                
            if received_amount_cents != expected_amount_cents:
                return JsonResponse({"RspCode": "04", "Message": "Invalid amount"})
                
            if order.is_paid:
                return JsonResponse({"RspCode": "02", "Message": "Order already confirmed"})
                
            if response_code == '00':
                order.is_paid = True
                order.save()
                return JsonResponse({"RspCode": "00", "Message": "Confirm success"})
            else:
                return JsonResponse({"RspCode": "00", "Message": "Confirm success (payment failed)"})
                
    except Order.DoesNotExist:
        return JsonResponse({"RspCode": "01", "Message": "Order not found"})
    except Exception as e:
        return JsonResponse({"RspCode": "99", "Message": f"System error: {str(e)}"})


# ─── Order REST APIs ─────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def api_order_create(request):
    user = request.user
    body = request.data or {}

    full_name = body.get('shipping_full_name', '').strip()
    phone = body.get('shipping_phone', '').strip()
    shipping_address = body.get('shipping_address', '').strip()

    if not full_name or not phone or not shipping_address:
        return Response({'error': 'Vui lòng cung cấp đầy đủ thông tin giao nhận'}, status=400)

    cart = Cart(request)
    if len(cart) == 0:
        return Response({'error': 'Giỏ hàng của bạn đang trống'}, status=400)

    try:
        with transaction.atomic():
            # 1. Lock and validate stock for all items
            items_to_create = []
            for key, qty in list(cart.cart.items()):
                pid, vid = parse_session_key(key)
                product = get_object_or_404(Product, id=pid)
                variant = None

                if not vid:
                    # Fallback to the first variant of the product if it exists to enforce stock control
                    first_variant = product.variants.first()
                    if first_variant:
                        vid = first_variant.id

                if vid:
                    # Lock the variant row
                    variant = ProductVariant.objects.select_for_update().get(id=vid)
                    if variant.stock < qty:
                        raise InsufficientStockException(
                            f"Sản phẩm {product.name} ({variant.name}) không đủ tồn kho (chỉ còn {variant.stock})."
                        )
                    
                    # Deduct stock
                    variant.stock -= qty
                    variant.save()
                    price = variant.price
                else:
                    price = product.sale_price if product.is_sale else product.price

                items_to_create.append({
                    'product': product,
                    'variant': variant,
                    'quantity': qty,
                    'price': price
                })

            # 2. Create Order record
            shipping_cost = body.get('shipping_cost')
            if shipping_cost is not None:
                try:
                    shipping_cost = int(shipping_cost)
                except (ValueError, TypeError):
                    shipping_cost = None

            order = Order.objects.create(
                user=user,
                full_name=full_name,
                phone=phone,
                shipping_address=shipping_address,
                amount_paid=cart.total_final(shipping_cost)
            )

            # 3. Create OrderItem records
            for item in items_to_create:
                OrderItem.objects.create(
                    order=order,
                    product=item['product'],
                    variant=item['variant'],
                    user=user,
                    quantity=item['quantity'],
                    price=item['price']
                )

            # 4. Clear cart database records
            DbCartItem.objects.filter(cart=cart.db_cart).delete()

            # 5. Clear session cart
            for k in list(request.session.keys()):
                if k == 'session_key':
                    del request.session[k]
            if 'shipping_method' in request.session:
                del request.session['shipping_method']

            # 6. Clear legacy profile cart (No-op: old_cart removed)

            # 7. Update user profile, default shipping address, and address book if not set
            try:
                # Update user names and phone
                user_updated = False
                if not user.first_name and not user.last_name and full_name:
                    parts = full_name.split(' ', 1)
                    if len(parts) > 1:
                        user.first_name = parts[1]
                        user.last_name = parts[0]
                    else:
                        user.first_name = full_name
                    user_updated = True
                if not user.phone and phone:
                    user.phone = phone
                    user_updated = True
                if user_updated:
                    user.save()

                # Update Profile (address)
                profile, _ = Profile.objects.get_or_create(user=user)
                if not profile.address and shipping_address:
                    profile.address = shipping_address[:200]
                    profile.save()

                # Update default ShippingAddress model
                shipping_address_obj, created = ShippingAddress.objects.get_or_create(user=user)
                if created or not shipping_address_obj.shipping_phone or not shipping_address_obj.shipping_address:
                    shipping_address_obj.shipping_full_name = full_name
                    shipping_address_obj.shipping_phone = phone
                    shipping_address_obj.shipping_address = shipping_address
                    shipping_address_obj.save()

                # Add to UserAddress address book if empty
                if not UserAddress.objects.filter(user=user).exists():
                    # Attempt to parse street, ward, city
                    parts = [p.strip() for p in shipping_address.split(',')]
                    if len(parts) >= 3:
                        city = parts[-1]
                        ward = parts[-2]
                        street = ", ".join(parts[:-2])
                    elif len(parts) == 2:
                        city = parts[-1]
                        ward = parts[0]
                        street = parts[0]
                    else:
                        city = shipping_address
                        ward = "N/A"
                        street = shipping_address

                    UserAddress.objects.create(
                        user=user,
                        name=full_name,
                        phone=phone,
                        street=street[:255],
                        ward=ward[:100],
                        city=city[:100],
                        type='home',
                        is_default=True
                    )
            except Exception as pe:
                logger.error(f"Failed to auto-update profile during order checkout: {pe}")

            return Response({
                'success': True,
                'order_id': order.id,
                'order_code': order.order_code,
                'message': 'Đặt hàng thành công!'
            }, status=201)

    except InsufficientStockException as e:
        return Response({'error': str(e)}, status=400)
    except Exception as e:
        logger.exception(f"Error creating order for user {user.id}: {e}")
        return Response({'error': 'Lỗi hệ thống khi tạo đơn hàng. Vui lòng thử lại sau.'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def api_order_history(request):
    from django.db.models import Q
    from rest_framework.pagination import PageNumberPagination

    orders_qs = Order.objects.filter(user=request.user)

    # Status filter mapping
    status_filter = request.query_params.get('status', 'all')
    if status_filter != 'all':
        if status_filter == 'shipping':
            orders_qs = orders_qs.filter(status='shipping')
        elif status_filter == 'completed':
            orders_qs = orders_qs.filter(status='delivered')
        elif status_filter == 'cancelled':
            orders_qs = orders_qs.filter(status='cancelled')
        elif status_filter in ['pending', 'confirmed']:
            orders_qs = orders_qs.filter(status=status_filter)

    # Date filters
    from_date = request.query_params.get('from_date')
    if from_date:
        orders_qs = orders_qs.filter(date_ordered__date__gte=from_date)
        
    to_date = request.query_params.get('to_date')
    if to_date:
        orders_qs = orders_qs.filter(date_ordered__date__lte=to_date)

    # Search filter
    search = request.query_params.get('search')
    if search:
        orders_qs = orders_qs.filter(
            Q(order_code__icontains=search) | Q(id__icontains=search)
        )

    orders_qs = orders_qs.prefetch_related('items__product', 'items__variant').order_by('-date_ordered', '-id')

    paginator = PageNumberPagination()
    paginator.page_size = 10
    paginated_orders = paginator.paginate_queryset(orders_qs, request)

    orders_list = []
    for order in paginated_orders:
        items_list = []
        for item in order.items.all():
            price = float(item.price)
            # Build absolute product image URL if possible
            prod_image = None
            if item.product and item.product.image:
                prod_image = _build_media_url(request, item.product.image)
            items_list.append({
                'product_id': item.product_id,
                'product_name': item.product.name if item.product else 'Sản phẩm đã xóa',
                'product_image': prod_image,
                'variant_id': item.variant_id,
                'variant_name': item.variant.name if item.variant else None,
                'quantity': item.quantity,
                'price': price,
                'subtotal': round(price * item.quantity, 0)
            })

        orders_list.append({
            'id': order.id,
            'order_code': order.order_code,
            'full_name': order.full_name,
            'phone': order.phone,
            'shipping_address': order.shipping_address,
            'amount_paid': float(order.amount_paid),
            'date_ordered': order.date_ordered.isoformat() if order.date_ordered else None,
            'shipped': order.shipped,
            'date_shipped': order.date_shipped.isoformat() if order.date_shipped else None,
            'status': order.status,
            'items': items_list
        })

    return paginator.get_paginated_response(orders_list)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def api_order_detail(request, pk):
    try:
        order = Order.objects.get(id=pk, user=request.user)
    except (Order.DoesNotExist, ValueError):
        try:
            order = Order.objects.get(order_code=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Đơn hàng không tồn tại hoặc không thuộc về bạn.'}, status=status.HTTP_404_NOT_FOUND)

    items_list = []
    for item in order.items.all():
        price = float(item.price)
        items_list.append({
            'product_id': item.product_id,
            'product_name': item.product.name if item.product else 'Sản phẩm đã xóa',
            'product_image': item.product.image.url if item.product and item.product.image else None,
            'variant_id': item.variant_id,
            'variant_name': item.variant.name if item.variant else None,
            'quantity': item.quantity,
            'price': price,
            'subtotal': round(price * item.quantity, 0)
        })

    return Response({
        'id': order.id,
        'order_code': order.order_code,
        'full_name': order.full_name,
        'phone': order.phone,
        'shipping_address': order.shipping_address,
        'amount_paid': float(order.amount_paid),
        'date_ordered': order.date_ordered.isoformat() if order.date_ordered else None,
        'shipped': order.shipped,
        'date_shipped': order.date_shipped.isoformat() if order.date_shipped else None,
        'status': order.status,
        'items': items_list
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def api_order_cancel(request, pk):
    order = get_object_or_404(Order, id=pk, user=request.user)

    if order.shipped or order.status in ('shipping', 'delivered'):
        return Response({'error': 'Không thể hủy đơn hàng đã giao hoặc đang giao.'}, status=400)

    if order.status == 'cancelled':
        return Response({'error': 'Đơn hàng đã được hủy trước đó.'}, status=400)

    try:
        with transaction.atomic():
            # 1. Lock and restore stock for variants
            for item in order.items.all():
                if item.variant:
                    # Row lock variant
                    variant = ProductVariant.objects.select_for_update().get(id=item.variant_id)
                    variant.stock += item.quantity
                    variant.save()

            # 2. Soft delete - update status instead of deleting
            order.status = 'cancelled'
            order.cancelled_at = timezone.now()
            cancel_reason = request.data.get('reason', '')
            if cancel_reason:
                order.cancel_reason = cancel_reason
            order.save()

            logger.info(f"Order {order.order_code} cancelled by user {request.user.id}")

            return Response({
                'success': True,
                'message': 'Đơn hàng đã được hủy thành công và tồn kho đã được khôi phục.'
            })
    except Exception as e:
        logger.exception(f"Error cancelling order {pk} for user {request.user.id}: {e}")
        return Response({'error': 'Lỗi hệ thống khi hủy đơn hàng. Vui lòng thử lại sau.'}, status=500)


# ─── Shipping & Address APIs ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def api_get_shipping_address(request):
    user = request.user
    try:
        shipping = ShippingAddress.objects.get(user=user)
        full_name = shipping.shipping_full_name or f"{user.first_name} {user.last_name}".strip()
        phone = shipping.shipping_phone
        address = shipping.shipping_address
    except ShippingAddress.DoesNotExist:
        full_name = f"{user.first_name} {user.last_name}".strip()
        phone = ""
        address = ""

    # Fallback to Profile/User phone/address if ShippingAddress values are blank
    if not phone or not address:
        try:
            profile = Profile.objects.get(user=user)
            if not address:
                address = profile.address
        except Profile.DoesNotExist:
            pass
        if not phone:
            phone = getattr(user, 'phone', '')

    data = {
        'full_name': full_name,
        'phone': phone,
        'address': address,
        'email': user.email
    }
    return Response(data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def api_user_addresses(request):
    if request.method == 'GET':
        addresses = UserAddress.objects.filter(user=request.user)
        data = [{
            'id': addr.id,
            'name': addr.name,
            'phone': addr.phone,
            'street': addr.street,
            'ward': addr.ward,
            'city': addr.city,
            'type': addr.type,
            'isDefault': addr.is_default
        } for addr in addresses]
        return Response(data)

    elif request.method == 'POST':
        body = request.data or {}
        name = body.get('name', '').strip()
        phone = body.get('phone', '').strip()
        street = body.get('street', '').strip()
        ward = body.get('ward', '').strip()
        city = body.get('city', '').strip()
        addr_type = body.get('type', 'home').strip()
        is_default = body.get('isDefault', False)

        if not name or not phone or not street or not ward or not city:
            return Response({'error': 'Vui lòng điền đầy đủ các thông tin bắt buộc.'}, status=status.HTTP_400_BAD_REQUEST)

        # If user has no addresses yet, force the first one to be default
        if not UserAddress.objects.filter(user=request.user).exists():
            is_default = True

        address = UserAddress.objects.create(
            user=request.user,
            name=name,
            phone=phone,
            street=street,
            ward=ward,
            city=city,
            type=addr_type,
            is_default=is_default
        )

        return Response({
            'id': address.id,
            'name': address.name,
            'phone': address.phone,
            'street': address.street,
            'ward': address.ward,
            'city': address.city,
            'type': address.type,
            'isDefault': address.is_default
        }, status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def api_user_address_detail(request, pk):
    user = request.user
    address = get_object_or_404(UserAddress, id=pk, user=user)

    if request.method == 'PATCH':
        body = request.data or {}
        if 'name' in body:
            address.name = body['name'].strip()
        if 'phone' in body:
            address.phone = body['phone'].strip()
        if 'street' in body:
            address.street = body['street'].strip()
        if 'ward' in body:
            address.ward = body['ward'].strip()
        if 'city' in body:
            address.city = body['city'].strip()
        if 'type' in body:
            address.type = body['type'].strip()
        if 'isDefault' in body:
            new_is_default = body['isDefault']
            if address.is_default and not new_is_default:
                pass
            else:
                address.is_default = new_is_default

        address.save()

        return Response({
            'id': address.id,
            'name': address.name,
            'phone': address.phone,
            'street': address.street,
            'ward': address.ward,
            'city': address.city,
            'type': address.type,
            'isDefault': address.is_default
        })

    elif request.method == 'DELETE':
        was_default = address.is_default
        address.delete()
        
        # If deleted address was default, set another address of this user as default
        if was_default:
            other = UserAddress.objects.filter(user=user).first()
            if other:
                other.is_default = True
                other.save()

        return Response({'success': True, 'message': 'Xóa địa chỉ thành công.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def api_user_address_set_default(request, pk):
    user = request.user
    address = get_object_or_404(UserAddress, id=pk, user=user)
    address.is_default = True
    address.save()
    return Response({'success': True, 'message': 'Thiết lập địa chỉ mặc định thành công.'})


@csrf_exempt
@api_view(['POST'])
@permission_classes([])
@authentication_classes([])
def api_ghn_webhook(request):
    """
    Exposed public webhook to receive delivery updates from GHN.
    Payload parameters: OrderCode, Status, Time
    """
    payload = request.data or {}
    logger.info(f"Received Giao Hang Nhanh (GHN) webhook event: {payload}")

    ghn_order_code = payload.get('OrderCode')
    ghn_status = payload.get('Status')

    # Fallback support for other payload keys
    if not ghn_order_code:
        ghn_order_code = payload.get('order_code')
    if not ghn_status:
        ghn_status = payload.get('status')

    if not ghn_order_code:
        return Response({"error": "OrderCode is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Match order by GHN tracking code
        order = Order.objects.get(shipping_tracking_code=ghn_order_code)
        
        # Check if GHN status represents a successful delivery
        if ghn_status in ['delivered', 'delivered_ok', 'done', 'shipping_ok']:
            order.status = 'delivered'
            order.save()
            logger.info(f"Order {order.order_code} successfully delivered via GHN.")

            # Send real-time WebSocket notification to the user
            try:
                from asgiref.sync import async_to_sync
                from channels.layers import get_channel_layer
                channel_layer = get_channel_layer()
                if channel_layer and order.user:
                    group_name = f"user_{order.user.id}"
                    async_to_sync(channel_layer.group_send)(
                        group_name,
                        {
                            "type": "send_notification",
                            "notification_type": "order_delivered",
                            "message": f"Đơn hàng {order.order_code} đã được giao thành công!",
                            "data": {
                                "order_id": order.id,
                                "order_code": order.order_code,
                            }
                        }
                    )
            except Exception as ne:
                logger.error(f"Failed to send delivery WebSocket notification for order {order.order_code}: {ne}")

        return Response({"success": True, "message": f"Status '{ghn_status}' processed for Order {order.order_code}"}, status=status.HTTP_200_OK)
    
    except Order.DoesNotExist:
        logger.warning(f"GHN webhook tracking code {ghn_order_code} does not match any order.")
        return Response({"error": "Order with specified tracking code not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.exception(f"Error handling GHN webhook: {e}")
        return Response({"error": "Internal system error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)