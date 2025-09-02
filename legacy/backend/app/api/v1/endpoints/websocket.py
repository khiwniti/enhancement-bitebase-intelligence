"""
General WebSocket endpoints for real-time updates
Provides unified WebSocket interface for frontend compatibility
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List, Set, Any, Optional
import json
import asyncio
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)
router = APIRouter()

class WebSocketManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        # Store active connections by user_id
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Store subscriptions by user_id -> set of topics
        self.user_subscriptions: Dict[str, Set[str]] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str):
        """Connect a new WebSocket"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        logger.info(f"WebSocket connected for user: {user_id}")
        
    async def disconnect(self, websocket: WebSocket, user_id: str):
        """Disconnect a WebSocket"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            
            # Clean up empty sets
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                
        logger.info(f"WebSocket disconnected for user: {user_id}")
        
    async def send_to_user(self, message: dict, user_id: str):
        """Send message to all connections for a specific user"""
        if user_id in self.active_connections:
            disconnected = set()
            
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending to WebSocket: {e}")
                    disconnected.add(websocket)
            
            # Remove disconnected WebSockets
            for websocket in disconnected:
                self.active_connections[user_id].discard(websocket)
                
    async def broadcast(self, message: dict, topic: Optional[str] = None):
        """Broadcast message to all connected users or specific topic subscribers"""
        for user_id in self.active_connections:
            # If topic is specified, only send to subscribers
            if topic and user_id in self.user_subscriptions:
                if topic not in self.user_subscriptions[user_id]:
                    continue
                    
            await self.send_to_user(message, user_id)
            
    async def subscribe_user(self, user_id: str, topics: List[str]):
        """Subscribe user to specific topics"""
        if user_id not in self.user_subscriptions:
            self.user_subscriptions[user_id] = set()
            
        self.user_subscriptions[user_id].update(topics)
        logger.info(f"User {user_id} subscribed to topics: {topics}")
        
    async def unsubscribe_user(self, user_id: str, topics: List[str] = None):
        """Unsubscribe user from topics"""
        if user_id in self.user_subscriptions:
            if topics:
                self.user_subscriptions[user_id] -= set(topics)
            else:
                del self.user_subscriptions[user_id]
                
        logger.info(f"User {user_id} unsubscribed from topics: {topics or 'all'}")

# Global WebSocket manager
websocket_manager = WebSocketManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    General WebSocket endpoint for real-time updates
    Supports dashboard updates, notifications, and live data
    """
    await websocket_manager.connect(websocket, user_id)
    
    try:
        # Send connection confirmation
        await websocket.send_json({
            "type": "connection_established",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "message": "WebSocket connection established"
        })
        
        # Handle incoming messages
        while True:
            try:
                data = await websocket.receive_json()
                await handle_websocket_message(data, user_id, websocket)
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                })
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
    finally:
        await websocket_manager.disconnect(websocket, user_id)

async def handle_websocket_message(data: Dict[str, Any], user_id: str, websocket: WebSocket):
    """Handle incoming WebSocket messages"""
    message_type = data.get("type")
    
    if message_type == "ping":
        await websocket.send_json({
            "type": "pong",
            "timestamp": datetime.utcnow().isoformat()
        })
        
    elif message_type == "subscribe":
        topics = data.get("topics", [])
        await websocket_manager.subscribe_user(user_id, topics)
        
        await websocket.send_json({
            "type": "subscription_confirmed",
            "topics": topics,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    elif message_type == "unsubscribe":
        topics = data.get("topics", [])
        await websocket_manager.unsubscribe_user(user_id, topics)
        
        await websocket.send_json({
            "type": "unsubscription_confirmed",
            "topics": topics,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    elif message_type == "dashboard_update":
        # Handle dashboard updates
        dashboard_id = data.get("dashboard_id")
        update_data = data.get("data", {})
        
        # Broadcast to other users viewing the same dashboard
        broadcast_message = {
            "type": "dashboard_updated",
            "dashboard_id": dashboard_id,
            "data": update_data,
            "updated_by": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await websocket_manager.broadcast(broadcast_message, f"dashboard:{dashboard_id}")
        
    elif message_type == "request_live_data":
        # Send mock live data
        data_type = data.get("data_type", "metrics")
        
        if data_type == "metrics":
            live_data = {
                "revenue": 125000 + (hash(str(datetime.now())) % 10000),
                "orders": 1250 + (hash(str(datetime.now())) % 100),
                "customers": 850 + (hash(str(datetime.now())) % 50),
                "rating": 4.2 + (hash(str(datetime.now())) % 10) / 100
            }
        else:
            live_data = {"message": "Live data not available for this type"}
            
        await websocket.send_json({
            "type": "live_data",
            "data_type": data_type,
            "data": live_data,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    else:
        await websocket.send_json({
            "type": "error",
            "message": f"Unknown message type: {message_type}",
            "timestamp": datetime.utcnow().isoformat()
        })

# Background task to send periodic updates
async def send_periodic_updates():
    """Send periodic updates to connected clients"""
    while True:
        try:
            # Send live metrics update every 30 seconds
            update_message = {
                "type": "periodic_update",
                "data": {
                    "timestamp": datetime.utcnow().isoformat(),
                    "active_users": len(websocket_manager.active_connections),
                    "system_status": "healthy"
                }
            }
            
            await websocket_manager.broadcast(update_message, "system_updates")
            await asyncio.sleep(30)
            
        except Exception as e:
            logger.error(f"Error in periodic updates: {e}")
            await asyncio.sleep(60)

# Start background task when module is imported
@router.on_event("startup")
async def startup_event():
    """Start background tasks"""
    asyncio.create_task(send_periodic_updates())
    logger.info("WebSocket background tasks started")

# Utility functions for external use
async def broadcast_dashboard_update(dashboard_id: str, update_data: dict, user_id: str):
    """Broadcast dashboard update to all subscribers"""
    message = {
        "type": "dashboard_updated",
        "dashboard_id": dashboard_id,
        "data": update_data,
        "updated_by": user_id,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await websocket_manager.broadcast(message, f"dashboard:{dashboard_id}")

async def send_notification(user_id: str, notification: dict):
    """Send notification to specific user"""
    message = {
        "type": "notification",
        "notification": notification,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await websocket_manager.send_to_user(message, user_id)
