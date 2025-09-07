"""
Migration API Endpoints
Endpoints for migrating existing restaurants to operational system
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid
import json

from app.core.database import get_db
from app.services.operations import OperationsService
from app.schemas.operations import (
    RestaurantOperationsCreate, RestaurantOperationsResponse,
    ServicePhase, TaskCreate, TaskPriority, TaskStatus,
    OrderCreate, OrderStatus, OrderType
)
from app.core.auth import get_current_user

router = APIRouter()


@router.post("/restaurants/{restaurant_id}/migration/assess")
async def assess_migration_readiness(
    restaurant_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Assess restaurant's readiness for migration to operational system"""
    
    # Check if operations already exist
    service = OperationsService(db)
    existing_operations = await service.get_current_phase(restaurant_id)
    
    if existing_operations:
        return {
            "already_migrated": True,
            "message": "Restaurant has already been migrated to operational system",
            "current_phase": existing_operations.current_phase.value
        }
    
    # Simulate assessment of existing restaurant data
    # In a real system, this would analyze existing POS data, menu items, staff, etc.
    assessment_results = {
        "restaurant_id": restaurant_id,
        "assessment_date": datetime.utcnow().isoformat(),
        "readiness_score": 85,  # Out of 100
        "data_quality": {
            "menu_items": {"available": True, "quality_score": 90, "item_count": 45},
            "staff_records": {"available": True, "quality_score": 75, "staff_count": 8},
            "historical_orders": {"available": True, "quality_score": 95, "order_count": 1250},
            "operating_hours": {"available": True, "quality_score": 100},
            "pos_integration": {"available": True, "quality_score": 80}
        },
        "migration_requirements": [
            {
                "requirement": "Staff Training",
                "status": "required",
                "estimated_time_hours": 4,
                "priority": "high"
            },
            {
                "requirement": "Menu Data Cleanup",
                "status": "recommended",
                "estimated_time_hours": 2,
                "priority": "medium"
            },
            {
                "requirement": "Historical Data Import",
                "status": "optional",
                "estimated_time_hours": 1,
                "priority": "low"
            }
        ],
        "estimated_migration_time": "2-4 hours",
        "recommended_migration_window": "During slow business hours or off-day"
    }
    
    # Store assessment results for later reference
    # In a real system, you'd save this to a migration_assessments table
    
    return {
        "migration_ready": assessment_results["readiness_score"] >= 70,
        "assessment": assessment_results,
        "next_step": "schedule_migration" if assessment_results["readiness_score"] >= 70 else "address_requirements"
    }


@router.post("/restaurants/{restaurant_id}/migration/schedule")
async def schedule_migration(
    restaurant_id: str,
    migration_window: Dict[str, Any],  # {"start_time": "2024-01-15T02:00:00Z", "duration_hours": 3}
    import_historical_data: bool = True,
    backup_existing_data: bool = True,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Schedule migration for existing restaurant"""
    
    service = OperationsService(db)
    existing_operations = await service.get_current_phase(restaurant_id)
    
    if existing_operations:
        raise HTTPException(
            status_code=400,
            detail="Restaurant has already been migrated"
        )
    
    # Validate migration window
    try:
        start_time = datetime.fromisoformat(migration_window["start_time"].replace('Z', '+00:00'))
        duration_hours = migration_window.get("duration_hours", 3)
    except (KeyError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="Invalid migration window format"
        )
    
    if start_time <= datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Migration window must be in the future"
        )
    
    # Create migration schedule record
    migration_schedule = {
        "restaurant_id": restaurant_id,
        "scheduled_by": current_user.id,
        "start_time": start_time.isoformat(),
        "duration_hours": duration_hours,
        "end_time": (start_time + timedelta(hours=duration_hours)).isoformat(),
        "import_historical_data": import_historical_data,
        "backup_existing_data": backup_existing_data,
        "status": "scheduled",
        "created_at": datetime.utcnow().isoformat()
    }
    
    # In a real system, store this in a migration_schedules table
    
    return {
        "success": True,
        "migration_scheduled": True,
        "schedule": migration_schedule,
        "pre_migration_checklist": [
            "Notify all staff about the migration window",
            "Ensure all current orders are completed before migration",
            "Backup existing POS data",
            "Prepare staff training materials",
            "Test internet connectivity and system access"
        ],
        "next_step": "wait_for_migration_window"
    }


@router.post("/restaurants/{restaurant_id}/migration/execute")
async def execute_migration(
    restaurant_id: str,
    migration_config: Dict[str, Any],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Execute migration process for existing restaurant"""
    
    service = OperationsService(db)
    existing_operations = await service.get_current_phase(restaurant_id)
    
    if existing_operations:
        raise HTTPException(
            status_code=400,
            detail="Restaurant has already been migrated"
        )
    
    # Start migration process
    migration_log = {
        "restaurant_id": restaurant_id,
        "migration_started": datetime.utcnow().isoformat(),
        "initiated_by": current_user.id,
        "steps": []
    }
    
    try:
        # Step 1: Create operations record
        migration_log["steps"].append({
            "step": "create_operations_record",
            "started_at": datetime.utcnow().isoformat(),
            "status": "in_progress"
        })
        
        # Import existing configuration or use defaults
        imported_config = migration_config.get("restaurant_config", {})
        
        operating_hours = imported_config.get("operating_hours", {
            "monday": {"open": "09:00", "close": "22:00", "closed": False},
            "tuesday": {"open": "09:00", "close": "22:00", "closed": False},
            "wednesday": {"open": "09:00", "close": "22:00", "closed": False},
            "thursday": {"open": "09:00", "close": "22:00", "closed": False},
            "friday": {"open": "09:00", "close": "23:00", "closed": False},
            "saturday": {"open": "08:00", "close": "23:00", "closed": False},
            "sunday": {"open": "08:00", "close": "21:00", "closed": False}
        })
        
        service_types = imported_config.get("service_types", {
            "dine_in": True,
            "takeout": True,
            "delivery": False,
            "pickup": True
        })
        
        seating_capacity = imported_config.get("seating_capacity", 50)
        
        from app.models.operations import RestaurantOperations
        operations = RestaurantOperations(
            restaurant_id=restaurant_id,
            current_phase=ServicePhase.CLOSED,
            is_transitioning=False,
            operating_hours=operating_hours,
            service_types=service_types,
            seating_capacity=seating_capacity
        )
        
        db.add(operations)
        db.commit()
        db.refresh(operations)
        
        migration_log["steps"][-1]["status"] = "completed"
        migration_log["steps"][-1]["completed_at"] = datetime.utcnow().isoformat()
        
        # Step 2: Import historical orders (if requested)
        if migration_config.get("import_historical_data", False):
            migration_log["steps"].append({
                "step": "import_historical_orders",
                "started_at": datetime.utcnow().isoformat(),
                "status": "in_progress"
            })
            
            # Schedule background task for historical data import
            background_tasks.add_task(
                import_historical_orders,
                restaurant_id,
                operations.id,
                migration_config.get("historical_orders", []),
                db
            )
            
            migration_log["steps"][-1]["status"] = "scheduled"
            migration_log["steps"][-1]["completed_at"] = datetime.utcnow().isoformat()
        
        # Step 3: Create migration tasks
        migration_log["steps"].append({
            "step": "create_migration_tasks",
            "started_at": datetime.utcnow().isoformat(),
            "status": "in_progress"
        })
        
        background_tasks.add_task(
            create_migration_tasks,
            restaurant_id,
            operations.id,
            current_user.id,
            db
        )
        
        migration_log["steps"][-1]["status"] = "scheduled"
        migration_log["steps"][-1]["completed_at"] = datetime.utcnow().isoformat()
        
        migration_log["migration_completed"] = datetime.utcnow().isoformat()
        migration_log["status"] = "completed"
        
    except Exception as e:
        migration_log["status"] = "failed"
        migration_log["error"] = str(e)
        migration_log["failed_at"] = datetime.utcnow().isoformat()
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")
    
    return {
        "success": True,
        "migration_completed": True,
        "operations_id": operations.id,
        "migration_log": migration_log,
        "message": "Restaurant successfully migrated to operational system",
        "next_steps": [
            "Complete post-migration verification",
            "Train staff on new system",
            "Monitor operations for first day"
        ]
    }


async def import_historical_orders(
    restaurant_id: str,
    operations_id: int,
    historical_orders: List[Dict[str, Any]],
    db: Session
):
    """Background task to import historical order data"""
    
    from app.models.operations import Order
    
    imported_count = 0
    
    for order_data in historical_orders[:100]:  # Limit to prevent overload
        try:
            # Convert historical order format to our format
            order = Order(
                id=str(uuid.uuid4()),
                restaurant_operations_id=operations_id,
                order_number=order_data.get("order_number", f"HIST-{imported_count+1}"),
                customer_name=order_data.get("customer_name"),
                customer_phone=order_data.get("customer_phone"),
                type=OrderType(order_data.get("type", "dine-in")),
                status=OrderStatus.SERVED,  # All historical orders are completed
                table_number=order_data.get("table_number"),
                items=order_data.get("items", []),
                subtotal=float(order_data.get("subtotal", 0)),
                tax=float(order_data.get("tax", 0)),
                total=float(order_data.get("total", 0)),
                notes=f"Imported from historical data - {order_data.get('original_date', '')}",
                estimated_prep_time=order_data.get("estimated_prep_time", 20),
                actual_prep_time=order_data.get("actual_prep_time", 25),
                created_at=datetime.fromisoformat(order_data.get("created_at", datetime.utcnow().isoformat())),
                completed_at=datetime.fromisoformat(order_data.get("completed_at", datetime.utcnow().isoformat()))
            )
            
            db.add(order)
            imported_count += 1
            
        except Exception as e:
            # Log error but continue with other orders
            continue
    
    if imported_count > 0:
        db.commit()


async def create_migration_tasks(
    restaurant_id: str,
    operations_id: int,
    user_id: str,
    db: Session
):
    """Create post-migration tasks"""
    
    migration_tasks = [
        {
            "title": "Verify Migration Completion",
            "description": "Check all systems are functioning correctly after migration",
            "priority": TaskPriority.CRITICAL,
            "category": "migration",
            "estimated_duration": 30,
            "due_date": datetime.utcnow() + timedelta(hours=2)
        },
        {
            "title": "Staff System Training",
            "description": "Train all staff on the new operational system",
            "priority": TaskPriority.HIGH,
            "category": "migration",
            "estimated_duration": 120,
            "due_date": datetime.utcnow() + timedelta(hours=24)
        },
        {
            "title": "Test Order Processing",
            "description": "Process several test orders to ensure system works correctly",
            "priority": TaskPriority.HIGH,
            "category": "migration",
            "estimated_duration": 45,
            "due_date": datetime.utcnow() + timedelta(hours=4)
        },
        {
            "title": "Update POS Integration",
            "description": "Configure POS system to work with new operational system",
            "priority": TaskPriority.MEDIUM,
            "category": "migration",
            "estimated_duration": 60,
            "due_date": datetime.utcnow() + timedelta(days=1)
        },
        {
            "title": "Monitor First Day Operations",
            "description": "Closely monitor operations for the first full day",
            "priority": TaskPriority.MEDIUM,
            "category": "migration",
            "estimated_duration": 480,  # Full day
            "due_date": datetime.utcnow() + timedelta(days=2)
        }
    ]
    
    from app.models.operations import Task
    
    for task_data in migration_tasks:
        task = Task(
            restaurant_operations_id=operations_id,
            id=str(uuid.uuid4()),
            assigned_to_role="manager",
            **task_data
        )
        db.add(task)
    
    db.commit()


@router.get("/restaurants/{restaurant_id}/migration/status")
async def get_migration_status(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get migration status for restaurant"""
    service = OperationsService(db)
    operations = await service.get_current_phase(restaurant_id)
    
    if not operations:
        return {
            "migrated": False,
            "status": "not_started",
            "message": "Restaurant has not been migrated to operational system"
        }
    
    # Get migration tasks to check completion
    from app.schemas.operations import TaskFilters
    migration_filter = TaskFilters(category="migration")
    migration_tasks = await service.get_tasks(restaurant_id, migration_filter, 0, 100)
    
    total_tasks = len(migration_tasks)
    completed_tasks = len([t for t in migration_tasks if t.status == TaskStatus.COMPLETED])
    
    progress_percentage = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 100
    
    # Determine migration status
    if progress_percentage >= 90:
        status = "completed"
        message = "Migration completed successfully"
    elif progress_percentage >= 50:
        status = "in_progress"
        message = "Migration tasks in progress"
    elif total_tasks > 0:
        status = "post_migration"
        message = "Migration executed, completing post-migration tasks"
    else:
        status = "completed"
        message = "Migration completed without post-migration tasks"
    
    return {
        "migrated": True,
        "status": status,
        "message": message,
        "migration_date": operations.created_at.isoformat(),
        "current_phase": operations.current_phase.value,
        "post_migration_progress": {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "progress_percentage": progress_percentage
        },
        "migration_tasks": [
            {
                "id": task.id,
                "title": task.title,
                "status": task.status.value,
                "priority": task.priority.value,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "is_overdue": task.due_date and task.due_date <= datetime.utcnow() and task.status != TaskStatus.COMPLETED
            }
            for task in migration_tasks
        ]
    }


@router.post("/restaurants/{restaurant_id}/migration/rollback")
async def rollback_migration(
    restaurant_id: str,
    rollback_reason: str,
    restore_backup: bool = True,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Rollback migration (emergency use only)"""
    service = OperationsService(db)
    operations = await service.get_current_phase(restaurant_id)
    
    if not operations:
        raise HTTPException(
            status_code=404,
            detail="No migration to rollback"
        )
    
    # Check if migration was recent (within 24 hours)
    migration_age = datetime.utcnow() - operations.created_at
    if migration_age > timedelta(hours=24):
        raise HTTPException(
            status_code=400,
            detail="Cannot rollback migration older than 24 hours"
        )
    
    try:
        # Remove operational data
        from app.models.operations import Order, Task, StaffSession, ServicePhaseTransition, OperationalMetric
        
        # Delete all related records
        db.query(OperationalMetric).filter_by(restaurant_operations_id=operations.id).delete()
        db.query(ServicePhaseTransition).filter_by(restaurant_operations_id=operations.id).delete()
        db.query(StaffSession).filter_by(restaurant_operations_id=operations.id).delete()
        db.query(Task).filter_by(restaurant_operations_id=operations.id).delete()
        db.query(Order).filter_by(restaurant_operations_id=operations.id).delete()
        
        # Delete operations record
        db.delete(operations)
        db.commit()
        
        rollback_log = {
            "restaurant_id": restaurant_id,
            "rollback_executed": datetime.utcnow().isoformat(),
            "rollback_by": current_user.id,
            "reason": rollback_reason,
            "restore_backup": restore_backup,
            "status": "completed"
        }
        
        return {
            "success": True,
            "rollback_completed": True,
            "rollback_log": rollback_log,
            "message": "Migration successfully rolled back",
            "next_steps": [
                "Verify original system is functioning",
                "Analyze rollback reason",
                "Plan future migration strategy"
            ]
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Rollback failed: {str(e)}"
        )