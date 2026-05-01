from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete

from .utils import generate_product_vector
from .models import Product

# Tự động tạo vector đặc trưng khi có sản phảm mới   
@receiver(post_save, sender=Product)
def generate_vector_on_create(sender, instance, created, **kwargs):
    if created:
        generate_product_vector.delay(instance.id)
