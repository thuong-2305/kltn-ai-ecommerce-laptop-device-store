import threading

_has_run = False

def schedule_generate_clip_vectors():
    global _has_run
    if _has_run:
        return
    _has_run = True

    # Đẩy việc chạy ra thread phụ để tránh lỗi "AppRegistryNotReady"
    thread = threading.Thread(target=_generate_vectors)
    thread.start()


def _generate_vectors():
    import os
    import django
    import time

    # Delay nhỏ đảm bảo Django khởi động hoàn toàn
    time.sleep(1)

    from store.models import Product, ProductImageFeature
    from store.utils import extract_clip_vector

    print("⚙️  Đang kiểm tra và sinh vector CLIP cho sản phẩm...")

    for product in Product.objects.all():
        if not product.image or not os.path.exists(product.image.path):
            continue

        if ProductImageFeature.objects.filter(product=product).exists():
            continue

        try:
            vector = extract_clip_vector(product.image.path)
            feature = ProductImageFeature(product=product)
            feature.set_vector(vector)
            feature.save()
            print(f"✅ Tạo vector cho: {product.name}")
        except Exception as e:
            print(f"❌ Lỗi xử lý {product.name}: {e}")
