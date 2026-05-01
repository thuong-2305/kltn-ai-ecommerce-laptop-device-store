from .cart import Cart

# Create context processors so our cart work on all page
def cart(request):
    return {'cart':Cart(request)}