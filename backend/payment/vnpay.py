import hashlib
import hmac
import urllib.parse


class VNPay:
    """VNPay payment gateway integration.
    
    Handles creating payment URLs and validating response signatures.
    """

    def __init__(self):
        # Instance attributes instead of class-level to avoid shared state
        self.requestData = {}
        self.responseData = {}

    def get_payment_url(self, vnpay_payment_url, secret_key):
        inputData = sorted(self.requestData.items())
        queryString = ''
        seq = 0
        for key, val in inputData:
            if seq == 1:
                queryString += '&' + key + '=' + urllib.parse.quote_plus(str(val))
            else:
                seq = 1
                queryString = key + '=' + urllib.parse.quote_plus(str(val))
        hashValue = self.__hmacsha512(secret_key, queryString)
        return vnpay_payment_url + '?' + queryString + '&vnp_SecureHash=' + hashValue

    def validate_response(self, secret_key):
        vnp_SecureHash = self.responseData.get('vnp_SecureHash', '')
        # Work on a copy to avoid mutating the original data
        data_copy = dict(self.responseData)
        data_copy.pop('vnp_SecureHash', None)
        data_copy.pop('vnp_SecureHashType', None)
        inputData = sorted(data_copy.items())

        hasData = ''
        seq = 0
        for key, val in inputData:
            if str(key).startswith('vnp_'):
                if seq == 1:
                    hasData += '&' + str(key) + '=' + urllib.parse.quote_plus(str(val))
                else:
                    seq = 1
                    hasData = str(key) + '=' + urllib.parse.quote_plus(str(val))
        hashValue = self.__hmacsha512(secret_key, hasData)
        return vnp_SecureHash == hashValue

    @staticmethod
    def __hmacsha512(key, data):
        return hmac.new(key.encode('utf-8'), data.encode('utf-8'), hashlib.sha512).hexdigest()


# Backward compatibility alias
vnpay = VNPay