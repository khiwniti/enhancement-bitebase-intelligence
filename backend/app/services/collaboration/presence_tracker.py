"""
Presence Tracking Service for Real-time Collaboration
Tracks user presence, cursors, and activity in collaborative sessions
"""

from typing import Dict, List, Optional, Any, Set
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import asyncio
import json

class PresenceStatus(Enum):
    ONLINE = "online"
    AWAY = "away"
    OFFLINE = "offline"
    EDITING = "editing"

@dataclass
class CursorPosition:
    """Represents a user's cursor position in the dashboard"""
    x: float
    y: float
    element_id: Optional[str] = None
    element_type: Optional[str] = None  # widget, chart, text, etc.
    selection: Optional[Dict[str, Any]] = None  # Selected elements/text
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class UserPresence:
    """Represents a user's presence in a collaborative session"""
    user_id: str
    username: str
    avatar_url: Optional[str]
    status: PresenceStatus
    cursor_position: Optional[CursorPosition]
    last_activity: datetime
    current_action: Optional[str] = None  # "editing", "viewing", "commenting"
    active_element: Optional[str] = None  # ID of element being edited
    color: str = "#3B82F6"  # User's assigned color for cursors/highlights
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "username": self.username,
            "avatar_url": self.avatar_url,
            "status": self.status.value,
            "cursor_position": self.cursor_position.to_dict() if self.cursor_position else None,
            "last_activity": self.last_activity.isoformat(),
            "current_action": self.current_action,
            "active_element": self.active_element,
            "color": self.color
        }

@dataclass
class CollaborationSession:
    """Represents a collaborative editing session"""
    dashboard_id: str
    created_at: datetime
    participants: Dict[str, UserPresence]
    active_cursors: Dict[str, CursorPosition]
    session_stats: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "dashboard_id": self.dashboard_id,
            "created_at": self.created_at.isoformat(),
            "participants": {uid: presence.to_dict() for uid, presence in self.participants.items()},
            "active_cursors": {uid: cursor.to_dict() for uid, cursor in self.active_cursors.items()},
            "session_stats": self.session_stats
        }

class PresenceTracker:
    """Service for tracking user presence and activity in collaborative sessions"""
    
    def __init__(self):
        self.sessions: Dict[str, CollaborationSession] = {}  # dashboard_id -> session
        self.user_sessions: Dict[str, Set[str]] = {}  # user_id -> set of dashboard_ids
        self.presence_timeout = timedelta(minutes=5)  # Consider user away after 5 minutes
        self.offline_timeout = timedelta(minutes=15)  # Consider user offline after 15 minutes
        self.cleanup_task = None
        
        # Color palette for user cursors
        self.user_colors = [
            "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
            "#06B6D4", "#F97316", "#84CC16", "#EC4899", "#6366F1"
        ]
        self.color_index = 0
    
    async def start_presence_tracking(self):
        """Start the presence tracking service"""
        if self.cleanup_task is None:
            self.cleanup_task = asyncio.create_task(self._cleanup_inactive_users())
    
    async def stop_presence_tracking(self):
        """Stop the presence tracking service"""
        if self.cleanup_task:
            self.cleanup_task.cancel()
            self.cleanup_task = None
    
    async def join_session(self, dashboard_id: str, user_id: str, 
                          username: str, avatar_url: Optional[str] = None) -> Dict[str, Any]:
        """User joins a collaborative session"""
        # Create session if it doesn't exist
        if dashboard_id not in self.sessions:
            self.sessions[dashboard_id] = CollaborationSession(
                dashboard_id=dashboard_id,
                created_at=datetime.now(timezone.utc),
                participants={},
                active_cursors={},
                session_stats={"total_joins": 0, "peak_users": 0}
            )
        
        session = self.sessions[dashboard_id]
        
        # Assign color to user
        user_color = self._assign_user_color(user_id)
        
        # Create or update user presence
        user_presence = UserPresence(
            user_id=user_id,
            username=username,
            avatar_url=avatar_url,
            status=PresenceStatus.ONLINE,
            cursor_position=None,
            last_activity=datetime.now(timezone.utc),
            color=user_color
        )
        
        session.participants[user_id] = user_presence
        
        # Update user sessions tracking
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = set()
        self.user_sessions[user_id].add(dashboard_id)
        
        # Update session stats
        session.session_stats["total_joins"] += 1
        current_users = len([p for p in session.participants.values() 
                           if p.status != PresenceStatus.OFFLINE])
        session.session_stats["peak_users"] = max(
            session.session_stats["peak_users"], 
            current_users
        )
        
        return {
            "session_id": f"{dashboard_id}:{user_id}",
            "user_presence": user_presence.to_dict(),
            "other_participants": [
                p.to_dict() for uid, p in session.participants.items() 
                if uid != user_id and p.status != PresenceStatus.OFFLINE
            ],
            "session_stats": session.session_stats
        }
    
    async def leave_session(self, dashboard_id: str, user_id: str) -> Dict[str, Any]:
        """User leaves a collaborative session"""
        if dashboard_id not in self.sessions:
            return {"status": "session_not_found"}
        
        session = self.sessions[dashboard_id]
        
        # Remove user presence
        if user_id in session.participants:
            session.participants[user_id].status = PresenceStatus.OFFLINE
            session.participants[user_id].last_activity = datetime.now(timezone.utc)
        
        # Remove cursor
        session.active_cursors.pop(user_id, None)
        
        # Update user sessions tracking
        if user_id in self.user_sessions:
            self.user_sessions[user_id].discard(dashboard_id)
            if not self.user_sessions[user_id]:
                del self.user_sessions[user_id]
        
        # Clean up empty sessions
        active_participants = [
            p for p in session.participants.values() 
            if p.status != PresenceStatus.OFFLINE
        ]
        
        if not active_participants:
            # Keep session for a while in case users reconnect
            pass
        
        return {
            "status": "left",
            "remaining_participants": [p.to_dict() for p in active_participants]
        }
    
    async def update_cursor_position(self, dashboard_id: str, user_id: str, 
                                   cursor_position: CursorPosition) -> Dict[str, Any]:
        """Update user's cursor position"""
        if dashboard_id not in self.sessions:
            return {"status": "session_not_found"}
        
        session = self.sessions[dashboard_id]
        
        # Update cursor position
        session.active_cursors[user_id] = cursor_position
        
        # Update user presence
        if user_id in session.participants:
            user_presence = session.participants[user_id]
            user_presence.cursor_position = cursor_position
            user_presence.last_activity = datetime.now(timezone.utc)
            user_presence.status = PresenceStatus.ONLINE
        
        return {
            "status": "updated",
            "cursor_position": cursor_position.to_dict(),
            "other_cursors": {
                uid: cursor.to_dict() 
                for uid, cursor in session.active_cursors.items() 
                if uid != user_id
            }
        }
    
    async def update_user_activity(self, dashboard_id: str, user_id: str, 
                                 action: str, element_id: Optional[str] = None) -> Dict[str, Any]:
        """Update user's current activity"""
        if dashboard_id not in self.sessions:
            return {"status": "session_not_found"}
        
        session = self.sessions[dashboard_id]
        
        if user_id in session.participants:
            user_presence = session.participants[user_id]
            user_presence.current_action = action
            user_presence.active_element = element_id
            user_presence.last_activity = datetime.now(timezone.utc)
            
            # Update status based on activity
            if action in ["editing", "commenting"]:
                user_presence.status = PresenceStatus.EDITING
            else:
                user_presence.status = PresenceStatus.ONLINE
        
        return {
            "status": "updated",
            "user_activity": {
                "user_id": user_id,
                "action": action,
                "element_id": element_id,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        }
    
    async def get_session_presence(self, dashboard_id: str) -> Dict[str, Any]:
        """Get current presence information for a session"""
        if dashboard_id not in self.sessions:
            return {"status": "session_not_found"}
        
        session = self.sessions[dashboard_id]
        
        # Update presence status based on last activity
        await self._update_presence_status(session)
        
        active_participants = [
            p.to_dict() for p in session.participants.values() 
            if p.status != PresenceStatus.OFFLINE
        ]
        
        return {
            "dashboard_id": dashboard_id,
            "participants": active_participants,
            "active_cursors": {
                uid: cursor.to_dict() 
                for uid, cursor in session.active_cursors.items()
            },
            "session_stats": session.session_stats,
            "total_participants": len(active_participants)
        }
    
    async def get_user_presence_across_sessions(self, user_id: str) -> Dict[str, Any]:
        """Get user's presence across all active sessions"""
        user_presence_data = {}
        
        if user_id in self.user_sessions:
            for dashboard_id in self.user_sessions[user_id]:
                if dashboard_id in self.sessions:
                    session = self.sessions[dashboard_id]
                    if user_id in session.participants:
                        presence = session.participants[user_id]
                        user_presence_data[dashboard_id] = presence.to_dict()
        
        return {
            "user_id": user_id,
            "active_sessions": user_presence_data,
            "total_sessions": len(user_presence_data)
        }
    
    async def _update_presence_status(self, session: CollaborationSession):
        """Update presence status based on last activity"""
        now = datetime.now(timezone.utc)
        
        for user_presence in session.participants.values():
            time_since_activity = now - user_presence.last_activity
            
            if time_since_activity > self.offline_timeout:
                user_presence.status = PresenceStatus.OFFLINE
                # Remove cursor for offline users
                session.active_cursors.pop(user_presence.user_id, None)
            elif time_since_activity > self.presence_timeout:
                if user_presence.status != PresenceStatus.OFFLINE:
                    user_presence.status = PresenceStatus.AWAY
            elif user_presence.status not in [PresenceStatus.ONLINE, PresenceStatus.EDITING]:
                user_presence.status = PresenceStatus.ONLINE
    
    async def _cleanup_inactive_users(self):
        """Background task to clean up inactive users"""
        while True:
            try:
                await asyncio.sleep(60)  # Run every minute
                
                now = datetime.now(timezone.utc)
                sessions_to_clean = []
                
                for dashboard_id, session in self.sessions.items():
                    await self._update_presence_status(session)
                    
                    # Remove offline users after extended period
                    offline_cutoff = now - timedelta(hours=1)
                    users_to_remove = [
                        uid for uid, presence in session.participants.items()
                        if (presence.status == PresenceStatus.OFFLINE and 
                            presence.last_activity < offline_cutoff)
                    ]
                    
                    for user_id in users_to_remove:
                        del session.participants[user_id]
                        session.active_cursors.pop(user_id, None)
                        
                        # Update user sessions tracking
                        if user_id in self.user_sessions:
                            self.user_sessions[user_id].discard(dashboard_id)
                            if not self.user_sessions[user_id]:
                                del self.user_sessions[user_id]
                    
                    # Mark empty sessions for cleanup
                    if not session.participants:
                        sessions_to_clean.append(dashboard_id)
                
                # Clean up empty sessions
                for dashboard_id in sessions_to_clean:
                    del self.sessions[dashboard_id]
                    
            except Exception as e:
                print(f"Error in presence cleanup: {e}")
                await asyncio.sleep(60)
    
    def _assign_user_color(self, user_id: str) -> str:
        """Assign a color to a user based on their ID"""
        # Use hash of user_id to get consistent color
        user_hash = hash(user_id) % len(self.user_colors)
        return self.user_colors[user_hash]
    
    async def get_session_statistics(self, dashboard_id: str) -> Dict[str, Any]:
        """Get detailed session statistics"""
        if dashboard_id not in self.sessions:
            return {"status": "session_not_found"}
        
        session = self.sessions[dashboard_id]
        now = datetime.now(timezone.utc)
        
        # Calculate session duration
        session_duration = now - session.created_at
        
        # Count active users by status
        status_counts = {}
        for status in PresenceStatus:
            status_counts[status.value] = len([
                p for p in session.participants.values() 
                if p.status == status
            ])
        
        return {
            "dashboard_id": dashboard_id,
            "session_duration_minutes": session_duration.total_seconds() / 60,
            "presence_stats": status_counts,
            "total_participants": len(session.participants),
            "active_cursors": len(session.active_cursors),
            "session_stats": session.session_stats
        }

# Global presence tracker instance
presence_tracker = PresenceTracker()