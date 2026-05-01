from store.models import Product
import pandas as pd  # type: ignore
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Chuyển QuerySet sang DataFrame
queryset = Product.objects.select_related('category').values('id', 'name', 'price', 'category__name', 'image','description')

df_products = pd.DataFrame(list(queryset))

# Đặc trưng
features = ['description', 'price', 'category__name']  # Sử dụng 'category__name'

# Hàm kết hợp các đặc trưng
def combineFeature(row):
    # Sử dụng tên category từ cột 'category__name'
    category_name = row["category__name"]  # Truy cập cột 'category__name' thay vì 'category'
    return f'{row["price"]} {category_name} {row["description"]}'

# Tạo cột combineFeature
df_products['combineFeature'] = df_products.apply(combineFeature, axis=1)

# Lưu trữ cột combineFeature trong temp
temp = df_products['combineFeature']

# Kết quả
tf = TfidfVectorizer()
tf_matrix = tf.fit_transform(df_products['combineFeature'])

# Tính similarity
similar = cosine_similarity(tf_matrix)

def get_products_similar(product_id, top_n):
    try:
        # Tìm vị trí dòng có id == product_id
        target_index = df_products.index[df_products['id'] == product_id].tolist()[0]
    except IndexError:
        return []  # ID không tồn tại trong df_products → không tìm được
    
    # Lấy các sản phẩm tương tự
    similar_products = list(enumerate(similar[target_index]))
    sorted_similar_products = sorted(similar_products, key=lambda x: x[1], reverse=True)

    similar_product_indices = [index for index, _ in sorted_similar_products if index != target_index][:top_n]

    similar_products_full = df_products.iloc[similar_product_indices]

    return similar_products_full.to_dict('records')

# print(get_products_similar(67, 5))
# res = temp.tolist()
