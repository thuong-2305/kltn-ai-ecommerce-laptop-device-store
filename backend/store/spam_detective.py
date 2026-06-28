import os
import re
import logging
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

logger = logging.getLogger(__name__)

# Cấu hình đường dẫn file Stopwords
base_path = os.path.dirname(__file__)
STOPWORDS_PATH = os.path.join(base_path, 'resources', 'vietnamese-stopwords-dash.txt')

# Tải danh sách Stopwords
stopwords = set()
if os.path.exists(STOPWORDS_PATH):
    try:
        with open(STOPWORDS_PATH, 'r', encoding='utf-8') as file:
            stopwords = set(line.strip() for line in file)
    except Exception as e:
        logger.error(f"Lỗi đọc file stopwords: {e}")
else:
    logger.warning(f"Không tìm thấy file stopwords tại {STOPWORDS_PATH}")

# Cấu hình Hugging Face Repository
REPO_ID = "thuong2305/vietnamese-spam-detector"
SUBFOLDER = "task_1"

_tokenizer = None
_model = None
_is_model_loaded = False

def load_model():
    global _tokenizer, _model, _is_model_loaded
    if _is_model_loaded:
        return True
        
    try:
        # Đọc token Hugging Face từ biến môi trường
        from django.conf import settings
        hf_token = getattr(settings, 'HF_TOKEN', None) or os.getenv('HF_TOKEN')
        
        # Nếu hf_token là chuỗi trống hoặc không có, cố gắng gọi mà không truyền token
        kwargs = {}
        if hf_token:
            kwargs['token'] = hf_token
            
        logger.info(f"Đang tải mô hình phát hiện Spam từ HF Hub ({REPO_ID}, subfolder={SUBFOLDER})...")
        
        _tokenizer = AutoTokenizer.from_pretrained(
            REPO_ID, 
            subfolder=SUBFOLDER, 
            use_fast=False, 
            **kwargs
        )
        _model = AutoModelForSequenceClassification.from_pretrained(
            REPO_ID, 
            subfolder=SUBFOLDER, 
            **kwargs
        )
        _model.eval()
        _is_model_loaded = True
        logger.info("Tải mô hình phát hiện Spam thành công.")
        return True
    except Exception as e:
        logger.error(f"Lỗi tải mô hình phát hiện Spam từ Hugging Face Hub: {e}", exc_info=True)
        return False

def filter_stop_words(text, stop_words):
    return ' '.join(word for word in text.split() if word not in stop_words)

def deEmojify(text):
    regex_pattern = re.compile(
        pattern="["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "]+", flags=re.UNICODE
    )
    return regex_pattern.sub(r'', text)

def preprocess(text, tokenized=True, lowercased=True):
    text = filter_stop_words(text, stopwords)
    text = deEmojify(text)
    text = text.lower() if lowercased else text
    if tokenized:
        try:
            from pyvi import ViTokenizer
            text = ViTokenizer.tokenize(text)
        except ImportError:
            pass
    return text

def isSpam(comment):
    """
    Kiểm tra xem bình luận có phải là spam hay không.
    Trả về: True nếu là spam, False nếu hợp lệ.
    """
    if not comment or not comment.strip():
        return False
        
    if not load_model():
        logger.warning("Không thể load model spam. Mặc định bình luận không phải spam.")
        return False
        
    try:
        processed_text = preprocess(comment, tokenized=True, lowercased=False)
        inputs = _tokenizer(
            processed_text, 
            truncation=True, 
            padding=True, 
            max_length=100, 
            return_tensors="pt"
        )
        
        with torch.no_grad():
            outputs = _model(**inputs)
            prediction = torch.argmax(outputs.logits, axis=-1).item()
            
        labels = ["no-spam", "spam"]
        is_spam_result = (labels[prediction] == "spam")
        logger.info(f"Spam detection: '{comment[:30]}...' -> {labels[prediction]} (is_spam={is_spam_result})")
        return is_spam_result
    except Exception as e:
        logger.error(f"Lỗi suy luận phát hiện spam: {e}", exc_info=True)
        return False
