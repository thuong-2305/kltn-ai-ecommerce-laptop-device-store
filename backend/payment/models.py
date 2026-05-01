from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from store.models import Product
from django.db.models.signals import post_save, pre_save
import datetime

class ShippingAddress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    shipping_full_name = models.CharField(max_length=255)
    shipping_phone = models.CharField(max_length=255)
    shipping_address = models.CharField(max_length=255, null=True, blank=True)

    # Tự chỉ định chính xác dạng số nhiều không cho django tự thêm dạng số nhiều s/es
    class Meta:
        verbose_name_plural = "Shipping Address"

    def __str__(self):
        return f'Shipping Address - {str(self.id)}'

# Create a user user by default when user sign up
@receiver(post_save, sender=User)
def create_shipping(sender, instance, created, **kwargs):
    if created:
        ShippingAddress.objects.create(user=instance)

# Order
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    shipping_address = models.TextField(max_length=1500)
    amount_paid = models.DecimalField(max_digits=20, decimal_places=0)
    date_ordered = models.DateTimeField(auto_now_add=True)
    shipped = models.BooleanField(default=False)
    date_shipped = models.DateTimeField(blank=True, null=True)

    def  __str__(self):
        return f'Order - {str(self.id)}'
    
# Auto add shipping date
@receiver(pre_save, sender=Order)
def set_shippped_date_on_update(sender, instance, **kwargs):
    if instance.pk:
        now = datetime.datetime.now()
        obj = sender._default_manager.get(pk=instance.pk)
        if instance.shipped and not obj.shipped:
            instance.date_shipped = now
    
# Order Item
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=20, decimal_places=0)

    def __str__(self):
        return f'Order Item - {str(self.id)}'



