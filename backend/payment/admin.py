from django.contrib import admin
from django.contrib.admin import AdminSite
from django.db.models import Sum
import datetime
from django.utils import timezone
from .models import OrderItem, ShippingAddress, Order
from store.models import Review

class CustomAdminSite(AdminSite):
    site_header = "Hệ thống Quản trị Laptop Device"
    site_title = "Laptop Device Admin Portal"
    index_title = "Bảng Điều Khiển Tổng Quan"

    def index(self, request, extra_context=None):
        # Calculate dashboard metrics
        paid_orders = Order.objects.filter(is_paid=True)
        total_revenue = paid_orders.aggregate(total=Sum('amount_paid'))['total'] or 0
        total_orders = Order.objects.count()

        # Sentiment count
        reviews = Review.objects.all()
        total_reviews = reviews.count()
        positive_sentiment = reviews.filter(sentiment='positive').count()
        neutral_sentiment = reviews.filter(sentiment='neutral').count()
        negative_sentiment = reviews.filter(sentiment='negative').count()
        spam_count = reviews.filter(is_spam=True).count()

        # Calculate daily revenue for last 30 days
        thirty_days_ago = timezone.now() - datetime.timedelta(days=30)
        from django.db.models.functions import TruncDate
        daily_revenue_data = (
            paid_orders.filter(date_ordered__gte=thirty_days_ago)
            .annotate(day=TruncDate('date_ordered'))
            .values('day')
            .annotate(revenue=Sum('amount_paid'))
            .order_by('day')
        )

        # Format for Chart.js
        revenue_labels = []
        revenue_values = []
        for entry in daily_revenue_data:
            day = entry['day']
            if isinstance(day, datetime.date):
                label_str = day.strftime('%d/%m')
            elif isinstance(day, str):
                try:
                    dt = datetime.datetime.strptime(day.split(' ')[0], '%Y-%m-%d')
                    label_str = dt.strftime('%d/%m')
                except ValueError:
                    label_str = day
            else:
                label_str = str(day)
            revenue_labels.append(label_str)
            revenue_values.append(float(entry['revenue'] or 0))

        extra_context = extra_context or {}
        extra_context.update({
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'total_reviews': total_reviews,
            'positive_sentiment': positive_sentiment,
            'neutral_sentiment': neutral_sentiment,
            'negative_sentiment': negative_sentiment,
            'spam_count': spam_count,
            'revenue_labels': revenue_labels,
            'revenue_values': revenue_values,
        })
        return super().index(request, extra_context)

custom_admin_site = CustomAdminSite(name='custom_admin')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    raw_id_fields = ('product', 'variant')

class OrderAdmin(admin.ModelAdmin):
    list_select_related = ('user',)
    list_display = ('order_code', 'user', 'amount_paid', 'status', 'shipping_tracking_code', 'shipped', 'date_ordered')
    list_filter = ('status', 'shipped', 'date_ordered')
    search_fields = ('order_code', 'user__username', 'full_name', 'shipping_tracking_code')
    readonly_fields = ['date_ordered', 'order_code']
    fields = ['order_code', 'user', 'full_name', 'phone', 'shipping_address', 'amount_paid', 'status', 'shipping_tracking_code', 'date_ordered', 'shipped', 'date_shipped']
    inlines = [OrderItemInline]

# Register models to custom admin site
custom_admin_site.register(ShippingAddress)
custom_admin_site.register(OrderItem)
custom_admin_site.register(Order, OrderAdmin)
