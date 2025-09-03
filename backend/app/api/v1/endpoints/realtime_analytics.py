"""
BiteBase Intelligence Real-time Analytics API
WebSocket endpoints for live dashboard updates
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from uuid import UUID
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.realtime.analytics_engine import analytics_engine, RealtimeMetric
from app.schemas.analytics import RealtimeMetricResponse, RealtimeSubscriptionRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/realtime-analytics", tags=["realtime-analytics"])

class RealtimeConnectionManager:
    """Manages WebSocket connections for real-time analytics"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}  # user_id -> websocket
        self.user_subscriptions: Dict[str, List[str]] = {}  # user_id -> restaurant_ids
        
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept WebSocket connection"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"Real-time analytics connection established for user {user_id}")
        
    async def disconnect(self, user_id: str):
        """Handle WebSocket disconnection"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        
        if user_id in self.user_subscriptions:
            # Unsubscribe from analytics engine
            await analytics_engine.unsubscribe_user(user_id)
            del self.user_subscriptions[user_id]
        
        logger.info(f"Real-time analytics connection closed for user {user_id}")
    
    async def send_to_user(self, message: Dict[str, Any], user_id: str):
        """Send message to specific user"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {e}")
                await self.disconnect(user_id)
    
    async def broadcast_metrics(self, metrics: List[RealtimeMetric]):
        """Broadcast metrics to relevant users"""
        # Group metrics by restaurant
        restaurant_metrics = {}
        for metric in metrics:
            if metric.restaurant_id not in restaurant_metrics:
                restaurant_metrics[metric.restaurant_id] = []
            restaurant_metrics[metric.restaurant_id].append(metric)
        
        # Send to subscribed users
        for user_id, restaurant_ids in self.user_subscriptions.items():
            user_updates = []
            
            for restaurant_id in restaurant_ids:
                if restaurant_id in restaurant_metrics:
                    user_updates.extend(restaurant_metrics[restaurant_id])
            
            if user_updates:
                message = {
                    "type": "metrics_update",
                    "metrics": [metric.to_dict() for metric in user_updates],
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                await self.send_to_user(message, user_id)

# Global connection manager
connection_manager = RealtimeConnectionManager()

@router.websocket("/ws/{user_id}")
async def realtime_analytics_websocket(
    websocket: WebSocket,
    user_id: str
):
    """WebSocket endpoint for real-time analytics updates"""
    await connection_manager.connect(websocket, user_id)
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connection_established",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "message": "Real-time analytics connection established"
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
        await connection_manager.disconnect(user_id)

async def handle_websocket_message(data: Dict[str, Any], user_id: str, websocket: WebSocket):
    """Handle incoming WebSocket messages"""
    message_type = data.get("type")
    
    if message_type == "ping":
        await websocket.send_json({
            "type": "pong",
            "timestamp": datetime.utcnow().isoformat()
        })
    
    elif message_type == "subscribe":
        restaurant_ids = data.get("restaurant_ids", [])
        await subscribe_to_restaurants(user_id, restaurant_ids)
        
        await websocket.send_json({
            "type": "subscription_confirmed",
            "restaurant_ids": restaurant_ids,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    elif message_type == "unsubscribe":
        restaurant_ids = data.get("restaurant_ids", [])
        await unsubscribe_from_restaurants(user_id, restaurant_ids)
        
        await websocket.send_json({
            "type": "unsubscription_confirmed",
            "restaurant_ids": restaurant_ids,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    elif message_type == "get_current_metrics":
        restaurant_id = data.get("restaurant_id")
        if restaurant_id:
            metrics = await analytics_engine.get_current_metrics(restaurant_id)
            await websocket.send_json({
                "type": "current_metrics",
                "restaurant_id": restaurant_id,
                "metrics": metrics,
                "timestamp": datetime.utcnow().isoformat()
            })
    
    else:
        await websocket.send_json({
            "type": "error",
            "message": f"Unknown message type: {message_type}",
            "timestamp": datetime.utcnow().isoformat()
        })

async def subscribe_to_restaurants(user_id: str, restaurant_ids: List[str]):
    """Subscribe user to restaurant analytics"""
    if user_id not in connection_manager.user_subscriptions:
        connection_manager.user_subscriptions[user_id] = []
    
    # Add new subscriptions
    for restaurant_id in restaurant_ids:
        if restaurant_id not in connection_manager.user_subscriptions[user_id]:
            connection_manager.user_subscriptions[user_id].append(restaurant_id)
    
    # Subscribe in analytics engine
    await analytics_engine.subscribe_user(user_id, restaurant_ids)
    
    logger.info(f"User {user_id} subscribed to restaurants: {restaurant_ids}")

async def unsubscribe_from_restaurants(user_id: str, restaurant_ids: List[str]):
    """Unsubscribe user from restaurant analytics"""
    if user_id in connection_manager.user_subscriptions:
        for restaurant_id in restaurant_ids:
            if restaurant_id in connection_manager.user_subscriptions[user_id]:
                connection_manager.user_subscriptions[user_id].remove(restaurant_id)
    
    # Unsubscribe in analytics engine
    await analytics_engine.unsubscribe_user(user_id, restaurant_ids)
    
    logger.info(f"User {user_id} unsubscribed from restaurants: {restaurant_ids}")

@router.post("/subscribe")
async def subscribe_to_analytics(
    request: RealtimeSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Subscribe to real-time analytics for specific restaurants"""
    try:
        user_id = str(current_user.id)
        restaurant_ids = [str(rid) for rid in request.restaurant_ids]
        
        await subscribe_to_restaurants(user_id, restaurant_ids)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Successfully subscribed to real-time analytics",
                "restaurant_ids": restaurant_ids,
                "user_id": user_id
            }
        )
    
    except Exception as e:
        logger.error(f"Error subscribing to analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to subscribe to analytics")

@router.post("/unsubscribe")
async def unsubscribe_from_analytics(
    request: RealtimeSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Unsubscribe from real-time analytics"""
    try:
        user_id = str(current_user.id)
        restaurant_ids = [str(rid) for rid in request.restaurant_ids]
        
        await unsubscribe_from_restaurants(user_id, restaurant_ids)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Successfully unsubscribed from real-time analytics",
                "restaurant_ids": restaurant_ids,
                "user_id": user_id
            }
        )
    
    except Exception as e:
        logger.error(f"Error unsubscribing from analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to unsubscribe from analytics")

@router.get("/metrics/{restaurant_id}")
async def get_current_metrics(
    restaurant_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current real-time metrics for a restaurant"""
    try:
        metrics = await analytics_engine.get_current_metrics(str(restaurant_id))
        
        return JSONResponse(
            status_code=200,
            content={
                "restaurant_id": str(restaurant_id),
                "metrics": metrics,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
    
    except Exception as e:
        logger.error(f"Error getting metrics for restaurant {restaurant_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get current metrics")

@router.post("/emit-metric")
async def emit_custom_metric(
    metric_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Emit a custom real-time metric (for testing/admin use)"""
    try:
        metric = RealtimeMetric(
            metric_type=metric_data.get("metric_type"),
            value=metric_data.get("value"),
            restaurant_id=metric_data.get("restaurant_id"),
            metadata=metric_data.get("metadata", {})
        )
        
        await analytics_engine.emit_metric(metric)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Metric emitted successfully",
                "metric_id": metric.id,
                "timestamp": metric.timestamp.isoformat()
            }
        )
    
    except Exception as e:
        logger.error(f"Error emitting custom metric: {e}")
        raise HTTPException(status_code=500, detail="Failed to emit metric")

@router.get("/status")
async def get_realtime_status():
    """Get real-time analytics system status"""
    try:
        # Initialize analytics engine if not already done
        if not analytics_engine.is_running:
            await analytics_engine.initialize()
        
        status = {
            "is_running": analytics_engine.is_running,
            "active_connections": len(connection_manager.active_connections),
            "active_subscriptions": len(connection_manager.user_subscriptions),
            "redis_available": analytics_engine.redis_client is not None,
            "cache_size": len(analytics_engine.metric_cache),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return JSONResponse(status_code=200, content=status)
    
    except Exception as e:
        logger.error(f"Error getting realtime status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get status")

# Initialize analytics engine on startup
@router.on_event("startup")
async def startup_event():
    """Initialize real-time analytics engine"""
    try:
        await analytics_engine.initialize()
        logger.info("Real-time analytics engine initialized")
    except Exception as e:
        logger.error(f"Failed to initialize analytics engine: {e}")

# Cleanup on shutdown
@router.on_event("shutdown")
async def shutdown_event():
    """Cleanup real-time analytics engine"""
    try:
        analytics_engine.is_running = False
        if analytics_engine.redis_client:
            await analytics_engine.redis_client.close()
        logger.info("Real-time analytics engine shutdown complete")
    except Exception as e:
        logger.error(f"Error during analytics engine shutdown: {e}")
