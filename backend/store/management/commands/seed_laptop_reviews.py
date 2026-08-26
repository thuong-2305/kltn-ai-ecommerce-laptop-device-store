import random
from decimal import Decimal
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from store.models import Product, Category, Review
from store.sentiment import SentimentAnalyzer

User = get_user_model()

# ─── Config ──────────────────────────────────────────────────────────────
LAPTOP_CATEGORY_NAMES = ['acer', 'dell', 'macbook']
CATEGORY_FLAVOR = {'acer': 'gaming', 'dell': 'dell', 'macbook': 'macbook'}

MIN_REVIEWS = 30
MAX_REVIEWS = 50
BESTSELLER_PRODUCT_NAME = 'Apple MacBook Air M2 2024 8CPU 8GPU 16GB 256GB'
BESTSELLER_MIN_REVIEWS = 105
BESTSELLER_MAX_REVIEWS = 130

REVIEWER_USER_POOL_SIZE = 180
REVIEWER_USERNAME_PREFIX = 'kh'  # "khách hàng"
REVIEWER_EMAIL_DOMAIN = 'demo-reviewer.vn'

DAYS_SPAN = 300  # spread review_date over the last ~10 months

# ─── Vietnamese name generator (no external deps) ──────────────────────
SURNAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ',
            'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý']
MIDDLE_MALE = ['Văn', 'Hữu', 'Đức', 'Minh', 'Quốc', 'Công', 'Thành', 'Anh']
MIDDLE_FEMALE = ['Thị', 'Ngọc', 'Thu', 'Kim', 'Hồng', 'Diễm', 'Bảo']
GIVEN_MALE = ['An', 'Bình', 'Cường', 'Dũng', 'Đạt', 'Hải', 'Hùng', 'Khang',
              'Long', 'Minh', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tài', 'Thắng',
              'Tuấn', 'Việt', 'Vinh', 'Khoa']
GIVEN_FEMALE = ['Anh', 'Chi', 'Dung', 'Giang', 'Hà', 'Hạnh', 'Hoa', 'Huyền',
                 'Lan', 'Linh', 'Mai', 'My', 'Nga', 'Nhi', 'Phương', 'Quỳnh',
                 'Thảo', 'Trang', 'Trinh', 'Vy']


def random_vn_name():
    surname = random.choice(SURNAMES)
    if random.random() < 0.5:
        middle, given = random.choice(MIDDLE_MALE), random.choice(GIVEN_MALE)
    else:
        middle, given = random.choice(MIDDLE_FEMALE), random.choice(GIVEN_FEMALE)
    return surname, f"{middle} {given}"


# ─── Comment banks (rating tier -> list of comment templates) ─────────────
GENERAL_5 = [
    "Sản phẩm đúng như mô tả, đóng gói cẩn thận, giao hàng nhanh.",
    "Máy chạy mượt, cấu hình đáp ứng tốt nhu cầu học tập và làm việc.",
    "Rất hài lòng với sản phẩm, sẽ ủng hộ shop lần sau.",
    "Đóng gói kỹ, có đầy đủ phụ kiện, máy còn nguyên seal.",
    "Giá hợp lý so với cấu hình, đáng đồng tiền.",
    "Nhân viên tư vấn nhiệt tình, giao hàng đúng hẹn.",
    "Dùng được vài ngày thấy máy chạy êm, không bị nóng.",
    "Thiết kế đẹp, cầm nhẹ tay, mang đi làm rất tiện.",
    "Màn hình hiển thị sắc nét, màu sắc chuẩn.",
    "Pin dùng cả ngày mới phải sạc, rất ưng.",
    "Bàn phím gõ êm, hành trình phím vừa tay.",
    "Loa nghe khá to và rõ, xem phim giải trí ổn.",
    "Tốc độ khởi động nhanh, mở ứng dụng mượt mà.",
    "Rất đáng mua trong tầm giá này.",
    "Lần đầu mua ở shop, trải nghiệm rất tốt, sẽ quay lại.",
    "Máy mới 100%, không có lỗi gì, rất ưng ý.",
    "Shop hỗ trợ nhiệt tình, giải đáp thắc mắc rất nhanh.",
    "Vận chuyển nhanh hơn dự kiến, đóng gói chống sốc kỹ.",
    "Cấu hình mạnh, xử lý đa nhiệm rất tốt.",
    "Chất lượng vượt mong đợi so với giá tiền.",
]
GENERAL_4 = [
    "Máy dùng tốt, chỉ hơi nặng một chút nhưng chấp nhận được.",
    "Cấu hình ổn, tuy nhiên pin hao hơi nhanh khi dùng nhiều tác vụ nặng.",
    "Giao hàng hơi lâu nhưng sản phẩm đúng mô tả, dùng ổn.",
    "Máy chạy mượt, chỉ tiếc là loa hơi nhỏ.",
    "Nhìn chung hài lòng, mong shop cải thiện khâu đóng gói tốt hơn.",
    "Sản phẩm ok trong tầm giá, chưa có gì để chê nhiều.",
    "Màn hình đẹp nhưng độ sáng ngoài trời hơi yếu.",
    "Chạy đa nhiệm tốt, khởi động hơi lâu so với kỳ vọng.",
    "Bàn phím gõ ổn nhưng phím hơi nông.",
    "Thiết kế đẹp, hiệu năng tốt, có điều hơi nóng khi dùng lâu.",
    "Dùng tạm ổn, hy vọng độ bền lâu dài sẽ tốt.",
    "Sản phẩm tốt, đóng gói hơi sơ sài so với giá tiền.",
]
GENERAL_3 = [
    "Sản phẩm tạm ổn, chưa có gì nổi bật.",
    "Máy dùng bình thường, đúng như tầm giá.",
    "Đóng gói ổn nhưng giao hàng khá chậm.",
    "Cấu hình tạm được, dùng cơ bản thì ổn, chạy nặng thì hơi đuối.",
    "Chưa dùng lâu nên chưa đánh giá được độ bền.",
    "Máy hơi nóng khi dùng lâu, mong được cải thiện.",
    "Bình thường, không có gì đặc biệt để khen hay chê.",
]
GENERAL_2 = [
    "Máy hơi ồn khi chạy đa nhiệm, không được như kỳ vọng.",
    "Giao hàng chậm hơn dự kiến, sản phẩm tạm chấp nhận được.",
    "Pin hao khá nhanh so với quảng cáo.",
    "Hộp bị móp nhẹ khi nhận hàng, máy thì vẫn dùng được.",
    "Cấu hình không mượt như mong đợi khi chạy phần mềm nặng.",
]
GENERAL_1 = [
    "Sản phẩm không như mô tả, khá thất vọng.",
    "Giao hàng trễ hẹn nhiều ngày, trải nghiệm không tốt.",
    "Máy gặp lỗi ngay khi mới mở hộp, đang chờ shop hỗ trợ đổi trả.",
    "Không hài lòng lắm, mong shop kiểm tra kỹ hơn trước khi giao.",
]

FLAVOR_5 = {
    'macbook': [
        "Máy chạy êm, mát, chip Apple xử lý đa nhiệm rất mượt.",
        "Pin trâu, dùng cả ngày làm việc không cần mang sạc theo.",
        "Thiết kế mỏng nhẹ, sang trọng đúng chất Apple.",
        "Màn hình Retina hiển thị đẹp, làm đồ họa nhìn sướng mắt.",
        "Chuyển từ Windows qua dùng macOS ban đầu hơi lạ nhưng giờ quen, rất thích.",
        "Trackpad mượt mà, thao tác đa điểm rất nhạy.",
        "Máy im lặng tuyệt đối, không nghe tiếng quạt kể cả khi làm việc nặng.",
    ],
    'gaming': [
        "Chơi game mượt, tản nhiệt tốt, không bị giật lag.",
        "Cấu hình mạnh, chiến các tựa game AAA khá ổn định.",
        "Đèn bàn phím RGB đẹp, thiết kế gaming cá tính.",
        "Chơi game 2-3 tiếng liên tục máy không quá nóng.",
        "Card đồ họa rời chiến game và render video đều tốt.",
        "Màn hình tần số quét cao, chơi game FPS rất đã.",
    ],
    'dell': [
        "Laptop văn phòng bền bỉ, gõ phím êm tay, làm việc cả ngày không mỏi.",
        "Thiết kế sang trọng, phù hợp mang đi công tác.",
        "Máy chạy ổn định, phù hợp cho dân văn phòng, kế toán.",
        "Vỏ máy chắc chắn, bản lề màn hình cứng cáp.",
    ],
}
FLAVOR_4 = {
    'macbook': [
        "Máy mượt, mát, chỉ tiếc là ít cổng kết nối phải mua thêm hub.",
        "Pin tốt nhưng sạc đi kèm hơi cồng kềnh.",
    ],
    'gaming': [
        "Chơi game ổn nhưng quạt tản nhiệt hơi ồn khi chạy hết công suất.",
        "Cấu hình mạnh nhưng máy khá nặng khi mang đi lại.",
    ],
    'dell': [
        "Máy bền, gõ phím tốt, chỉ tiếc thiết kế hơi đơn điệu.",
    ],
}

RATING_WEIGHTS = [(5, 55), (4, 25), (3, 11), (2, 6), (1, 3)]


def pick_rating():
    ratings = [r for r, _ in RATING_WEIGHTS]
    weights = [w for _, w in RATING_WEIGHTS]
    return random.choices(ratings, weights=weights, k=1)[0]


def pick_comment(rating, flavor):
    if rating == 5:
        pool = list(GENERAL_5) + list(FLAVOR_5.get(flavor, []))
    elif rating == 4:
        pool = list(GENERAL_4) + list(FLAVOR_4.get(flavor, []))
    elif rating == 3:
        pool = list(GENERAL_3)
    elif rating == 2:
        pool = list(GENERAL_2)
    else:
        pool = list(GENERAL_1)
    return random.choice(pool)


def random_review_date():
    offset_days = random.randint(0, DAYS_SPAN)
    offset_seconds = random.randint(0, 86400)
    return timezone.now() - timedelta(days=offset_days, seconds=offset_seconds)


class Command(BaseCommand):
    help = (
        "Seed Vietnamese demo reviews for laptop products (acer/dell/macbook): "
        "30-50 reviews per product, 105-130 for the bestseller. Safe to re-run."
    )

    def handle(self, *args, **options):
        random.seed(42)

        categories = list(Category.objects.filter(name__in=LAPTOP_CATEGORY_NAMES))
        if not categories:
            self.stdout.write(self.style.ERROR("No laptop categories found."))
            return

        products = list(Product.objects.filter(category__in=categories).select_related('category'))
        if not products:
            self.stdout.write(self.style.ERROR("No laptop products found."))
            return

        # ─── Ensure a pool of dedicated demo reviewer accounts exists ───
        existing_reviewer_count = User.objects.filter(username__startswith=REVIEWER_USERNAME_PREFIX).count()
        to_create = max(0, REVIEWER_USER_POOL_SIZE - existing_reviewer_count)
        new_users = []
        for i in range(existing_reviewer_count, existing_reviewer_count + to_create):
            surname, rest = random_vn_name()
            username = f"{REVIEWER_USERNAME_PREFIX}{i:04d}"
            email = f"{username}@{REVIEWER_EMAIL_DOMAIN}"
            u = User(username=username, email=email, first_name=surname, last_name=rest, is_active=True)
            u.set_unusable_password()
            new_users.append(u)
        if new_users:
            User.objects.bulk_create(new_users, ignore_conflicts=True)

        reviewer_pool = list(User.objects.filter(username__startswith=REVIEWER_USERNAME_PREFIX))
        if len(reviewer_pool) < BESTSELLER_MAX_REVIEWS:
            self.stdout.write(self.style.WARNING(
                f"Reviewer pool only has {len(reviewer_pool)} accounts; "
                f"increase REVIEWER_USER_POOL_SIZE for the bestseller target."
            ))

        bestseller = next((p for p in products if p.name == BESTSELLER_PRODUCT_NAME), None)

        created_total = 0
        summary_lines = []

        with transaction.atomic():
            for product in products:
                if bestseller and product.id == bestseller.id:
                    target = random.randint(BESTSELLER_MIN_REVIEWS, BESTSELLER_MAX_REVIEWS)
                else:
                    target = random.randint(MIN_REVIEWS, MAX_REVIEWS)

                current_count = Review.objects.filter(product=product).count()
                needed = target - current_count
                if needed <= 0:
                    summary_lines.append(f"{product.id}\t{current_count}\t0\t{target}")
                    continue

                existing_reviewer_ids = set(
                    Review.objects.filter(product=product).values_list('user_id', flat=True)
                )
                candidates = [u for u in reviewer_pool if u.id not in existing_reviewer_ids]
                random.shuffle(candidates)
                chosen_users = candidates[:needed]

                flavor = CATEGORY_FLAVOR.get(product.category.name, 'general')
                reviews_to_create = []
                for user in chosen_users:
                    rating = pick_rating()
                    comment = pick_comment(rating, flavor)
                    sentiment_label, confidence = SentimentAnalyzer.analyze(comment, rating=rating)
                    reviews_to_create.append(Review(
                        product=product,
                        user=user,
                        rating=rating,
                        comment=comment,
                        sentiment=sentiment_label,
                        score_analysis=Decimal(str(round(confidence, 5))),
                        review_date=random_review_date(),
                        is_spam=False,
                    ))

                Review.objects.bulk_create(reviews_to_create, ignore_conflicts=True)
                created_total += len(reviews_to_create)
                summary_lines.append(f"{product.id}\t{current_count}\t{len(reviews_to_create)}\t{target}")

        self.stdout.write(self.style.SUCCESS(
            f"Done. Created {created_total} new review(s) across {len(products)} laptop product(s). "
            f"Reviewer pool size: {len(reviewer_pool)}."
        ))
        with open('seed_laptop_reviews_summary.tsv', 'w', encoding='utf-8') as f:
            f.write("product_id\tprevious_count\tcreated\ttarget\n")
            f.write("\n".join(summary_lines) + "\n")
