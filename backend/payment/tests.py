from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from store.models import Category, Product, ProductVariant
from cart.models import Cart as CartModel, CartItem as DbCartItem
from payment.models import Order, OrderItem

User = get_user_model()

class OrderAPITests(APITestCase):
    def setUp(self):
        # Create user
        self.user = User.objects.create_user(
            username='orderuser',
            email='orderuser@example.com',
            password='testpassword'
        )
        
        # Create category & product
        self.category = Category.objects.create(name='Computers')
        self.product = Product.objects.create(
            name='MacBook Pro 14',
            price=30000000,
            category=self.category
        )
        
        # Create variant with stock
        self.variant = ProductVariant.objects.create(
            product=self.product,
            sku='MBP-14-16GB',
            name='16GB RAM / 512GB SSD',
            price=32000000,
            stock=5
        )

        # URL paths
        self.cart_add_url = reverse('cart_add_api')
        self.order_create_url = reverse('api_order_create')
        self.order_history_url = reverse('api_order_history')

    def test_order_creation_and_stock_deduction(self):
        self.client.force_authenticate(user=self.user)

        # 1. Add 2 units of variant to cart
        self.client.post(self.cart_add_url, {
            'product_id': self.product.id,
            'variant_id': self.variant.id,
            'quantity': 2
        }, format='json')

        # 2. Place Order
        shipping_data = {
            'shipping_full_name': 'Nguyen Van A',
            'shipping_phone': '0987654321',
            'shipping_address': '123 Le Loi, District 1, HCMC'
        }
        response = self.client.post(self.order_create_url, shipping_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        
        order_id = response.data['order_id']
        order_code = response.data['order_code']
        self.assertTrue(order_code.startswith('ORD-'))

        # Verify stock deduction
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock, 3)

        # Verify OrderItem variant links and price
        order = Order.objects.get(id=order_id)
        self.assertEqual(order.items.count(), 1)
        item = order.items.first()
        self.assertEqual(item.product, self.product)
        self.assertEqual(item.variant, self.variant)
        self.assertEqual(item.quantity, 2)
        self.assertEqual(item.price, 32000000)

        # Verify DB cart is cleared
        db_cart = CartModel.objects.get(user=self.user)
        self.assertEqual(db_cart.items.count(), 0)

    def test_insufficient_stock_fails_and_rolls_back(self):
        self.client.force_authenticate(user=self.user)

        # 1. Add 6 units of variant to cart (exceeding stock=5)
        self.client.post(self.cart_add_url, {
            'product_id': self.product.id,
            'variant_id': self.variant.id,
            'quantity': 6
        }, format='json')

        # 2. Try to place order
        shipping_data = {
            'shipping_full_name': 'Nguyen Van B',
            'shipping_phone': '0987654321',
            'shipping_address': '456 Nguyen Hue, District 1, HCMC'
        }
        response = self.client.post(self.order_create_url, shipping_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('không đủ tồn kho', response.data['error'])

        # Verify stock remains unchanged (rolled back)
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock, 5)

        # Verify no orders created
        self.assertEqual(Order.objects.filter(user=self.user).count(), 0)

    def test_order_history(self):
        self.client.force_authenticate(user=self.user)

        # Create sample order
        order = Order.objects.create(
            user=self.user,
            full_name='Nguyen Van A',
            phone='0987654321',
            shipping_address='123 Le Loi',
            amount_paid=32000000
        )
        OrderItem.objects.create(
            order=order,
            product=self.product,
            variant=self.variant,
            user=self.user,
            quantity=1,
            price=32000000
        )

        response = self.client.get(self.order_history_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['order_code'], order.order_code)
        self.assertEqual(len(response.data['results'][0]['items']), 1)
        self.assertEqual(response.data['results'][0]['items'][0]['product_name'], self.product.name)
        self.assertEqual(response.data['results'][0]['items'][0]['variant_name'], self.variant.name)

    def test_order_cancellation_restores_stock(self):
        self.client.force_authenticate(user=self.user)

        # 1. Create order
        order = Order.objects.create(
            user=self.user,
            full_name='Nguyen Van C',
            phone='0987654321',
            shipping_address='789 Dien Bien Phu',
            amount_paid=64000000
        )
        OrderItem.objects.create(
            order=order,
            product=self.product,
            variant=self.variant,
            user=self.user,
            quantity=2,
            price=32000000
        )
        # Manually deduct stock to simulate order creation
        self.variant.stock = 3
        self.variant.save()

        # 2. Cancel order
        cancel_url = reverse('api_order_cancel', kwargs={'pk': order.id})
        response = self.client.post(cancel_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        # Verify order status is updated to 'cancelled'
        order.refresh_from_db()
        self.assertEqual(order.status, 'cancelled')

        # Verify variant stock is restored back to 5
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock, 5)

import hmac
import hashlib
import urllib.parse
from django.conf import settings

class VNPAYAPITests(APITestCase):
    def setUp(self):
        # Create user
        self.user = User.objects.create_user(
            username='payuser',
            email='payuser@example.com',
            password='testpassword'
        )
        
        # Create order
        self.order = Order.objects.create(
            user=self.user,
            full_name='Nguyen Van Pay',
            phone='0987654321',
            shipping_address='789 Dien Bien Phu',
            amount_paid=32000000
        )
        
        # URLs
        self.checkout_url = reverse('vnpay_checkout')
        self.return_url = reverse('vnpay_return')
        self.ipn_url = reverse('vnpay_ipn')

    def test_vnpay_checkout_generates_url(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.checkout_url, {'order_code': self.order.order_code}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('payment_url', response.data)
        payment_url = response.data['payment_url']
        self.assertIn('vnp_SecureHash=', payment_url)
        self.assertIn('vnp_TxnRef=' + self.order.order_code, payment_url)

    def test_vnpay_return_success(self):
        # Generate valid return signature params
        params = {
            'vnp_TxnRef': self.order.order_code,
            'vnp_ResponseCode': '00',
            'vnp_Amount': '3200000000', # 32000000 * 100
        }
        # compute signature
        has_data = '&'.join([f"{k}={urllib.parse.quote_plus(v)}" for k, v in sorted(params.items())])
        secret_key = settings.VNPAY_HASH_SECRET_KEY
        signature = hmac.new(secret_key.encode('utf-8'), has_data.encode('utf-8'), hashlib.sha512).hexdigest()
        params['vnp_SecureHash'] = signature

        response = self.client.get(self.return_url, params)
        # return view redirects
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.order.refresh_from_db()
        self.assertTrue(self.order.is_paid)

    def test_vnpay_ipn_success(self):
        params = {
            'vnp_TxnRef': self.order.order_code,
            'vnp_ResponseCode': '00',
            'vnp_Amount': '3200000000',
        }
        has_data = '&'.join([f"{k}={urllib.parse.quote_plus(v)}" for k, v in sorted(params.items())])
        secret_key = settings.VNPAY_HASH_SECRET_KEY
        signature = hmac.new(secret_key.encode('utf-8'), has_data.encode('utf-8'), hashlib.sha512).hexdigest()
        params['vnp_SecureHash'] = signature

        response = self.client.get(self.ipn_url, params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['RspCode'], '00')
        
        self.order.refresh_from_db()
        self.assertTrue(self.order.is_paid)

    def test_vnpay_ipn_invalid_signature(self):
        params = {
            'vnp_TxnRef': self.order.order_code,
            'vnp_ResponseCode': '00',
            'vnp_Amount': '3200000000',
            'vnp_SecureHash': 'invalidhash123'
        }
        response = self.client.get(self.ipn_url, params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['RspCode'], '97') # Invalid Signature

    def test_vnpay_ipn_invalid_amount(self):
        params = {
            'vnp_TxnRef': self.order.order_code,
            'vnp_ResponseCode': '00',
            'vnp_Amount': '999900', # wrong amount
        }
        has_data = '&'.join([f"{k}={urllib.parse.quote_plus(v)}" for k, v in sorted(params.items())])
        secret_key = settings.VNPAY_HASH_SECRET_KEY
        signature = hmac.new(secret_key.encode('utf-8'), has_data.encode('utf-8'), hashlib.sha512).hexdigest()
        params['vnp_SecureHash'] = signature

        response = self.client.get(self.ipn_url, params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['RspCode'], '04') # Invalid amount


class GHNIntegrationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='ghnuser',
            email='ghnuser@example.com',
            password='testpassword'
        )
        self.category = Category.objects.create(name='Electronics')
        self.product = Product.objects.create(
            name='Laptop Dell XPS 15',
            price=35000000,
            category=self.category
        )
        self.order = Order.objects.create(
            user=self.user,
            full_name='Nguyen Van GHN',
            phone='0987654321',
            shipping_address='789 Dien Bien Phu, Ward 22, Binh Thanh District, HCMC',
            amount_paid=35000000,
            is_paid=True
        )
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=1,
            price=35000000
        )
        self.webhook_url = reverse('ghn_webhook')

    def test_order_confirmation_dispatches_to_ghn(self):
        # Admin confirms the order (changes status to 'confirmed')
        self.order.status = 'confirmed'
        self.order.save()

        # Refresh order from DB
        self.order.refresh_from_db()

        # Order should be automatically dispatched to GHN:
        # 1. status changes to 'shipping'
        # 2. shipped becomes True
        # 3. tracking code is set
        self.assertEqual(self.order.status, 'shipping')
        self.assertTrue(self.order.shipped)
        self.assertIsNotNone(self.order.shipping_tracking_code)
        self.assertTrue(len(self.order.shipping_tracking_code) > 0)

    def test_ghn_webhook_updates_status_to_delivered(self):
        # Setup tracking code
        tracking_code = 'GHN-TEST-123456'
        self.order.shipping_tracking_code = tracking_code
        self.order.status = 'shipping'
        self.order.shipped = True
        self.order.save()

        # Send webhook from GHN
        webhook_payload = {
            'OrderCode': tracking_code,
            'Status': 'delivered'
        }
        response = self.client.post(self.webhook_url, webhook_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        # Order should now be marked as delivered
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'delivered')


