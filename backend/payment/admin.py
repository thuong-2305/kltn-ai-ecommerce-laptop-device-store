from django.contrib import admin
from .models import OrderItem, ShippingAddress, Order
from django.contrib.auth.models import User
# Register model
admin.site.register(ShippingAddress)
admin.site.register(Order)
admin.site.register(OrderItem)

# Create order inline
class OrderItemInline(admin.StackedInline):
    model = OrderItem
    # delete orderitem blank in order
    extra = 0 


# Them cac order item vao bang hien thi ben duoi order giong nhau
class OrderAdmin(admin.ModelAdmin):
    model = Order
    readonly_fields = ['date_ordered']
    # sap xep lai thu tu hien thi cac truong trong admin
    fields = ['user', 'full_name', 'phone', 'shipping_address', 'amount_paid', 'date_ordered', 'shipped', 'date_shipped']
    inlines = [OrderItemInline]

# Unregister Order model 
admin.site.unregister(Order)

# Reregister our order and orderadmin
admin.site.register(Order, OrderAdmin)
