"""
Onboarding API Endpoints
Endpoints for new restaurant onboarding process
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid

from app.core.database import get_db
from app.services.operations import OperationsService
from app.schemas.operations import (
    RestaurantOperationsCreate, RestaurantOperationsResponse,
    ServicePhase, TaskCreate, TaskPriority, TaskStatus,
    OperatingHours, ServiceConfiguration
)
from app.core.auth import get_current_user

router = APIRouter()


# Onboarding Flow Steps
@router.post("/restaurants/{restaurant_id}/onboarding/initialize")
async def initialize_restaurant_operations(
    restaurant_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Initialize restaurant operations system for new restaurant"""
    
    # Check if operations already exist
    service = OperationsService(db)
    existing_operations = await service.get_current_phase(restaurant_id)
    
    if existing_operations:
        raise HTTPException(
            status_code=400, 
            detail="Restaurant operations already initialized"
        )
    
    # Create default operating hours (can be customized later)
    default_hours = {
        "monday": OperatingHours(open="09:00", close="22:00").dict(),
        "tuesday": OperatingHours(open="09:00", close="22:00").dict(),
        "wednesday": OperatingHours(open="09:00", close="22:00").dict(),
        "thursday": OperatingHours(open="09:00", close="22:00").dict(),
        "friday": OperatingHours(open="09:00", close="23:00").dict(),
        "saturday": OperatingHours(open="08:00", close="23:00").dict(),
        "sunday": OperatingHours(open="08:00", close="21:00").dict()
    }
    
    # Create default service configuration
    default_service_config = ServiceConfiguration(
        dine_in=True,
        takeout=True,
        delivery=False,
        pickup=True,
        seating_capacity=50
    ).dict()
    
    # Create restaurant operations record
    from app.models.operations import RestaurantOperations
    operations = RestaurantOperations(
        restaurant_id=restaurant_id,
        current_phase=ServicePhase.CLOSED,
        is_transitioning=False,
        operating_hours=default_hours,
        service_types=default_service_config,
        seating_capacity=50
    )
    
    db.add(operations)
    db.commit()
    db.refresh(operations)
    
    # Schedule background task to create onboarding tasks
    background_tasks.add_task(
        create_onboarding_tasks,
        restaurant_id,
        operations.id,
        current_user.id,
        db
    )
    
    return {
        "success": True,
        "restaurant_id": restaurant_id,
        "operations_id": operations.id,
        "message": "Restaurant operations initialized successfully",
        "next_step": "setup_configuration"
    }


async def create_onboarding_tasks(
    restaurant_id: str, 
    operations_id: int, 
    user_id: str, 
    db: Session
):
    """Background task to create initial onboarding tasks"""
    
    onboarding_tasks = [
        {
            "title": "Complete Restaurant Profile Setup",
            "description": "Add restaurant details, photos, and basic information",
            "priority": TaskPriority.CRITICAL,
            "category": "onboarding",
            "estimated_duration": 15,
            "due_date": datetime.utcnow() + timedelta(hours=24)
        },
        {
            "title": "Configure Operating Hours",
            "description": "Set your restaurant's operating hours for each day of the week",
            "priority": TaskPriority.HIGH,
            "category": "onboarding",
            "estimated_duration": 10,
            "due_date": datetime.utcnow() + timedelta(hours=24)
        },
        {
            "title": "Set Up Menu Categories",
            "description": "Create menu categories and add initial menu items",
            "priority": TaskPriority.HIGH,
            "category": "onboarding",
            "estimated_duration": 30,
            "due_date": datetime.utcnow() + timedelta(days=2)
        },
        {
            "title": "Train Staff on System",
            "description": "Conduct training session for staff on using the operational system",
            "priority": TaskPriority.MEDIUM,
            "category": "onboarding",
            "estimated_duration": 60,
            "due_date": datetime.utcnow() + timedelta(days=3)
        },
        {
            "title": "Test Order Flow",
            "description": "Process test orders to ensure system is working correctly",
            "priority": TaskPriority.MEDIUM,
            "category": "onboarding",
            "estimated_duration": 20,
            "due_date": datetime.utcnow() + timedelta(days=3)
        },
        {
            "title": "Set Up Cleaning Checklists",
            "description": "Create daily, weekly, and monthly cleaning task checklists",
            "priority": TaskPriority.MEDIUM,
            "category": "onboarding",
            "estimated_duration": 25,
            "due_date": datetime.utcnow() + timedelta(days=5)
        }
    ]
    
    from app.models.operations import Task
    
    for task_data in onboarding_tasks:
        task = Task(
            restaurant_operations_id=operations_id,
            id=str(uuid.uuid4()),
            assigned_to_role="manager",
            **task_data
        )
        db.add(task)
    
    db.commit()


@router.get("/restaurants/{restaurant_id}/onboarding/progress")
async def get_onboarding_progress(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get onboarding progress for restaurant"""
    service = OperationsService(db)
    operations = await service.get_current_phase(restaurant_id)
    
    if not operations:
        return {
            "initialized": False,
            "progress_percentage": 0,
            "next_step": "initialize"
        }
    
    # Get onboarding tasks
    from app.schemas.operations import TaskFilters
    onboarding_filter = TaskFilters(category="onboarding")
    onboarding_tasks = await service.get_tasks(restaurant_id, onboarding_filter, 0, 100)
    
    total_tasks = len(onboarding_tasks)
    completed_tasks = len([t for t in onboarding_tasks if t.status == TaskStatus.COMPLETED])
    
    progress_percentage = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
    
    # Determine next step based on progress
    next_step = "complete_tasks"
    if progress_percentage >= 80:
        next_step = "go_live"
    elif progress_percentage >= 50:
        next_step = "staff_training"
    elif progress_percentage >= 25:
        next_step = "menu_setup"
    
    return {
        "initialized": True,
        "progress_percentage": progress_percentage,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": total_tasks - completed_tasks,
        "onboarding_tasks": [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status.value,
                "priority": task.priority.value,
                "estimated_duration": task.estimated_duration,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "is_overdue": task.due_date and task.due_date <= datetime.utcnow() and task.status != TaskStatus.COMPLETED
            }
            for task in onboarding_tasks
        ],
        "next_step": next_step
    }


@router.post("/restaurants/{restaurant_id}/onboarding/configuration")
async def setup_restaurant_configuration(
    restaurant_id: str,
    operating_hours: Optional[Dict[str, OperatingHours]] = None,
    service_types: Optional[ServiceConfiguration] = None,
    seating_capacity: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Configure restaurant operational settings"""
    service = OperationsService(db)
    operations = await service.get_current_phase(restaurant_id)
    
    if not operations:
        raise HTTPException(status_code=404, detail="Restaurant operations not initialized")
    
    # Update configuration
    if operating_hours:
        operations.operating_hours = {day: hours.dict() for day, hours in operating_hours.items()}
    
    if service_types:
        operations.service_types = service_types.dict()
    
    if seating_capacity is not None:
        operations.seating_capacity = seating_capacity
    
    operations.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(operations)
    
    # Mark configuration task as completed if it exists
    config_task = None
    from app.schemas.operations import TaskFilters
    from app.models.operations import Task
    from sqlalchemy import and_
    
    config_task = db.query(Task).filter(
        and_(
            Task.restaurant_operations_id == operations.id,
            Task.title.contains("Configure Operating Hours"),
            Task.status != TaskStatus.COMPLETED
        )
    ).first()
    
    if config_task:
        config_task.status = TaskStatus.COMPLETED
        config_task.completed_at = datetime.utcnow()
        config_task.completed_by_user_id = current_user.id
        config_task.completion_notes = "Configuration completed via onboarding API"
        db.commit()
    
    return {
        "success": True,
        "message": "Restaurant configuration updated successfully",
        "configuration": {
            "operating_hours": operations.operating_hours,
            "service_types": operations.service_types,
            "seating_capacity": operations.seating_capacity
        }
    }


@router.post("/restaurants/{restaurant_id}/onboarding/staff-training")
async def track_staff_training(
    restaurant_id: str,
    staff_trained: List[Dict[str, Any]],  # [{"user_id": "123", "role": "server", "training_completed": True}]
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Track staff training completion"""
    service = OperationsService(db)
    operations = await service.get_current_phase(restaurant_id)
    
    if not operations:
        raise HTTPException(status_code=404, detail="Restaurant operations not initialized")
    
    # Create training records (you might want to create a separate table for this)
    training_summary = {
        "training_date": datetime.utcnow().isoformat(),
        "trainer_user_id": current_user.id,
        "staff_trained": staff_trained,
        "total_staff": len(staff_trained),
        "completion_rate": len([s for s in staff_trained if s.get("training_completed", False)]) / len(staff_trained) * 100
    }
    
    # Mark training task as completed
    from app.models.operations import Task
    from sqlalchemy import and_
    
    training_task = db.query(Task).filter(
        and_(
            Task.restaurant_operations_id == operations.id,
            Task.title.contains("Train Staff on System"),
            Task.status != TaskStatus.COMPLETED
        )
    ).first()
    
    if training_task:
        training_task.status = TaskStatus.COMPLETED
        training_task.completed_at = datetime.utcnow()
        training_task.completed_by_user_id = current_user.id
        training_task.completion_notes = f"Training completed for {len(staff_trained)} staff members"
        db.commit()
    
    return {
        "success": True,
        "message": "Staff training tracked successfully",
        "training_summary": training_summary
    }


@router.post("/restaurants/{restaurant_id}/onboarding/go-live")
async def complete_onboarding_go_live(
    restaurant_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Complete onboarding and go live with operations"""
    service = OperationsService(db)
    operations = await service.get_current_phase(restaurant_id)
    
    if not operations:
        raise HTTPException(status_code=404, detail="Restaurant operations not initialized")
    
    # Check onboarding progress
    from app.schemas.operations import TaskFilters
    onboarding_filter = TaskFilters(category="onboarding")
    onboarding_tasks = await service.get_tasks(restaurant_id, onboarding_filter, 0, 100)
    
    total_tasks = len(onboarding_tasks)
    completed_tasks = len([t for t in onboarding_tasks if t.status == TaskStatus.COMPLETED])
    progress_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    if progress_percentage < 80:
        raise HTTPException(
            status_code=400,
            detail=f"Onboarding not complete. {progress_percentage:.0f}% completed. Need at least 80%."
        )
    
    # Transition to opening phase if currently closed
    if operations.current_phase == ServicePhase.CLOSED:
        from app.schemas.operations import ServicePhaseUpdate
        phase_update = ServicePhaseUpdate(
            phase=ServicePhase.OPENING,
            user_id=current_user.id,
            notes="Going live - onboarding completed"
        )
        operations = await service.update_service_phase(restaurant_id, phase_update)
    
    # Schedule background task to create operational tasks
    background_tasks.add_task(
        create_operational_tasks,
        restaurant_id,
        operations.id,
        db
    )
    
    return {
        "success": True,
        "message": "Restaurant is now live! Welcome to BiteBase Operations.",
        "current_phase": operations.current_phase.value,
        "onboarding_completed": True,
        "next_steps": [
            "Monitor live order queue",
            "Manage staff tasks",
            "Track operational metrics",
            "Use real-time dashboard"
        ]
    }


async def create_operational_tasks(restaurant_id: str, operations_id: int, db: Session):
    """Create initial operational tasks after going live"""
    
    operational_tasks = [
        {
            "title": "Morning Opening Checklist",
            "description": "Complete morning opening procedures",
            "priority": TaskPriority.HIGH,
            "category": "opening",
            "assigned_to_role": "manager",
            "estimated_duration": 20,
            "due_date": datetime.utcnow() + timedelta(hours=1)
        },
        {
            "title": "Check Kitchen Equipment",
            "description": "Verify all kitchen equipment is functioning properly",
            "priority": TaskPriority.MEDIUM,
            "category": "maintenance",
            "assigned_to_role": "kitchen",
            "estimated_duration": 15,
            "due_date": datetime.utcnow() + timedelta(hours=2)
        },
        {
            "title": "Stock Inventory Check",
            "description": "Review and update inventory levels",
            "priority": TaskPriority.MEDIUM,
            "category": "inventory",
            "assigned_to_role": "manager",
            "estimated_duration": 30,
            "due_date": datetime.utcnow() + timedelta(hours=3)
        }
    ]
    
    from app.models.operations import Task
    
    for task_data in operational_tasks:
        task = Task(
            restaurant_operations_id=operations_id,
            id=str(uuid.uuid4()),
            **task_data
        )
        db.add(task)
    
    db.commit()


@router.get("/restaurants/{restaurant_id}/onboarding/checklist")
async def get_onboarding_checklist(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get comprehensive onboarding checklist"""
    service = OperationsService(db)
    operations = await service.get_current_phase(restaurant_id)
    
    checklist_items = [
        {
            "id": "initialize",
            "title": "Initialize Operations System",
            "description": "Set up basic operational framework",
            "completed": operations is not None,
            "required": True
        },
        {
            "id": "profile",
            "title": "Complete Restaurant Profile",
            "description": "Add restaurant details and photos",
            "completed": False,  # Would check actual profile completion
            "required": True
        },
        {
            "id": "hours",
            "title": "Configure Operating Hours",
            "description": "Set daily operating hours",
            "completed": operations and operations.operating_hours is not None,
            "required": True
        },
        {
            "id": "menu",
            "title": "Set Up Menu",
            "description": "Add menu categories and items",
            "completed": False,  # Would check menu setup
            "required": True
        },
        {
            "id": "staff",
            "title": "Train Staff",
            "description": "Conduct system training for staff",
            "completed": False,  # Would check training records
            "required": True
        },
        {
            "id": "test",
            "title": "Test Order Flow",
            "description": "Process test orders",
            "completed": False,  # Would check test order history
            "required": True
        },
        {
            "id": "cleaning",
            "title": "Set Up Cleaning Tasks",
            "description": "Create cleaning checklists",
            "completed": False,  # Would check cleaning task creation
            "required": False
        }
    ]
    
    completed_count = len([item for item in checklist_items if item["completed"]])
    required_count = len([item for item in checklist_items if item["required"]])
    required_completed = len([item for item in checklist_items if item["required"] and item["completed"]])
    
    return {
        "checklist_items": checklist_items,
        "progress": {
            "total_items": len(checklist_items),
            "completed_items": completed_count,
            "required_items": required_count,
            "required_completed": required_completed,
            "completion_percentage": int(completed_count / len(checklist_items) * 100),
            "required_percentage": int(required_completed / required_count * 100) if required_count > 0 else 0
        },
        "can_go_live": required_completed >= required_count
    }