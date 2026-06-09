import logging
from django.db import models
from django.conf import settings
from django.dispatch import receiver
from store.models import Product, ProductVariant
from django.db.models.signals import post_save, pre_save
from django.utils import timezone
import random

logger = logging.getLogger(__name__)

class ShippingAddress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    shipping_full_name = models.CharField(max_length=255)
    shipping_phone = models.CharField(max_length=255)
    shipping_address = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Shipping Address"

    def __str__(self):
        return f'Shipping Address - {str(self.id)}'

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_shipping(sender, instance, created, **kwargs):
    if created:
        ShippingAddress.objects.create(user=instance)

# Order
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Chờ xử lý'),
        ('confirmed', 'Đã xác nhận'),
        ('shipping', 'Đang giao'),
        ('delivered', 'Đã giao'),
        ('cancelled', 'Đã hủy'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    order_code = models.CharField(max_length=100, unique=True, null=True, blank=True, db_index=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    shipping_address = models.TextField(max_length=1500)
    amount_paid = models.DecimalField(max_digits=20, decimal_places=0)
    date_ordered = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    shipped = models.BooleanField(default=False)
    is_paid = models.BooleanField(default=False, db_index=True)
    date_shipped = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    cancel_reason = models.TextField(blank=True, null=True)

    def __str__(self):
        return f'Order {self.order_code if self.order_code else str(self.id)}'

    def save(self, *args, **kwargs):
        if not self.order_code:
            date_str = timezone.now().strftime("%Y%m%d")
            # Loop to ensure uniqueness with retry limit
            for _ in range(10):
                code = f"ORD-{date_str}-{random.randint(100000, 999999)}"
                if not Order.objects.filter(order_code=code).exists():
                    self.order_code = code
                    break
            else:
                # Fallback to uuid-based code if all retries fail
                import uuid
                self.order_code = f"ORD-{date_str}-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

# Auto add shipping date and track old status
@receiver(pre_save, sender=Order)
def set_shipped_date_on_update(sender, instance, **kwargs):
    if instance.pk:
        try:
            obj = sender._default_manager.get(pk=instance.pk)
            instance._old_is_paid = obj.is_paid
            instance._old_shipped = obj.shipped
            instance._old_status = obj.status
            if instance.shipped and not obj.shipped:
                instance.date_shipped = timezone.now()  # Use timezone-aware datetime
        except sender.DoesNotExist:
            instance._old_is_paid = False
            instance._old_shipped = False
            instance._old_status = 'pending'
    else:
        instance._old_is_paid = False
        instance._old_shipped = False
        instance._old_status = 'pending'


@receiver(post_save, sender=Order)
def send_order_notifications(sender, instance, created, **kwargs):
    if not instance.user:
        return

    try:
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        if channel_layer:
            group_name = f"user_{instance.user.id}"
            
            # Check payment status change
            old_is_paid = getattr(instance, '_old_is_paid', False)
            is_paid_newly = (created and instance.is_paid) or (not created and instance.is_paid and not old_is_paid)
            
            if is_paid_newly:
                message = f"Đơn hàng {instance.order_code} đã được thanh toán thành công!"
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        "type": "send_notification",
                        "notification_type": "payment_success",
                        "message": message,
                        "data": {
                            "order_id": instance.id,
                            "order_code": instance.order_code,
                            "amount": str(instance.amount_paid),
                        }
                    }
                )

            # Check shipping status change
            old_shipped = getattr(instance, '_old_shipped', False)
            shipped_newly = (created and instance.shipped) or (not created and instance.shipped and not old_shipped)
            
            if shipped_newly:
                message = f"Đơn hàng {instance.order_code} đang được vận chuyển!"
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        "type": "send_notification",
                        "notification_type": "order_shipped",
                        "message": message,
                        "data": {
                            "order_id": instance.id,
                            "order_code": instance.order_code,
                        }
                    }
                )
    except Exception as e:
        logger.error(f"Failed to send WebSocket notification for order {instance.order_code}: {e}")

# Order Item
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=20, decimal_places=0)

    def __str__(self):
        variant_info = f" ({self.variant.name})" if self.variant else ""
        return f'Order Item {self.id} - {self.product.name}{variant_info} x {self.quantity}'


class UserAddress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    street = models.CharField(max_length=255)
    ward = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    type = models.CharField(max_length=20, default='home')
    is_default = models.BooleanField(default=False)

    class Meta:
        db_table = 'payment_user_address'
        ordering = ['-is_default', '-id']

    def __str__(self):
        return f"{self.name} - {self.street}, {self.ward}, {self.city}"

    def save(self, *args, **kwargs):
        if self.is_default:
            UserAddress.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
