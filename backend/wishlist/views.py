import json
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .wishlist import Wishlist
from store.models import Product
from store.views import _serialize_product, _get_active_sales

def _serialize_wishlist(request, wishlist):
    wishlist_products = wishlist.get_prods()
    _, active_sales_by_category = _get_active_sales()
    results = [
        _serialize_product(request, p, active_sales_by_category.get(p.category_id))
        for p in wishlist_products
    ]
    return results

@require_GET
def wishlist_summary_api(request):
    wishlist = Wishlist(request)
    return JsonResponse({'results': _serialize_wishlist(request, wishlist)}, json_dumps_params={'ensure_ascii': False})

@csrf_exempt
@require_POST
def wishlist_add_api(request):
    try:
        body = json.loads(request.body)
        product_id = int(body.get('product_id', 0))
    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)
        
    product = get_object_or_404(Product, id=product_id)
    wishlist = Wishlist(request)
    
    # Calculate effective price if not provided
    price = product.sale_price if product.is_sale and product.sale_price else product.price
    msg = wishlist.add_wish(product, price)
    
    return JsonResponse({
        'results': _serialize_wishlist(request, wishlist),
        'message': msg
    }, json_dumps_params={'ensure_ascii': False})

@csrf_exempt
@require_POST
def wishlist_remove_api(request):
    try:
        body = json.loads(request.body)
        product_id = int(body.get('product_id', 0))
    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)
        
    product = get_object_or_404(Product, id=product_id)
    wishlist = Wishlist(request)
    msg = wishlist.remove_wish(product)
    
    return JsonResponse({
        'results': _serialize_wishlist(request, wishlist),
        'message': msg
    }, json_dumps_params={'ensure_ascii': False})

@csrf_exempt
@require_POST
def wishlist_to_cart_api(request):
    try:
        body = json.loads(request.body)
        product_id = int(body.get('product_id', 0))
    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)
        
    product = get_object_or_404(Product, id=product_id)
    wishlist = Wishlist(request)
    msg = wishlist.addToCart(product)
    
    return JsonResponse({
        'results': _serialize_wishlist(request, wishlist),
        'message': msg
    }, json_dumps_params={'ensure_ascii': False})