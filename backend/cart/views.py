import json
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .cart import Cart
from store.models import Product


def _build_media_url(request, file_field):
    if not file_field:
        return None
    try:
        return request.build_absolute_uri(file_field.url)
    except ValueError:
        return None


def _serialize_cart(request, cart):
    """Return full cart payload: items list + totals."""
    product_ids = list(cart.cart.keys())
    products = {
        str(p.id): p
        for p in Product.objects.filter(id__in=product_ids).select_related('category')
    }

    items = []
    for pid, qty in cart.cart.items():
        product = products.get(str(pid))
        if not product:
            continue
        price = float(product.sale_price if product.is_sale and product.sale_price else product.price)
        items.append({
            'product_id': int(pid),
            'name': product.name,
            'image': _build_media_url(request, product.image),
            'category': product.category.name if product.category_id else None,
            'price': price,
            'quantity': qty,
            'subtotal': round(price * qty, 0),
        })

    shipping_method = cart.shipping_method
    shipping_cost = cart.get_shipping_cost(shipping_method)
    total = sum(it['subtotal'] for it in items)

    return {
        'items': items,
        'item_count': len(items),
        'total_qty': sum(it['quantity'] for it in items),
        'subtotal': total,
        'shipping_method': shipping_method,
        'shipping_cost': shipping_cost,
        'total': total + shipping_cost,
    }


# ─── GET /api/cart/ ───────────────────────────────────────────────
@require_GET
def cart_summary_api(request):
    cart = Cart(request)
    return JsonResponse(_serialize_cart(request, cart))


# ─── POST /api/cart/add/ ─────────────────────────────────────────
@csrf_exempt
@require_POST
def cart_add_api(request):
    try:
        body = json.loads(request.body)
        product_id = int(body.get('product_id', 0))
        qty = max(1, int(body.get('quantity', 1)))
    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)

    product = get_object_or_404(Product, id=product_id)
    cart = Cart(request)
    msg = cart.add(product=product, quantity=qty)
    return JsonResponse({**_serialize_cart(request, cart), 'message': msg})


# ─── POST /api/cart/update/ ──────────────────────────────────────
@csrf_exempt
@require_POST
def cart_update_api(request):
    try:
        body = json.loads(request.body)
        product_id = int(body.get('product_id', 0))
        qty = max(1, int(body.get('quantity', 1)))
    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)

    cart = Cart(request)
    cart.update(product=product_id, quantity=qty)
    return JsonResponse({**_serialize_cart(request, cart), 'message': 'Đã cập nhật số lượng'})


# ─── POST /api/cart/delete/ ──────────────────────────────────────
@csrf_exempt
@require_POST
def cart_delete_api(request):
    try:
        body = json.loads(request.body)
        product_id = int(body.get('product_id', 0))
    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)

    cart = Cart(request)
    cart.delete(product=product_id)
    return JsonResponse({**_serialize_cart(request, cart), 'message': 'Đã xóa sản phẩm'})


# ─── POST /api/cart/shipping/ ────────────────────────────────────
@csrf_exempt
@require_POST
def cart_shipping_api(request):
    try:
        body = json.loads(request.body)
        method = body.get('shipping_method', 'normal')
        if method not in ('normal', 'express'):
            return JsonResponse({'error': 'Phương thức vận chuyển không hợp lệ'}, status=400)
    except (ValueError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)

    cart = Cart(request)
    cart.update_shipping(shipping_method=method)
    return JsonResponse({**_serialize_cart(request, cart), 'message': f'Đã chọn giao hàng {method}'})
