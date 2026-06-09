import json
import logging
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.utils import timezone
from .models import Product, Review
from shared.utils import get_authenticated_user

logger = logging.getLogger(__name__)

# Max 5MB per review image
MAX_REVIEW_IMAGE_SIZE = 5 * 1024 * 1024


def _get_user(request):
    """Return (user, None) or (None, error_response)."""
    try:
        user = get_authenticated_user(request, raise_on_invalid_token=True)
        if user is None:
            return None, JsonResponse({'error': 'Chưa xác thực'}, status=401)
        return user, None
    except Exception:
        return None, JsonResponse({'error': 'Token không hợp lệ'}, status=401)


def _serialize_review(review, request=None):
    from store.views import _build_media_url
    images = []
    # Fetch related images from review.images relation
    for img in review.images.all():
        url = _build_media_url(request, img.image)
        if url:
            images.append(url)
            
    return {
        'id': review.id,
        'user': {
            'id': review.user.id,
            'full_name': review.user.get_full_name() or review.user.username,
            'username': review.user.username,
        },
        'rating': review.rating,
        'comment': review.comment or '',
        'sentiment': review.sentiment,
        'review_date': review.review_date.strftime('%d/%m/%Y') if review.review_date else '',
        'is_spam': review.is_spam,
        'images': images,
    }


# ─── GET /api/store/products/<pk>/reviews/  ──────────────────────
@require_GET
def product_reviews_api(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Sản phẩm không tồn tại'}, status=404)

    reviews = (
        Review.objects
        .filter(product=product, is_spam=False)
        .select_related('user')
        .prefetch_related('images')
        .order_by('-review_date')
    )

    # Aggregate
    total = reviews.count()
    if total > 0:
        from django.db.models import Avg, Count, Q
        agg = reviews.aggregate(
            avg=Avg('rating'),
            star_1=Count('id', filter=Q(rating=1)),
            star_2=Count('id', filter=Q(rating=2)),
            star_3=Count('id', filter=Q(rating=3)),
            star_4=Count('id', filter=Q(rating=4)),
            star_5=Count('id', filter=Q(rating=5)),
        )
        avg_rating = round(float(agg['avg'] or 0), 1)
        breakdown = {
            1: agg['star_1'],
            2: agg['star_2'],
            3: agg['star_3'],
            4: agg['star_4'],
            5: agg['star_5'],
        }
    else:
        avg_rating = 0
        breakdown = {i: 0 for i in range(1, 6)}

    return JsonResponse({
        'product_id': pk,
        'total': total,
        'avg_rating': avg_rating,
        'breakdown': breakdown,
        'reviews': [_serialize_review(r, request) for r in reviews[:50]],
    })


# ─── POST /api/store/reviews/  ────────────────────────────────────
@csrf_exempt
def submit_review_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Phương thức không hỗ trợ'}, status=405)

    user, err = _get_user(request)
    if err:
        return err

    product_id = None
    rating = None
    comment = ''
    title = ''

    # Handle application/json vs multipart/form-data
    if request.content_type == 'application/json':
        try:
            body = json.loads(request.body)
            product_id = body.get('product_id')
            rating = body.get('rating')
            comment = body.get('comment', '').strip()
            title = body.get('title', '').strip()
        except (ValueError, json.JSONDecodeError):
            return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)
    else:
        product_id = request.POST.get('product_id')
        rating = request.POST.get('rating')
        comment = request.POST.get('comment', '').strip()
        title = request.POST.get('title', '').strip()

    # Convert types
    try:
        if product_id is not None:
            product_id = int(product_id)
        if rating is not None:
            rating = int(rating)
    except (ValueError, TypeError):
        return JsonResponse({'error': 'Dữ liệu product_id hoặc rating không hợp lệ'}, status=400)

    # Validation
    if not product_id:
        return JsonResponse({'error': 'Thiếu product_id'}, status=400)
    if not rating or rating not in range(1, 6):
        return JsonResponse({'error': 'Đánh giá phải từ 1 đến 5 sao'}, status=400)
    if not comment:
        return JsonResponse({'error': 'Vui lòng nhập nội dung đánh giá'}, status=400)

    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Sản phẩm không tồn tại'}, status=404)

    # Combine title + comment
    full_comment = f"{title}\n{comment}".strip() if title else comment

    # Upsert — one review per user per product
    review, created = Review.objects.update_or_create(
        user=user,
        product=product,
        defaults={
            'rating': rating,
            'comment': full_comment,
            'review_date': timezone.now(),
            'is_spam': False,
        }
    )

    # Handle image uploads
    uploaded_files = request.FILES.getlist('images') or request.FILES.getlist('image')
    if uploaded_files:
        # Validate image sizes
        for file in uploaded_files[:5]:
            if file.size > MAX_REVIEW_IMAGE_SIZE:
                return JsonResponse({'error': f'Kích thước ảnh "{file.name}" vượt quá 5MB'}, status=400)
        if not created:
            # Remove existing review images if updating review
            review.images.all().delete()
        for file in uploaded_files[:5]:
            from .models import ReviewImage
            ReviewImage.objects.create(review=review, image=file)

    return JsonResponse({
        'message': 'Đánh giá đã được ghi nhận thành công!' if created else 'Đánh giá đã được cập nhật!',
        'review': _serialize_review(review, request),
        'created': created,
    }, status=201 if created else 200)


# ─── GET /api/store/products/<pk>/my-review/  ────────────────────
def my_review_api(request, pk):
    if request.method != 'GET':
        return JsonResponse({'error': 'Phương thức không hỗ trợ'}, status=405)

    user, err = _get_user(request)
    if err:
        return JsonResponse({'review': None})  # Not logged in → no review

    try:
        review = Review.objects.get(user=user, product_id=pk)
        return JsonResponse({'review': _serialize_review(review)})
    except Review.DoesNotExist:
        return JsonResponse({'review': None})
