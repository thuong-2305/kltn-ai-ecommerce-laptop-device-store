from store.models import Product, Profile

class Cart():
    def __init__(self, request):
        self.session = request.session

        # Get request
        self.request = request

        # Get the current session key if it exist
        cart = self.session.get('session_key')

        # If the user is new, no session key!
        if 'session_key' not in request.session:
            cart = self.session['session_key'] = {}

        # Make sure cart is available on all pages of site
        self.cart = cart

        self.shipping_method = self.session.get('shipping_method', 'normal')

    def add(self, product, quantity):
        product_id = str(product.id)
        product_qty = str(quantity)
        msg = ""
        if product_id in self.cart:
            msg = "Sản phẩm đã có trong giả hàng" 
        else:
            self.cart[product_id] = int(product_qty)
            msg = "Thêm vào giỏ hàng thành công" 

        self.session.modified = True

        # Deal with logged in user
        if self.request.user.is_authenticated:
            # Get the current user profile
            current_user = Profile.objects.filter(user__id=self.request.user.id)    
            # convert {'3':1} to {"3":1}
            carty = str(self.cart)
            carty = carty.replace("\'", "\"") 
            # Save carty to the Profile model
            current_user.update(old_cart=str(carty))

        return msg

    def db_add(self, product, quantity):
        product_id = str(product)
        product_qty = str(quantity)

        if product_id in self.cart:
            pass
        else:
            self.cart[product_id] = int(product_qty)
            
        self.session.modified = True

        # Deal with logged in user
        if self.request.user.is_authenticated:
            # Get the current user profile
            current_user = Profile.objects.filter(user__id=self.request.user.id)    
            # convert {'3':1} to {"3":1}
            carty = str(self.cart)
            carty = carty.replace("\'", "\"") 
            # Save carty to the Profile model
            current_user.update(old_cart=str(carty))

    def __len__(self):
        return len(self.cart)
    
    def total(self):
        product_ids = self.cart.keys()
        products = Product.objects.filter(id__in=product_ids)
        quantities = self.cart
        total = 0

        for key, val in quantities.items():
            key = int(key)
            for product in products:
                if product.id == key:
                    if product.is_sale:
                        total += product.sale_price*val
                    else:
                        total += product.price*val

        return total
    
    def get_shipping_cost(self, shipping_method):
        if shipping_method == 'normal':
            return 20000
        return 100000
    
    def total_final(self):
        shipping_cost = self.get_shipping_cost(self.shipping_method)
        return self.total() + shipping_cost
    
    def get_prods(self):
        #get ids from cart
        product_ids = self.cart.keys()
        #use ids to lookup products in database model
        products = Product.objects.filter(id__in=product_ids)
        return products
    
    def get_quants(self):
        quantities = self.cart
        return quantities
    
    def update(self, product, quantity) :
        product_id = str(product)
        product_qty = int(quantity)
        
        ourcart = self.cart

        ourcart[product_id] = product_qty

        self.session.modified = True
        
        # Deal with logged in user
        if self.request.user.is_authenticated:
            # Get the current user profile
            current_user = Profile.objects.filter(user__id=self.request.user.id)    
            # convert {'3':1} to {"3":1}
            carty = str(self.cart)
            carty = carty.replace("\'", "\"") 
            # Save carty to the Profile model
            current_user.update(old_cart=str(carty))

        thing = self.cart
        return thing
    
    def delete(self, product):
        product_id = str(product)
        
        if product_id in self.cart:
            del self.cart[product_id]

        self.session.modified = True

        # Deal with logged in user
        if self.request.user.is_authenticated:
            # Get the current user profile
            current_user = Profile.objects.filter(user__id=self.request.user.id)    
            # convert {'3':1} to {"3":1}
            carty = str(self.cart)
            carty = carty.replace("\'", "\"") 
            # Save carty to the Profile model
            current_user.update(old_cart=str(carty))


    def update_shipping(self, shipping_method):
        self.session['shipping_method'] = shipping_method
        self.shipping_method = shipping_method

        self.session.modified = True
