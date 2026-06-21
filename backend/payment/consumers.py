import json
from channels.generic.websocket import AsyncWebsocketConsumer

class OrderNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            # Reject connection for unauthenticated users
            await self.close()
            return

        self.group_name = f"user_{self.user.id}"
        
        # Join group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            # Leave group
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    # Receive message from room group
    async def send_notification(self, event):
        message = event.get('message')
        notification_type = event.get('notification_type', 'order_update')
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'notification_type': notification_type,
            'data': event.get('data', {})
        }, ensure_ascii=False))
