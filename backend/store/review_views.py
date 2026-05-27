import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Product, Review
from datetime import datetime


def _get_user(request):
    """Return (user, None) or (None, error_response)."""
    jwt_auth = JWTAuthentication()
    try:
        result = jwt_auth.authenticate(request)
        if result is None:
            return None, JsonResponse({'error': 'Chưa xác thực'}, status=401)
        user, _ = result
        return user, None
    except Exception:
        return None, JsonResponse({'error': 'Token không hợp lệ'}, status=401)


def _serialize_review(review, request=None):
    from store.views import _build_media_url
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
        .order_by('-review_date')
    )

    # Aggregate
    total = reviews.count()
    if total > 0:
        from django.db.models import Avg, Count
        agg = reviews.aggregate(avg=Avg('rating'))
        avg_rating = round(float(agg['avg'] or 0), 1)
        # per-star breakdown
        breakdown = {i: reviews.filter(rating=i).count() for i in range(1, 6)}
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

    try:
        body = json.loads(request.body)
    except (ValueError, json.JSONDecodeError):
        return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)

    product_id = body.get('product_id')
    rating = body.get('rating')
    comment = body.get('comment', '').strip()
    title = body.get('title', '').strip()

    # Validation
    if not product_id:
        return JsonResponse({'error': 'Thiếu product_id'}, status=400)
    if not rating or not isinstance(rating, int) or rating not in range(1, 6):
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
            'review_date': datetime.now(),
            'is_spam': False,
        }
    )

    return JsonResponse({
        'message': 'Đánh giá đã được ghi nhận thành công!' if created else 'Đánh giá đã được cập nhật!',
        'review': _serialize_review(review),
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
