"""
Mobile API Endpoints
Optimized endpoints for mobile app operations
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.database import get_db
from app.services.operations import OperationsService
from app.schemas.operations import (
    ServicePhase, OrderStatus, TaskStatus, TaskPriority,
    OrderResponse, TaskResponse, StaffSessionResponse
)
from app.core.auth import get_current_user

router = APIRouter()


# Mobile Dashboard - Optimized for quick loading
@router.get("/restaurants/{restaurant_id}/mobile/dashboard")
async def get_mobile_dashboard(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get optimized dashboard data for mobile app"""
    service = OperationsService(db)
    
    # Get current phase
    operations = await service.get_current_phase(restaurant_id)
    if not operations:
        raise HTTPException(status_code=404, detail="Restaurant operations not found")
    
    # Get essential metrics
    active_orders = await service.get_active_orders_count(restaurant_id)
    urgent_orders = await service.get_urgent_orders_count(restaurant_id)
    task_counts = await service.get_task_counts(restaurant_id)
    staff_count = await service.get_active_staff_count(restaurant_id)
    
    # Calculate phase duration
    phase_duration = int((datetime.utcnow() - operations.phase_started_at).total_seconds() / 60)
    
    return {
        "current_phase": operations.current_phase.value,
        "is_transitioning": operations.is_transitioning,
        "phase_duration_minutes": phase_duration,
        "metrics": {
            "active_orders": active_orders,
            "urgent_orders": urgent_orders,
            "pending_tasks": task_counts["pending"],
            "overdue_tasks": task_counts["overdue"],
            "staff_on_duty": staff_count
        },
        "alerts": {
            "urgent_orders": urgent_orders > 0,
            "overdue_tasks": task_counts["overdue"] > 0,
            "staff_shortage": staff_count < 2  # Configurable threshold
        }
    }


# Mobile Order Queue - Simplified for mobile
@router.get("/restaurants/{restaurant_id}/mobile/orders")
async def get_mobile_orders(
    restaurant_id: str,
    status_filter: Optional[str] = Query("active", description="active, urgent, or all"),
    limit: int = Query(20, le=50, description="Limit for mobile performance"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get orders optimized for mobile display"""
    service = OperationsService(db)
    
    # Build filters based on mobile-specific needs
    filters = None
    if status_filter == "active":
        from app.schemas.operations import OrderFilters
        filters = OrderFilters(
            status=[OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY]
        )
    elif status_filter == "urgent":
        # Get urgent orders (created > 15 minutes ago and not completed)
        cutoff_time = datetime.utcnow() - timedelta(minutes=15)
        from app.schemas.operations import OrderFilters
        filters = OrderFilters(
            status=[OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING],
            created_before=cutoff_time
        )
    
    orders = await service.get_orders(restaurant_id, filters, 0, limit)
    
    # Simplify order data for mobile
    mobile_orders = []
    for order in orders:
        # Calculate wait time
        wait_time = int((datetime.utcnow() - order.created_at).total_seconds() / 60)
        is_urgent = wait_time > 15 and order.status not in [OrderStatus.SERVED, OrderStatus.CANCELLED]
        
        mobile_orders.append({
            "id": order.id,
            "order_number": order.order_number,
            "customer_name": order.customer_name or "Walk-in",
            "type": order.type.value,
            "status": order.status.value,
            "table_number": order.table_number,
            "total": order.total,
            "item_count": len(order.items),
            "wait_time_minutes": wait_time,
            "is_urgent": is_urgent,
            "estimated_prep_time": order.estimated_prep_time,
            "created_at": order.created_at.isoformat()
        })
    
    return {
        "orders": mobile_orders,
        "total_count": len(mobile_orders),
        "has_urgent": any(order["is_urgent"] for order in mobile_orders)
    }


# Mobile Task List - Prioritized for staff
@router.get("/restaurants/{restaurant_id}/mobile/tasks")
async def get_mobile_tasks(
    restaurant_id: str,
    assigned_to_me: Optional[bool] = Query(False, description="Filter tasks assigned to current user"),
    status_filter: Optional[str] = Query("active", description="active, overdue, or all"),
    limit: int = Query(15, le=30, description="Limit for mobile performance"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get tasks optimized for mobile staff interface"""
    service = OperationsService(db)
    
    # Build filters
    from app.schemas.operations import TaskFilters
    filters_dict = {}
    
    if assigned_to_me:
        filters_dict["assigned_to_user_id"] = current_user.id
    
    if status_filter == "active":
        filters_dict["status"] = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS]
    elif status_filter == "overdue":
        filters_dict["overdue_only"] = True
    
    filters = TaskFilters(**filters_dict) if filters_dict else None
    
    tasks = await service.get_tasks(restaurant_id, filters, 0, limit)
    
    # Simplify task data for mobile
    mobile_tasks = []
    for task in tasks:
        # Calculate urgency based on due date and priority
        is_overdue = task.due_date and task.due_date <= datetime.utcnow() and task.status != TaskStatus.COMPLETED
        time_until_due = None
        if task.due_date:
            time_until_due = int((task.due_date - datetime.utcnow()).total_seconds() / 60)
        
        mobile_tasks.append({
            "id": task.id,
            "title": task.title,
            "status": task.status.value,
            "priority": task.priority.value,
            "category": task.category,
            "assigned_to_role": task.assigned_to_role,
            "estimated_duration": task.estimated_duration,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "time_until_due_minutes": time_until_due,
            "is_overdue": is_overdue,
            "photo_required": task.photo_required,
            "location": task.location,
            "created_at": task.created_at.isoformat()
        })
    
    # Sort by priority and urgency
    priority_order = {"critical": 4, "high": 3, "medium": 2, "low": 1}
    mobile_tasks.sort(key=lambda x: (
        -priority_order.get(x["priority"], 0),  # Higher priority first
        x["is_overdue"],  # Overdue tasks first
        x["time_until_due_minutes"] or 999999  # Soonest due date first
    ))
    
    return {
        "tasks": mobile_tasks,
        "total_count": len(mobile_tasks),
        "has_overdue": any(task["is_overdue"] for task in mobile_tasks),
        "critical_count": len([t for t in mobile_tasks if t["priority"] == "critical"])
    }


# Mobile Quick Actions
@router.post("/restaurants/{restaurant_id}/mobile/quick-actions/next-phase")
async def mobile_next_phase(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Quick action to move to next logical service phase"""
    service = OperationsService(db)
    operations = await service.get_current_phase(restaurant_id)
    
    if not operations:
        raise HTTPException(status_code=404, detail="Restaurant operations not found")
    
    # Define phase progression logic
    phase_progression = {
        ServicePhase.CLOSED: ServicePhase.OPENING,
        ServicePhase.OPENING: ServicePhase.BREAKFAST,
        ServicePhase.BREAKFAST: ServicePhase.LUNCH,
        ServicePhase.LUNCH: ServicePhase.AFTERNOON_BREAK,
        ServicePhase.AFTERNOON_BREAK: ServicePhase.DINNER,
        ServicePhase.DINNER: ServicePhase.LATE_NIGHT,
        ServicePhase.LATE_NIGHT: ServicePhase.CLOSING,
        ServicePhase.CLOSING: ServicePhase.CLOSED
    }
    
    next_phase = phase_progression.get(operations.current_phase)
    if not next_phase:
        return {"error": "No next phase available"}
    
    from app.schemas.operations import ServicePhaseUpdate
    phase_update = ServicePhaseUpdate(
        phase=next_phase,
        user_id=current_user.id,
        notes=f"Phase transition via mobile quick action"
    )
    
    updated_operations = await service.update_service_phase(restaurant_id, phase_update)
    
    return {
        "success": True,
        "current_phase": updated_operations.current_phase.value,
        "message": f"Transitioned to {updated_operations.current_phase.value}"
    }


@router.post("/restaurants/{restaurant_id}/mobile/quick-actions/mark-order-ready/{order_id}")
async def mobile_mark_order_ready(
    restaurant_id: str,
    order_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Quick action to mark order as ready"""
    service = OperationsService(db)
    
    from app.schemas.operations import OrderUpdate
    order_update = OrderUpdate(status=OrderStatus.READY)
    
    order = await service.update_order(restaurant_id, order_id, order_update)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "success": True,
        "order_id": order.id,
        "order_number": order.order_number,
        "status": order.status.value,
        "message": f"Order {order.order_number} marked as ready"
    }


@router.post("/restaurants/{restaurant_id}/mobile/quick-actions/complete-task/{task_id}")
async def mobile_complete_task(
    restaurant_id: str,
    task_id: str,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Quick action to complete a task"""
    service = OperationsService(db)
    
    from app.schemas.operations import TaskUpdate
    task_update = TaskUpdate(
        status=TaskStatus.COMPLETED,
        completion_notes=notes or f"Completed via mobile by {current_user.id}"
    )
    
    task = await service.update_task(restaurant_id, task_id, task_update)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "success": True,
        "task_id": task.id,
        "title": task.title,
        "status": task.status.value,
        "message": f"Task '{task.title}' completed"
    }


# Mobile Staff Status
@router.get("/restaurants/{restaurant_id}/mobile/my-session")
async def get_my_mobile_session(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get current user's session information for mobile"""
    service = OperationsService(db)
    
    # Get user's active session
    operations = await service.get_current_phase(restaurant_id)
    if not operations:
        raise HTTPException(status_code=404, detail="Restaurant operations not found")
    
    # Query for active session
    from sqlalchemy import and_
    from app.models.operations import StaffSession
    
    session = service.db.query(StaffSession).filter(
        and_(
            StaffSession.restaurant_operations_id == operations.id,
            StaffSession.user_id == current_user.id,
            StaffSession.is_active == True
        )
    ).first()
    
    if not session:
        return {
            "has_active_session": False,
            "message": "No active session found"
        }
    
    # Calculate session duration
    session_duration = int((datetime.utcnow() - session.session_start).total_seconds() / 60)
    
    return {
        "has_active_session": True,
        "session_id": session.id,
        "role": session.role,
        "session_start": session.session_start.isoformat(),
        "session_duration_minutes": session_duration,
        "tasks_completed": session.tasks_completed,
        "orders_processed": session.orders_processed,
        "last_seen_at": session.last_seen_at.isoformat()
    }


# Mobile Summary Stats
@router.get("/restaurants/{restaurant_id}/mobile/stats/today")
async def get_mobile_today_stats(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get today's performance stats for mobile"""
    service = OperationsService(db)
    
    # Get today's date range
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    # Get today's orders
    from app.schemas.operations import OrderFilters
    today_filters = OrderFilters(
        created_after=today_start,
        created_before=today_end
    )
    
    today_orders = await service.get_orders(restaurant_id, today_filters, 0, 1000)
    
    # Calculate stats
    total_orders = len(today_orders)
    completed_orders = len([o for o in today_orders if o.status in [OrderStatus.SERVED, OrderStatus.CANCELLED]])
    total_revenue = sum(o.total for o in today_orders if o.status == OrderStatus.SERVED)
    avg_order_value = total_revenue / completed_orders if completed_orders > 0 else 0
    
    # Get today's tasks completed by current user
    from app.schemas.operations import TaskFilters
    from sqlalchemy import and_
    from app.models.operations import Task
    
    today_tasks = service.db.query(Task).filter(
        and_(
            Task.restaurant_operations_id == (await service.get_current_phase(restaurant_id)).id,
            Task.completed_by_user_id == current_user.id,
            Task.completed_at >= today_start,
            Task.completed_at < today_end
        )
    ).count()
    
    return {
        "date": today_start.date().isoformat(),
        "orders": {
            "total": total_orders,
            "completed": completed_orders,
            "in_progress": total_orders - completed_orders
        },
        "revenue": {
            "total": round(total_revenue, 2),
            "average_order_value": round(avg_order_value, 2)
        },
        "my_performance": {
            "tasks_completed": today_tasks
        }
    }