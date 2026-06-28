from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response

from store.models import Product, ProductVariant
from .cart import Cart, parse_session_key


from shared.utils import build_media_url as _build_media_url



def _serialize_cart(request, cart):
    """Return full cart payload: items list + totals."""
    # Batch load all products and variants to avoid N+1 queries
    all_pids = set()
    all_vids = set()
    for key in cart.cart.keys():
        pid, vid = parse_session_key(key)
        all_pids.add(pid)
        if vid:
            all_vids.add(vid)

    products_map = {
        p.id: p for p in Product.objects.filter(id__in=all_pids).select_related('category')
    }
    variants_map = {
        v.id: v for v in ProductVariant.objects.filter(id__in=all_vids)
    } if all_vids else {}

    items = []
    for key, qty in cart.cart.items():
        pid, vid = parse_session_key(key)
        product = products_map.get(pid)
        if not product:
            continue

        variant = variants_map.get(vid) if vid else None

        if variant:
            price = float(variant.price)
            name = f"{product.name} ({variant.name})"
            sku = variant.sku
        else:
            price = float(product.sale_price if product.is_sale and product.sale_price else product.price)
            name = product.name
            sku = None

        items.append({
            'product_id': pid,
            'variant_id': vid,
            'variant_name': variant.name if variant else None,
            'sku': sku,
            'name': name,
            'image': _build_media_url(request, product.image),
            'category': product.category.name if product.category_id else None,
            'price': price,
            'quantity': qty,
            'subtotal': round(price * qty, 0),
        })

    shipping_method = cart.shipping_method
    shipping_cost = cart.get_shipping_cost(shipping_method)
    subtotal = sum(it['subtotal'] for it in items)

    return {
        'items': items,
        'item_count': len(items),
        'total_qty': sum(it['quantity'] for it in items),
        'subtotal': subtotal,
        'shipping_method': shipping_method,
        'shipping_cost': shipping_cost,
        'total': subtotal + shipping_cost,
    }


# ─── GET /api/cart/ ───────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([JWTAuthentication])
def cart_summary_api(request):
    cart = Cart(request)
    return Response(_serialize_cart(request, cart))


# ─── POST /api/cart/add/ ─────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([JWTAuthentication])
def cart_add_api(request):
    try:
        body = request.data
        product_id = int(body.get('product_id', 0))
        variant_id = body.get('variant_id')
        if variant_id:
            variant_id = int(variant_id)
        else:
            variant_id = None
        qty = max(1, int(body.get('quantity', 1)))
    except (ValueError, TypeError):
        return Response({'error': 'Dữ liệu không hợp lệ'}, status=400)

    product = get_object_or_404(Product, id=product_id)
    variant = None
    if variant_id:
        variant = get_object_or_404(ProductVariant, id=variant_id, product=product)

    cart = Cart(request)
    try:
        msg = cart.add(product=product, quantity=qty, variant=variant)
        return Response({**_serialize_cart(request, cart), 'message': msg})
    except ValueError as e:
        return Response({'error': str(e)}, status=400)



# ─── POST /api/cart/update/ ──────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([JWTAuthentication])
def cart_update_api(request):
    try:
        body = request.data
        product_id = int(body.get('product_id', 0))
        variant_id = body.get('variant_id')
        if variant_id:
            variant_id = int(variant_id)
        else:
            variant_id = None
        qty = max(1, int(body.get('quantity', 1)))
    except (ValueError, TypeError):
        return Response({'error': 'Dữ liệu không hợp lệ'}, status=400)

    cart = Cart(request)
    cart.update(product=product_id, quantity=qty, variant_id=variant_id)
    return Response({**_serialize_cart(request, cart), 'message': 'Đã cập nhật số lượng'})


# ─── POST /api/cart/delete/ ──────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([JWTAuthentication])
def cart_delete_api(request):
    try:
        body = request.data
        product_id = int(body.get('product_id', 0))
        variant_id = body.get('variant_id')
        if variant_id:
            variant_id = int(variant_id)
        else:
            variant_id = None
    except (ValueError, TypeError):
        return Response({'error': 'Dữ liệu không hợp lệ'}, status=400)

    cart = Cart(request)
    cart.delete(product=product_id, variant_id=variant_id)
    return Response({**_serialize_cart(request, cart), 'message': 'Đã xóa sản phẩm'})


# ─── POST /api/cart/shipping/ ────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([JWTAuthentication])
def cart_shipping_api(request):
    try:
        body = request.data
        method = body.get('shipping_method', 'normal')
        if method not in ('normal', 'express'):
            return Response({'error': 'Phương thức vận chuyển không hợp lệ'}, status=400)
    except (ValueError, TypeError):
        return Response({'error': 'Dữ liệu không hợp lệ'}, status=400)

    cart = Cart(request)
    cart.update_shipping(shipping_method=method)
    return Response({**_serialize_cart(request, cart), 'message': f'Đã chọn giao hàng {method}'})


# ─── POST /api/cart/merge/ ───────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def cart_merge_api(request):
    try:
        body = request.data or {}
        session_cart = body.get('cart')
        if not session_cart:
            session_cart = request.session.get('session_key', {})
    except (ValueError, TypeError):
        return Response({'error': 'Dữ liệu không hợp lệ'}, status=400)

    cart = Cart(request)
    cart.merge(session_cart)
    # Clear guest cart session to avoid double merge
    if 'session_key' in request.session:
        request.session['session_key'] = {}
        request.session.modified = True
    return Response({**_serialize_cart(request, cart), 'message': 'Đồng bộ giỏ hàng thành công'})
