"""
Real-time Notifications API for BiteBase Intelligence
WebSocket-based instant notifications system
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, CurrentUser

logger = logging.getLogger(__name__)

router = APIRouter()

# Notification Models
class NotificationType:
    """Notification type constants"""
    SYSTEM = "system"
    DASHBOARD_SHARED = "dashboard_shared"
    REPORT_READY = "report_ready"
    AI_INSIGHT = "ai_insight"
    DATA_SOURCE_CONNECTED = "data_source_connected"
    DATA_SOURCE_ERROR = "data_source_error"
    USER_MENTION = "user_mention"
    COLLABORATION_INVITE = "collaboration_invite"
    EXPORT_COMPLETE = "export_complete"
    ALERT_TRIGGERED = "alert_triggered"
    MAINTENANCE = "maintenance"


class NotificationPriority:
    """Notification priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Notification(BaseModel):
    """Notification data model"""
    id: str
    type: str
    title: str
    message: str
    priority: str = NotificationPriority.MEDIUM
    user_id: str
    data: Optional[Dict] = None
    read: bool = False
    created_at: datetime
    expires_at: Optional[datetime] = None
    action_url: Optional[str] = None
    action_text: Optional[str] = None


class NotificationUpdate(BaseModel):
    """Real-time notification update"""
    event_type: str  # "new_notification", "notification_read", "notification_deleted"
    notification: Optional[Notification] = None
    notification_id: Optional[str] = None
    timestamp: datetime


# WebSocket Connection Manager
class NotificationManager:
    """Manages WebSocket connections for real-time notifications"""
    
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}  # user_id -> websockets
        self.connection_metadata: Dict[WebSocket, Dict] = {}  # websocket -> metadata
        self.user_notifications: Dict[str, List[Notification]] = {}  # user_id -> notifications
        
    async def connect(self, websocket: WebSocket, user_id: str, device_info: Optional[Dict] = None):
        """Connect a user's WebSocket"""
        await websocket.accept()
        
        # Add to user connections
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        
        # Store connection metadata
        self.connection_metadata[websocket] = {
            "user_id": user_id,
            "connected_at": datetime.now(timezone.utc),
            "device_info": device_info or {},
            "last_ping": datetime.now(timezone.utc)
        }
        
        logger.info(f"User {user_id} connected to notifications WebSocket")
        
        # Send pending notifications
        await self._send_pending_notifications(user_id, websocket)
    
    async def disconnect(self, websocket: WebSocket):
        """Disconnect a WebSocket"""
        if websocket in self.connection_metadata:
            user_id = self.connection_metadata[websocket]["user_id"]
            
            # Remove from user connections
            if user_id in self.active_connections:
                self.active_connections[user_id].discard(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
            
            # Remove metadata
            del self.connection_metadata[websocket]
            
            logger.info(f"User {user_id} disconnected from notifications WebSocket")
    
    async def send_notification(self, notification: Notification):
        """Send notification to a specific user"""
        user_id = notification.user_id
        
        # Store notification
        if user_id not in self.user_notifications:
            self.user_notifications[user_id] = []
        self.user_notifications[user_id].append(notification)
        
        # Keep only last 100 notifications per user
        self.user_notifications[user_id] = self.user_notifications[user_id][-100:]
        
        # Send to active connections
        if user_id in self.active_connections:
            update = NotificationUpdate(
                event_type="new_notification",
                notification=notification,
                timestamp=datetime.now(timezone.utc)
            )
            
            await self._send_to_user_connections(user_id, update.dict())
    
    async def broadcast_notification(self, notification_data: Dict, exclude_users: Optional[Set[str]] = None):
        """Broadcast notification to all connected users"""
        exclude_users = exclude_users or set()
        
        for user_id, connections in self.active_connections.items():
            if user_id not in exclude_users:
                await self._send_to_user_connections(user_id, notification_data)
    
    async def mark_notification_read(self, user_id: str, notification_id: str):
        """Mark a notification as read"""
        if user_id in self.user_notifications:
            for notification in self.user_notifications[user_id]:
                if notification.id == notification_id:
                    notification.read = True
                    
                    # Send update to user connections
                    update = NotificationUpdate(
                        event_type="notification_read",
                        notification_id=notification_id,
                        timestamp=datetime.now(timezone.utc)
                    )
                    
                    await self._send_to_user_connections(user_id, update.dict())
                    break
    
    async def delete_notification(self, user_id: str, notification_id: str):
        """Delete a notification"""
        if user_id in self.user_notifications:
            self.user_notifications[user_id] = [
                n for n in self.user_notifications[user_id] 
                if n.id != notification_id
            ]
            
            # Send update to user connections
            update = NotificationUpdate(
                event_type="notification_deleted",
                notification_id=notification_id,
                timestamp=datetime.now(timezone.utc)
            )
            
            await self._send_to_user_connections(user_id, update.dict())
    
    async def get_user_notifications(self, user_id: str, unread_only: bool = False) -> List[Notification]:
        """Get notifications for a user"""
        notifications = self.user_notifications.get(user_id, [])
        
        if unread_only:
            notifications = [n for n in notifications if not n.read]
        
        return sorted(notifications, key=lambda x: x.created_at, reverse=True)
    
    async def _send_to_user_connections(self, user_id: str, message: Dict):
        """Send message to all connections for a user"""
        if user_id not in self.active_connections:
            return
        
        connections_to_remove = []
        
        for websocket in self.active_connections[user_id]:
            try:
                await websocket.send_text(json.dumps(message, default=str))
            except Exception as e:
                logger.error(f"Error sending to WebSocket: {str(e)}")
                connections_to_remove.append(websocket)
        
        # Remove failed connections
        for websocket in connections_to_remove:
            await self.disconnect(websocket)
    
    async def _send_pending_notifications(self, user_id: str, websocket: WebSocket):
        """Send pending notifications to a newly connected user"""
        notifications = await self.get_user_notifications(user_id)
        
        if notifications:
            initial_data = {
                "event_type": "initial_notifications",
                "notifications": [n.dict() for n in notifications],
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            try:
                await websocket.send_text(json.dumps(initial_data, default=str))
            except Exception as e:
                logger.error(f"Error sending initial notifications: {str(e)}")
    
    async def cleanup_expired_notifications(self):
        """Clean up expired notifications"""
        current_time = datetime.now(timezone.utc)
        
        for user_id in self.user_notifications:
            self.user_notifications[user_id] = [
                n for n in self.user_notifications[user_id]
                if n.expires_at is None or n.expires_at > current_time
            ]
    
    def get_connection_stats(self) -> Dict:
        """Get connection statistics"""
        total_connections = sum(len(connections) for connections in self.active_connections.values())
        
        return {
            "total_users": len(self.active_connections),
            "total_connections": total_connections,
            "users_online": list(self.active_connections.keys()),
            "avg_connections_per_user": total_connections / max(len(self.active_connections), 1)
        }


# Global notification manager
notification_manager = NotificationManager()


# WebSocket endpoint
@router.websocket("/ws/{user_id}")
async def notifications_websocket(
    websocket: WebSocket,
    user_id: str,
    device_type: Optional[str] = None,
    device_id: Optional[str] = None
):
    """WebSocket endpoint for real-time notifications"""
    
    device_info = {
        "device_type": device_type,
        "device_id": device_id,
        "user_agent": websocket.headers.get("user-agent", "")
    }
    
    await notification_manager.connect(websocket, user_id, device_info)
    
    try:
        while True:
            try:
                # Receive messages from client
                data = await websocket.receive_json()

                # Handle different message types
                message_type = data.get("type")

                if message_type == "ping":
                    # Update last ping time
                    if websocket in notification_manager.connection_metadata:
                        notification_manager.connection_metadata[websocket]["last_ping"] = datetime.now(timezone.utc)

                    # Send pong response
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }))

                elif message_type == "mark_read":
                    notification_id = data.get("notification_id")
                    if notification_id:
                        await notification_manager.mark_notification_read(user_id, notification_id)

                elif message_type == "delete_notification":
                    notification_id = data.get("notification_id")
                    if notification_id:
                        await notification_manager.delete_notification(user_id, notification_id)

                elif message_type == "get_notifications":
                    unread_only = data.get("unread_only", False)
                    notifications = await notification_manager.get_user_notifications(user_id, unread_only)

                    await websocket.send_text(json.dumps({
                        "type": "notifications_list",
                        "notifications": [n.dict() for n in notifications],
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }, default=str))

            except json.JSONDecodeError:
                logger.error("Invalid JSON received from WebSocket")
                break
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {str(e)}")
                break

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        await notification_manager.disconnect(websocket)


# REST API Endpoints
@router.post("/send")
async def send_notification(
    notification_data: Dict,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Send a notification to a user"""
    try:
        notification = Notification(
            id=f"notif_{datetime.now().timestamp()}_{notification_data['user_id']}",
            type=notification_data.get("type", NotificationType.SYSTEM),
            title=notification_data["title"],
            message=notification_data["message"],
            priority=notification_data.get("priority", NotificationPriority.MEDIUM),
            user_id=notification_data["user_id"],
            data=notification_data.get("data"),
            created_at=datetime.now(timezone.utc),
            expires_at=notification_data.get("expires_at"),
            action_url=notification_data.get("action_url"),
            action_text=notification_data.get("action_text")
        )

        await notification_manager.send_notification(notification)

        return {
            "status": "success",
            "notification_id": notification.id,
            "message": "Notification sent successfully"
        }

    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send notification")


@router.post("/broadcast")
async def broadcast_notification(
    notification_data: Dict,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Broadcast a notification to all users"""
    try:
        broadcast_data = {
            "event_type": "broadcast_notification",
            "notification": {
                "id": f"broadcast_{datetime.now().timestamp()}",
                "type": notification_data.get("type", NotificationType.SYSTEM),
                "title": notification_data["title"],
                "message": notification_data["message"],
                "priority": notification_data.get("priority", NotificationPriority.MEDIUM),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "action_url": notification_data.get("action_url"),
                "action_text": notification_data.get("action_text")
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        exclude_users = set(notification_data.get("exclude_users", []))
        await notification_manager.broadcast_notification(broadcast_data, exclude_users)

        return {
            "status": "success",
            "message": "Notification broadcasted successfully",
            "recipients": len(notification_manager.active_connections) - len(exclude_users)
        }

    except Exception as e:
        logger.error(f"Error broadcasting notification: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to broadcast notification")


@router.get("/list")
async def get_notifications(
    unread_only: bool = False,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get notifications for the current user"""
    try:
        notifications = await notification_manager.get_user_notifications(
            current_user.id, unread_only
        )

        return {
            "notifications": [n.dict() for n in notifications],
            "total": len(notifications),
            "unread_count": len([n for n in notifications if not n.read])
        }

    except Exception as e:
        logger.error(f"Error getting notifications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get notifications")


@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Mark a notification as read"""
    try:
        await notification_manager.mark_notification_read(current_user.id, notification_id)

        return {
            "status": "success",
            "message": "Notification marked as read"
        }

    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to mark notification as read")


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """Delete a notification"""
    try:
        await notification_manager.delete_notification(current_user.id, notification_id)

        return {
            "status": "success",
            "message": "Notification deleted successfully"
        }

    except Exception as e:
        logger.error(f"Error deleting notification: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete notification")


@router.get("/stats")
async def get_notification_stats(
    current_user: CurrentUser = Depends(get_current_user)
):
    """Get notification system statistics (admin only)"""
    try:
        # In a real implementation, you'd check if user is admin
        stats = notification_manager.get_connection_stats()

        return {
            "connection_stats": stats,
            "notification_counts": {
                user_id: len(notifications)
                for user_id, notifications in notification_manager.user_notifications.items()
            }
        }

    except Exception as e:
        logger.error(f"Error getting notification stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get notification stats")


# Background task for cleanup
async def cleanup_notifications_task():
    """Background task to clean up expired notifications"""
    while True:
        try:
            await notification_manager.cleanup_expired_notifications()
            await asyncio.sleep(3600)  # Run every hour
        except Exception as e:
            logger.error(f"Error in notification cleanup task: {str(e)}")
            await asyncio.sleep(60)  # Retry after 1 minute on error
