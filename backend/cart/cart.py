from store.models import Product, ProductVariant
from .models import Cart as CartModel, CartItem

def parse_session_key(key):
    if '_' in key:
        pid, vid = key.split('_', 1)
        return int(pid), int(vid)
    return int(key), None

def make_session_key(product_id, variant_id=None):
    if variant_id:
        return f"{product_id}_{variant_id}"
    return str(product_id)

class Cart():
    def __init__(self, request):
        self.session = request.session
        self.request = request
        self.shipping_method = self.session.get('shipping_method', 'normal')

        if self.request.user.is_authenticated:
            # Authenticated user: DB cart
            self.db_cart, _ = CartModel.objects.get_or_create(user=self.request.user)
            self.cart = {}
            for item in self.db_cart.items.all():
                key = make_session_key(item.product_id, item.variant_id)
                self.cart[key] = item.quantity
        else:
            # Guest user: Session cart
            cart = self.session.get('session_key')
            if 'session_key' not in self.session:
                cart = self.session['session_key'] = {}
            self.cart = cart

    def add(self, product, quantity, variant=None):
        quantity = int(quantity)
        variant_id = variant.id if variant else None
        
        # Check stock validation
        check_variant = variant
        if not check_variant:
            check_variant = product.variants.first()
            
        if check_variant:
            if check_variant.stock <= 0:
                raise ValueError("Sản phẩm hiện đang tạm hết hàng!")
            if check_variant.stock < quantity:
                raise ValueError(f"Không đủ số lượng trong kho (chỉ còn {check_variant.stock} sản phẩm)!")
        
        if self.request.user.is_authenticated:
            # Check if item exists in DB cart
            exists = CartItem.objects.filter(
                cart=self.db_cart,
                product=product,
                variant=variant
            ).exists()
            if exists:
                return "Sản phẩm đã có trong giỏ hàng"
            
            CartItem.objects.create(
                cart=self.db_cart,
                product=product,
                variant=variant,
                quantity=quantity
            )
            # Update local representation
            key = make_session_key(product.id, variant_id)
            self.cart[key] = quantity
            return "Thêm vào giỏ hàng thành công"
        else:
            key = make_session_key(product.id, variant_id)
            if key in self.cart:
                return "Sản phẩm đã có trong giỏ hàng"
            
            self.cart[key] = quantity
            self.session.modified = True
            return "Thêm vào giỏ hàng thành công"




    def __len__(self):
        if self.request.user.is_authenticated:
            return self.db_cart.items.count()
        return len(self.cart)

    def total(self):
        total = 0
        if self.request.user.is_authenticated:
            items = self.db_cart.items.select_related('product', 'variant')
            for item in items:
                price = item.variant.price if item.variant else (item.product.sale_price if item.product.is_sale and item.product.sale_price else item.product.price)
                total += price * item.quantity
        else:
            # Batch fetch to avoid N+1 queries
            all_pids = set()
            all_vids = set()
            for key in self.cart.keys():
                pid, vid = parse_session_key(key)
                all_pids.add(pid)
                if vid:
                    all_vids.add(vid)
            
            products_map = {p.id: p for p in Product.objects.filter(id__in=all_pids)}
            variants_map = {v.id: v for v in ProductVariant.objects.filter(id__in=all_vids)} if all_vids else {}

            for key, qty in self.cart.items():
                pid, vid = parse_session_key(key)
                product = products_map.get(pid)
                if not product:
                    continue
                if vid:
                    variant = variants_map.get(vid)
                    if not variant:
                        continue
                    price = variant.price
                else:
                    price = product.sale_price if product.is_sale and product.sale_price else product.price
                total += price * qty
        return total

    def get_shipping_cost(self, shipping_method):
        if shipping_method == 'normal':
            return 20000
        return 100000

    def total_final(self, shipping_cost=None):
        if shipping_cost is None:
            shipping_cost = self.get_shipping_cost(self.shipping_method)
        return self.total() + shipping_cost

    def get_prods(self):
        product_ids = []
        if self.request.user.is_authenticated:
            product_ids = self.db_cart.items.values_list('product_id', flat=True).distinct()
        else:
            for key in self.cart.keys():
                pid, _ = parse_session_key(key)
                product_ids.append(pid)
        return Product.objects.filter(id__in=product_ids)

    def get_quants(self):
        res = {}
        for key, val in self.cart.items():
            pid, _ = parse_session_key(key)
            res[str(pid)] = val
        return res

    def update(self, product, quantity, variant_id=None):
        product_id = product.id if isinstance(product, Product) else int(product)
        quantity = int(quantity)

        # Validate stock limits
        if variant_id:
            try:
                variant = ProductVariant.objects.get(id=variant_id)
                if variant.stock < quantity:
                    quantity = max(0, variant.stock)
            except ProductVariant.DoesNotExist:
                pass
        else:
            try:
                product_obj = Product.objects.get(id=product_id)
                variant = product_obj.variants.first()
                if variant and variant.stock < quantity:
                    quantity = max(0, variant.stock)
            except Product.DoesNotExist:
                pass

        if self.request.user.is_authenticated:
            CartItem.objects.filter(
                cart=self.db_cart,
                product_id=product_id,
                variant_id=variant_id
            ).update(quantity=quantity)
            
            key = make_session_key(product_id, variant_id)
            self.cart[key] = quantity
        else:
            key = make_session_key(product_id, variant_id)
            self.cart[key] = quantity
            self.session.modified = True


        return self.cart

    def delete(self, product, variant_id=None):
        product_id = product.id if isinstance(product, Product) else int(product)

        if self.request.user.is_authenticated:
            CartItem.objects.filter(
                cart=self.db_cart,
                product_id=product_id,
                variant_id=variant_id
            ).delete()
            
            key = make_session_key(product_id, variant_id)
            if key in self.cart:
                del self.cart[key]
        else:
            key = make_session_key(product_id, variant_id)
            if key in self.cart:
                del self.cart[key]
                self.session.modified = True

    def update_shipping(self, shipping_method):
        self.session['shipping_method'] = shipping_method
        self.shipping_method = shipping_method
        self.session.modified = True

    def merge(self, session_cart):
        if not self.request.user.is_authenticated:
            return

        for key, qty in session_cart.items():
            pid, vid = parse_session_key(key)
            try:
                product = Product.objects.get(id=pid)
                variant = ProductVariant.objects.get(id=vid) if vid else None

                item, created = CartItem.objects.get_or_create(
                    cart=self.db_cart,
                    product=product,
                    variant=variant,
                    defaults={'quantity': qty}
                )
                if not created:
                    item.quantity += qty
                    item.save()
            except (Product.DoesNotExist, ProductVariant.DoesNotExist):
                continue

        # Sync local representation
        self.cart = {}
        for item in self.db_cart.items.all():
            key = make_session_key(item.product_id, item.variant_id)
            self.cart[key] = item.quantity
