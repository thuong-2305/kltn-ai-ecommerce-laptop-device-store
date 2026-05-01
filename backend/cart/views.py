from django.shortcuts import render, get_object_or_404
from django.contrib import messages
from .cart import Cart
from store.models import Product
from django.http import JsonResponse

def cart_summary(request):
    cart = Cart(request)
    cart_products = cart.get_prods 
    quantities = cart.get_quants
    totals = cart.total()
    total_final = cart.total_final()
    return render(request, 'cart_summary.html', {'cart_products':cart_products, 'quantities': quantities, 'totals':totals, 'total_final':total_final})

def cart_add(request):   
    cart = Cart(request)  
    #test for POST
    if request.POST.get('action') == 'post':
        #get stuff
        product_id = int(request.POST.get('product_id'))
        product_qty = int(request.POST.get('product_qty'))
        
        #lookup product in db
        product = get_object_or_404(Product, id=product_id)
        #save to session
        msg = cart.add(product=product, quantity=product_qty)

        #get cart quantity
        cart_quantity = cart.__len__()
        
        #return reponse
        response = JsonResponse({'qty': cart_quantity, 'msg': msg})
        return response


def cart_delete(request):
    cart = Cart(request)
    if request.POST.get('action') == 'post':
        #get stuff
        product_id = int(request.POST.get('product_id'))
        cart.delete(product=product_id)

        response = JsonResponse({'product':product_id}) 

        messages.success(request, ("Đã xóa thành công..."))
        return response

def cart_update(request):
    cart = Cart(request)
    if request.POST.get('action') == 'post':
        #get stuff
        product_id = int(request.POST.get('product_id'))
        product_qty = int(request.POST.get('product_qty'))

        cart.update(product=product_id, quantity=product_qty)

        response = JsonResponse({'qty':product_qty}) 
        messages.success(request, ("Đã update số lượng thành công..."))
        return response
        # return redirect('cart_summary')

def cart_update_shipping(request):
    cart = Cart(request)
    if request.POST.get('action') == 'update_shipping':
        shipping_method = request.POST.get('shipping_method')
        # Lưu giá trị shipping_method vào session
        cart.update_shipping(shipping_method=shipping_method)
        total_final = cart.total_final()
        total_final = "{:,.0f}".format(total_final)

        return JsonResponse({'total_final': total_final, 'shipping_method': shipping_method})
    return JsonResponse({'status': 'error'}, status=400)


