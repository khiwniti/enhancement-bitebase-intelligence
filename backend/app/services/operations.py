"""
Operations Service
Business logic for restaurant operations management
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
from datetime import datetime, timedelta
from fastapi import HTTPException

from app.models.operations import (
    RestaurantOperations, Order, Task, ServicePhaseTransition, 
    StaffSession, OperationalMetric, ServicePhase, OrderStatus, TaskStatus
)
from app.schemas.operations import (
    ServicePhaseUpdate, OrderCreate, OrderUpdate, TaskCreate, TaskUpdate,
    StaffSessionCreate, StaffSessionUpdate, OperationalMetricCreate,
    OrderFilters, TaskFilters
)


class OperationsService:
    """Service class for restaurant operations management"""

    def __init__(self, db: Session):
        self.db = db

    # Service Phase Management
    async def get_current_phase(self, restaurant_id: str) -> Optional[RestaurantOperations]:
        """Get current service phase for restaurant"""
        return self.db.query(RestaurantOperations).filter(
            RestaurantOperations.restaurant_id == restaurant_id
        ).first()

    async def update_service_phase(
        self, 
        restaurant_id: str, 
        phase_update: ServicePhaseUpdate
    ) -> RestaurantOperations:
        """Update service phase with transition logging"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            raise HTTPException(status_code=404, detail="Restaurant operations not found")
        
        # Log the transition
        if operations.current_phase != phase_update.phase:
            transition = ServicePhaseTransition(
                restaurant_operations_id=operations.id,
                from_phase=operations.current_phase,
                to_phase=phase_update.phase,
                initiated_by_user_id=phase_update.user_id,
                transition_data={"notes": phase_update.notes} if phase_update.notes else None
            )
            self.db.add(transition)
        
        # Update phase
        operations.current_phase = phase_update.phase
        operations.phase_started_at = datetime.utcnow()
        operations.is_transitioning = False
        
        self.db.commit()
        self.db.refresh(operations)
        
        return operations

    async def start_phase_transition(self, restaurant_id: str) -> RestaurantOperations:
        """Mark restaurant as transitioning between phases"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            raise HTTPException(status_code=404, detail="Restaurant operations not found")
        
        operations.is_transitioning = True
        self.db.commit()
        self.db.refresh(operations)
        
        return operations

    # Order Management
    async def create_order(self, restaurant_id: str, order_data: OrderCreate) -> Order:
        """Create a new order"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            raise HTTPException(status_code=404, detail="Restaurant operations not found")
        
        # Check if order number already exists
        existing_order = self.db.query(Order).filter(
            and_(
                Order.restaurant_operations_id == operations.id,
                Order.order_number == order_data.order_number
            )
        ).first()
        
        if existing_order:
            raise HTTPException(status_code=400, detail="Order number already exists")
        
        order = Order(
            restaurant_operations_id=operations.id,
            **order_data.dict()
        )
        
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        
        return order

    async def get_orders(
        self, 
        restaurant_id: str, 
        filters: Optional[OrderFilters] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Order]:
        """Get orders with optional filtering"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            return []
        
        query = self.db.query(Order).filter(
            Order.restaurant_operations_id == operations.id
        )
        
        # Apply filters
        if filters:
            if filters.status:
                query = query.filter(Order.status.in_(filters.status))
            if filters.type:
                query = query.filter(Order.type.in_(filters.type))
            if filters.created_after:
                query = query.filter(Order.created_at >= filters.created_after)
            if filters.created_before:
                query = query.filter(Order.created_at <= filters.created_before)
            if filters.customer_name:
                query = query.filter(Order.customer_name.ilike(f"%{filters.customer_name}%"))
            if filters.table_number:
                query = query.filter(Order.table_number == filters.table_number)
        
        return query.order_by(desc(Order.created_at)).offset(skip).limit(limit).all()

    async def get_order(self, restaurant_id: str, order_id: str) -> Optional[Order]:
        """Get specific order by ID"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            return None
        
        return self.db.query(Order).filter(
            and_(
                Order.restaurant_operations_id == operations.id,
                Order.id == order_id
            )
        ).first()

    async def update_order(self, restaurant_id: str, order_id: str, order_update: OrderUpdate) -> Optional[Order]:
        """Update order status and details"""
        order = await self.get_order(restaurant_id, order_id)
        
        if not order:
            return None
        
        update_data = order_update.dict(exclude_unset=True)
        
        # Set completion time if status is changing to served or cancelled
        if order_update.status in [OrderStatus.SERVED, OrderStatus.CANCELLED]:
            update_data['completed_at'] = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(order, field, value)
        
        self.db.commit()
        self.db.refresh(order)
        
        return order

    async def get_active_orders_count(self, restaurant_id: str) -> int:
        """Get count of active orders (not served or cancelled)"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            return 0
        
        return self.db.query(Order).filter(
            and_(
                Order.restaurant_operations_id == operations.id,
                ~Order.status.in_([OrderStatus.SERVED, OrderStatus.CANCELLED])
            )
        ).count()

    async def get_urgent_orders_count(self, restaurant_id: str) -> int:
        """Get count of urgent orders (taking too long)"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            return 0
        
        # Consider orders urgent if they're older than 20 minutes for dine-in or 15 for others
        threshold_time = datetime.utcnow() - timedelta(minutes=15)
        
        return self.db.query(Order).filter(
            and_(
                Order.restaurant_operations_id == operations.id,
                ~Order.status.in_([OrderStatus.SERVED, OrderStatus.CANCELLED]),
                Order.created_at <= threshold_time
            )
        ).count()

    # Task Management
    async def create_task(self, restaurant_id: str, task_data: TaskCreate) -> Task:
        """Create a new task"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            raise HTTPException(status_code=404, detail="Restaurant operations not found")
        
        task = Task(
            restaurant_operations_id=operations.id,
            **task_data.dict()
        )
        
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        
        return task

    async def get_tasks(
        self, 
        restaurant_id: str, 
        filters: Optional[TaskFilters] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """Get tasks with optional filtering"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            return []
        
        query = self.db.query(Task).filter(
            Task.restaurant_operations_id == operations.id
        )
        
        # Apply filters
        if filters:
            if filters.status:
                query = query.filter(Task.status.in_(filters.status))
            if filters.priority:
                query = query.filter(Task.priority.in_(filters.priority))
            if filters.category:
                query = query.filter(Task.category == filters.category)
            if filters.assigned_to_user_id:
                query = query.filter(Task.assigned_to_user_id == filters.assigned_to_user_id)
            if filters.assigned_to_role:
                query = query.filter(Task.assigned_to_role == filters.assigned_to_role)
            if filters.due_before:
                query = query.filter(Task.due_date <= filters.due_before)
            if filters.overdue_only:
                query = query.filter(
                    and_(
                        Task.status != TaskStatus.COMPLETED,
                        Task.due_date <= datetime.utcnow()
                    )
                )
        
        return query.order_by(
            desc(Task.priority), 
            asc(Task.due_date), 
            desc(Task.created_at)
        ).offset(skip).limit(limit).all()

    async def get_task(self, restaurant_id: str, task_id: str) -> Optional[Task]:
        """Get specific task by ID"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            return None
        
        return self.db.query(Task).filter(
            and_(
                Task.restaurant_operations_id == operations.id,
                Task.id == task_id
            )
        ).first()

    async def update_task(self, restaurant_id: str, task_id: str, task_update: TaskUpdate) -> Optional[Task]:
        """Update task status and details"""
        task = await self.get_task(restaurant_id, task_id)
        
        if not task:
            return None
        
        update_data = task_update.dict(exclude_unset=True)
        
        # Set completion time if status is changing to completed
        if task_update.status == TaskStatus.COMPLETED:
            update_data['completed_at'] = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(task, field, value)
        
        self.db.commit()
        self.db.refresh(task)
        
        return task

    async def get_task_counts(self, restaurant_id: str) -> Dict[str, int]:
        """Get task counts by status"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            return {"pending": 0, "in_progress": 0, "completed": 0, "overdue": 0}
        
        base_query = self.db.query(Task).filter(
            Task.restaurant_operations_id == operations.id
        )
        
        pending = base_query.filter(Task.status == TaskStatus.PENDING).count()
        in_progress = base_query.filter(Task.status == TaskStatus.IN_PROGRESS).count()
        completed = base_query.filter(Task.status == TaskStatus.COMPLETED).count()
        overdue = base_query.filter(
            and_(
                Task.status != TaskStatus.COMPLETED,
                Task.due_date <= datetime.utcnow()
            )
        ).count()
        
        return {
            "pending": pending,
            "in_progress": in_progress,
            "completed": completed,
            "overdue": overdue
        }

    # Staff Session Management
    async def create_staff_session(self, restaurant_id: str, session_data: StaffSessionCreate) -> StaffSession:
        """Create a new staff session"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            raise HTTPException(status_code=404, detail="Restaurant operations not found")
        
        # End any existing active sessions for this user
        existing_sessions = self.db.query(StaffSession).filter(
            and_(
                StaffSession.restaurant_operations_id == operations.id,
                StaffSession.user_id == session_data.user_id,
                StaffSession.is_active == True
            )
        ).all()
        
        for session in existing_sessions:
            session.is_active = False
            session.session_end = datetime.utcnow()
        
        # Create new session
        session = StaffSession(
            restaurant_operations_id=operations.id,
            **session_data.dict()
        )
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        return session

    async def get_active_staff_count(self, restaurant_id: str) -> int:
        """Get count of currently active staff"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            return 0
        
        # Consider staff active if they've been seen in the last 15 minutes
        cutoff_time = datetime.utcnow() - timedelta(minutes=15)
        
        return self.db.query(StaffSession).filter(
            and_(
                StaffSession.restaurant_operations_id == operations.id,
                StaffSession.is_active == True,
                StaffSession.last_seen_at >= cutoff_time
            )
        ).count()

    # Analytics and Metrics
    async def calculate_avg_order_time(self, restaurant_id: str) -> float:
        """Calculate average order preparation time"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            return 0.0
        
        # Get completed orders from today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        avg_time = self.db.query(func.avg(Order.actual_prep_time)).filter(
            and_(
                Order.restaurant_operations_id == operations.id,
                Order.status == OrderStatus.SERVED,
                Order.created_at >= today_start,
                Order.actual_prep_time.isnot(None)
            )
        ).scalar()
        
        return float(avg_time or 0)

    async def get_operational_dashboard(self, restaurant_id: str) -> Dict[str, Any]:
        """Get comprehensive operational dashboard data"""
        operations = await self.get_current_phase(restaurant_id)
        
        if not operations:
            raise HTTPException(status_code=404, detail="Restaurant operations not found")
        
        # Calculate phase duration
        phase_duration = int((datetime.utcnow() - operations.phase_started_at).total_seconds() / 60)
        
        # Get recent orders (last 10)
        recent_orders = await self.get_orders(restaurant_id, limit=10)
        
        # Get urgent tasks (high/critical priority, not completed)
        urgent_tasks_filter = TaskFilters(
            status=[TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
            priority=["high", "critical"]
        )
        urgent_tasks = await self.get_tasks(restaurant_id, urgent_tasks_filter, limit=5)
        
        return {
            "current_phase": operations.current_phase,
            "is_transitioning": operations.is_transitioning,
            "active_orders": await self.get_active_orders_count(restaurant_id),
            "urgent_orders": await self.get_urgent_orders_count(restaurant_id),
            "task_counts": await self.get_task_counts(restaurant_id),
            "staff_on_duty": await self.get_active_staff_count(restaurant_id),
            "avg_order_time": await self.calculate_avg_order_time(restaurant_id),
            "phase_duration_minutes": phase_duration,
            "recent_orders": recent_orders,
            "urgent_tasks": urgent_tasks,
            "performance_metrics": {
                "orders_per_hour": 0,  # Calculate based on current phase
                "task_completion_rate": 0,  # Calculate based on completed vs total
                "staff_efficiency": 0,  # Calculate based on tasks/orders per staff
            }
        }