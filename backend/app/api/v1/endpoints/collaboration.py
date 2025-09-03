"""
Collaboration API endpoints for real-time dashboard editing
Handles WebSocket connections, presence tracking, and operational transformation
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional, Any
import json
import asyncio
from datetime import datetime
import uuid

from app.services.collaboration.realtime_sync import (
    realtime_sync_service, 
    Operation, 
    OperationType,
    RealtimeSyncService
)
from app.services.collaboration.presence_tracker import (
    presence_tracker,
    CursorPosition,
    PresenceStatus,
    PresenceTracker
)
from app.schemas.dashboard import DashboardResponse
from app.core.database import get_db

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}  # dashboard_id -> websockets
        self.user_connections: Dict[str, WebSocket] = {}  # user_id -> websocket
        
    async def connect(self, websocket: WebSocket, dashboard_id: str, user_id: str):
        """Accept WebSocket connection and add to session"""
        await websocket.accept()
        
        if dashboard_id not in self.active_connections:
            self.active_connections[dashboard_id] = []
        
        self.active_connections[dashboard_id].append(websocket)
        self.user_connections[f"{dashboard_id}:{user_id}"] = websocket
        
        return True
    
    def disconnect(self, websocket: WebSocket, dashboard_id: str, user_id: str):
        """Remove WebSocket connection"""
        if dashboard_id in self.active_connections:
            if websocket in self.active_connections[dashboard_id]:
                self.active_connections[dashboard_id].remove(websocket)
            
            if not self.active_connections[dashboard_id]:
                del self.active_connections[dashboard_id]
        
        self.user_connections.pop(f"{dashboard_id}:{user_id}", None)
    
    async def send_to_user(self, dashboard_id: str, user_id: str, message: dict):
        """Send message to specific user"""
        connection_key = f"{dashboard_id}:{user_id}"
        if connection_key in self.user_connections:
            try:
                await self.user_connections[connection_key].send_text(json.dumps(message))
            except Exception as e:
                print(f"Error sending to user {user_id}: {e}")
    
    async def broadcast_to_session(self, dashboard_id: str, message: dict, exclude_user: Optional[str] = None):
        """Broadcast message to all users in a session"""
        if dashboard_id not in self.active_connections:
            return
        
        message_text = json.dumps(message)
        connections_to_remove = []
        
        for websocket in self.active_connections[dashboard_id]:
            try:
                # Skip excluded user
                if exclude_user:
                    user_connection_key = None
                    for key, ws in self.user_connections.items():
                        if ws == websocket and key.endswith(f":{exclude_user}"):
                            user_connection_key = key
                            break
                    if user_connection_key:
                        continue
                
                await websocket.send_text(message_text)
            except Exception as e:
                print(f"Error broadcasting to session {dashboard_id}: {e}")
                connections_to_remove.append(websocket)
        
        # Remove failed connections
        for websocket in connections_to_remove:
            if websocket in self.active_connections[dashboard_id]:
                self.active_connections[dashboard_id].remove(websocket)

# Global connection manager
connection_manager = ConnectionManager()

@router.websocket("/ws/{dashboard_id}/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    dashboard_id: str, 
    user_id: str,
    username: str = "Anonymous",
    avatar_url: Optional[str] = None
):
    """
    WebSocket endpoint for real-time collaboration
    Handles presence tracking, cursor sharing, and operation synchronization
    """
    
    # Connect user to session
    await connection_manager.connect(websocket, dashboard_id, user_id)
    
    try:
        # Join collaboration session
        session_data = await realtime_sync_service.join_session(dashboard_id, user_id)
        presence_data = await presence_tracker.join_session(dashboard_id, user_id, username, avatar_url)
        
        # Send initial session state
        await websocket.send_text(json.dumps({
            "type": "session_joined",
            "data": {
                "session": session_data,
                "presence": presence_data,
                "dashboard_state": session_data.get("dashboard_state", {})
            }
        }))
        
        # Notify other users of new participant
        await connection_manager.broadcast_to_session(
            dashboard_id,
            {
                "type": "user_joined",
                "data": {
                    "user_id": user_id,
                    "username": username,
                    "avatar_url": avatar_url,
                    "presence": presence_data["user_presence"]
                }
            },
            exclude_user=user_id
        )
        
        # Main message loop
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            message_data = message.get("data", {})
            
            if message_type == "operation":
                await handle_operation(websocket, dashboard_id, user_id, message_data)
            
            elif message_type == "cursor_move":
                await handle_cursor_move(websocket, dashboard_id, user_id, message_data)
            
            elif message_type == "activity_update":
                await handle_activity_update(websocket, dashboard_id, user_id, message_data)
            
            elif message_type == "sync_request":
                await handle_sync_request(websocket, dashboard_id, user_id, message_data)
            
            elif message_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong", "timestamp": datetime.now().isoformat()}))
            
            else:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": f"Unknown message type: {message_type}"
                }))
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error for user {user_id} in dashboard {dashboard_id}: {e}")
    finally:
        # Clean up on disconnect
        connection_manager.disconnect(websocket, dashboard_id, user_id)
        
        # Leave sessions
        await realtime_sync_service.leave_session(dashboard_id, user_id)
        leave_data = await presence_tracker.leave_session(dashboard_id, user_id)
        
        # Notify other users
        await connection_manager.broadcast_to_session(
            dashboard_id,
            {
                "type": "user_left",
                "data": {
                    "user_id": user_id,
                    "remaining_participants": leave_data.get("remaining_participants", [])
                }
            }
        )

async def handle_operation(websocket: WebSocket, dashboard_id: str, user_id: str, data: Dict[str, Any]):
    """Handle collaborative editing operation"""
    try:
        # Create operation object
        operation = Operation(
            id=str(uuid.uuid4()),
            type=OperationType(data["operation_type"]),
            dashboard_id=dashboard_id,
            user_id=user_id,
            timestamp=datetime.now(),
            path=data.get("path", []),
            data=data.get("operation_data", {}),
            version=data.get("version", 0),
            dependencies=data.get("dependencies", [])
        )
        
        # Submit operation for processing
        result = await realtime_sync_service.submit_operation(operation)
        
        # Send confirmation to sender
        await websocket.send_text(json.dumps({
            "type": "operation_processed",
            "data": {
                "operation_id": operation.id,
                "status": result["status"],
                "new_version": result["new_version"]
            }
        }))
        
        # Broadcast operation to other users
        await connection_manager.broadcast_to_session(
            dashboard_id,
            {
                "type": "operation_applied",
                "data": {
                    "operation": operation.to_dict(),
                    "version": result["new_version"]
                }
            },
            exclude_user=user_id
        )
        
    except Exception as e:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": f"Failed to process operation: {str(e)}"
        }))

async def handle_cursor_move(websocket: WebSocket, dashboard_id: str, user_id: str, data: Dict[str, Any]):
    """Handle cursor position update"""
    try:
        cursor_position = CursorPosition(
            x=data.get("x", 0),
            y=data.get("y", 0),
            element_id=data.get("element_id"),
            element_type=data.get("element_type"),
            selection=data.get("selection")
        )
        
        # Update cursor position
        result = await presence_tracker.update_cursor_position(dashboard_id, user_id, cursor_position)
        
        # Broadcast cursor position to other users
        await connection_manager.broadcast_to_session(
            dashboard_id,
            {
                "type": "cursor_moved",
                "data": {
                    "user_id": user_id,
                    "cursor_position": cursor_position.to_dict()
                }
            },
            exclude_user=user_id
        )
        
    except Exception as e:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": f"Failed to update cursor: {str(e)}"
        }))

async def handle_activity_update(websocket: WebSocket, dashboard_id: str, user_id: str, data: Dict[str, Any]):
    """Handle user activity update"""
    try:
        action = data.get("action", "viewing")
        element_id = data.get("element_id")
        
        # Update user activity
        result = await presence_tracker.update_user_activity(dashboard_id, user_id, action, element_id)
        
        # Broadcast activity to other users
        await connection_manager.broadcast_to_session(
            dashboard_id,
            {
                "type": "activity_updated",
                "data": result["user_activity"]
            },
            exclude_user=user_id
        )
        
    except Exception as e:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": f"Failed to update activity: {str(e)}"
        }))

async def handle_sync_request(websocket: WebSocket, dashboard_id: str, user_id: str, data: Dict[str, Any]):
    """Handle user sync request"""
    try:
        from_version = data.get("from_version", 0)
        
        # Get sync data
        sync_data = await realtime_sync_service.sync_user_state(dashboard_id, user_id, from_version)
        
        # Send sync response
        await websocket.send_text(json.dumps({
            "type": "sync_response",
            "data": sync_data
        }))
        
    except Exception as e:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": f"Failed to sync: {str(e)}"
        }))

# REST API endpoints for collaboration management

@router.post("/sessions/{dashboard_id}/join")
async def join_collaboration_session(
    dashboard_id: str,
    user_data: Dict[str, Any]
):
    """Join a collaboration session (REST endpoint)"""
    try:
        user_id = user_data["user_id"]
        username = user_data.get("username", "Anonymous")
        avatar_url = user_data.get("avatar_url")
        
        # Join both sync and presence sessions
        session_data = await realtime_sync_service.join_session(dashboard_id, user_id)
        presence_data = await presence_tracker.join_session(dashboard_id, user_id, username, avatar_url)
        
        return {
            "status": "success",
            "session": session_data,
            "presence": presence_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to join session: {str(e)}"
        )

@router.get("/sessions/{dashboard_id}/presence")
async def get_session_presence(dashboard_id: str):
    """Get current presence information for a session"""
    try:
        presence_data = await presence_tracker.get_session_presence(dashboard_id)
        return presence_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get presence: {str(e)}"
        )

@router.get("/sessions/{dashboard_id}/state")
async def get_session_state(dashboard_id: str):
    """Get current session state"""
    try:
        session_state = await realtime_sync_service.get_session_state(dashboard_id)
        return session_state
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get session state: {str(e)}"
        )

@router.get("/users/{user_id}/presence")
async def get_user_presence(user_id: str):
    """Get user's presence across all sessions"""
    try:
        presence_data = await presence_tracker.get_user_presence_across_sessions(user_id)
        return presence_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user presence: {str(e)}"
        )

@router.get("/sessions/{dashboard_id}/statistics")
async def get_session_statistics(dashboard_id: str):
    """Get detailed session statistics"""
    try:
        stats = await presence_tracker.get_session_statistics(dashboard_id)
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )

@router.post("/sessions/{dashboard_id}/operations")
async def submit_operation_rest(
    dashboard_id: str,
    operation_data: Dict[str, Any]
):
    """Submit an operation via REST API (fallback for WebSocket)"""
    try:
        # Create operation object
        operation = Operation(
            id=str(uuid.uuid4()),
            type=OperationType(operation_data["operation_type"]),
            dashboard_id=dashboard_id,
            user_id=operation_data["user_id"],
            timestamp=datetime.now(),
            path=operation_data.get("path", []),
            data=operation_data.get("operation_data", {}),
            version=operation_data.get("version", 0),
            dependencies=operation_data.get("dependencies", [])
        )
        
        # Submit operation
        result = await realtime_sync_service.submit_operation(operation)
        
        # Broadcast to WebSocket users
        await connection_manager.broadcast_to_session(
            dashboard_id,
            {
                "type": "operation_applied",
                "data": {
                    "operation": operation.to_dict(),
                    "version": result["new_version"]
                }
            },
            exclude_user=operation_data["user_id"]
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit operation: {str(e)}"
        )

# Initialize services on startup
@router.on_event("startup")
async def startup_collaboration_services():
    """Initialize collaboration services"""
    await presence_tracker.start_presence_tracking()

@router.on_event("shutdown")
async def shutdown_collaboration_services():
    """Clean up collaboration services"""
    await presence_tracker.stop_presence_tracking()