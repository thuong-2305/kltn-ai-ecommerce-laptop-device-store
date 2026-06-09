from store.models import Product
from cart.cart import Cart


class Wishlist():
    def __init__(self, request):
        self.session = request.session
        self.request = request
        wishlist = self.session.get('wishlist_session_key')
        if 'wishlist_session_key' not in request.session:
            wishlist = self.session['wishlist_session_key'] = {}
        self.wishlist = wishlist

    def add_wish(self, product, price):
        product_id = str(product.id)
        product_price = str(price)
        msg = ""
        if product_id in self.wishlist:
            msg = "Sản phẩm đã có trong danh sách yêu thích"
        else:
            self.wishlist[product_id] = str(product_price)
            msg = "Thêm vào danh sách yêu thích thành công"
        self.session.modified = True
        return msg

    def remove_wish(self, product):
        product_id = str(product.id)
        msg = "Sản phẩm không có trong wishlist"
        if product_id in self.wishlist:
            del self.wishlist[product_id]
            msg = "Đã xóa sản phẩm khỏi wishlist"
        self.session.modified = True
        return msg

    def get_prods(self):
        product_ids = self.wishlist.keys()
        products = Product.objects.filter(id__in=product_ids)
        return products