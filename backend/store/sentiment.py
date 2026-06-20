import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# Fallback sentiment analysis based on rating
def _fallback_analyze(rating):
    if rating is not None:
        if rating >= 4:
            return 'positive', 1.0
        elif rating <= 2:
            return 'negative', 1.0
        else:
            return 'neutral', 1.0
    return 'neutral', 0.0

try:
    import torch
    import torch.nn.functional as F
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    HAS_ML_LIBS = True
except ImportError as e:
    logger.warning(f"ML libraries (torch/transformers) not available: {e}. Using fallback rating-based sentiment.")
    HAS_ML_LIBS = False

# Path to the local pre-trained model directory
MODEL_DIR = os.path.join(settings.BASE_DIR, 'distilphobert_best')

class SentimentAnalyzer:
    _tokenizer = None
    _model = None
    _is_model_loaded = False

    @classmethod
    def load_model(cls):
        """Loads tokenizer and model from local directory if not already loaded."""
        if not HAS_ML_LIBS:
            return False

        if cls._is_model_loaded:
            return True

        if not os.path.exists(MODEL_DIR):
            logger.warning(f"Model directory not found at {MODEL_DIR}. Using fallback rating-based sentiment.")
            return False

        try:
            logger.info(f"Loading DistilPhoBERT tokenizer and model from {MODEL_DIR}...")
            cls._tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
            cls._model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
            cls._model.eval()
            cls._is_model_loaded = True
            logger.info("Model loaded successfully.")
            return True
        except Exception as ex:
            logger.error(f"Error loading model from {MODEL_DIR}: {ex}", exc_info=True)
            return False

    @classmethod
    def analyze(cls, text, rating=None):
        """
        Analyzes the sentiment of review comments.
        Returns:
            Tuple[str, float]: (sentiment_label, confidence_score)
            sentiment_label: 'positive', 'neutral', or 'negative'
        """
        if not text or not text.strip():
            return _fallback_analyze(rating)

        # 1. Attempt to load model and tokenize
        if not cls.load_model():
            return _fallback_analyze(rating)

        try:
            # 2. Perform word segmentation with pyvi if available
            segmented_text = text
            try:
                from pyvi import ViTokenizer
                segmented_text = ViTokenizer.tokenize(text)
            except ImportError:
                # pyvi not available, fall back to raw text (not ideal but safe)
                pass

            # 3. Tokenize input
            inputs = cls._tokenizer(
                segmented_text, 
                return_tensors="pt", 
                truncation=True, 
                max_length=256
            )

            # 4. Model inference
            with torch.no_grad():
                outputs = cls._model(**inputs)
                probabilities = F.softmax(outputs.logits, dim=-1)

            # 5. Extract predicted class and confidence
            # Model config maps: 0 -> Negative, 1 -> Neutral, 2 -> Positive
            probs = probabilities[0].tolist()
            max_idx = probs.index(max(probs))

            sentiment_map = {
                0: 'negative',
                1: 'neutral',
                2: 'positive'
            }

            sentiment_label = sentiment_map.get(max_idx, 'neutral')
            confidence = probs[max_idx]

            logger.info(f"Sentiment analysis: '{text[:30]}...' -> {sentiment_label} (score: {confidence:.4f})")
            return sentiment_label, confidence

        except Exception as ex:
            logger.error(f"Error during sentiment inference: {ex}", exc_info=True)
            return _fallback_analyze(rating)
