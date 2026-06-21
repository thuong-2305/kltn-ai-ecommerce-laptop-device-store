from rest_framework.response import Response
from rest_framework import status

def build_media_url(request, file_field):
    """
    Build absolute media URL for serialization.
    """
    if not file_field:
        return None

    try:
        return request.build_absolute_uri(file_field.url)
    except ValueError:
        return None

def get_first_serializer_error(serializer):
    """
    Extracts the first error message from serializer.errors.
    Handles nested errors (recursively gets the first error string).
    """
    if not serializer.errors:
        return "Dữ liệu không hợp lệ"
    
    def _extract_first(errors):
        if isinstance(errors, dict):
            if not errors:
                return "Dữ liệu không hợp lệ"
            first_key = next(iter(errors))
            return _extract_first(errors[first_key])
        elif isinstance(errors, list):
            if not errors:
                return "Dữ liệu không hợp lệ"
            if isinstance(errors[0], (dict, list)):
                return _extract_first(errors[0])
            return str(errors[0])
        return str(errors)

    return _extract_first(serializer.errors)

def format_serializer_error(serializer):
    """
    Returns a Response object with the first error message,
    conforming to the frontend API specification.
    """
    error_msg = get_first_serializer_error(serializer)
    return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)

def get_authenticated_user(request, raise_on_invalid_token=False):
    """
    Authenticate the user using SimpleJWT.
    Returns user if valid.
    If header is present but token is invalid/expired, raises error or returns None.
    """
    from rest_framework_simplejwt.authentication import JWTAuthentication
    jwt_auth = JWTAuthentication()
    header = jwt_auth.get_header(request)
    if header is None:
        return None
        
    try:
        validated = jwt_auth.authenticate(request)
        if validated is not None:
            return validated[0]
    except Exception as e:
        if raise_on_invalid_token:
            raise e
    return None

