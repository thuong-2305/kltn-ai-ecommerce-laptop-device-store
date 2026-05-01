# AI-related functions (commented to avoid dependency issues)
# Uncomment if you have torch, clip, faiss, and celery installed

# import torch
# import clip
# import os
# from PIL import Image
# import numpy as np
# import faiss
# from .models import Product, ProductImageFeature
# from celery import shared_task

# model, preprocess = clip.load("ViT-B/32", device="cpu")

# def extract_clip_vector(image_path):
#     image = preprocess(Image.open(image_path)).unsqueeze(0).to("cpu")
#     with torch.no_grad():
#         features = model.encode_image(image)
#         features /= features.norm(dim=-1, keepdim=True)
#     return features[0].tolist()

# @shared_task
# def generate_product_vector(product_id):
#     try:
#         product = Product.objects.get(id=product_id)
#         if product.image and os.path.exists(product.image.path):
#             vector = extract_clip_vector(product.image.path)
#             feature, _ = ProductImageFeature.objects.get_or_create(product=product)
#             feature.set_vector(vector)
#             feature.save()
#     except Product.DoesNotExist:
#         pass

# def build_faiss_index():
#     features = list(ProductImageFeature.objects.all())
#     if not features:
#         return None, []

#     vectors = np.array([f.get_vector() for f in features]).astype('float32')
#     ids = [f.product.id for f in features]

#     faiss.normalize_L2(vectors)
#     index = faiss.IndexFlatIP(512)
#     index.add(vectors)
#     return index, ids

# def find_similar_products(image_path, top_k=10):
#     query = np.array([extract_clip_vector(image_path)]).astype('float32')
#     faiss.normalize_L2(query)

#     index, ids = build_faiss_index()
#     if index is None:
#         return []

#     distances, indices = index.search(query, top_k)

#     sorted_indices = np.argsort(-distances[0])
#     sorted_product_ids = [ids[indices[0][i]] for i in sorted_indices]
#     sorted_similarities = [distances[0][i] for i in sorted_indices]
#     for pid, sim in zip(sorted_product_ids, sorted_similarities):
#         print(f"Product ID: {pid}, Similarity: {sim:.4f}")

#     return sorted_product_ids
