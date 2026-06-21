import json
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from store.models import Product
from store.views import _serialize_product, _get_active_sales
from .wishlist import Wishlist as SessionWishlist
from .models import Wishlist as DbWishlist
from cart.cart import Cart
from shared.utils import get_authenticated_user as _get_authenticated_user

def _serialize_wishlist_products(request, products):
    _, active_sales_by_category = _get_active_sales()
    results = [
        _serialize_product(request, p, active_sales_by_category.get(p.category_id))
        for p in products
    ]
    return results

def _get_wishlist_products(request, user):
    if user and user.is_authenticated:
        db_wishlist, _ = DbWishlist.objects.get_or_create(user=user)
        return db_wishlist.products.all(), db_wishlist
    else:
        session_wishlist = SessionWishlist(request)
        return session_wishlist.get_prods(), session_wishlist

def wishlist_summary_api(request):
    user = _get_authenticated_user(request)
    products, _ = _get_wishlist_products(request, user)
    return JsonResponse({'results': _serialize_wishlist_products(request, products)}, json_dumps_params={'ensure_ascii': False})

@csrf_exempt
def wishlist_add_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Phương thức không hỗ trợ'}, status=405)
    try:
        body = json.loads(request.body)
        product_id = int(body.get('product_id', 0))
    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)
        
    product = get_object_or_404(Product, id=product_id)
    user = _get_authenticated_user(request)
    
    if user and user.is_authenticated:
        _, db_wishlist = _get_wishlist_products(request, user)
        if db_wishlist.products.filter(id=product.id).exists():
            msg = "Sản phẩm đã có trong danh sách yêu thích"
        else:
            db_wishlist.products.add(product)
            msg = "Thêm vào danh sách yêu thích thành công"
        products, _ = _get_wishlist_products(request, user)
    else:
        session_wishlist = SessionWishlist(request)
        price = product.sale_price if product.is_sale and product.sale_price else product.price
        msg = session_wishlist.add_wish(product, price)
        products = session_wishlist.get_prods()
        
    return JsonResponse({
        'results': _serialize_wishlist_products(request, products),
        'message': msg
    }, json_dumps_params={'ensure_ascii': False})

@csrf_exempt
def wishlist_remove_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Phương thức không hỗ trợ'}, status=405)
    try:
        body = json.loads(request.body)
        product_id = int(body.get('product_id', 0))
    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)
        
    product = get_object_or_404(Product, id=product_id)
    user = _get_authenticated_user(request)
    
    if user and user.is_authenticated:
        _, db_wishlist = _get_wishlist_products(request, user)
        if db_wishlist.products.filter(id=product.id).exists():
            db_wishlist.products.remove(product)
            msg = "Đã xóa sản phẩm khỏi wishlist"
        else:
            msg = "Sản phẩm không có trong wishlist"
        products, _ = _get_wishlist_products(request, user)
    else:
        session_wishlist = SessionWishlist(request)
        msg = session_wishlist.remove_wish(product)
        products = session_wishlist.get_prods()
        
    return JsonResponse({
        'results': _serialize_wishlist_products(request, products),
        'message': msg
    }, json_dumps_params={'ensure_ascii': False})

@csrf_exempt
def wishlist_to_cart_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Phương thức không hỗ trợ'}, status=405)
    try:
        body = json.loads(request.body)
        product_id = int(body.get('product_id', 0))
    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)
        
    product = get_object_or_404(Product, id=product_id)
    user = _get_authenticated_user(request)
    
    # Check if in wishlist
    in_wishlist = False
    if user and user.is_authenticated:
        _, db_wishlist = _get_wishlist_products(request, user)
        in_wishlist = db_wishlist.products.filter(id=product.id).exists()
    else:
        session_wishlist = SessionWishlist(request)
        in_wishlist = str(product.id) in session_wishlist.wishlist

    if not in_wishlist:
        return JsonResponse({'error': 'Sản phẩm không có trong wishlist'}, status=400)

    cart = Cart(request)
    product_in_cart = False
    for k in cart.cart.keys():
        if k == str(product.id) or k.startswith(f"{product.id}_"):
            product_in_cart = True
            break
            
    if not product_in_cart:
        cart.add(product=product, quantity=1)
        msg = "Thêm vào giỏ hàng thành công"
        # Remove from wishlist
        if user and user.is_authenticated:
            _, db_wishlist = _get_wishlist_products(request, user)
            db_wishlist.products.remove(product)
        else:
            session_wishlist = SessionWishlist(request)
            session_wishlist.remove_wish(product)
    else:
        msg = "Sản phẩm đã có trong giỏ hàng"

    # Get updated wishlist products
    products, _ = _get_wishlist_products(request, user)

    return JsonResponse({
        'results': _serialize_wishlist_products(request, products),
        'message': msg
    }, json_dumps_params={'ensure_ascii': False})