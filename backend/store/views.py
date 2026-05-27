from django.http import JsonResponse
from django.db.models import Avg, Q, Sum, Case, When, F, Count
from django.db.utils import ProgrammingError
from django.utils import timezone
from django.views.decorators.cache import cache_page
from django.views.decorators.http import require_GET
from django.core.paginator import Paginator

from .models import Product, Category, ProductThumbnail, Profile, Review, SaleEvent

import json


def _build_media_url(request, file_field):
    if not file_field:
        return None

    try:
        return request.build_absolute_uri(file_field.url)
    except ValueError:
        return None


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
        'image': _build_media_url(request, product.image),
        'thumbnails': thumbnails,
        'price': base_price,
        'sale_price': sale_price,
        'is_sale': is_sale,
        'discount_percentage': discount_percentage,
        'total_sold': int(getattr(product, 'total_sold', 0) or 0),
        'average_rating': round(float(getattr(product, 'average_rating', 0) or 0), 1),
        'review_count': int(getattr(product, 'review_count', 0) or 0),
        'short_description': product.short_description or '',
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
            .select_related('category')
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

        # --- Filter: search ---
        search = request.GET.get('search', '').strip()
        if search:
            qs = qs.filter(name__icontains=search)

        # --- Filter: price range ---
        # Use effective price (sale_price if on sale, else price)
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
        sort = request.GET.get('sort', 'newest')
        sort_map = {
            'newest': '-id',
            'price-asc': 'effective_price',
            'price-desc': '-effective_price',
            'rating': '-average_rating',
            'popular': '-total_sold',
        }
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
        return JsonResponse({'error': str(exc), 'results': []}, status=500)


@require_GET
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
        return JsonResponse({'error': str(exc), 'results': []}, status=500)


@require_GET
def product_detail_api(request, pk):
    """
    REST API endpoint: GET /api/store/products/<pk>/
    Returns full product detail: info, specs, reviews, related products.
    """
    try:
        product = (
            Product.objects
            .select_related('category')
            .prefetch_related('thumbnails')
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

    # Reviews (non-spam, recent first, limit 10)
    review_qs = (
        Review.objects
        .filter(product=product, is_spam=False)
        .select_related('user')
        .order_by('-review_date')[:20]
    )
    data['reviews'] = [
        {
            'id': r.id,
            'user': r.user.get_full_name() or r.user.username,
            'rating': r.rating,
            'comment': r.comment or '',
            'sentiment': r.sentiment,
            'review_date': r.review_date.isoformat(),
        }
        for r in review_qs
    ]

    # Rating distribution
    from django.db.models import IntegerField
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
        .select_related('category')
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


def home(request):
    """Legacy root URL — redirect to home_api for backward compatibility."""
    return home_api(request)

