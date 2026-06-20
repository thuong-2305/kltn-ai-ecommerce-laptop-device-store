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

    # Check if a review already exists for this user and product
    if Review.objects.filter(user=user, product=product).exists():
        return JsonResponse({'error': 'Bạn đã đánh giá sản phẩm này rồi và không thể chỉnh sửa.'}, status=400)

    # Combine title + comment
    full_comment = f"{title}\n{comment}".strip() if title else comment

    # Run sentiment analysis using our model
    from store.sentiment import SentimentAnalyzer
    sentiment_label, confidence = SentimentAnalyzer.analyze(full_comment, rating=rating)

    # Upsert — one review per user per product
    review, created = Review.objects.update_or_create(
        user=user,
        product=product,
        defaults={
            'rating': rating,
            'comment': full_comment,
            'sentiment': sentiment_label,
            'score_analysis': confidence,
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


# ─── GET /api/store/admin/reviews/  ──────────────────────────────
def admin_reviews_api(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Phương thức không hỗ trợ'}, status=405)

    user, err = _get_user(request)
    if err:
        return err

    # Require staff or superuser
    if not (user.is_staff or user.is_superuser):
        return JsonResponse({'error': 'Bạn không có quyền truy cập thông tin này'}, status=403)

    # Fetch all reviews sorted by date
    reviews = Review.objects.select_related('user', 'product').order_by('-review_date')
    
    serialized = []
    for r in reviews:
        serialized.append({
            'id': r.id,
            'user': r.user.get_full_name() or r.user.username,
            'content': r.comment or '',
            'rating': r.rating,
            'product_id': r.product.id,
            'target': r.product.name,
            'sentiment': r.sentiment or 'neutral',
            'time': r.review_date.strftime('%d/%m/%Y %H:%M') if r.review_date else '',
            'status': 'spam' if r.is_spam else 'approved',
        })

    return JsonResponse({'reviews': serialized})


# ─── GET /api/store/products/<pk>/sentiment-stats/  ──────────────
def product_sentiment_stats_api(request, pk):
    from django.db.models import Avg
    if request.method != 'GET':
        return JsonResponse({'error': 'Phương thức không hỗ trợ'}, status=405)

    user, err = _get_user(request)
    if err:
        return err

    # Require staff or superuser
    if not (user.is_staff or user.is_superuser):
        return JsonResponse({'error': 'Bạn không có quyền truy cập thông tin này'}, status=403)

    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Sản phẩm không tồn tại'}, status=404)

    reviews = Review.objects.filter(product=product, is_spam=False).order_by('-review_date')
    total_reviews = reviews.count()

    # Calculate sentiment distribution (Pie Chart)
    positive_count = reviews.filter(sentiment='positive').count()
    neutral_count = reviews.filter(sentiment='neutral').count()
    negative_count = reviews.filter(sentiment='negative').count()

    data_pie = [
        {'name': 'Tích cực', 'value': positive_count, 'color': '#10B981'},
        {'name': 'Trung tính', 'value': neutral_count, 'color': '#FBBF24'},
        {'name': 'Tiêu cực', 'value': negative_count, 'color': '#EF4444'},
    ]

    # Calculate sentiment trends (Trend Line Chart over last 7 days)
    from django.utils import timezone
    from datetime import timedelta
    
    data_trend = []
    today = timezone.localtime(timezone.now()).date()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_reviews = reviews.filter(review_date__date=day)
        day_total = day_reviews.count()
        if day_total > 0:
            pos_pct = round((day_reviews.filter(sentiment='positive').count() / day_total) * 100)
            neu_pct = round((day_reviews.filter(sentiment='neutral').count() / day_total) * 100)
            neg_pct = round((day_reviews.filter(sentiment='negative').count() / day_total) * 100)
        else:
            pos_pct, neu_pct, neg_pct = 0, 0, 0
            
        data_trend.append({
            'name': day.strftime('%d/%m'),
            'pos': pos_pct,
            'neu': neu_pct,
            'neg': neg_pct,
        })

    # Aspect analysis
    aspect_keywords = {
        'Hiệu năng': ['mạnh', 'mượt', 'lag', 'chậm', 'hiệu năng', 'game', 'fps', 'cpu', 'ryzen', 'intel', 'core', 'card', 'ram', 'ssd', 'đồ họa'],
        'Thiết kế': ['đẹp', 'xấu', 'thiết kế', 'mỏng', 'nhẹ', 'nhôm', 'vỏ', 'sang trọng', 'ngoại hình', 'chất liệu', 'bản lề'],
        'Màn hình': ['màn hình', 'độ phân giải', 'tần số quét', 'ips', 'oled', 'màu', 'sắc nét', '2k', '4k', 'hz', 'độ sáng', 'tấm nền'],
        'Tản nhiệt': ['nóng', 'quạt', 'tản nhiệt', 'ấm', 'nhiệt độ', 'cool', 'overheat'],
        'Pin': ['pin', 'sạc', 'dung lượng', 'tiếng', 'giờ', 'battery', 'adapter'],
        'Âm thanh': ['loa', 'âm thanh', 'volume', 'sound', 'nhạc', 'audio', 'bass'],
        'Giá cả': ['giá', 'tiền', 'tầm giá', 'đắt', 'rẻ', 'phù hợp', 'tiết kiệm', 'chi phí', 'mắc']
    }
    
    aspect_list = []
    product_avg = round(float(reviews.aggregate(avg=Avg('rating'))['avg'] or 0.0), 1) if total_reviews > 0 else 4.0
    
    for name, keywords in aspect_keywords.items():
        aspect_total_rating = 0
        aspect_mention_count = 0
        for r in reviews:
            comment_lower = (r.comment or '').lower()
            if any(kw in comment_lower for kw in keywords):
                aspect_total_rating += r.rating
                aspect_mention_count += 1
                
        score = round(aspect_total_rating / aspect_mention_count, 1) if aspect_mention_count > 0 else product_avg
        aspect_list.append({
            'name': name,
            'score': score,
            'count': aspect_mention_count,
        })

    # Extract keywords
    positive_kws = ['mạnh', 'mượt', 'đẹp', 'nhẹ', 'tốt', 'mát', 'rẻ', 'hài lòng', 'ưng ý', 'sắc nét']
    negative_kws = ['nóng', 'lag', 'yếu', 'chậm', 'đắt', 'mắc', 'ồn', 'tệ', 'lỗi', 'pin hụt']
    
    positive_keywords_list = []
    negative_keywords_list = []
    
    for kw in positive_kws:
        count = 0
        for r in reviews:
            if r.sentiment == 'positive' or r.rating >= 4:
                if kw in (r.comment or '').lower():
                    count += 1
        if count > 0:
            positive_keywords_list.append({'t': kw, 'c': count})
            
    for kw in negative_kws:
        count = 0
        for r in reviews:
            if r.sentiment == 'negative' or r.rating <= 2:
                if kw in (r.comment or '').lower():
                    count += 1
        if count > 0:
            negative_keywords_list.append({'t': kw, 'c': count})

    positive_keywords_list.sort(key=lambda x: x['c'], reverse=True)
    negative_keywords_list.sort(key=lambda x: x['c'], reverse=True)

    from store.views import _build_media_url
    serialized_reviews = []
    for r in reviews[:50]:
        serialized_reviews.append(_serialize_review(r, request))

    product_data = {
        'id': product.id,
        'name': product.name,
        'image': _build_media_url(request, product.image) if product.image else None,
        'price': product.sale_price or product.price or 0,
        'category_name': product.category.name if product.category else 'Laptop',
        'avg_rating': product_avg,
        'total_reviews': total_reviews,
    }

    return JsonResponse({
        'product': product_data,
        'dataPie': data_pie,
        'dataTrend': data_trend,
        'aspects': aspect_list,
        'positiveKeywords': positive_keywords_list[:5],
        'negativeKeywords': negative_keywords_list[:5],
        'reviews': serialized_reviews,
        'total': total_reviews,
    })

