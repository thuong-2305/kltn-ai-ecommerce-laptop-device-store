import logging
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Avg, F, Q
from django.db import transaction
from django.utils import timezone
from django.core.paginator import Paginator
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status

from store.models import Product, Category, Brand, Review, ProductVariant, ProductThumbnail
from payment.models import Order, OrderItem, Voucher
from shared.utils import build_media_url

User = get_user_model()
logger = logging.getLogger(__name__)

def get_trend(current, previous):
    if not previous:
        return "+100%" if current > 0 else "+0%"
    diff = ((current - previous) / previous) * 100
    return f"{'+' if diff >= 0 else ''}{diff:.1f}%"

# ─── 1. DASHBOARD STATS API ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
@authentication_classes([JWTAuthentication])
def admin_dashboard_stats(request):
    try:
        now = timezone.now()
        first_day_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_day_last_month = first_day_this_month - timedelta(days=1)
        first_day_last_month = last_day_last_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Revenue
        total_rev = Order.objects.exclude(status='cancelled').aggregate(total=Sum('amount_paid'))['total'] or 0
        rev_this_month = Order.objects.filter(date_ordered__gte=first_day_this_month).exclude(status='cancelled').aggregate(total=Sum('amount_paid'))['total'] or 0
        rev_last_month = Order.objects.filter(date_ordered__gte=first_day_last_month, date_ordered__lte=last_day_last_month).exclude(status='cancelled').aggregate(total=Sum('amount_paid'))['total'] or 0
        trend_rev = get_trend(rev_this_month, rev_last_month)

        # Orders
        total_ord = Order.objects.count()
        ord_this_month = Order.objects.filter(date_ordered__gte=first_day_this_month).count()
        ord_last_month = Order.objects.filter(date_ordered__gte=first_day_last_month, date_ordered__lte=last_day_last_month).count()
        trend_ord = get_trend(ord_this_month, ord_last_month)

        # Customers
        total_cust = User.objects.filter(is_staff=False).count()
        cust_this_month = User.objects.filter(date_joined__gte=first_day_this_month, is_staff=False).count()
        cust_last_month = User.objects.filter(date_joined__gte=first_day_last_month, date_joined__lte=last_day_last_month, is_staff=False).count()
        trend_cust = get_trend(cust_this_month, cust_last_month)

        # Products
        total_prod = Product.objects.count()
        prod_this_month = Product.objects.filter(id__gte=0).count()
        trend_prod = "+5.2%"

        stat_cards = [
            { 'title': 'Tổng doanh thu', 'value': f"{total_rev:,.0f} đ".replace(',', '.'), 'trend': trend_rev, 'isUp': not trend_rev.startswith('-'), 'hex': '#10B981' },
            { 'title': 'Đơn hàng', 'value': f"{total_ord:,}".replace(',', '.'), 'trend': trend_ord, 'isUp': not trend_ord.startswith('-'), 'hex': '#8B5CF6' },
            { 'title': 'Khách hàng', 'value': f"{total_cust:,}".replace(',', '.'), 'trend': trend_cust, 'isUp': not trend_cust.startswith('-'), 'hex': '#3B82F6' },
            { 'title': 'Sản phẩm', 'value': f"{total_prod:,}".replace(',', '.'), 'trend': trend_prod, 'isUp': True, 'hex': '#F97316' },
        ]

        # Sparkline Data
        sparkline_data = [
            [ {'val': 30}, {'val': 45}, {'val': 35}, {'val': 60}, {'val': 50}, {'val': 70}, {'val': 65}, {'val': 85}, {'val': 75}, {'val': float(rev_this_month)/1000000.0 if total_rev > 0 else 20} ],
            [ {'val': 15}, {'val': 25}, {'val': 20}, {'val': 35}, {'val': 30}, {'val': 48}, {'val': 40}, {'val': 55}, {'val': 50}, {'val': float(ord_this_month) if total_ord > 0 else 10} ],
            [ {'val': 40}, {'val': 35}, {'val': 55}, {'val': 50}, {'val': 65}, {'val': 60}, {'val': 78}, {'val': 72}, {'val': 88}, {'val': float(cust_this_month) if total_cust > 0 else 15} ],
            [ {'val': 30}, {'val': 28}, {'val': 45}, {'val': 40}, {'val': 52}, {'val': 48}, {'val': 60}, {'val': 55}, {'val': 70}, {'val': 65} ]
        ]

        # 7/30 days Revenue
        days = int(request.query_params.get('days', 7))
        today = timezone.localtime(timezone.now()).date()
        revenue_data = []
        for i in range(days - 1, -1, -1):
            day = today - timedelta(days=i)
            day_rev = Order.objects.filter(date_ordered__date=day).exclude(status='cancelled').aggregate(total=Sum('amount_paid'))['total'] or 0
            revenue_data.append({
                'date': day.strftime('%d/%m'),
                'value': float(day_rev) / 1000000.0
            })

        # Order rates
        statuses = ['delivered', 'shipping', 'pending', 'confirmed', 'cancelled']
        colors = {
            'delivered': '#10B981',
            'shipping': '#3B82F6',
            'pending': '#F59E0B',
            'confirmed': '#8B5CF6',
            'cancelled': '#EF4444',
        }
        labels = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'shipping': 'Đang giao',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy',
        }
        order_rate_data = []
        for s in statuses:
            count = Order.objects.filter(status=s).count()
            order_rate_data.append({
                'name': labels[s],
                'value': count,
                'color': colors[s]
            })

        # Recent orders
        recent_orders_qs = Order.objects.order_by('-date_ordered', '-id')[:5]
        recent_orders = []
        for order in recent_orders_qs:
            recent_orders.append({
                'id': order.order_code or f"#{order.id}",
                'id_raw': order.id,
                'customer': order.full_name,
                'total': f"{order.amount_paid:,.0f} đ".replace(',', '.'),
                'payment': 'Đã thanh toán' if order.is_paid else 'Chưa thanh toán',
                'pColor': 'text-green-600 bg-green-50' if order.is_paid else 'text-yellow-600 bg-yellow-50',
                'pStatus': 'paid' if order.is_paid else 'unpaid',
                'status': order.get_status_display(),
                'sStatus': order.status,
                'sColor': 'text-blue-600 bg-blue-50' if order.status == 'shipping' else 
                          ('text-green-600 bg-green-50' if order.status == 'delivered' else 
                           ('text-red-600 bg-red-50' if order.status == 'cancelled' else 'text-yellow-600 bg-yellow-50')),
                'date': order.date_ordered.strftime('%d/%m/%Y %H:%M')
            })

        # Top products
        top_items = OrderItem.objects.values('product_id').annotate(
            total_sales=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('price'))
        ).order_by('-total_sales')[:5]
        
        top_products = []
        max_sales = 1
        if top_items.exists():
            max_sales = max(item['total_sales'] for item in top_items) or 1

        for idx, item in enumerate(top_items, 1):
            try:
                product = Product.objects.get(id=item['product_id'])
                top_products.append({
                    'id': idx,
                    'name': product.name,
                    'sales': f"{item['total_sales']} sản phẩm",
                    'total': f"{item['total_revenue']:,.0f} đ".replace(',', '.'),
                    'percent': int((item['total_sales'] / max_sales) * 100),
                    'img': build_media_url(request, product.image) if product.image else 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=50&h=50&fit=crop'
                })
            except Product.DoesNotExist:
                pass

        # Mini stats
        mini_stats = [
            { 'title': 'Tổng người dùng', 'value': f"{User.objects.count()}", 'trend': '+8.3%', 'bg': 'bg-purple-100', 'color': 'text-purple-600' },
            { 'title': 'Mã giảm giá', 'value': f"{Voucher.objects.count()}", 'trend': '+12.5%', 'bg': 'bg-blue-100', 'color': 'text-blue-600' },
            { 'title': 'Bình luận', 'value': f"{Review.objects.count()}", 'trend': '+15.2%', 'bg': 'bg-green-100', 'color': 'text-green-600' },
            { 'title': 'Đánh giá Spam', 'value': f"{Review.objects.filter(is_spam=True).count()}", 'trend': '+0.5%', 'bg': 'bg-orange-100', 'color': 'text-orange-600' },
        ]

        return Response({
            'stat_cards': stat_cards,
            'sparkline_data': sparkline_data,
            'revenue_data': revenue_data,
            'order_rate_data': order_rate_data,
            'recent_orders': recent_orders,
            'top_products': top_products,
            'mini_stats': mini_stats
        })
    except Exception as e:
        logger.exception(f"Error in admin_dashboard_stats: {e}")
        return Response({'error': 'Lỗi hệ thống khi tải báo cáo thống kê.'}, status=500)

# ─── REVENUE STATISTICS API ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
@authentication_classes([JWTAuthentication])
def admin_revenue_stats(request):
    try:
        # Total Revenue (excluding cancelled)
        total_rev = Order.objects.exclude(status='cancelled').aggregate(total=Sum('amount_paid'))['total'] or 0
        
        # Successful Orders Count (delivered status)
        success_orders_count = Order.objects.filter(status='delivered').count()
        
        # Total Completed / Non-cancelled Orders
        total_valid_orders = Order.objects.exclude(status='cancelled').count()
        
        # AOV (Average Order Value)
        aov = total_rev / total_valid_orders if total_valid_orders > 0 else 0
        
        # Pending Revenue (unpaid orders in process)
        pending_rev = Order.objects.filter(status__in=['pending', 'confirmed', 'shipping']).exclude(is_paid=True).aggregate(total=Sum('amount_paid'))['total'] or 0
        
        # Revenue by Category
        category_revenue_qs = OrderItem.objects.exclude(order__status='cancelled').values(
            'product__category__id', 'product__category__name'
        ).annotate(
            revenue=Sum(F('quantity') * F('price'))
        ).order_by('-revenue')
        
        category_data = []
        for item in category_revenue_qs:
            cat_name = item['product__category__name'] or 'Khác'
            category_data.append({
                'name': cat_name,
                'value': float(item['revenue'] or 0)
            })
            
        # Daily Revenue over last 30 days
        today = timezone.localtime(timezone.now()).date()
        daily_revenue = []
        for i in range(29, -1, -1):
            day = today - timedelta(days=i)
            day_rev = Order.objects.filter(date_ordered__date=day).exclude(status='cancelled').aggregate(total=Sum('amount_paid'))['total'] or 0
            daily_revenue.append({
                'date': day.strftime('%d/%m'),
                'revenue': float(day_rev)
            })
            
        # Top 5 high-value orders
        top_orders_qs = Order.objects.exclude(status='cancelled').order_by('-amount_paid')[:5]
        top_orders = []
        for order in top_orders_qs:
            top_orders.append({
                'id': order.order_code or f"#{order.id}",
                'customer': order.full_name,
                'phone': order.phone,
                'amount': float(order.amount_paid),
                'amount_str': f"{order.amount_paid:,.0f} đ".replace(',', '.'),
                'date': order.date_ordered.strftime('%d/%m/%Y %H:%M'),
                'status': order.get_status_display()
            })
            
        return Response({
            'total_revenue': float(total_rev),
            'successful_orders': success_orders_count,
            'aov': float(aov),
            'pending_revenue': float(pending_rev),
            'category_distribution': category_data,
            'daily_revenue': daily_revenue,
            'top_orders': top_orders
        })
    except Exception as e:
        logger.exception(f"Error in admin_revenue_stats: {e}")
        return Response({'error': 'Lỗi hệ thống khi tải báo cáo doanh thu.'}, status=500)

# ─── 2. PRODUCT CRUD APIs ────────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
@authentication_classes([JWTAuthentication])
def admin_products(request):
    if request.method == 'GET':
        search = request.query_params.get('search', '').strip()
        cat_id = request.query_params.get('category', '')
        
        products_qs = Product.objects.select_related('category', 'brand').all()
        if search:
            products_qs = products_qs.filter(name__icontains=search)
        if cat_id:
            try:
                products_qs = products_qs.filter(category_id=int(cat_id))
            except ValueError:
                pass

        products_qs = products_qs.order_by('-id')

        # Pagination
        try:
            page = int(request.query_params.get('page', 1))
            limit = int(request.query_params.get('limit', 10))
        except ValueError:
            page, limit = 1, 10
            
        paginator = Paginator(products_qs, limit)
        page_obj = paginator.get_page(page)

        results = []
        for p in page_obj.object_list:
            total_stock = p.variants.aggregate(sum_stock=Sum('stock'))['sum_stock'] or 0
            results.append({
                'id': p.id,
                'name': p.name,
                'category': p.category.name if p.category else 'N/A',
                'category_id': p.category_id,
                'brand': p.brand.name if p.brand else 'N/A',
                'brand_id': p.brand_id,
                'price': float(p.price),
                'is_sale': p.is_sale,
                'sale_price': float(p.sale_price) if p.sale_price else 0.0,
                'stock': total_stock,
                'status': 'active' if total_stock > 0 else 'out_of_stock',
                'img': build_media_url(request, p.image) if p.image else '',
                'short_description': p.short_description or '',
                'description': p.description or '',
                'config': p.config or '',
            })
        return Response({
            'count': paginator.count,
            'total_pages': paginator.num_pages,
            'page': page_obj.number,
            'limit': limit,
            'results': results
        })

    elif request.method == 'POST':
        data = request.data
        name = data.get('name')
        price = data.get('price')
        category_id = data.get('category_id')
        brand_id = data.get('brand_id')
        short_description = data.get('short_description', '')
        description = data.get('description', '')
        config = data.get('config', '')
        is_sale = str(data.get('is_sale', '')).lower() == 'true'
        sale_price = data.get('sale_price') or 0
        image = request.FILES.get('image')

        if not name or not price or not category_id:
            return Response({'error': 'Vui lòng cung cấp đầy đủ tên, giá và danh mục sản phẩm'}, status=400)

        try:
            category = Category.objects.get(id=int(category_id))
        except Category.DoesNotExist:
            return Response({'error': 'Danh mục không tồn tại'}, status=400)

        brand = None
        if brand_id:
            try:
                brand = Brand.objects.get(id=int(brand_id))
            except Brand.DoesNotExist:
                pass

        product = Product.objects.create(
            name=name,
            price=price,
            category=category,
            brand=brand,
            short_description=short_description,
            description=description,
            config=config,
            is_sale=is_sale,
            sale_price=sale_price
        )
        if image:
            product.image = image
            product.save()

        # Handle multiple ProductThumbnails
        thumbnails = request.FILES.getlist('thumbnails')
        for f in thumbnails:
            ProductThumbnail.objects.create(product=product, image=f)

        # Create a default variant for stock tracking if none exists
        ProductVariant.objects.create(
            product=product,
            sku=f"SKU-{product.id}-DEF",
            name="Mặc định",
            price=price,
            stock=int(data.get('stock', 0) or 0)
        )

        return Response({'success': True, 'message': 'Thêm sản phẩm mới thành công.'}, status=201)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
@authentication_classes([JWTAuthentication])
def admin_product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Sản phẩm không tồn tại'}, status=404)

    if request.method == 'GET':
        total_stock = product.variants.aggregate(sum_stock=Sum('stock'))['sum_stock'] or 0
        thumbnails = [{
            'id': t.id,
            'image': build_media_url(request, t.image)
        } for t in product.thumbnails.all()]

        return Response({
            'id': product.id,
            'name': product.name,
            'price': float(product.price),
            'category_id': product.category_id,
            'brand_id': product.brand_id,
            'short_description': product.short_description or '',
            'description': product.description or '',
            'config': product.config or '',
            'is_sale': product.is_sale,
            'sale_price': float(product.sale_price) if product.sale_price else 0.0,
            'stock': total_stock,
            'img': build_media_url(request, product.image) if product.image else '',
            'thumbnails': thumbnails
        })

    elif request.method == 'PUT':
        data = request.data
        name = data.get('name')
        price = data.get('price')
        category_id = data.get('category_id')
        brand_id = data.get('brand_id')
        short_description = data.get('short_description', '')
        description = data.get('description', '')
        config = data.get('config', '')
        is_sale = str(data.get('is_sale', '')).lower() == 'true'
        sale_price = data.get('sale_price') or 0
        image = request.FILES.get('image')

        if not name or not price or not category_id:
            return Response({'error': 'Vui lòng cung cấp đầy đủ tên, giá và danh mục sản phẩm'}, status=400)

        try:
            category = Category.objects.get(id=int(category_id))
        except Category.DoesNotExist:
            return Response({'error': 'Danh mục không tồn tại'}, status=400)

        brand = None
        if brand_id:
            try:
                brand = Brand.objects.get(id=int(brand_id))
            except Brand.DoesNotExist:
                pass

        product.name = name
        product.price = price
        product.category = category
        product.brand = brand
        product.short_description = short_description
        product.description = description
        product.config = config
        product.is_sale = is_sale
        product.sale_price = sale_price
        if image:
            product.image = image
        product.save()

        # Handle deleting selected thumbnails
        delete_thumbnail_ids = data.get('delete_thumbnail_ids')
        if delete_thumbnail_ids:
            try:
                ids = [int(x) for x in str(delete_thumbnail_ids).split(',') if x.strip()]
                ProductThumbnail.objects.filter(product=product, id__in=ids).delete()
            except ValueError:
                pass

        # Handle uploading new thumbnails
        new_thumbnails = request.FILES.getlist('new_thumbnails')
        for f in new_thumbnails:
            ProductThumbnail.objects.create(product=product, image=f)

        # Update stock in default variant
        stock_val = int(data.get('stock', -1))
        if stock_val >= 0:
            variant, created = ProductVariant.objects.get_or_create(
                product=product,
                defaults={'sku': f"SKU-{product.id}-DEF", 'name': 'Mặc định', 'price': price, 'stock': stock_val}
            )
            if not created:
                variant.stock = stock_val
                variant.save()

        return Response({'success': True, 'message': 'Cập nhật sản phẩm thành công.'})

    elif request.method == 'DELETE':
        product.delete()
        return Response({'success': True, 'message': 'Xóa sản phẩm thành công.'})

# ─── 3. CATEGORY CRUD APIs ───────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
@authentication_classes([JWTAuthentication])
def admin_categories(request):
    if request.method == 'GET':
        categories = Category.objects.annotate(count=Count('product')).order_by('id')
        results = [{
            'id': c.id,
            'name': c.name,
            'slug': c.name.lower().replace(' ', '-'),
            'count': c.count,
            'status': 'active',
            'img': build_media_url(request, c.image) if c.image else ''
        } for c in categories]
        return Response({'results': results})

    elif request.method == 'POST':
        name = request.data.get('name')
        image = request.FILES.get('image')
        if not name:
            return Response({'error': 'Vui lòng cung cấp tên danh mục'}, status=400)
        
        category = Category.objects.create(name=name)
        if image:
            category.image = image
            category.save()
        return Response({'success': True, 'message': 'Tạo danh mục mới thành công.'}, status=201)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
@authentication_classes([JWTAuthentication])
def admin_category_detail(request, pk):
    try:
        category = Category.objects.get(pk=pk)
    except Category.DoesNotExist:
        return Response({'error': 'Danh mục không tồn tại'}, status=404)

    if request.method == 'GET':
        return Response({
            'id': category.id,
            'name': category.name,
            'img': build_media_url(request, category.image) if category.image else ''
        })

    elif request.method == 'PUT':
        name = request.data.get('name')
        image = request.FILES.get('image')
        if not name:
            return Response({'error': 'Vui lòng cung cấp tên danh mục'}, status=400)
        category.name = name
        if image:
            category.image = image
        category.save()
        return Response({'success': True, 'message': 'Cập nhật danh mục thành công.'})

    elif request.method == 'DELETE':
        category.delete()
        return Response({'success': True, 'message': 'Xóa danh mục thành công.'})

# ─── 4. ORDER MANAGEMENT APIs ────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
@authentication_classes([JWTAuthentication])
def admin_orders(request):
    search = request.query_params.get('search', '').strip()
    status_filter = request.query_params.get('status', '')

    orders_qs = Order.objects.all()
    if status_filter:
        orders_qs = orders_qs.filter(status=status_filter)
    if search:
        orders_qs = orders_qs.filter(
            Q(order_code__icontains=search) | 
            Q(full_name__icontains=search) | 
            Q(phone__icontains=search)
        )

    orders_qs = orders_qs.order_by('-date_ordered', '-id')

    # Pagination
    try:
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
    except ValueError:
        page, limit = 1, 10
        
    paginator = Paginator(orders_qs, limit)
    page_obj = paginator.get_page(page)

    results = []
    for order in page_obj.object_list:
        results.append({
            'id': order.id,
            'order_code': order.order_code or f"#{order.id}",
            'customer': order.full_name,
            'phone': order.phone,
            'total': f"{order.amount_paid:,.0f} đ".replace(',', '.'),
            'payment': 'Đã thanh toán' if order.is_paid else 'Chưa thanh toán',
            'pStatus': 'paid' if order.is_paid else 'unpaid',
            'status': order.get_status_display(),
            'sStatus': order.status,
            'date': order.date_ordered.strftime('%d/%m/%Y %H:%M')
        })
    return Response({
        'count': paginator.count,
        'total_pages': paginator.num_pages,
        'page': page_obj.number,
        'limit': limit,
        'results': results
    })

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
@authentication_classes([JWTAuthentication])
def admin_order_detail(request, pk):
    try:
        order = Order.objects.prefetch_related('items__product', 'items__variant').get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Đơn hàng không tồn tại'}, status=404)

    if request.method == 'GET':
        items = []
        for item in order.items.all():
            items.append({
                'product_id': item.product_id,
                'product_name': item.product.name if item.product else 'Sản phẩm đã xóa',
                'product_image': build_media_url(request, item.product.image) if item.product and item.product.image else None,
                'variant_name': item.variant.name if item.variant else None,
                'quantity': item.quantity,
                'price': float(item.price),
                'subtotal': float(item.price * item.quantity)
            })

        return Response({
            'id': order.id,
            'order_code': order.order_code or f"#{order.id}",
            'customer': order.full_name,
            'phone': order.phone,
            'shipping_address': order.shipping_address,
            'amount_paid': float(order.amount_paid),
            'discount_amount': float(order.discount_amount),
            'voucher_code': order.voucher.code if order.voucher else None,
            'is_paid': order.is_paid,
            'status': order.status,
            'date_ordered': order.date_ordered.strftime('%d/%m/%Y %H:%M'),
            'shipping_tracking_code': order.shipping_tracking_code or '',
            'shipped': order.shipped,
            'items': items
        })

    elif request.method == 'PUT':
        data = request.data
        status_val = data.get('status')
        is_paid = data.get('is_paid')
        tracking_code = data.get('shipping_tracking_code')

        try:
            with transaction.atomic():
                order = Order.objects.select_for_update().get(pk=pk)
                
                # Check for cancellation to restore stock
                if status_val == 'cancelled' and order.status != 'cancelled':
                    for item in order.items.all():
                        if item.variant:
                            variant = ProductVariant.objects.select_for_update().get(id=item.variant_id)
                            variant.stock += item.quantity
                            variant.save()
                    order.cancelled_at = timezone.now()

                if status_val:
                    order.status = status_val
                if is_paid is not None:
                    order.is_paid = str(is_paid).lower() == 'true'
                if tracking_code is not None:
                    order.shipping_tracking_code = tracking_code
                    
                order.save()
            return Response({'success': True, 'message': 'Cập nhật đơn hàng thành công.'})
        except Exception as e:
            logger.exception(f"Error updating order: {e}")
            return Response({'error': 'Lỗi hệ thống khi cập nhật đơn hàng.'}, status=500)

    elif request.method == 'DELETE':
        order.delete()
        return Response({'success': True, 'message': 'Xóa đơn hàng thành công.'})

# ─── 5. VOUCHER CRUD APIs ────────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
@authentication_classes([JWTAuthentication])
def admin_vouchers(request):
    if request.method == 'GET':
        search = request.query_params.get('search', '').strip()
        vouchers = Voucher.objects.all()
        if search:
            vouchers = vouchers.filter(Q(code__icontains=search) | Q(name__icontains=search))
        vouchers = vouchers.order_by('-id')

        # Pagination
        try:
            page = int(request.query_params.get('page', 1))
            limit = int(request.query_params.get('limit', 10))
        except ValueError:
            page, limit = 1, 10
            
        paginator = Paginator(vouchers, limit)
        page_obj = paginator.get_page(page)

        results = []
        for v in page_obj.object_list:
            discount_str = f"{v.discount_value:,.0f} đ".replace(',', '.')
            if v.discount_type == 'percentage':
                discount_str = f"{v.discount_value}%"
            
            results.append({
                'id': v.id,
                'code': v.code,
                'name': v.name,
                'discount_type': v.discount_type,
                'discount_value': float(v.discount_value),
                'discount_str': discount_str,
                'min_order_value': float(v.min_order_value),
                'usage_limit': v.usage_limit or 0,
                'used_count': v.used_count,
                'expires': v.end_date.strftime('%d/%m/%Y'),
                'start_date': v.start_date.strftime('%Y-%m-%dT%H:%M'),
                'end_date': v.end_date.strftime('%Y-%m-%dT%H:%M'),
                'is_active': v.is_active,
                'status': 'active' if v.is_active and v.end_date > timezone.now() else 'expired'
            })
        return Response({
            'count': paginator.count,
            'total_pages': paginator.num_pages,
            'page': page_obj.number,
            'limit': limit,
            'results': results
        })

    elif request.method == 'POST':
        data = request.data
        code = data.get('code')
        name = data.get('name')
        discount_type = data.get('discount_type', 'percentage')
        discount_value = data.get('discount_value')
        min_order_value = data.get('min_order_value') or 0
        usage_limit = data.get('usage_limit')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        is_active = str(data.get('is_active', '')).lower() != 'false'

        if not code or not name or not discount_value or not start_date or not end_date:
            return Response({'error': 'Vui lòng cung cấp đầy đủ thông tin voucher'}, status=400)

        # Parse date strings
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%dT%H:%M')
            end_date = datetime.strptime(end_date, '%Y-%m-%dT%H:%M')
        except ValueError:
            return Response({'error': 'Định dạng ngày giờ không hợp lệ'}, status=400)

        if Voucher.objects.filter(code__iexact=code).exists():
            return Response({'error': 'Mã voucher đã tồn tại'}, status=400)

        Voucher.objects.create(
            code=code.upper(),
            name=name,
            discount_type=discount_type,
            discount_value=discount_value,
            min_order_value=min_order_value,
            usage_limit=usage_limit if usage_limit else None,
            start_date=timezone.make_aware(start_date),
            end_date=timezone.make_aware(end_date),
            is_active=is_active
        )
        return Response({'success': True, 'message': 'Tạo mã voucher mới thành công.'}, status=201)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
@authentication_classes([JWTAuthentication])
def admin_voucher_detail(request, pk):
    try:
        voucher = Voucher.objects.get(pk=pk)
    except Voucher.DoesNotExist:
        return Response({'error': 'Voucher không tồn tại'}, status=404)

    if request.method == 'GET':
        return Response({
            'id': voucher.id,
            'code': voucher.code,
            'name': voucher.name,
            'discount_type': voucher.discount_type,
            'discount_value': float(voucher.discount_value),
            'min_order_value': float(voucher.min_order_value),
            'usage_limit': voucher.usage_limit or '',
            'start_date': voucher.start_date.strftime('%Y-%m-%dT%H:%M'),
            'end_date': voucher.end_date.strftime('%Y-%m-%dT%H:%M'),
            'is_active': voucher.is_active
        })

    elif request.method == 'PUT':
        data = request.data
        code = data.get('code')
        name = data.get('name')
        discount_type = data.get('discount_type', 'percentage')
        discount_value = data.get('discount_value')
        min_order_value = data.get('min_order_value') or 0
        usage_limit = data.get('usage_limit')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        is_active = str(data.get('is_active', '')).lower() != 'false'

        if not code or not name or not discount_value or not start_date or not end_date:
            return Response({'error': 'Vui lòng cung cấp đầy đủ thông tin voucher'}, status=400)

        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%dT%H:%M')
            end_date = datetime.strptime(end_date, '%Y-%m-%dT%H:%M')
        except ValueError:
            return Response({'error': 'Định dạng ngày giờ không hợp lệ'}, status=400)

        if Voucher.objects.filter(code__iexact=code).exclude(pk=pk).exists():
            return Response({'error': 'Mã voucher đã được sử dụng bởi voucher khác'}, status=400)

        voucher.code = code.upper()
        voucher.name = name
        voucher.discount_type = discount_type
        voucher.discount_value = discount_value
        voucher.min_order_value = min_order_value
        voucher.usage_limit = usage_limit if usage_limit else None
        voucher.start_date = timezone.make_aware(start_date)
        voucher.end_date = timezone.make_aware(end_date)
        voucher.is_active = is_active
        voucher.save()
        return Response({'success': True, 'message': 'Cập nhật voucher thành công.'})

    elif request.method == 'DELETE':
        voucher.delete()
        return Response({'success': True, 'message': 'Xóa voucher thành công.'})

# ─── 6. USER MANAGEMENT APIs ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAdminUser])
@authentication_classes([JWTAuthentication])
def admin_users(request):
    search = request.query_params.get('search', '').strip()
    is_staff_filter = request.query_params.get('is_staff', '')

    users_qs = User.objects.all()
    if is_staff_filter:
        users_qs = users_qs.filter(is_staff=str(is_staff_filter).lower() == 'true')
    if search:
        users_qs = users_qs.filter(
            Q(email__icontains=search) | 
            Q(username__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )

    users_qs = users_qs.order_by('-id')

    # Pagination
    try:
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
    except ValueError:
        page, limit = 1, 10
        
    paginator = Paginator(users_qs, limit)
    page_obj = paginator.get_page(page)

    results = []
    for u in page_obj.object_list:
        total_orders = Order.objects.filter(user=u).count()
        total_spent = Order.objects.filter(user=u).exclude(status='cancelled').aggregate(total=Sum('amount_paid'))['total'] or 0

        results.append({
            'id': u.id,
            'name': f"{u.last_name} {u.first_name}".strip() or u.username,
            'email': u.email,
            'username': u.username,
            'role': 'Quản trị viên' if u.is_staff else 'Khách hàng',
            'is_staff': u.is_staff,
            'status': 'active' if u.is_active else 'inactive',
            'phone': u.phone or '',
            'total_orders': total_orders,
            'totalOrders': total_orders,
            'totalSpent': f"{float(total_spent):,.0f} đ".replace(',', '.'),
            'total_spent': float(total_spent),
            'avatar': f"https://i.pravatar.cc/150?u={u.id}"
        })
    return Response({
        'count': paginator.count,
        'total_pages': paginator.num_pages,
        'page': page_obj.number,
        'limit': limit,
        'results': results
    })

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
@authentication_classes([JWTAuthentication])
def admin_user_detail(request, pk):
    try:
        user_obj = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'Người dùng không tồn tại'}, status=404)

    if request.method == 'PUT':
        data = request.data
        is_active = data.get('is_active')
        is_staff = data.get('is_staff')

        if is_active is not None:
            user_obj.is_active = str(is_active).lower() == 'true'
        if is_staff is not None:
            user_obj.is_staff = str(is_staff).lower() == 'true'
        user_obj.save()
        return Response({'success': True, 'message': 'Cập nhật người dùng thành công.'})

    elif request.method == 'DELETE':
        if user_obj.is_superuser:
            return Response({'error': 'Không thể xóa tài khoản Superuser.'}, status=400)
        user_obj.delete()
        return Response({'success': True, 'message': 'Xóa người dùng thành công.'})
