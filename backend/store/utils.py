import os
import json
import logging
import numpy as np
from .models import Product, ProductImageFeature

logger = logging.getLogger(__name__)

# Lazy loading of torch, clip, faiss
_model = None
_preprocess = None
_clip_loaded = False
_clip_error = None

# FAISS index cache
_faiss_index = None
_faiss_ids = None
_faiss_product_count = 0

def load_clip_model():
    global _model, _preprocess, _clip_loaded, _clip_error
    if _clip_loaded:
        return _model, _preprocess
    
    try:
        import torch
        import clip
        from PIL import Image
        import faiss
        
        # Load clip model
        model, preprocess = clip.load("ViT-B/32", device="cpu")
        _model = model
        _preprocess = preprocess
        _clip_loaded = True
        logger.info("Successfully loaded CLIP model and preprocess pipeline.")
        return _model, _preprocess
    except Exception as e:
        _clip_error = str(e)
        logger.error(f"Failed to load CLIP/torch/faiss: {e}")
        return None, None

def extract_clip_vector(image_path):
    model, preprocess = load_clip_model()
    if not model:
        raise ImportError(f"CLIP environment not available: {_clip_error}")
        
    import torch
    from PIL import Image
    
    image = preprocess(Image.open(image_path)).unsqueeze(0).to("cpu")
    with torch.no_grad():
        features = model.encode_image(image)
        features /= features.norm(dim=-1, keepdim=True)
    return features[0].tolist()

def get_or_extract_feature(product):
    try:
        return ProductImageFeature.objects.get(product=product)
    except ProductImageFeature.DoesNotExist:
        if product.image and os.path.exists(product.image.path):
            try:
                # Check if CLIP is available
                model, _ = load_clip_model()
                if not model:
                    return None
                    
                vector = extract_clip_vector(product.image.path)
                feature = ProductImageFeature.objects.create(product=product)
                feature.set_vector(vector)
                feature.save()
                return feature
            except Exception as e:
                logger.error(f"Error extracting vector for product {product.id}: {e}")
        return None

def build_faiss_index():
    try:
        import faiss
    except ImportError:
        return None, []
        
    # Populate vectors for products that don't have them
    for product in Product.objects.all():
        get_or_extract_feature(product)
        
    features = list(ProductImageFeature.objects.all())
    if not features:
        return None, []

    vectors = np.array([f.get_vector() for f in features]).astype('float32')
    ids = [f.product.id for f in features]

    faiss.normalize_L2(vectors)
    index = faiss.IndexFlatIP(512)
    index.add(vectors)
    return index, ids


def get_cached_faiss_index():
    """Return cached FAISS index. Rebuild only when product count changes."""
    global _faiss_index, _faiss_ids, _faiss_product_count
    
    current_count = ProductImageFeature.objects.count()
    if _faiss_index is None or current_count != _faiss_product_count:
        logger.info(f"Rebuilding FAISS index (product features: {current_count})")
        _faiss_index, _faiss_ids = build_faiss_index()
        _faiss_product_count = current_count
    
    return _faiss_index, _faiss_ids


def invalidate_faiss_cache():
    """Call this when products are added/removed to force index rebuild."""
    global _faiss_index, _faiss_ids, _faiss_product_count
    _faiss_index = None
    _faiss_ids = None
    _faiss_product_count = 0


def find_similar_products(image_path, top_k=10):
    try:
        import faiss
        model, _ = load_clip_model()
        if not model:
            # Fallback to empty if CLIP is not configured/loaded
            return []
    except ImportError:
        return []

    try:
        query = np.array([extract_clip_vector(image_path)]).astype('float32')
        faiss.normalize_L2(query)

        # Use cached index instead of rebuilding every time
        index, ids = get_cached_faiss_index()
        if index is None or len(ids) == 0:
            return []

        distances, indices = index.search(query, min(top_k, len(ids)))
        
        # Sort results by similarity score descending
        sorted_indices = np.argsort(-distances[0])
        sorted_product_ids = [ids[indices[0][i]] for i in sorted_indices]
        return sorted_product_ids
    except Exception as e:
        logger.error(f"Error finding similar products: {e}")
        return []
