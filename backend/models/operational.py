#!/usr/bin/env python3
"""
BiteBase Operations Platform - Enhanced Data Models
Supports Phase 1 MVP implementation with role-based access, checklists, and operational workflows
"""

from datetime import datetime, date, time
from enum import Enum
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field
from uuid import uuid4

# User Roles and Permissions
class UserRole(Enum):
    OWNER = "owner"                    # Full access to all restaurant data and settings
    MANAGER = "manager"                # Operational oversight, reports, staff management
    ASSISTANT_MANAGER = "assistant_manager"  # Limited management functions
    SERVER = "server"                  # FOH operations, checklists, communication
    BARTENDER = "bartender"           # Bar operations, inventory
    HOST = "host"                     # Seating, customer management
    COOK = "cook"                     # BOH operations, kitchen checklists
    PREP_COOK = "prep_cook"           # Food preparation, inventory
    DISHWASHER = "dishwasher"         # Cleaning, basic BOH tasks
    ADMIN = "admin"                   # System administration (BiteBase staff)

class ShiftType(Enum):
    OPENING = "opening"
    MID_SHIFT = "mid_shift"
    CLOSING = "closing"
    OVERNIGHT = "overnight"

class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"
    FAILED = "failed"

class ChecklistType(Enum):
    DAILY_OPENING = "daily_opening"
    DAILY_CLOSING = "daily_closing"
    SHIFT_HANDOVER = "shift_handover"
    WEEKLY_DEEP_CLEAN = "weekly_deep_clean"
    MONTHLY_INVENTORY = "monthly_inventory"
    SAFETY_AUDIT = "safety_audit"
    CUSTOM = "custom"

class CommunicationPriority(Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

# Enhanced User Model with Role-Based Access
@dataclass
class User:
    id: str = field(default_factory=lambda: str(uuid4()))
    tenant_id: str = ""                # Multi-tenant isolation
    email: str = ""
    password_hash: str = ""
    first_name: str = ""
    last_name: str = ""
    phone: str = ""
    role: UserRole = UserRole.SERVER
    is_active: bool = True
    is_clocked_in: bool = False
    hourly_wage: Optional[float] = None
    clock_in_time: Optional[datetime] = None
    permissions: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    last_login: Optional[datetime] = None

# Restaurant Profile with Operational Settings
@dataclass
class Restaurant:
    id: str = field(default_factory=lambda: str(uuid4()))
    tenant_id: str = ""
    name: str = ""
    address: str = ""
    phone: str = ""
    email: str = ""
    website: str = ""
    cuisine_type: str = ""
    operating_hours: Dict[str, Dict[str, str]] = field(default_factory=dict)  # day -> {open, close}
    time_zone: str = "UTC"
    pos_system: str = ""              # "square", "toast", "clover", etc.
    pos_config: Dict[str, Any] = field(default_factory=dict)
    target_labor_cost_percentage: float = 30.0
    settings: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

# Checklist Template System
@dataclass
class ChecklistTemplate:
    id: str = field(default_factory=lambda: str(uuid4()))
    tenant_id: str = ""
    name: str = ""
    description: str = ""
    checklist_type: ChecklistType = ChecklistType.CUSTOM
    target_roles: List[UserRole] = field(default_factory=list)
    shift_type: Optional[ShiftType] = None
    estimated_duration_minutes: int = 30
    is_active: bool = True
    created_by: str = ""              # User ID
    tasks: List['TaskTemplate'] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

@dataclass
class TaskTemplate:
    id: str = field(default_factory=lambda: str(uuid4()))
    checklist_template_id: str = ""
    title: str = ""
    description: str = ""
    instructions: str = ""
    order_index: int = 0
    is_required: bool = True
    requires_photo: bool = False
    requires_signature: bool = False
    requires_temperature: bool = False
    estimated_minutes: int = 5
    category: str = ""                # "cleaning", "food_prep", "safety", etc.

# Active Checklist Instances
@dataclass
class ChecklistInstance:
    id: str = field(default_factory=lambda: str(uuid4()))
    tenant_id: str = ""
    template_id: str = ""
    assigned_user_id: str = ""
    shift_date: date = field(default_factory=date.today)
    shift_type: ShiftType = ShiftType.OPENING
    status: str = "assigned"          # assigned, in_progress, completed, expired
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    completion_percentage: float = 0.0
    tasks: List['TaskInstance'] = field(default_factory=list)
    notes: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

@dataclass
class TaskInstance:
    id: str = field(default_factory=lambda: str(uuid4()))
    checklist_instance_id: str = ""
    template_task_id: str = ""
    title: str = ""
    status: TaskStatus = TaskStatus.PENDING
    completed_by: Optional[str] = None  # User ID
    completed_at: Optional[datetime] = None
    photo_url: Optional[str] = None
    signature_data: Optional[str] = None
    temperature_reading: Optional[float] = None
    notes: str = ""
    skipped_reason: str = ""

# FOH/BOH Communication System
@dataclass
class CommunicationLog:
    id: str = field(default_factory=lambda: str(uuid4()))
    tenant_id: str = ""
    from_user_id: str = ""
    to_department: str = ""           # "FOH", "BOH", "MANAGEMENT"
    message: str = ""
    priority: CommunicationPriority = CommunicationPriority.NORMAL
    table_number: Optional[str] = None
    order_id: Optional[str] = None
    is_acknowledged: bool = False
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)

# Manager's Daily Log (Shift Handovers)
@dataclass
class ManagerLog:
    id: str = field(default_factory=lambda: str(uuid4()))
    tenant_id: str = ""
    date: date = field(default_factory=date.today)
    shift_type: ShiftType = ShiftType.OPENING
    manager_id: str = ""
    log_entry: str = ""
    highlights: List[str] = field(default_factory=list)
    issues: List[str] = field(default_factory=list)
    follow_up_actions: List[str] = field(default_factory=list)
    weather: str = ""
    special_events: str = ""
    staff_notes: Dict[str, str] = field(default_factory=dict)  # user_id -> notes
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

# Real-Time KPI Tracking
@dataclass
class LiveKPI:
    id: str = field(default_factory=lambda: str(uuid4()))
    tenant_id: str = ""
    timestamp: datetime = field(default_factory=datetime.now)
    
    # Sales Metrics (from POS)
    current_sales: float = 0.0
    sales_forecast: float = 0.0
    hourly_sales: List[float] = field(default_factory=list)
    
    # Labor Metrics
    clocked_in_staff: int = 0
    current_labor_cost: float = 0.0
    labor_cost_percentage: float = 0.0
    target_labor_percentage: float = 30.0
    
    # Operational Metrics
    checklist_completion_rate: float = 0.0
    pending_communications: int = 0
    order_errors_count: int = 0
    
    # Service Metrics
    average_ticket_size: float = 0.0
    orders_per_hour: float = 0.0
    customer_wait_time: Optional[float] = None

# POS Integration Models
@dataclass
class POSTransaction:
    id: str = field(default_factory=lambda: str(uuid4()))
    tenant_id: str = ""
    pos_transaction_id: str = ""
    timestamp: datetime = field(default_factory=datetime.now)
    total_amount: float = 0.0
    tax_amount: float = 0.0
    tip_amount: float = 0.0
    payment_method: str = ""
    table_number: Optional[str] = None
    server_id: Optional[str] = None
    items: List[Dict[str, Any]] = field(default_factory=list)
    is_voided: bool = False
    void_reason: str = ""

# Permissions System
ROLE_PERMISSIONS = {
    UserRole.OWNER: [
        "view_all_data", "manage_staff", "manage_settings", "manage_pos", 
        "view_financial", "create_checklists", "view_reports", "manage_restaurant"
    ],
    UserRole.MANAGER: [
        "view_dashboard", "manage_staff", "view_financial", "create_checklists",
        "view_reports", "manage_communications", "clock_in_staff"
    ],
    UserRole.ASSISTANT_MANAGER: [
        "view_dashboard", "view_limited_financial", "assign_checklists",
        "view_reports", "manage_communications"
    ],
    UserRole.SERVER: [
        "view_assigned_checklists", "complete_tasks", "send_communications",
        "view_daily_goals", "clock_in_out"
    ],
    UserRole.COOK: [
        "view_assigned_checklists", "complete_tasks", "receive_communications",
        "view_kitchen_display", "clock_in_out"
    ],
    # ... etc for other roles
}

def user_has_permission(user: User, permission: str) -> bool:
    """Check if user has specific permission based on role."""
    role_permissions = ROLE_PERMISSIONS.get(user.role, [])
    return permission in role_permissions or permission in user.permissions

# Pre-built Checklist Templates (Best Practices)
TEMPLATE_LIBRARY = {
    "foh_opening": {
        "name": "Front of House Opening",
        "type": ChecklistType.DAILY_OPENING,
        "roles": [UserRole.SERVER, UserRole.HOST, UserRole.MANAGER],
        "tasks": [
            "Unlock entrance doors",
            "Turn on lights and music system",
            "Check dining room temperature",
            "Set up host station with menus and reservation book",
            "Inspect tables, chairs, and booths for cleanliness",
            "Refill condiment containers",
            "Test POS system and card readers",
            "Count and verify cash drawer starting amount",
            "Review daily specials with kitchen",
            "Brief FOH staff on reservations and events"
        ]
    },
    "boh_opening": {
        "name": "Back of House Opening",
        "type": ChecklistType.DAILY_OPENING,
        "roles": [UserRole.COOK, UserRole.PREP_COOK, UserRole.MANAGER],
        "tasks": [
            "Check refrigeration temperatures (walk-in, reach-ins)",
            "Inspect food storage areas for cleanliness",
            "Review prep list for the day",
            "Check gas connections and equipment functionality",
            "Set up cooking stations with tools and ingredients",
            "Prepare mise en place for lunch service",
            "Label and date all prep items",
            "Review daily specials and 86'd items",
            "Test kitchen display system",
            "Ensure hand wash stations are stocked"
        ]
    }
}

if __name__ == "__main__":
    # Example usage and testing
    print("BiteBase Operations Platform - Data Models Loaded")
    print(f"Defined {len(UserRole)} user roles")
    print(f"Defined {len(ChecklistType)} checklist types")
    print(f"Template library contains {len(TEMPLATE_LIBRARY)} pre-built templates")