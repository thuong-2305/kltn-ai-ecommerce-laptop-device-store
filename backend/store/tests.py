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


from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Category, Brand, Product, ProductSpecificationKey, ProductSpecification, ProductVariant

class BrandAndCategoryIntegrationTests(TestCase):
    def setUp(self):
        # Create test category and brand
        self.category = Category.objects.create(name="Laptop Laptops")
        self.brand = Brand.objects.create(name="Dell Tech")
        
        # Create dummy image for upload
        dummy_image = SimpleUploadedFile(
            name='test_image.png',
            content=b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82',
            content_type='image/png'
        )
        
        # Create product associated with category and brand
        self.product = Product.objects.create(
            name="Dell XPS 13",
            price=25000000,
            category=self.category,
            brand=self.brand,
            image=dummy_image
        )

    def test_categories_list_api(self):
        response = self.client.get(reverse('categories_api'))
        self.assertEqual(response.status_code, 200)
        payload = json.loads(response.content.decode('utf-8'))
        self.assertIn('results', payload)
        self.assertEqual(len(payload['results']), 1)
        self.assertEqual(payload['results'][0]['name'], "Laptop Laptops")
        self.assertEqual(payload['results'][0]['product_count'], 1)

    def test_brands_list_api(self):
        response = self.client.get(reverse('brands_api'))
        self.assertEqual(response.status_code, 200)
        payload = json.loads(response.content.decode('utf-8'))
        self.assertIn('results', payload)
        self.assertEqual(len(payload['results']), 1)
        self.assertEqual(payload['results'][0]['name'], "Dell Tech")
        self.assertEqual(payload['results'][0]['product_count'], 1)

    def test_products_filter_by_brand(self):
        # Filter by correct brand
        response = self.client.get(f"{reverse('products_api')}?brand={self.brand.id}")
        self.assertEqual(response.status_code, 200)
        payload = json.loads(response.content.decode('utf-8'))
        self.assertEqual(payload['count'], 1)
        self.assertEqual(payload['results'][0]['name'], "Dell XPS 13")
        self.assertEqual(payload['results'][0]['brand']['name'], "Dell Tech")

        # Filter by non-existent brand
        response = self.client.get(f"{reverse('products_api')}?brand=999")
        self.assertEqual(response.status_code, 200)
        payload = json.loads(response.content.decode('utf-8'))
        self.assertEqual(payload['count'], 0)

    def test_products_filter_by_advanced_specs(self):
        # Update self.product with a config
        self.product.config = "- CPU + Intel Core i7 - RAM + 16GB - Storage + 512GB SSD - OS + Windows 11"
        self.product.save()

        # Create another product with different config
        dummy_image_2 = SimpleUploadedFile(
            name='test_image_2.png',
            content=b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82',
            content_type='image/png'
        )
        Product.objects.create(
            name="MacBook Pro",
            price=35000000,
            category=self.category,
            brand=self.brand,
            image=dummy_image_2,
            config="- CPU + Apple M3 - RAM + 8GB - Storage + 256GB - OS + macOS"
        )

        # Test filtering by CPU (i7) -> should return Dell XPS 13
        response = self.client.get(f"{reverse('products_api')}?cpu=i7")
        self.assertEqual(response.status_code, 200)
        payload = json.loads(response.content.decode('utf-8'))
        self.assertEqual(payload['count'], 1)
        self.assertEqual(payload['results'][0]['name'], "Dell XPS 13")

        # Test filtering by RAM (8GB) -> should return MacBook Pro
        response = self.client.get(f"{reverse('products_api')}?ram=8GB")
        self.assertEqual(response.status_code, 200)
        payload = json.loads(response.content.decode('utf-8'))
        self.assertEqual(payload['count'], 1)
        self.assertEqual(payload['results'][0]['name'], "MacBook Pro")

        # Test filtering by Storage (512GB) -> should return Dell XPS 13
        response = self.client.get(f"{reverse('products_api')}?storage=512GB")
        self.assertEqual(response.status_code, 200)
        payload = json.loads(response.content.decode('utf-8'))
        self.assertEqual(payload['count'], 1)

        # Test filtering by OS (macOS) -> should return MacBook Pro
        response = self.client.get(f"{reverse('products_api')}?os=macOS")
        self.assertEqual(response.status_code, 200)
        payload = json.loads(response.content.decode('utf-8'))
        self.assertEqual(payload['count'], 1)
        self.assertEqual(payload['results'][0]['name'], "MacBook Pro")

    def test_product_detail_api_with_variants_and_specifications(self):
        # Create key
        spec_key = ProductSpecificationKey.objects.create(name="CPU")
        
        # Create specification
        ProductSpecification.objects.create(
            product=self.product,
            key=spec_key,
            value="Intel Core i7"
        )

        # Create variant
        ProductVariant.objects.create(
            product=self.product,
            sku="DELL-XPS13-I7-16-512",
            name="Core i7 / 16GB / 512GB",
            price=28000000,
            stock=10
        )

        # Call product detail API
        response = self.client.get(reverse('product_detail_api', kwargs={'pk': self.product.id}))
        self.assertEqual(response.status_code, 200)
        payload = json.loads(response.content.decode('utf-8'))

        # Verify specifications list
        self.assertIn('specifications', payload)
        self.assertEqual(len(payload['specifications']), 1)
        self.assertEqual(payload['specifications'][0]['key'], "CPU")
        self.assertEqual(payload['specifications'][0]['value'], "Intel Core i7")

        # Verify variants list
        self.assertIn('variants', payload)
        self.assertEqual(len(payload['variants']), 1)
        self.assertEqual(payload['variants'][0]['sku'], "DELL-XPS13-I7-16-512")
        self.assertEqual(payload['variants'][0]['name'], "Core i7 / 16GB / 512GB")
        self.assertEqual(payload['variants'][0]['price'], 28000000.0)
        self.assertEqual(payload['variants'][0]['stock'], 10)

from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from store.models import Review, ReviewImage
from django.contrib.auth import get_user_model

User = get_user_model()

class ReviewImageTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='reviewtester',
            email='reviewer@example.com',
            password='testpassword'
        )
        self.category = Category.objects.create(name="Laptop Laptops")
        self.brand = Brand.objects.create(name="Dell Tech")
        self.product = Product.objects.create(
            name="Dell Latitude",
            price=15000000,
            category=self.category,
            brand=self.brand
        )
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.submit_review_url = reverse('submit_review_api')

    def test_submit_review_with_images(self):
        # Create dummy image files to upload
        image_1 = SimpleUploadedFile(
            name='review_pic_1.png',
            content=b'dummycontent1',
            content_type='image/png'
        )
        image_2 = SimpleUploadedFile(
            name='review_pic_2.png',
            content=b'dummycontent2',
            content_type='image/png'
        )
        
        post_data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Sản phẩm dùng cực kỳ tốt, thiết kế rất đẹp.',
            'title': 'Rất hài lòng!',
            'images': [image_1, image_2]
        }
        
        # Send multipart post request
        response = self.client.post(self.submit_review_url, post_data, format='multipart')
        self.assertEqual(response.status_code, 201)
        
        # Check review created
        review = Review.objects.get(user=self.user, product=self.product)
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.comment, 'Rất hài lòng!\nSản phẩm dùng cực kỳ tốt, thiết kế rất đẹp.')
        
        # Check review images created
        self.assertEqual(review.images.count(), 2)
        images = list(review.images.all())
        self.assertTrue(images[0].image.name.startswith('reviews/gallery/review_pic_1'))
        self.assertTrue(images[1].image.name.startswith('reviews/gallery/review_pic_2'))
        
        # Check serialize structure contains images
        payload = response.json()
        self.assertIn('review', payload)
        self.assertIn('images', payload['review'])
        self.assertEqual(len(payload['review']['images']), 2)
        self.assertTrue(payload['review']['images'][0].startswith('http://'))

    def test_submit_duplicate_review_fails(self):
        post_data = {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Sản phẩm dùng tốt',
        }
        res1 = self.client.post(self.submit_review_url, post_data)
        self.assertEqual(res1.status_code, 201)

        res2 = self.client.post(self.submit_review_url, post_data)
        self.assertEqual(res2.status_code, 400)
        self.assertEqual(res2.json()['error'], 'Bạn đã đánh giá sản phẩm này rồi và không thể chỉnh sửa.')



class ImageSearchAPITests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="AI Search Category")
        self.product1 = Product.objects.create(
            name="Laptop AI One",
            price=25000000,
            category=self.category
        )
        self.product2 = Product.objects.create(
            name="Laptop AI Two",
            price=30000000,
            category=self.category
        )

    def test_products_api_with_ids_parameter(self):
        # Call products_api with ids in query params
        ids_str = f"{self.product2.id},{self.product1.id}"
        url = f"{reverse('products_api')}?ids={ids_str}"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        
        payload = response.json()
        self.assertEqual(payload['count'], 2)
        # Verify custom ordering is preserved (product2 first, then product1)
        self.assertEqual(payload['results'][0]['id'], self.product2.id)
        self.assertEqual(payload['results'][1]['id'], self.product1.id)

    def test_search_by_image_unsupported_method(self):
        url = reverse('search_by_image_api')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 405)

    def test_search_by_image_missing_file(self):
        url = reverse('search_by_image_api')
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, 400)

    def test_search_by_image_valid_request_fallback(self):
        # When CLIP is not fully configured or under tests, it will fallback gracefully or run
        url = reverse('search_by_image_api')
        image = SimpleUploadedFile(
            name='test_query.jpg',
            content=b'dummyimagebytes',
            content_type='image/jpeg'
        )
        response = self.client.post(url, {'image': image}, format='multipart')
        # Regardless of whether torch/clip loads successfully in test env, it should respond 200
        # (either returning empty/fallback list or matching results) and not return a 500 error!
        self.assertEqual(response.status_code, 200)
        self.assertIn('product_ids', response.json())


class SentimentAnalyzerTests(TestCase):
    def test_sentiment_analyzer_prediction(self):
        from store.sentiment import SentimentAnalyzer
        
        # Test positive review comment
        sentiment, score = SentimentAnalyzer.analyze("Sản phẩm dùng rất tốt, tôi vô cùng hài lòng", rating=5)
        self.assertEqual(sentiment, "positive")
        self.assertGreater(score, 0.5)

        # Test negative review comment
        sentiment, score = SentimentAnalyzer.analyze("Sản phẩm tệ quá, dùng bị lag và nóng máy", rating=1)
        self.assertEqual(sentiment, "negative")
        self.assertGreater(score, 0.5)


class AdminReviewsAndStatsAPITests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username='adminuser',
            email='admin@example.com',
            password='adminpassword'
        )
        self.customer = User.objects.create_user(
            username='customeruser',
            email='customer@example.com',
            password='customerpassword'
        )
        self.category = Category.objects.create(name="Laptop Laptops")
        self.brand = Brand.objects.create(name="Dell Tech")
        self.product = Product.objects.create(
            name="Dell Latitude",
            price=15000000,
            category=self.category,
            brand=self.brand
        )
        self.r1 = Review.objects.create(
            user=self.customer,
            product=self.product,
            rating=5,
            comment="Sản phẩm rất đẹp và hiệu năng cực kỳ mạnh mẽ, chạy rất mượt",
            sentiment="positive"
        )
        self.admin_token = str(RefreshToken.for_user(self.admin).access_token)
        self.customer_token = str(RefreshToken.for_user(self.customer).access_token)
        
        self.admin_reviews_url = reverse('admin_reviews_api')
        self.sentiment_stats_url = reverse('product_sentiment_stats_api', kwargs={'pk': self.product.id})

    def test_admin_reviews_access_control(self):
        # 1. Unauthenticated fails
        res = self.client.get(self.admin_reviews_url)
        self.assertEqual(res.status_code, 401)

        # 2. Customer (non-staff) fails
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.customer_token}')
        res = self.client.get(self.admin_reviews_url)
        self.assertEqual(res.status_code, 403)

        # 3. Admin succeeds
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        res = self.client.get(self.admin_reviews_url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()['reviews']), 1)
        self.assertEqual(res.json()['reviews'][0]['target'], self.product.name)

    def test_sentiment_stats_access_control_and_data(self):
        # 1. Unauthenticated fails
        res = self.client.get(self.sentiment_stats_url)
        self.assertEqual(res.status_code, 401)

        # 2. Customer fails
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.customer_token}')
        res = self.client.get(self.sentiment_stats_url)
        self.assertEqual(res.status_code, 403)

        # 3. Admin succeeds
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        res = self.client.get(self.sentiment_stats_url)
        self.assertEqual(res.status_code, 200)
        
        payload = res.json()
        self.assertEqual(payload['product']['name'], self.product.name)
        aspects = {a['name']: a for a in payload['aspects']}
        self.assertIn('Hiệu năng', aspects)
        self.assertEqual(aspects['Hiệu năng']['count'], 1)
        self.assertEqual(aspects['Hiệu năng']['score'], 5.0)
        self.assertIn('Thiết kế', aspects)
        self.assertEqual(aspects['Thiết kế']['count'], 1)
        self.assertEqual(aspects['Thiết kế']['score'], 5.0)
        self.assertIn('Pin', aspects)
        self.assertEqual(aspects['Pin']['count'], 0)
        self.assertEqual(aspects['Pin']['score'], 5.0)


