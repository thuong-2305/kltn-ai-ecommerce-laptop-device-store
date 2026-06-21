import json
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from store.models import Product, Category
from wishlist.models import Wishlist as DbWishlist

User = get_user_model()

class WishlistAPITests(APITestCase):
    def setUp(self):
        # Create user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        
        # Create category
        self.category = Category.objects.create(name='Test Category')
        
        # Create products
        self.product1 = Product.objects.create(
            name='Test Laptop 1',
            price=15000000,
            category=self.category
        )
        self.product2 = Product.objects.create(
            name='Test Laptop 2',
            price=20000000,
            category=self.category
        )

        # Generate JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

    def test_guest_wishlist_add_and_summary(self):
        # 1. Add product1 to guest wishlist
        response = self.client.post(
            reverse('wishlist_add_api'),
            data=json.dumps({'product_id': self.product1.id}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['results']), 1)
        self.assertEqual(data['results'][0]['id'], self.product1.id)
        
        # 2. Get wishlist summary
        response = self.client.get(reverse('wishlist_summary_api'))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['results']), 1)
        
        # 3. Add to cart
        response = self.client.post(
            reverse('wishlist_to_cart_api'),
            data=json.dumps({'product_id': self.product1.id}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        
        # 4. Remove product1
        response = self.client.post(
            reverse('wishlist_remove_api'),
            data=json.dumps({'product_id': self.product1.id}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['results']), 0)

    def test_authenticated_db_wishlist(self):
        # Set authorization header for JWT authentication
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        # 1. Add product1 to DB wishlist
        response = self.client.post(
            reverse('wishlist_add_api'),
            data=json.dumps({'product_id': self.product1.id}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['results']), 1)
        self.assertEqual(data['results'][0]['id'], self.product1.id)
        
        # Verify persistence in DB
        db_wish = DbWishlist.objects.get(user=self.user)
        self.assertTrue(db_wish.products.filter(id=self.product1.id).exists())
        
        # 2. Add product2
        response = self.client.post(
            reverse('wishlist_add_api'),
            data=json.dumps({'product_id': self.product2.id}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 2)
        
        # 3. Get summary
        response = self.client.get(reverse('wishlist_summary_api'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 2)
        
        # 4. Move product1 to cart
        response = self.client.post(
            reverse('wishlist_to_cart_api'),
            data=json.dumps({'product_id': self.product1.id}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        
        # Check that product1 is removed from wishlist, only product2 remains
        response = self.client.get(reverse('wishlist_summary_api'))
        data = response.json()
        self.assertEqual(len(data['results']), 1)
        self.assertEqual(data['results'][0]['id'], self.product2.id)
        
        # 5. Remove product2
        response = self.client.post(
            reverse('wishlist_remove_api'),
            data=json.dumps({'product_id': self.product2.id}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['results']), 0)
