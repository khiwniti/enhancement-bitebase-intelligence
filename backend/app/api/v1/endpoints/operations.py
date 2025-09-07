"""
Operations API Endpoints
FastAPI endpoints for restaurant operations management
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import json
from datetime import datetime

from app.core.database import get_db
from app.services.operations import OperationsService
from app.schemas.operations import (
    ServicePhaseUpdate, ServicePhaseResponse, RestaurantOperationsResponse,
    OrderCreate, OrderUpdate, OrderResponse, OrderListResponse, OrderFilters,
    TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskFilters,
    StaffSessionCreate, StaffSessionUpdate, StaffSessionResponse,
    OperationalMetricCreate, OperationalDashboard, LiveUpdatesResponse,
    APIResponse, PaginatedResponse
)
from app.core.auth import get_current_user

router = APIRouter()


class ConnectionManager:
    """WebSocket connection manager for real-time updates"""
    
    def __init__(self):
        self.active_connections: dict = {}
    
    async def connect(self, websocket: WebSocket, restaurant_id: str):
        await websocket.accept()
        if restaurant_id not in self.active_connections:
            self.active_connections[restaurant_id] = []
        self.active_connections[restaurant_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, restaurant_id: str):
        if restaurant_id in self.active_connections:
            self.active_connections[restaurant_id].remove(websocket)
    
    async def broadcast_to_restaurant(self, restaurant_id: str, message: dict):
        if restaurant_id in self.active_connections:
            for connection in self.active_connections[restaurant_id]:
                try:
                    await connection.send_json(message)
                except:
                    # Connection is closed, remove it
                    self.active_connections[restaurant_id].remove(connection)

manager = ConnectionManager()


# Service Phase Management
@router.get("/restaurants/{restaurant_id}/phase", response_model=ServicePhaseResponse)
async def get_current_service_phase(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get current service phase for restaurant"""
    service = OperationsService(db)
    operations = await service.get_current_phase(restaurant_id)
    
    if not operations:
        raise HTTPException(status_code=404, detail="Restaurant operations not found")
    
    phase_duration = int((datetime.utcnow() - operations.phase_started_at).total_seconds() / 60)
    
    return ServicePhaseResponse(
        current_phase=operations.current_phase,
        is_transitioning=operations.is_transitioning,
        phase_started_at=operations.phase_started_at,
        phase_duration_minutes=phase_duration
    )


@router.post("/restaurants/{restaurant_id}/phase", response_model=ServicePhaseResponse)
async def update_service_phase(
    restaurant_id: str,
    phase_update: ServicePhaseUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update service phase with transition logging"""
    service = OperationsService(db)
    
    # Set user_id from current user if not provided
    if not phase_update.user_id:
        phase_update.user_id = current_user.id
    
    operations = await service.update_service_phase(restaurant_id, phase_update)
    
    # Broadcast phase change to connected clients
    await manager.broadcast_to_restaurant(restaurant_id, {
        "type": "phase_change",
        "data": {
            "current_phase": operations.current_phase.value,
            "is_transitioning": operations.is_transitioning,
            "phase_started_at": operations.phase_started_at.isoformat()
        },
        "timestamp": datetime.utcnow().isoformat(),
        "restaurant_id": restaurant_id
    })
    
    phase_duration = int((datetime.utcnow() - operations.phase_started_at).total_seconds() / 60)
    
    return ServicePhaseResponse(
        current_phase=operations.current_phase,
        is_transitioning=operations.is_transitioning,
        phase_started_at=operations.phase_started_at,
        phase_duration_minutes=phase_duration
    )


@router.post("/restaurants/{restaurant_id}/phase/transition")
async def start_phase_transition(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Mark restaurant as transitioning between phases"""
    service = OperationsService(db)
    operations = await service.start_phase_transition(restaurant_id)
    
    # Broadcast transition start to connected clients
    await manager.broadcast_to_restaurant(restaurant_id, {
        "type": "transition_start",
        "data": {"is_transitioning": True},
        "timestamp": datetime.utcnow().isoformat(),
        "restaurant_id": restaurant_id
    })
    
    return {"success": True, "is_transitioning": operations.is_transitioning}


# Order Management
@router.post("/restaurants/{restaurant_id}/orders", response_model=OrderResponse)
async def create_order(
    restaurant_id: str,
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new order"""
    service = OperationsService(db)
    order = await service.create_order(restaurant_id, order_data)
    
    # Broadcast new order to connected clients
    await manager.broadcast_to_restaurant(restaurant_id, {
        "type": "order_created",
        "data": {
            "id": order.id,
            "order_number": order.order_number,
            "status": order.status.value,
            "type": order.type.value,
            "total": order.total,
            "created_at": order.created_at.isoformat()
        },
        "timestamp": datetime.utcnow().isoformat(),
        "restaurant_id": restaurant_id
    })
    
    return order


@router.get("/restaurants/{restaurant_id}/orders", response_model=OrderListResponse)
async def get_orders(
    restaurant_id: str,
    status: Optional[List[str]] = Query(None),
    order_type: Optional[List[str]] = Query(None),
    customer_name: Optional[str] = Query(None),
    table_number: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get orders with optional filtering"""
    service = OperationsService(db)
    
    # Build filters
    filters = None
    if any([status, order_type, customer_name, table_number]):
        filters = OrderFilters(
            status=status,
            type=order_type,
            customer_name=customer_name,
            table_number=table_number
        )
    
    orders = await service.get_orders(restaurant_id, filters, skip, limit)
    active_count = await service.get_active_orders_count(restaurant_id)
    urgent_count = await service.get_urgent_orders_count(restaurant_id)
    
    return OrderListResponse(
        orders=orders,
        total_count=len(orders),
        active_orders=active_count,
        urgent_orders=urgent_count
    )


@router.get("/restaurants/{restaurant_id}/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    restaurant_id: str,
    order_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get specific order by ID"""
    service = OperationsService(db)
    order = await service.get_order(restaurant_id, order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order


@router.put("/restaurants/{restaurant_id}/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    restaurant_id: str,
    order_id: str,
    order_update: OrderUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update order status and details"""
    service = OperationsService(db)
    order = await service.update_order(restaurant_id, order_id, order_update)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Broadcast order update to connected clients
    await manager.broadcast_to_restaurant(restaurant_id, {
        "type": "order_updated",
        "data": {
            "id": order.id,
            "order_number": order.order_number,
            "status": order.status.value,
            "actual_prep_time": order.actual_prep_time,
            "updated_at": order.updated_at.isoformat() if order.updated_at else None
        },
        "timestamp": datetime.utcnow().isoformat(),
        "restaurant_id": restaurant_id
    })
    
    return order


# Task Management
@router.post("/restaurants/{restaurant_id}/tasks", response_model=TaskResponse)
async def create_task(
    restaurant_id: str,
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new task"""
    service = OperationsService(db)
    task = await service.create_task(restaurant_id, task_data)
    
    # Broadcast new task to connected clients
    await manager.broadcast_to_restaurant(restaurant_id, {
        "type": "task_created",
        "data": {
            "id": task.id,
            "title": task.title,
            "status": task.status.value,
            "priority": task.priority.value,
            "assigned_to_user_id": task.assigned_to_user_id,
            "assigned_to_role": task.assigned_to_role,
            "due_date": task.due_date.isoformat() if task.due_date else None
        },
        "timestamp": datetime.utcnow().isoformat(),
        "restaurant_id": restaurant_id
    })
    
    return task


@router.get("/restaurants/{restaurant_id}/tasks", response_model=TaskListResponse)
async def get_tasks(
    restaurant_id: str,
    status: Optional[List[str]] = Query(None),
    priority: Optional[List[str]] = Query(None),
    category: Optional[str] = Query(None),
    assigned_to_user_id: Optional[str] = Query(None),
    assigned_to_role: Optional[str] = Query(None),
    overdue_only: Optional[bool] = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get tasks with optional filtering"""
    service = OperationsService(db)
    
    # Build filters
    filters = None
    if any([status, priority, category, assigned_to_user_id, assigned_to_role, overdue_only]):
        filters = TaskFilters(
            status=status,
            priority=priority,
            category=category,
            assigned_to_user_id=assigned_to_user_id,
            assigned_to_role=assigned_to_role,
            overdue_only=overdue_only
        )
    
    tasks = await service.get_tasks(restaurant_id, filters, skip, limit)
    task_counts = await service.get_task_counts(restaurant_id)
    
    return TaskListResponse(
        tasks=tasks,
        total_count=len(tasks),
        pending_count=task_counts["pending"],
        in_progress_count=task_counts["in_progress"],
        completed_count=task_counts["completed"],
        overdue_count=task_counts["overdue"]
    )


@router.get("/restaurants/{restaurant_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    restaurant_id: str,
    task_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get specific task by ID"""
    service = OperationsService(db)
    task = await service.get_task(restaurant_id, task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task


@router.put("/restaurants/{restaurant_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    restaurant_id: str,
    task_id: str,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update task status and details"""
    service = OperationsService(db)
    task = await service.update_task(restaurant_id, task_id, task_update)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Set completion user if task is being completed
    if task_update.status and task_update.status.value == "completed":
        task.completed_by_user_id = current_user.id
        task.completed_at = datetime.utcnow()
    
    # Broadcast task update to connected clients
    await manager.broadcast_to_restaurant(restaurant_id, {
        "type": "task_updated",
        "data": {
            "id": task.id,
            "title": task.title,
            "status": task.status.value,
            "completion_notes": task.completion_notes,
            "completed_by_user_id": task.completed_by_user_id,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
            "updated_at": task.updated_at.isoformat() if task.updated_at else None
        },
        "timestamp": datetime.utcnow().isoformat(),
        "restaurant_id": restaurant_id
    })
    
    return task


# Staff Session Management
@router.post("/restaurants/{restaurant_id}/staff/sessions", response_model=StaffSessionResponse)
async def create_staff_session(
    restaurant_id: str,
    session_data: StaffSessionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new staff session (check in)"""
    service = OperationsService(db)
    session = await service.create_staff_session(restaurant_id, session_data)
    
    # Broadcast staff check-in to connected clients
    await manager.broadcast_to_restaurant(restaurant_id, {
        "type": "staff_checkin",
        "data": {
            "user_id": session.user_id,
            "role": session.role,
            "session_start": session.session_start.isoformat()
        },
        "timestamp": datetime.utcnow().isoformat(),
        "restaurant_id": restaurant_id
    })
    
    return session


@router.get("/restaurants/{restaurant_id}/staff/count")
async def get_active_staff_count(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get count of currently active staff"""
    service = OperationsService(db)
    count = await service.get_active_staff_count(restaurant_id)
    
    return {"active_staff_count": count}


# Dashboard and Analytics
@router.get("/restaurants/{restaurant_id}/dashboard", response_model=OperationalDashboard)
async def get_operational_dashboard(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get comprehensive operational dashboard data"""
    service = OperationsService(db)
    dashboard_data = await service.get_operational_dashboard(restaurant_id)
    
    return OperationalDashboard(**dashboard_data)


@router.get("/restaurants/{restaurant_id}/metrics/orders")
async def get_order_metrics(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get order-related metrics"""
    service = OperationsService(db)
    
    active_orders = await service.get_active_orders_count(restaurant_id)
    urgent_orders = await service.get_urgent_orders_count(restaurant_id)
    avg_order_time = await service.calculate_avg_order_time(restaurant_id)
    
    return {
        "active_orders": active_orders,
        "urgent_orders": urgent_orders,
        "average_order_time_minutes": avg_order_time
    }


@router.get("/restaurants/{restaurant_id}/metrics/tasks")
async def get_task_metrics(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get task-related metrics"""
    service = OperationsService(db)
    task_counts = await service.get_task_counts(restaurant_id)
    
    return task_counts


# Real-time WebSocket endpoint
@router.websocket("/restaurants/{restaurant_id}/live")
async def websocket_live_updates(websocket: WebSocket, restaurant_id: str):
    """WebSocket endpoint for real-time operational updates"""
    await manager.connect(websocket, restaurant_id)
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connection_established",
            "data": {"restaurant_id": restaurant_id},
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for messages from client (heartbeat, etc.)
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "heartbeat":
                    await websocket.send_json({
                        "type": "heartbeat_response",
                        "timestamp": datetime.utcnow().isoformat()
                    })
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                # Log error but don't break connection
                await websocket.send_json({
                    "type": "error",
                    "data": {"message": "Invalid message format"},
                    "timestamp": datetime.utcnow().isoformat()
                })
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, restaurant_id)
    except Exception as e:
        manager.disconnect(websocket, restaurant_id)
        await websocket.close()