import os
import json
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# Load GHN locations mapping
GHN_MAPPING_FILE = os.path.join(settings.BASE_DIR, 'payment', 'ghn_mapping.json')
try:
    with open(GHN_MAPPING_FILE, 'r', encoding='utf-8') as f:
        ghn_mapping = json.load(f)
except Exception as e:
    logger.error(f"Failed to load GHN mapping file: {e}")
    ghn_mapping = {}


# Load configurations from settings
GHN_API_URL = getattr(settings, 'GHN_API_URL', 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/')
GHN_TOKEN = getattr(settings, 'GHN_TOKEN', '')
GHN_SHOP_ID = getattr(settings, 'GHN_SHOP_ID', '')


def get_ghn_location_ids(province_name, district_name, ward_name):
    """
    Queries GHN master location APIs to match string values of address with GHN IDs.
    Returns:
        Tuple[int, str]: (district_id, ward_code)
    """
    headers = {
        "Token": GHN_TOKEN,
        "Content-Type": "application/json"
    }

    # 1. Find Province ID
    province_id = None
    try:
        url = f"{GHN_API_URL}master-data/province"
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code == 200:
            provinces = res.json().get('data', [])
            for p in provinces:
                p_name = p.get('ProvinceName', '').lower()
                if province_name.lower() in p_name or p_name in province_name.lower():
                    province_id = p.get('ProvinceID')
                    break
        if not province_id:
            province_id = 202  # Default to TP. Hồ Chí Minh
    except Exception as e:
        logger.error(f"Error fetching provinces from GHN: {e}")
        province_id = 202

    # 2. Find District ID
    district_id = None
    try:
        url = f"{GHN_API_URL}master-data/district"
        res = requests.post(url, headers=headers, json={"province_id": province_id}, timeout=10)
        if res.status_code == 200:
            districts = res.json().get('data', [])
            for d in districts:
                d_name = d.get('DistrictName', '').lower()
                if district_name.lower() in d_name or d_name in district_name.lower():
                    district_id = d.get('DistrictID')
                    break
                
                # Check extensions list if available
                extensions = d.get('NameExtension', []) or []
                if any(district_name.lower() in ext.lower() for ext in extensions):
                    district_id = d.get('DistrictID')
                    break
        if not district_id:
            district_id = 1442  # Default to District 1, TP HCM
    except Exception as e:
        logger.error(f"Error fetching districts from GHN: {e}")
        district_id = 1442

    # 3. Find Ward Code
    ward_code = None
    try:
        url = f"{GHN_API_URL}master-data/ward"
        res = requests.post(url, headers=headers, json={"district_id": district_id}, timeout=10)
        if res.status_code == 200:
            wards = res.json().get('data', [])
            for w in wards:
                w_name = w.get('WardName', '').lower()
                if ward_name.lower() in w_name or w_name in ward_name.lower():
                    ward_code = w.get('WardCode')
                    break
                
                # Check extensions list if available
                extensions = w.get('NameExtension', []) or []
                if any(ward_name.lower() in ext.lower() for ext in extensions):
                    ward_code = w.get('WardCode')
                    break
        if not ward_code:
            ward_code = "20314"  # Default to Ward Bến Nghé, District 1, TP HCM
    except Exception as e:
        logger.error(f"Error fetching wards from GHN: {e}")
        ward_code = "20314"

    return district_id, ward_code


def create_ghn_shipping_order(order):
    """
    Creates a shipping order in Giao Hàng Nhanh (GHN).
    If GHN configurations are missing or request fails, returns a mock tracking code.
    Returns:
        str: GHN order code (tracking code)
    """
    mock_code = f"GHN-MOCK-{order.order_code}"
    
    if not GHN_TOKEN or not GHN_SHOP_ID:
        logger.warning(f"GHN credentials missing. Generated mock tracking code: {mock_code}")
        return mock_code

    # Parse address components from order.shipping_address
    # Format: "Street, Ward, Province"
    address_parts = [p.strip() for p in order.shipping_address.split(',')]
    if len(address_parts) >= 4:
        city = address_parts[-1]
        ward = address_parts[-3]
    elif len(address_parts) == 3:
        city = address_parts[-1]
        ward = address_parts[-2]
    else:
        city = "TP Hồ Chí Minh"
        ward = "Phường Bến Nghé"

    # Match address strings to GHN IDs using mapping
    mapping_key = f"{city}|{ward}"
    mapping_data = ghn_mapping.get(mapping_key)
    
    if mapping_data:
        district_id = mapping_data.get('district_id')
        ward_code = mapping_data.get('ward_code')
        logger.info(f"GHN location mapping found for {mapping_key}: district_id={district_id}, ward_code={ward_code}")
    else:
        logger.warning(f"GHN location mapping NOT found for {mapping_key}. Falling back to name matching...")
        # Fallback to get_ghn_location_ids
        district_id, ward_code = get_ghn_location_ids(city, city, ward)


    headers = {
        "Token": GHN_TOKEN,
        "ShopId": str(GHN_SHOP_ID),
        "Content-Type": "application/json"
    }

    # Build items array for GHN payload
    ghn_items = []
    for item in order.items.all():
        ghn_items.append({
            "name": item.product.name if item.product else "Sản phẩm",
            "code": item.variant.sku if item.variant else (item.product.name[:20] if item.product else "SKU"),
            "quantity": item.quantity,
            "price": int(item.price)
        })

    payload = {
        "payment_type_id": 2,  # Seller pays shipping fee
        "note": f"LaptopDevice Store - Đơn hàng {order.order_code}",
        "required_note": "KHONGCHOXEMHANG",
        "from_name": "LaptopDevice Store",
        "from_phone": "0909999999",
        "from_address": "72 Lê Lợi, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh",
        "from_ward_code": "20314",
        "from_district_id": 1442,
        "to_name": order.full_name,
        "to_phone": order.phone,
        "to_address": order.shipping_address,
        "to_ward_code": ward_code,
        "to_district_id": district_id,
        "cod_amount": 0 if order.is_paid else int(order.amount_paid),
        "weight": 2000,   # default weight in grams (2kg for laptop packages)
        "length": 30,     # default package dimension in cm
        "width": 20,
        "height": 10,
        "service_type_id": 2,  # Standard delivery service
        "items": ghn_items
    }

    try:
        url = f"{GHN_API_URL}shipping-order/create"
        logger.info(f"Sending order {order.order_code} to GHN API: {url}...")
        res = requests.post(url, headers=headers, json=payload, timeout=15)
        if res.status_code == 200:
            res_data = res.json()
            if res_data.get('code') == 200 or res_data.get('message') == 'Success':
                ghn_order_code = res_data.get('data', {}).get('order_code')
                logger.info(f"GHN Shipping Order created successfully: {ghn_order_code}")
                return ghn_order_code
            else:
                logger.error(f"GHN API returned error: {res_data}")
        else:
            logger.error(f"GHN API failed with status {res.status_code}: {res.text}")
    except Exception as e:
        logger.error(f"Failed to connect to GHN API: {e}", exc_info=True)

    # Fallback to mock code to ensure admin flow completes gracefully
    logger.warning(f"Falling back to mock tracking code: {mock_code}")
    return mock_code


def calculate_ghn_shipping_cost(to_district_id, to_ward_code, weight=2000, service_type_id=2):
    """
    Calls GHN API to calculate shipping fee.
    If GHN credentials are not set or API call fails, returns a fallback default fee.
    """
    if not GHN_TOKEN or not GHN_SHOP_ID:
        logger.warning("GHN credentials missing for shipping cost calculation. Using fallback default.")
        return 20000 if service_type_id == 2 else 50000

    headers = {
        "Token": GHN_TOKEN,
        "ShopId": str(GHN_SHOP_ID),
        "Content-Type": "application/json"
    }
    
    payload = {
        "from_district_id": 1442,  # District 1, TP HCM (shop address)
        "from_ward_code": "20314", # Ward Bến Nghé
        "to_district_id": int(to_district_id),
        "to_ward_code": str(to_ward_code),
        "service_type_id": int(service_type_id),
        "weight": int(weight),
        "length": 30,
        "width": 20,
        "height": 10
    }

    try:
        url = f"{GHN_API_URL}shipping-order/fee"
        res = requests.post(url, headers=headers, json=payload, timeout=10)
        if res.status_code == 200:
            res_data = res.json()
            if res_data.get('code') == 200:
                fee = res_data.get('data', {}).get('total', 20000)
                logger.info(f"GHN Shipping Fee calculated: {fee} VND")
                return int(fee)
            else:
                logger.error(f"GHN Fee API returned error code: {res_data}")
        else:
            logger.error(f"GHN Fee API failed with status {res.status_code}: {res.text}")
    except Exception as e:
        logger.error(f"Failed to call GHN Fee API: {e}", exc_info=True)
        
    return 20000 if service_type_id == 2 else 50000
