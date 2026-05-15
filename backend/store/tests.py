import json
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import patch

from django.test import RequestFactory, SimpleTestCase
from django.urls import reverse

from . import views


class FakeQuerySet(list):
	def annotate(self, **kwargs):
		return self

	def select_related(self, *args, **kwargs):
		return self

	def prefetch_related(self, *args, **kwargs):
		return self

	def order_by(self, *args, **kwargs):
		return self

	def filter(self, **kwargs):
		if 'total_sold__gt' in kwargs:
			threshold = kwargs['total_sold__gt']
			return FakeQuerySet(
				[item for item in self if getattr(item, 'total_sold', 0) > threshold]
			)

		return self

	def count(self):
		return len(self)


class FakeManager:
	def __init__(self, items):
		self.items = FakeQuerySet(items)

	def annotate(self, *args, **kwargs):
		return self.items

	def filter(self, *args, **kwargs):
		return self.items

	def select_related(self, *args, **kwargs):
		return self.items

	def prefetch_related(self, *args, **kwargs):
		return self.items

	def order_by(self, *args, **kwargs):
		return self.items


class HomeApiTests(SimpleTestCase):
	def setUp(self):
		self.factory = RequestFactory()

	def test_home_api_route_is_registered(self):
		self.assertEqual(reverse('home_api'), '/api/store/home/')

	def test_home_api_returns_expected_payload(self):
		laptop_category = SimpleNamespace(
			id=1,
			name='Laptop',
			image=SimpleNamespace(url='/media/uploads/category/laptop.png'),
			product_count=2,
		)
		accessory_category = SimpleNamespace(
			id=2,
			name='Phu kien',
			image=SimpleNamespace(url='/media/uploads/category/accessory.png'),
			product_count=1,
		)

		active_sale = SimpleNamespace(
			id=11,
			category=laptop_category,
			category_id=1,
			discount_percentage=Decimal('20.00'),
			start_date=SimpleNamespace(isoformat=lambda: '2026-05-01T00:00:00+00:00'),
			end_date=SimpleNamespace(isoformat=lambda: '2026-05-31T23:59:59+00:00'),
		)

		sold_product = SimpleNamespace(
			id=101,
			name='Laptop Asus ROG',
			category=laptop_category,
			category_id=1,
			image=SimpleNamespace(url='/media/uploads/product/rog.png'),
			thumbnails=SimpleNamespace(
				all=lambda: [
					SimpleNamespace(image=SimpleNamespace(url='/media/uploads/product/thumbnails/rog-1.png')),
				]
			),
			price=Decimal('2000000'),
			sale_price=Decimal('0'),
			is_sale=False,
			short_description='Gaming laptop',
			total_sold=14,
			average_rating=Decimal('4.6'),
			review_count=8,
		)
		unsold_product = SimpleNamespace(
			id=102,
			name='Laptop Acer Swift',
			category=accessory_category,
			category_id=2,
			image=SimpleNamespace(url='/media/uploads/product/swift.png'),
			thumbnails=SimpleNamespace(all=lambda: []),
			price=Decimal('1500000'),
			sale_price=Decimal('1200000'),
			is_sale=True,
			short_description='Thin and light',
			total_sold=0,
			average_rating=Decimal('4.2'),
			review_count=4,
		)

		request = self.factory.get('/api/store/home/')

		with patch.object(views.Category, 'objects', FakeManager([laptop_category, accessory_category])), \
			 patch.object(views.SaleEvent, 'objects', FakeManager([active_sale])), \
			 patch.object(views.Product, 'objects', FakeManager([sold_product, unsold_product])):
			response = views.home_api(request)

		self.assertEqual(response.status_code, 200)

		payload = json.loads(response.content.decode('utf-8'))

		self.assertEqual(payload['stats']['category_count'], 2)
		self.assertEqual(payload['stats']['active_sale_count'], 1)
		self.assertEqual(payload['stats']['featured_product_count'], 2)
		self.assertEqual(payload['stats']['top_product_count'], 1)
		self.assertEqual(payload['discounted_category_ids'], [1])

		self.assertEqual(len(payload['categories']), 2)
		self.assertEqual(len(payload['active_sales']), 1)
		self.assertEqual(len(payload['featured_products']), 2)
		self.assertEqual(len(payload['top_products']), 1)

		self.assertTrue(payload['featured_products'][0]['image'].startswith('http://testserver/'))
		self.assertEqual(payload['top_products'][0]['id'], 101)
		self.assertEqual(payload['top_products'][0]['sale_price'], 1600000.0)
		self.assertEqual(payload['top_products'][0]['review_count'], 8)
