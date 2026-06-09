import logging
import tempfile
import os

from django.http import JsonResponse
from django.db.models import Avg, Q, Sum, Case, When, F, Count
from django.db.utils import ProgrammingError
from django.utils import timezone
from django.views.decorators.cache import cache_page
from django.views.decorators.http import require_GET
from django.core.paginator import Paginator

from shared.utils import build_media_url as _build_media_url
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.response import Response
from rest_framework import status
from .utils import find_similar_products

from .models import Product, Category, Brand, ProductThumbnail, Review, SaleEvent

logger = logging.getLogger(__name__)


def _get_active_sales():
    current_time = timezone.now()
    try:
        active_sales = list(
            (
            SaleEvent.objects.filter(start_date__lte=current_time, end_date__gte=current_time)
            .select_related('category')
            .order_by('category_id', '-discount_percentage', '-id')
            )
        )
    except ProgrammingError:
        return [], {}

    active_sales_by_category = {}
    for sale in active_sales:
        active_sales_by_category.setdefault(sale.category_id, sale)

    return active_sales, active_sales_by_category


def _annotate_home_products(queryset):
    return queryset.annotate(
        total_sold=Sum('orderitem__quantity'),
        average_rating=Avg('review__rating', filter=Q(review__is_spam=False)),
        review_count=Count('review', filter=Q(review__is_spam=False), distinct=True),
    )


def _serialize_category(request, category, sale=None):
    return {
        'id': category.id,
        'name': category.name,
        'image': _build_media_url(request, category.image),
        'product_count': int(getattr(category, 'product_count', 0) or 0),
        'has_sale': sale is not None,
        'discount_percentage': float(sale.discount_percentage) if sale else 0,
    }


def _serialize_brand(request, brand):
    return {
        'id': brand.id,
        'name': brand.name,
        'image': _build_media_url(request, brand.image),
        'product_count': int(getattr(brand, 'product_count', 0) or 0),
    }


def _serialize_sale(request, sale):
    return {
        'id': sale.id,
        'category': _serialize_category(request, sale.category),
        'discount_percentage': float(sale.discount_percentage),
        'start_date': sale.start_date.isoformat(),
        'end_date': sale.end_date.isoformat(),
    }


def _serialize_product(request, product, sale=None):
    base_price = float(product.price or 0)
    discount_percentage = 0.0
    sale_price = base_price
    is_sale = False

    if sale is not None:
        discount_percentage = float(sale.discount_percentage)
        sale_price = round(base_price * (1 - discount_percentage / 100), 2)
        is_sale = True
    elif product.is_sale and product.sale_price:
        sale_price = float(product.sale_price)
        is_sale = True

    thumbnails = [
        url
        for url in (_build_media_url(request, thumbnail.image) for thumbnail in product.thumbnails.all())
        if url
    ]

    return {
        'id': product.id,
        'name': product.name,
        'category': {
            'id': product.category_id,
            'name': product.category.name if product.category_id else None,
        },
        'brand': {
            'id': getattr(product, 'brand_id', None),
            'name': product.brand.name if getattr(product, 'brand', None) else None,
        } if getattr(product, 'brand_id', None) else None,
        'image': _build_media_url(request, product.image),
        'thumbnails': thumbnails,
        'price': base_price,
        'sale_price': sale_price,
        'is_sale': is_sale,
        'discount_percentage': discount_percentage,
        'total_sold': int(getattr(product, 'total_sold', 0) or 0),
        'average_rating': round(float(getattr(product, 'average_rating', 0) or 0), 1),
        'review_count': int(getattr(product, 'review_count', 0) or 0),
        'short_description': getattr(product, 'short_description', '') or '',
        'config': getattr(product, 'config', '') or '',
    }


@require_GET
def products_api(request):
    """
    REST API endpoint: GET /api/store/products/
    Query params:
      - category (int): filter by category id
      - search (str): search by product name
      - min_price (int): minimum price filter
      - max_price (int): maximum price filter
      - sort (str): newest | price-asc | price-desc | rating | popular
      - page (int): page number (default 1)
      - limit (int): items per page (default 20, max 100)
    """
    try:
        _, active_sales_by_category = _get_active_sales()

        qs = (
            Product.objects
            .select_related('category', 'brand')
            .prefetch_related('thumbnails')
            .annotate(
                average_rating=Avg('review__rating', filter=Q(review__is_spam=False)),
                review_count=Count('review', filter=Q(review__is_spam=False), distinct=True),
                total_sold=Sum('orderitem__quantity'),
            )
        )

        # --- Filter: category ---
        category_id = request.GET.get('category')
        if category_id:
            try:
                qs = qs.filter(category_id=int(category_id))
            except (ValueError, TypeError):
                pass

        # --- Filter: brand ---
        brand_id = request.GET.get('brand')
        if brand_id:
            try:
                qs = qs.filter(brand_id=int(brand_id))
            except (ValueError, TypeError):
                pass

        # --- Filter: ids ---
        ids = request.GET.get('ids')
        is_custom_order = False
        preserved = None
        if ids:
            try:
                id_list = [int(x) for x in ids.split(',') if x.strip()]
                if id_list:
                    qs = qs.filter(id__in=id_list)
                    preserved = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(id_list)])
                    is_custom_order = True
            except (ValueError, TypeError):
                pass

        # --- Filter: cpu ---
        cpu = request.GET.get('cpu')
        if cpu:
            qs = qs.filter(Q(config__icontains=cpu) | Q(specifications__key__name__iexact='CPU', specifications__value__icontains=cpu)).distinct()

        # --- Filter: ram ---
        ram = request.GET.get('ram')
        if ram:
            qs = qs.filter(Q(config__icontains=ram) | Q(specifications__key__name__iexact='RAM', specifications__value__icontains=ram)).distinct()

        # --- Filter: storage ---
        storage = request.GET.get('storage')
        if storage:
            qs = qs.filter(Q(config__icontains=storage) | Q(specifications__key__name__iexact='Ổ cứng', specifications__value__icontains=storage) | Q(specifications__key__name__iexact='Storage', specifications__value__icontains=storage)).distinct()

        # --- Filter: screen ---
        screen = request.GET.get('screen')
        if screen:
            qs = qs.filter(Q(config__icontains=screen) | Q(specifications__key__name__iexact='Màn hình', specifications__value__icontains=screen) | Q(specifications__key__name__iexact='Screen', specifications__value__icontains=screen)).distinct()

        # --- Filter: os ---
        os_param = request.GET.get('os')
        if os_param:
            qs = qs.filter(Q(config__icontains=os_param) | Q(specifications__key__name__iexact='Hệ điều hành', specifications__value__icontains=os_param) | Q(specifications__key__name__iexact='OS', specifications__value__icontains=os_param)).distinct()

        # --- Filter: search ---
        search = request.GET.get('search', '').strip()
        if search:
            qs = qs.filter(name__icontains=search)

        # --- Price range filter ---
        qs = qs.annotate(
            effective_price=Case(
                When(is_sale=True, sale_price__isnull=False, then=F('sale_price')),
                default=F('price'),
            )
        )

        try:
            min_price = int(request.GET.get('min_price', 0))
            max_price = int(request.GET.get('max_price', 999_999_999))
            qs = qs.filter(effective_price__gte=min_price, effective_price__lte=max_price)
        except (ValueError, TypeError):
            pass

        # --- Sorting ---
        sort = request.GET.get('sort')
        if not sort and is_custom_order:
            qs = qs.order_by(preserved)
        else:
            sort = sort or 'newest'
            sort_map = {
                'newest': '-id',
                'price-asc': 'effective_price',
                'price-desc': '-effective_price',
                'rating': '-average_rating',
                'popular': '-total_sold',
            }
            if is_custom_order and sort == 'newest':
                qs = qs.order_by(preserved)
            else:
                qs = qs.order_by(sort_map.get(sort, '-id'))

        # --- Pagination ---
        try:
            limit = min(int(request.GET.get('limit', 20)), 100)
            page_num = int(request.GET.get('page', 1))
        except (ValueError, TypeError):
            limit, page_num = 20, 1

        paginator = Paginator(qs, limit)
        page_obj = paginator.get_page(page_num)

        results = [
            _serialize_product(request, product, active_sales_by_category.get(product.category_id))
            for product in page_obj.object_list
        ]

        return JsonResponse({
            'count': paginator.count,
            'total_pages': paginator.num_pages,
            'page': page_obj.number,
            'limit': limit,
            'results': results,
        }, json_dumps_params={'ensure_ascii': False})

    except Exception as exc:
        logger.exception(f"Error in products_api: {exc}")
        return JsonResponse({'error': 'Lỗi hệ thống. Vui lòng thử lại sau.', 'results': []}, status=500)


@require_GET
@cache_page(60 * 5)
def categories_api(request):
    """REST API endpoint: GET /api/store/categories/"""
    try:
        categories = Category.objects.annotate(product_count=Count('product')).order_by('id')
        _, active_sales_by_category = _get_active_sales()

        data = [
            _serialize_category(request, cat, active_sales_by_category.get(cat.id))
            for cat in categories
        ]
        return JsonResponse({'results': data}, json_dumps_params={'ensure_ascii': False})
    except Exception as exc:
        logger.exception(f"Error in categories_api: {exc}")
        return JsonResponse({'error': 'Lỗi hệ thống. Vui lòng thử lại sau.', 'results': []}, status=500)


@require_GET
@cache_page(60 * 5)
def brands_api(request):
    """REST API endpoint: GET /api/store/brands/"""
    try:
        brands = Brand.objects.annotate(product_count=Count('products')).order_by('id')
        data = [
            _serialize_brand(request, b)
            for b in brands
        ]
        return JsonResponse({'results': data}, json_dumps_params={'ensure_ascii': False})
    except Exception as exc:
        logger.exception(f"Error in brands_api: {exc}")
        return JsonResponse({'error': 'Lỗi hệ thống. Vui lòng thử lại sau.', 'results': []}, status=500)


@require_GET
def product_detail_api(request, pk):
    """
    REST API endpoint: GET /api/store/products/<pk>/
    Returns full product detail: info, specs, reviews, related products.
    """
    try:
        product = (
            Product.objects
            .select_related('category', 'brand')
            .prefetch_related('thumbnails', 'specifications__key', 'variants')
            .annotate(
                average_rating=Avg('review__rating', filter=Q(review__is_spam=False)),
                review_count=Count('review', filter=Q(review__is_spam=False), distinct=True),
                total_sold=Sum('orderitem__quantity'),
            )
            .get(pk=pk)
        )
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)

    _, active_sales_by_category = _get_active_sales()
    sale = active_sales_by_category.get(product.category_id)

    # Serialize base product data
    data = _serialize_product(request, product, sale)

    # Add full description
    data['description'] = product.description or ''

    # Parse config into structured list: "- CPU + Intel Core i7: 1235U + ..." → [{CPU: [{Intel Core i7: 1235U}]}, ...]
    raw_config = product.config or ''
    config_items = []
    for segment in raw_config.split('- '):
        segment = segment.strip()
        if not segment:
            continue
        parts = [p.strip() for p in segment.split(' + ')]
        if len(parts) >= 2:
            label = parts[0]
            specs = []
            for kv in parts[1:]:
                if ': ' in kv:
                    k, v = kv.split(': ', 1)
                    specs.append({'key': k.strip(), 'value': v.strip()})
                else:
                    specs.append({'key': kv, 'value': ''})
            config_items.append({'label': label, 'specs': specs})
    data['config'] = config_items

    # Serialize structured specifications
    specifications = [
        {
            'id': spec.id,
            'key': spec.key.name,
            'value': spec.value
        }
        for spec in product.specifications.all()
    ]
    data['specifications'] = specifications

    # Serialize product variants
    variants = [
        {
            'id': var.id,
            'sku': var.sku,
            'name': var.name,
            'price': float(var.price),
            'stock': var.stock
        }
        for var in product.variants.all()
    ]
    data['variants'] = variants

    # Reviews (non-spam, recent first, limit 20)
    review_qs = (
        Review.objects
        .filter(product=product, is_spam=False)
        .select_related('user')
        .prefetch_related('images')
        .order_by('-review_date')[:20]
    )
    from store.review_views import _serialize_review
    data['reviews'] = [_serialize_review(r, request) for r in review_qs]

    # Rating distribution
    dist_qs = (
        Review.objects
        .filter(product=product, is_spam=False)
        .values('rating')
        .annotate(count=Count('id'))
    )
    rating_dist = {i: 0 for i in range(1, 6)}
    for row in dist_qs:
        rating_dist[row['rating']] = row['count']
    data['rating_distribution'] = rating_dist

    # Related products (same category, exclude self, limit 8)
    related_qs = (
        Product.objects
        .select_related('category', 'brand')
        .prefetch_related('thumbnails')
        .annotate(
            average_rating=Avg('review__rating', filter=Q(review__is_spam=False)),
            review_count=Count('review', filter=Q(review__is_spam=False), distinct=True),
            total_sold=Sum('orderitem__quantity'),
        )
        .filter(category=product.category)
        .exclude(pk=pk)
        .order_by('-id')[:8]
    )
    data['related_products'] = [
        _serialize_product(request, p, active_sales_by_category.get(p.category_id))
        for p in related_qs
    ]

    return JsonResponse(data, json_dumps_params={'ensure_ascii': False})


@cache_page(60 * 5)
def home_api(request):
    """Return home page data for the frontend app."""
    active_sales, active_sales_by_category = _get_active_sales()

    categories = Category.objects.annotate(product_count=Count('product')).order_by('id')
    product_queryset = Product.objects.select_related('category').prefetch_related('thumbnails').order_by('-id')

    try:
        featured_products = list(_annotate_home_products(product_queryset)[:8])
    except ProgrammingError:
        featured_products = list(product_queryset[:8])

    try:
        top_products = list(
            _annotate_home_products(
                Product.objects.select_related('category').prefetch_related('thumbnails')
            )
            .filter(total_sold__gt=0)
            .order_by('-total_sold', '-id')[:10]
        )
    except ProgrammingError:
        top_products = list(product_queryset[:10])

    payload = {
        'categories': [
            _serialize_category(request, category, active_sales_by_category.get(category.id))
            for category in categories
        ],
        'discounted_category_ids': list(active_sales_by_category.keys()),
        'active_sales': [
            _serialize_sale(request, sale)
            for sale in active_sales
        ],
        'featured_products': [
            _serialize_product(request, product, active_sales_by_category.get(product.category_id))
            for product in featured_products
        ],
        'top_products': [
            _serialize_product(request, product, active_sales_by_category.get(product.category_id))
            for product in top_products
        ],
        'stats': {
            'category_count': categories.count(),
            'active_sale_count': len(active_sales_by_category),
            'featured_product_count': len(featured_products),
            'top_product_count': len(top_products),
        },
    }

    return JsonResponse(payload, json_dumps_params={'ensure_ascii': False})


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle, UserRateThrottle])
def search_by_image_api(request):
    image_file = request.FILES.get('image')
    if not image_file:
        return Response({'error': 'Vui lòng cung cấp hình ảnh để tìm kiếm'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            for chunk in image_file.chunks():
                temp_file.write(chunk)
            temp_filepath = temp_file.name

        try:
            product_ids = find_similar_products(temp_filepath, top_k=20)
        finally:
            if os.path.exists(temp_filepath):
                os.remove(temp_filepath)

        return Response({'product_ids': product_ids})
    except Exception as e:
        logger.exception(f"Error in search_by_image_api: {e}")
        return Response({'error': 'Lỗi hệ thống khi tìm kiếm. Vui lòng thử lại sau.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
