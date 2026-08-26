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
# Query params (all optional, backward compatible):
#   rating  - filter to a single star value (1-5); omitted/"all" = no filter
#   limit   - page size, default 50, capped to 100
#   offset  - pagination offset, default 0
@require_GET
def product_reviews_api(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Sản phẩm không tồn tại'}, status=404)

    from django.db.models import Q
    current_user = None
    try:
        current_user = get_authenticated_user(request, raise_on_invalid_token=False)
    except Exception:
        pass

    if current_user and current_user.is_authenticated:
        reviews_filter = Q(is_spam=False) | Q(is_spam=True, user=current_user)
    else:
        reviews_filter = Q(is_spam=False)

    base_qs = (
        Review.objects
        .filter(product=product)
        .filter(reviews_filter)
        .select_related('user')
        .prefetch_related('images')
        .order_by('-review_date')
    )

    # Aggregate over the full (unfiltered-by-rating) set.
    total = base_qs.count()
    if total > 0:
        from django.db.models import Avg, Count, Q
        agg = base_qs.aggregate(
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

    qs = base_qs
    rating_param = request.GET.get('rating')
    if rating_param and rating_param != 'all':
        try:
            rating_val = int(rating_param)
        except (TypeError, ValueError):
            rating_val = None
        if rating_val in (1, 2, 3, 4, 5):
            qs = qs.filter(rating=rating_val)

    filtered_total = breakdown[rating_val] if rating_param and rating_param != 'all' and rating_val in (1, 2, 3, 4, 5) else total

    try:
        limit = int(request.GET.get('limit', 50))
    except (TypeError, ValueError):
        limit = 50
    limit = max(1, min(limit, 100))
    try:
        offset = int(request.GET.get('offset', 0))
    except (TypeError, ValueError):
        offset = 0
    offset = max(0, offset)

    page = list(qs[offset:offset + limit])

    return JsonResponse({
        'product_id': pk,
        'total': total,
        'filtered_total': filtered_total,
        'avg_rating': avg_rating,
        'breakdown': breakdown,
        'reviews': [_serialize_review(r, request) for r in page],
        'has_more': offset + len(page) < filtered_total,
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

    try:
        if product_id is not None:
            product_id = int(product_id)
        if rating is not None:
            rating = int(rating)
    except (ValueError, TypeError):
        return JsonResponse({'error': 'Dữ liệu product_id hoặc rating không hợp lệ'}, status=400)

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

    if Review.objects.filter(user=user, product=product).exists():
        return JsonResponse({'error': 'Bạn đã đánh giá sản phẩm này rồi và không thể chỉnh sửa.'}, status=400)

    full_comment = f"{title}\n{comment}".strip() if title else comment

    from store.sentiment import SentimentAnalyzer
    sentiment_label, confidence = SentimentAnalyzer.analyze(full_comment, rating=rating)

    from store.spam_detective import isSpam
    is_spam_detected = isSpam(full_comment)

    # One review per user per product
    review, created = Review.objects.update_or_create(
        user=user,
        product=product,
        defaults={
            'rating': rating,
            'comment': full_comment,
            'sentiment': sentiment_label,
            'score_analysis': confidence,
            'review_date': timezone.now(),
            'is_spam': is_spam_detected,
        }
    )

    uploaded_files = request.FILES.getlist('images') or request.FILES.getlist('image')
    if uploaded_files:
        for file in uploaded_files[:5]:
            if file.size > MAX_REVIEW_IMAGE_SIZE:
                return JsonResponse({'error': f'Kích thước ảnh "{file.name}" vượt quá 5MB'}, status=400)
        if not created:
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

    from django.db.models import Q
    from django.core.paginator import Paginator
    search = request.GET.get('search', '').strip()
    status_filter = request.GET.get('status', 'all').strip()

    reviews = Review.objects.select_related('user', 'product')

    if status_filter == 'approved':
        reviews = reviews.filter(is_spam=False)
    elif status_filter == 'spam':
        reviews = reviews.filter(is_spam=True)

    if search:
        reviews = reviews.filter(
            Q(user__username__icontains=search) |
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search) |
            Q(comment__icontains=search) |
            Q(product__name__icontains=search)
        )

    reviews = reviews.order_by('-review_date', '-id')

    try:
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
    except ValueError:
        page, limit = 1, 10

    paginator = Paginator(reviews, limit)
    page_obj = paginator.get_page(page)

    serialized = []
    for r in page_obj.object_list:
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

    return JsonResponse({
        'count': paginator.count,
        'total_pages': paginator.num_pages,
        'page': page_obj.number,
        'limit': limit,
        'results': serialized
    }, json_dumps_params={'ensure_ascii': False})


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


# ─── GET /api/store/admin/sentiment-stats/ ────────────────────────
def global_sentiment_stats_api(request):
    from django.db.models import Avg, Count, Q
    from django.utils import timezone
    from datetime import timedelta
    from store.views import _build_media_url

    if request.method != 'GET':
        return JsonResponse({'error': 'Phương thức không hỗ trợ'}, status=405)

    user, err = _get_user(request)
    if err:
        return err

    # Require staff or superuser
    if not (user.is_staff or user.is_superuser):
        return JsonResponse({'error': 'Bạn không có quyền truy cập thông tin này'}, status=403)

    reviews = Review.objects.filter(is_spam=False)
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

    # Products list with sentiment breakdown
    products = (
        Product.objects
        .annotate(
            total_reviews=Count('review', filter=Q(review__is_spam=False)),
            avg_rating=Avg('review__rating', filter=Q(review__is_spam=False)),
            pos_count=Count('review', filter=Q(review__sentiment='positive', review__is_spam=False)),
            neu_count=Count('review', filter=Q(review__sentiment='neutral', review__is_spam=False)),
            neg_count=Count('review', filter=Q(review__sentiment='negative', review__is_spam=False)),
        )
        .filter(total_reviews__gt=0)
        .order_by('-total_reviews')
    )

    serialized_products = []
    for p in products:
        total = p.total_reviews
        serialized_products.append({
            'id': p.id,
            'name': p.name,
            'image': _build_media_url(request, p.image) if p.image else None,
            'total_reviews': total,
            'avg_rating': round(float(p.avg_rating or 0.0), 1),
            'positive_percent': round((p.pos_count / total) * 100) if total > 0 else 0,
            'neutral_percent': round((p.neu_count / total) * 100) if total > 0 else 0,
            'negative_percent': round((p.neg_count / total) * 100) if total > 0 else 0,
        })

    return JsonResponse({
        'total_reviews': total_reviews,
        'dataPie': data_pie,
        'dataTrend': data_trend,
        'products': serialized_products,
    })


# ─── PUT/DELETE /api/store/admin/reviews/<pk>/  ───────────────────
@csrf_exempt
def admin_review_detail_api(request, pk):
    if request.method not in ('PUT', 'DELETE'):
        return JsonResponse({'error': 'Phương thức không hỗ trợ'}, status=405)

    user, err = _get_user(request)
    if err:
        return err

    # Require staff or superuser
    if not (user.is_staff or user.is_superuser):
        return JsonResponse({'error': 'Bạn không có quyền truy cập thông tin này'}, status=403)

    try:
        review = Review.objects.get(pk=pk)
    except Review.DoesNotExist:
        return JsonResponse({'error': 'Bình luận không tồn tại'}, status=404)

    if request.method == 'PUT':
        try:
            body = json.loads(request.body)
            is_spam = body.get('is_spam')
            if is_spam is not None:
                review.is_spam = bool(is_spam)
                review.save()
            return JsonResponse({'success': True, 'message': 'Cập nhật bình luận thành công'})
        except Exception as e:
            return JsonResponse({'error': 'Dữ liệu không hợp lệ'}, status=400)

    elif request.method == 'DELETE':
        review.delete()
        return JsonResponse({'success': True, 'message': 'Xóa bình luận thành công'})


# ─── GET /api/store/products/<pk>/public-sentiment/  ──────────────
@require_GET
def product_public_sentiment_api(request, pk):
    """
    Endpoint công khai (không yêu cầu xác thực).
    Trả về tổng hợp cảm xúc sản phẩm cho người dùng thông thường.
    Sử dụng Composite Sentiment Score: S = 0.6 × S_sentiment + 0.4 × S_rating
    """
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Sản phẩm không tồn tại'}, status=404)

    from django.db.models import Avg, Count, Q

    reviews = Review.objects.filter(product=product, is_spam=False)
    total = reviews.count()

    if total == 0:
        return JsonResponse({'has_data': False, 'total': 0})

    agg = reviews.aggregate(
        avg_rating=Avg('rating'),
        pos_count=Count('id', filter=Q(sentiment='positive')),
        neu_count=Count('id', filter=Q(sentiment='neutral')),
        neg_count=Count('id', filter=Q(sentiment='negative')),
    )

    pos_count = agg['pos_count'] or 0
    neu_count = agg['neu_count'] or 0
    neg_count = agg['neg_count'] or 0
    avg_rating = float(agg['avg_rating'] or 3.0)

    # ── Composite Sentiment Score (S₃) ──────────────────────────────
    # S_sentiment ∈ [-1, +1]: tỷ lệ tích cực - tiêu cực
    s_sentiment = (pos_count - neg_count) / total
    # S_rating ∈ [-1, +1]: chuẩn hoá rating 1–5 sao về [-1, +1]
    s_rating = (avg_rating - 3.0) / 2.0
    # Trọng số: 60% AI text analysis, 40% star rating
    score = 0.6 * s_sentiment + 0.4 * s_rating

    # ── Ánh xạ sang nhãn ────────────────────────────────────────────
    if score >= 0.6:
        label = 'very_positive'
        label_vn = 'Rất hài lòng'
        description = 'Phần lớn khách hàng rất hài lòng về sản phẩm này.'
        color = 'green'
    elif score >= 0.25:
        label = 'positive'
        label_vn = 'Hài lòng'
        description = 'Đa số khách hàng hài lòng và có trải nghiệm tốt với sản phẩm.'
        color = 'green'
    elif score >= -0.25:
        label = 'neutral'
        label_vn = 'Trung lập'
        description = 'Ý kiến khách hàng tương đối cân bằng về sản phẩm.'
        color = 'gray'
    elif score >= -0.6:
        label = 'negative'
        label_vn = 'Không hài lòng'
        description = 'Một số khách hàng cảm thấy chưa hài lòng về sản phẩm.'
        color = 'red'
    else:
        label = 'very_negative'
        label_vn = 'Rất không hài lòng'
        description = 'Nhiều khách hàng không hài lòng về sản phẩm.'
        color = 'red'

    # ── Mức tin cậy dựa trên số lượng review ────────────────────────
    if total >= 50:
        confidence_level = 'high'
        confidence_label = 'Cao'
    elif total >= 15:
        confidence_level = 'medium'
        confidence_label = 'Trung bình'
    elif total >= 5:
        confidence_level = 'low'
        confidence_label = 'Thấp'
    else:
        confidence_level = 'very_low'
        confidence_label = 'Rất thấp'

    # ── Trích xuất từ khoá nổi bật ───────────────────────────────────
    positive_kw_list = ['mạnh', 'mượt', 'đẹp', 'nhẹ', 'tốt', 'mát', 'hài lòng', 'sắc nét', 'nhanh', 'bền', 'ổn định']
    negative_kw_list = ['nóng', 'lag', 'chậm', 'đắt', 'mắc', 'ồn', 'tệ', 'lỗi', 'pin hụt', 'nặng', 'kém']

    all_reviews_data = list(reviews.values('sentiment', 'comment', 'rating'))

    pos_keywords = []
    neg_keywords = []

    for kw in positive_kw_list:
        count = sum(
            1 for r in all_reviews_data
            if r['sentiment'] == 'positive' and kw in (r['comment'] or '').lower()
        )
        if count > 0:
            pos_keywords.append({'keyword': kw, 'count': count})

    for kw in negative_kw_list:
        count = sum(
            1 for r in all_reviews_data
            if r['sentiment'] == 'negative' and kw in (r['comment'] or '').lower()
        )
        if count > 0:
            neg_keywords.append({'keyword': kw, 'count': count})

    pos_keywords.sort(key=lambda x: -x['count'])
    neg_keywords.sort(key=lambda x: -x['count'])

    return JsonResponse({
        'has_data': True,
        'total': total,
        'avg_rating': round(avg_rating, 1),
        'distribution': {
            'positive': {
                'count': pos_count,
                'percent': round(pos_count / total * 100),
            },
            'neutral': {
                'count': neu_count,
                'percent': round(neu_count / total * 100),
            },
            'negative': {
                'count': neg_count,
                'percent': round(neg_count / total * 100),
            },
        },
        'overall': {
            'label': label,
            'label_vn': label_vn,
            'score': round(score, 3),
            'description': description,
            'color': color,
            'confidence_level': confidence_level,
            'confidence_label': confidence_label,
        },
        'keywords': {
            'positive': pos_keywords[:5],
            'negative': neg_keywords[:5],
        },
        'ai_disclaimer': 'Kết quả phân tích được thực hiện bởi mô hình AI DistilPhoBERT, có thể không phản ánh chính xác 100% nội dung bình luận.',
    }, json_dumps_params={'ensure_ascii': False})
