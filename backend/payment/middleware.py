import urllib.parse
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_key):
    try:
        # Validate simplejwt token
        token = AccessToken(token_key)
        user_id = token.payload.get('user_id')
        if user_id:
            return User.objects.get(id=user_id)
    except Exception:
        pass
    return AnonymousUser()

class JWTAuthMiddleware:
    """
    Custom middleware to authenticate WebSocket connections via SimpleJWT token in the query parameters.
    Example URL: ws://localhost:8000/ws/notifications/?token=<JWT_TOKEN>
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Close old db connections to prevent leaks
        close_old_connections()
        
        # Parse query string
        query_string = scope.get('query_string', b'').decode()
        query_params = urllib.parse.parse_qs(query_string)
        
        token = query_params.get('token', [None])[0]
        
        if token:
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
            
        return await self.inner(scope, receive, send)
