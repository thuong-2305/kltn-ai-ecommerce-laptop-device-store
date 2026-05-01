from django.shortcuts import render, redirect, get_object_or_404
from store.views import product
from .wishlist import Wishlist
from store.models import Product
from django.http import JsonResponse


def wishlist(request):
    wishlist = Wishlist(request)
    wishlist_products = wishlist.get_prods()
    price = wishlist.get_price()
    return render(request, 'wishlist.html', {'wishlist_products': wishlist_products, 'price': price})


def wishlist_add(request):
    wishlist = Wishlist(request)
    if request.method == 'POST':
        product_id = str(request.POST.get('product_id'))
        product_price = str(request.POST.get('product_price'))

        product = get_object_or_404(Product, id=product_id)
        msg = wishlist.add_wish(product, product_price)

        response = JsonResponse({'msg': msg})
        return response


def wishlist_remove(request):
    wishlist = Wishlist(request)
    if request.method == 'POST':
        product_id = str(request.POST.get('product_id'))
        product = get_object_or_404(Product, id=product_id)
        msg = wishlist.remove_wish(product)

        response = JsonResponse({'msg': msg})
        return response


def wishlist_toCart(request):
    wishlist = Wishlist(request)
    if request.method == 'POST':
        product_id = str(request.POST.get('product_id'))
        product = get_object_or_404(Product, id=product_id)
        msg = wishlist.addToCart(product)
        response = JsonResponse({'msg': msg})
        return response