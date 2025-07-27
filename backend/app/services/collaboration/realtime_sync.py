"""
Real-time Synchronization Service for Dashboard Collaboration
Implements operational transformation and conflict resolution
"""

from typing import Dict, List, Optional, Any, Set
from datetime import datetime, timezone
import json
import asyncio
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
from abc import ABC, abstractmethod

class OperationType(Enum):
    INSERT = "insert"
    DELETE = "delete"
    UPDATE = "update"
    MOVE = "move"
    STYLE = "style"

@dataclass
class Operation:
    """Represents a single operation in the collaborative editing system"""
    id: str
    type: OperationType
    dashboard_id: str
    user_id: str
    timestamp: datetime
    path: List[str]  # Path to the modified element
    data: Dict[str, Any]
    version: int
    dependencies: List[str] = None  # Operation IDs this depends on
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type.value,
            "dashboard_id": self.dashboard_id,
            "user_id": self.user_id,
            "timestamp": self.timestamp.isoformat(),
            "path": self.path,
            "data": self.data,
            "version": self.version,
            "dependencies": self.dependencies or []
        }

class TransformationStrategy(ABC):
    """Abstract base class for operation transformation strategies"""
    
    @abstractmethod
    def transform(self, op1: Operation, op2: Operation) -> tuple[Operation, Operation]:
        """Transform two concurrent operations"""
        pass

class DefaultTransformation(TransformationStrategy):
    """Default operational transformation implementation"""
    
    def transform(self, op1: Operation, op2: Operation) -> tuple[Operation, Operation]:
        """
        Transform two concurrent operations to maintain consistency
        """
        # If operations are on different paths, no transformation needed
        if not self._paths_intersect(op1.path, op2.path):
            return op1, op2
        
        # Handle same-path operations
        if op1.path == op2.path:
            return self._transform_same_path(op1, op2)
        
        # Handle parent-child relationships
        if self._is_parent_path(op1.path, op2.path):
            return self._transform_parent_child(op1, op2)
        
        return op1, op2
    
    def _paths_intersect(self, path1: List[str], path2: List[str]) -> bool:
        """Check if two paths intersect"""
        min_len = min(len(path1), len(path2))
        return path1[:min_len] == path2[:min_len]
    
    def _is_parent_path(self, parent: List[str], child: List[str]) -> bool:
        """Check if one path is parent of another"""
        if len(parent) >= len(child):
            return False
        return child[:len(parent)] == parent
    
    def _transform_same_path(self, op1: Operation, op2: Operation) -> tuple[Operation, Operation]:
        """Transform operations on the same path"""
        # Last writer wins for updates
        if op1.type == OperationType.UPDATE and op2.type == OperationType.UPDATE:
            if op1.timestamp > op2.timestamp:
                return op1, None  # op2 is superseded
            else:
                return None, op2  # op1 is superseded
        
        # Delete wins over update
        if op1.type == OperationType.DELETE:
            return op1, None
        if op2.type == OperationType.DELETE:
            return None, op2
        
        return op1, op2
    
    def _transform_parent_child(self, parent_op: Operation, child_op: Operation) -> tuple[Operation, Operation]:
        """Transform parent-child path operations"""
        # If parent is deleted, child operation becomes invalid
        if parent_op.type == OperationType.DELETE:
            return parent_op, None
        
        return parent_op, child_op

class ConflictResolver:
    """Resolves conflicts in collaborative editing"""
    
    def __init__(self, transformation_strategy: TransformationStrategy = None):
        self.transformation_strategy = transformation_strategy or DefaultTransformation()
        self.operation_history: Dict[str, List[Operation]] = {}
    
    async def resolve_conflict(self, operations: List[Operation]) -> List[Operation]:
        """
        Resolve conflicts between a list of concurrent operations
        """
        if len(operations) <= 1:
            return operations
        
        # Sort operations by timestamp for deterministic resolution
        operations.sort(key=lambda op: (op.timestamp, op.user_id))
        
        resolved_operations = []
        
        for i, current_op in enumerate(operations):
            transformed_op = current_op
            
            # Transform against all previous operations
            for prev_op in resolved_operations:
                if transformed_op is None:
                    break
                
                transformed_op, _ = self.transformation_strategy.transform(
                    transformed_op, prev_op
                )
            
            if transformed_op is not None:
                resolved_operations.append(transformed_op)
        
        return resolved_operations
    
    async def apply_operations(self, dashboard_state: Dict[str, Any], 
                             operations: List[Operation]) -> Dict[str, Any]:
        """
        Apply a list of operations to a dashboard state
        """
        state = dashboard_state.copy()
        
        for operation in operations:
            state = await self._apply_single_operation(state, operation)
        
        return state
    
    async def _apply_single_operation(self, state: Dict[str, Any], 
                                    operation: Operation) -> Dict[str, Any]:
        """Apply a single operation to the state"""
        try:
            if operation.type == OperationType.INSERT:
                return self._apply_insert(state, operation)
            elif operation.type == OperationType.DELETE:
                return self._apply_delete(state, operation)
            elif operation.type == OperationType.UPDATE:
                return self._apply_update(state, operation)
            elif operation.type == OperationType.MOVE:
                return self._apply_move(state, operation)
            elif operation.type == OperationType.STYLE:
                return self._apply_style(state, operation)
            
        except Exception as e:
            # Log error but don't crash the collaboration session
            print(f"Error applying operation {operation.id}: {e}")
        
        return state
    
    def _apply_insert(self, state: Dict[str, Any], operation: Operation) -> Dict[str, Any]:
        """Apply insert operation"""
        target = self._navigate_to_path(state, operation.path[:-1])
        if isinstance(target, list):
            index = int(operation.path[-1])
            target.insert(index, operation.data)
        elif isinstance(target, dict):
            target[operation.path[-1]] = operation.data
        return state
    
    def _apply_delete(self, state: Dict[str, Any], operation: Operation) -> Dict[str, Any]:
        """Apply delete operation"""
        target = self._navigate_to_path(state, operation.path[:-1])
        if isinstance(target, list):
            index = int(operation.path[-1])
            if 0 <= index < len(target):
                del target[index]
        elif isinstance(target, dict):
            target.pop(operation.path[-1], None)
        return state
    
    def _apply_update(self, state: Dict[str, Any], operation: Operation) -> Dict[str, Any]:
        """Apply update operation"""
        target = self._navigate_to_path(state, operation.path[:-1])
        if isinstance(target, (list, dict)):
            key = operation.path[-1]
            if isinstance(target, list):
                key = int(key)
            if isinstance(target, list) and 0 <= key < len(target):
                target[key] = operation.data
            elif isinstance(target, dict):
                target[key] = operation.data
        return state
    
    def _apply_move(self, state: Dict[str, Any], operation: Operation) -> Dict[str, Any]:
        """Apply move operation"""
        # Move operations need source and target paths
        source_path = operation.data.get('source_path', [])
        target_path = operation.data.get('target_path', [])
        
        if source_path and target_path:
            # Extract item from source
            source_parent = self._navigate_to_path(state, source_path[:-1])
            item = None
            
            if isinstance(source_parent, list):
                index = int(source_path[-1])
                if 0 <= index < len(source_parent):
                    item = source_parent.pop(index)
            elif isinstance(source_parent, dict):
                item = source_parent.pop(source_path[-1], None)
            
            # Insert at target
            if item is not None:
                target_parent = self._navigate_to_path(state, target_path[:-1])
                if isinstance(target_parent, list):
                    index = int(target_path[-1])
                    target_parent.insert(index, item)
                elif isinstance(target_parent, dict):
                    target_parent[target_path[-1]] = item
        
        return state
    
    def _apply_style(self, state: Dict[str, Any], operation: Operation) -> Dict[str, Any]:
        """Apply style operation"""
        target = self._navigate_to_path(state, operation.path)
        if isinstance(target, dict):
            style_data = operation.data.get('style', {})
            if 'style' not in target:
                target['style'] = {}
            target['style'].update(style_data)
        return state
    
    def _navigate_to_path(self, state: Dict[str, Any], path: List[str]) -> Any:
        """Navigate to a specific path in the state"""
        current = state
        for key in path:
            if isinstance(current, list):
                try:
                    current = current[int(key)]
                except (ValueError, IndexError):
                    return None
            elif isinstance(current, dict):
                current = current.get(key)
                if current is None:
                    return None
            else:
                return None
        return current

class RealtimeSyncService:
    """Main service for managing real-time dashboard synchronization"""
    
    def __init__(self):
        self.active_sessions: Dict[str, Set[str]] = {}  # dashboard_id -> user_ids
        self.operation_queue: Dict[str, List[Operation]] = {}  # dashboard_id -> operations
        self.dashboard_states: Dict[str, Dict[str, Any]] = {}  # dashboard_id -> state
        self.conflict_resolver = ConflictResolver()
        self.version_counter: Dict[str, int] = {}  # dashboard_id -> version
        
    async def join_session(self, dashboard_id: str, user_id: str) -> Dict[str, Any]:
        """User joins a collaborative session"""
        if dashboard_id not in self.active_sessions:
            self.active_sessions[dashboard_id] = set()
            self.operation_queue[dashboard_id] = []
            self.version_counter[dashboard_id] = 0
        
        self.active_sessions[dashboard_id].add(user_id)
        
        return {
            "session_id": f"{dashboard_id}:{user_id}",
            "participants": list(self.active_sessions[dashboard_id]),
            "current_version": self.version_counter[dashboard_id],
            "dashboard_state": self.dashboard_states.get(dashboard_id, {})
        }
    
    async def leave_session(self, dashboard_id: str, user_id: str) -> Dict[str, Any]:
        """User leaves a collaborative session"""
        if dashboard_id in self.active_sessions:
            self.active_sessions[dashboard_id].discard(user_id)
            
            if not self.active_sessions[dashboard_id]:
                # Clean up empty sessions
                del self.active_sessions[dashboard_id]
                # Keep recent operations for reconnection
                
        return {
            "participants": list(self.active_sessions.get(dashboard_id, [])),
            "user_left": user_id
        }
    
    async def submit_operation(self, operation: Operation) -> Dict[str, Any]:
        """Submit an operation for collaborative editing"""
        dashboard_id = operation.dashboard_id
        
        # Add to operation queue
        if dashboard_id not in self.operation_queue:
            self.operation_queue[dashboard_id] = []
        
        # Set operation version
        operation.version = self.version_counter.get(dashboard_id, 0) + 1
        
        self.operation_queue[dashboard_id].append(operation)
        
        # Process operations in batch for efficiency
        await self._process_operations(dashboard_id)
        
        return {
            "operation_id": operation.id,
            "status": "processed",
            "new_version": self.version_counter[dashboard_id],
            "participants_to_notify": list(self.active_sessions.get(dashboard_id, []))
        }
    
    async def _process_operations(self, dashboard_id: str):
        """Process pending operations for a dashboard"""
        if dashboard_id not in self.operation_queue:
            return
        
        operations = self.operation_queue[dashboard_id]
        if not operations:
            return
        
        # Group operations by version for batch processing
        current_version = self.version_counter.get(dashboard_id, 0)
        pending_operations = [op for op in operations if op.version > current_version]
        
        if not pending_operations:
            return
        
        # Resolve conflicts
        resolved_operations = await self.conflict_resolver.resolve_conflict(pending_operations)
        
        # Apply operations to dashboard state
        current_state = self.dashboard_states.get(dashboard_id, {})
        new_state = await self.conflict_resolver.apply_operations(current_state, resolved_operations)
        
        # Update state and version
        self.dashboard_states[dashboard_id] = new_state
        self.version_counter[dashboard_id] = max(op.version for op in resolved_operations)
        
        # Clear processed operations
        self.operation_queue[dashboard_id] = [
            op for op in operations if op.version > self.version_counter[dashboard_id]
        ]
    
    async def get_session_state(self, dashboard_id: str) -> Dict[str, Any]:
        """Get current session state"""
        return {
            "dashboard_id": dashboard_id,
            "participants": list(self.active_sessions.get(dashboard_id, [])),
            "version": self.version_counter.get(dashboard_id, 0),
            "state": self.dashboard_states.get(dashboard_id, {}),
            "pending_operations": len(self.operation_queue.get(dashboard_id, []))
        }
    
    async def sync_user_state(self, dashboard_id: str, user_id: str, 
                            from_version: int) -> Dict[str, Any]:
        """Sync user state from a specific version"""
        current_version = self.version_counter.get(dashboard_id, 0)
        
        if from_version >= current_version:
            return {
                "status": "up_to_date",
                "version": current_version
            }
        
        # Get operations since user's version
        operations = self.operation_queue.get(dashboard_id, [])
        missing_operations = [
            op.to_dict() for op in operations 
            if op.version > from_version and op.user_id != user_id
        ]
        
        return {
            "status": "sync_required",
            "current_version": current_version,
            "operations": missing_operations,
            "dashboard_state": self.dashboard_states.get(dashboard_id, {})
        }

# Global service instance
realtime_sync_service = RealtimeSyncService()