from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from store.models import Category, Product, ProductVariant
from cart.models import Cart as CartModel, CartItem

User = get_user_model()

class CartAPITests(APITestCase):
    def setUp(self):
        # Create user
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpassword'
        )
        
        # Create category
        self.category = Category.objects.create(name='Laptops')
        
        # Create product
        self.product = Product.objects.create(
            name='Dell XPS 13',
            price=20000000,
            category=self.category
        )
        
        # Create variants
        self.variant_16gb = ProductVariant.objects.create(
            product=self.product,
            sku='DELL-XPS-13-16GB',
            name='16GB RAM',
            price=22000000,
            stock=10
        )
        self.variant_32gb = ProductVariant.objects.create(
            product=self.product,
            sku='DELL-XPS-13-32GB',
            name='32GB RAM',
            price=25000000,
            stock=5
        )

        # URL patterns
        self.summary_url = reverse('cart_summary_api')
        self.add_url = reverse('cart_add_api')
        self.update_url = reverse('cart_update_api')
        self.delete_url = reverse('cart_delete_api')
        self.merge_url = reverse('cart_merge_api')

    def test_guest_cart_flow(self):
        # 1. Add product without variant
        response = self.client.post(self.add_url, {'product_id': self.product.id, 'quantity': 2}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['item_count'], 1)
        self.assertEqual(response.data['total_qty'], 2)
        self.assertEqual(response.data['subtotal'], 40000000.0)

        # 2. Add same product with a variant (should treat as separate item)
        response = self.client.post(self.add_url, {
            'product_id': self.product.id,
            'variant_id': self.variant_16gb.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['item_count'], 2)
        self.assertEqual(response.data['total_qty'], 3)
        self.assertEqual(response.data['subtotal'], 62000000.0)

        # 3. Update quantity of the variant item
        response = self.client.post(self.update_url, {
            'product_id': self.product.id,
            'variant_id': self.variant_16gb.id,
            'quantity': 3
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_qty'], 5)
        self.assertEqual(response.data['subtotal'], 106000000.0)

        # 4. Remove the parent item (without variant)
        response = self.client.post(self.delete_url, {
            'product_id': self.product.id
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['item_count'], 1)
        self.assertEqual(response.data['total_qty'], 3)
        self.assertEqual(response.data['subtotal'], 66000000.0)

    def test_authenticated_cart_flow(self):
        self.client.force_authenticate(user=self.user)

        # 1. Add item with variant
        response = self.client.post(self.add_url, {
            'product_id': self.product.id,
            'variant_id': self.variant_32gb.id,
            'quantity': 1
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify db models
        db_cart = CartModel.objects.get(user=self.user)
        self.assertEqual(db_cart.items.count(), 1)
        item = db_cart.items.first()
        self.assertEqual(item.product, self.product)
        self.assertEqual(item.variant, self.variant_32gb)
        self.assertEqual(item.quantity, 1)

        # 2. Update item quantity
        response = self.client.post(self.update_url, {
            'product_id': self.product.id,
            'variant_id': self.variant_32gb.id,
            'quantity': 4
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.quantity, 4)

        # 3. Delete item
        response = self.client.post(self.delete_url, {
            'product_id': self.product.id,
            'variant_id': self.variant_32gb.id
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(db_cart.items.count(), 0)

    def test_merge_cart(self):
        # 1. Simulate guest session items
        guest_cart_data = {
            f"{self.product.id}": 2,  # Parent product
            f"{self.product.id}_{self.variant_16gb.id}": 1 # Variant product
        }
        
        # 2. Authenticate
        self.client.force_authenticate(user=self.user)

        # 3. Merge request
        response = self.client.post(self.merge_url, {'cart': guest_cart_data}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 4. Verify DB cart has merged items
        db_cart = CartModel.objects.get(user=self.user)
        self.assertEqual(db_cart.items.count(), 2)
        
        item_parent = db_cart.items.get(variant__isnull=True)
        self.assertEqual(item_parent.quantity, 2)
        
        item_variant = db_cart.items.get(variant=self.variant_16gb)
        self.assertEqual(item_variant.quantity, 1)
