"""
Enhanced Operations API for BiteBase Intelligence
Transforming from passive intelligence to active operational hub
"""
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, APIRouter
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, time
from enum import Enum
import json

# Define enums and models inline to avoid import issues
class UserRole(str, Enum):
    OWNER = "owner"
    MANAGER = "manager"
    ASSISTANT_MANAGER = "assistant_manager"
    CHEF = "chef"
    SOUS_CHEF = "sous_chef"
    LINE_COOK = "line_cook"
    SERVER = "server"
    HOST = "host"
    BARTENDER = "bartender"
    DISHWASHER = "dishwasher"

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"

# Initialize security
security = HTTPBearer()

class ShiftPhase(str, Enum):
    PRE_OPENING = "pre_opening"
    SERVICE = "service" 
    CLOSING = "closing"

class ChecklistResponse(BaseModel):
    id: str
    template_id: str
    restaurant_id: str
    user_id: str
    shift_phase: ShiftPhase
    assigned_date: datetime
    completed_tasks: List[str] = []
    total_tasks: int
    completion_percentage: float
    status: TaskStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

class LiveKPIResponse(BaseModel):
    restaurant_id: str
    timestamp: datetime
    labor_cost_percentage: float
    sales_vs_forecast: float
    average_table_turn_time: Optional[float] = None
    kitchen_ticket_time: Optional[float] = None
    current_covers: int
    forecasted_covers: int
    total_sales_today: float
    forecasted_sales: float

class TaskCompletionRequest(BaseModel):
    task_id: str
    completed_by: str
    completion_notes: Optional[str] = None
    photo_url: Optional[str] = None

class CommunicationMessageRequest(BaseModel):
    sender_id: str
    sender_role: UserRole
    recipient_role: UserRole
    message_type: str
    content: str
    priority: str = "normal"
    related_order_id: Optional[str] = None

# Mock data store for demonstration
mock_checklists = []
mock_kpis = []
mock_communications = []

# Real-time KPI calculator
def calculate_live_kpis(restaurant_id: str) -> LiveKPIResponse:
    """Calculate real-time KPIs for a restaurant"""
    # Simulate POS integration data
    current_time = datetime.now()
    
    # Mock real-time calculations
    total_sales_today = 4250.75  # From POS integration
    labor_costs_today = 1402.75  # From time tracking
    forecasted_sales = 5800.00   # From sales forecasting
    current_covers = 45          # Current guests
    
    labor_cost_percentage = (labor_costs_today / total_sales_today) * 100
    sales_vs_forecast = (total_sales_today / forecasted_sales) * 100
    
    return LiveKPIResponse(
        restaurant_id=restaurant_id,
        timestamp=current_time,
        labor_cost_percentage=round(labor_cost_percentage, 2),
        sales_vs_forecast=round(sales_vs_forecast, 2),
        average_table_turn_time=52.3,  # Minutes from POS
        kitchen_ticket_time=12.8,      # Minutes from KDS
        current_covers=current_covers,
        forecasted_covers=75,
        total_sales_today=total_sales_today,
        forecasted_sales=forecasted_sales
    )

def generate_checklist_for_shift(restaurant_id: str, user_id: str, shift_phase: ShiftPhase) -> ChecklistResponse:
    """Generate role-specific checklist based on shift phase and user role"""
    checklist_id = f"cl_{restaurant_id}_{user_id}_{shift_phase}_{datetime.now().strftime('%Y%m%d')}"
    
    # Mock template mapping
    task_templates = {
        ShiftPhase.PRE_OPENING: [
            "Verify walk-in cooler temperature (35-38°F)",
            "Check all equipment functionality", 
            "Complete mise en place prep",
            "Stock all service stations",
            "Review daily specials and 86'd items"
        ],
        ShiftPhase.SERVICE: [
            "Monitor kitchen ticket times",
            "Maintain station cleanliness",
            "Check inventory levels hourly",
            "Update 86'd items board"
        ],
        ShiftPhase.CLOSING: [
            "Complete deep cleaning checklist",
            "Store all perishables properly", 
            "Secure all equipment",
            "Complete end-of-shift inventory",
            "Submit manager's log notes"
        ]
    }
    
    tasks = task_templates.get(shift_phase, [])
    
    return ChecklistResponse(
        id=checklist_id,
        template_id=f"tpl_{shift_phase}",
        restaurant_id=restaurant_id,
        user_id=user_id,
        shift_phase=shift_phase,
        assigned_date=datetime.now(),
        completed_tasks=[],
        total_tasks=len(tasks),
        completion_percentage=0.0,
        status=TaskStatus.PENDING,
        created_at=datetime.now()
    )

# API Routes
def get_operations_routes():
    from fastapi import APIRouter
    router = APIRouter(prefix="/api/v1/operations", tags=["Operations"])
    
    @router.get("/dashboard/{restaurant_id}", response_model=Dict[str, Any])
    async def get_manager_dashboard(restaurant_id: str):
        """Get real-time manager dashboard data"""
        
        # Live KPIs
        live_kpis = calculate_live_kpis(restaurant_id)
        
        # Active checklists progress
        active_checklists = [cl for cl in mock_checklists if cl.restaurant_id == restaurant_id]
        
        # Recent communications
        recent_comms = [msg for msg in mock_communications if msg.restaurant_id == restaurant_id][-10:]
        
        # Critical alerts
        alerts = []
        if live_kpis.labor_cost_percentage > 35:
            alerts.append({
                "type": "warning",
                "message": f"Labor costs at {live_kpis.labor_cost_percentage}% - Consider adjusting staffing"
            })
        
        if live_kpis.sales_vs_forecast < 80:
            alerts.append({
                "type": "info", 
                "message": "Sales trending below forecast - Monitor closely"
            })
            
        return {
            "restaurant_id": restaurant_id,
            "timestamp": datetime.now(),
            "live_kpis": live_kpis.dict(),
            "checklist_progress": [
                {
                    "phase": cl.shift_phase,
                    "completion": cl.completion_percentage,
                    "total_tasks": cl.total_tasks
                } for cl in active_checklists
            ],
            "recent_communications": len(recent_comms),
            "critical_alerts": alerts,
            "shift_summary": {
                "covers_served": live_kpis.current_covers,
                "avg_ticket_time": live_kpis.kitchen_ticket_time,
                "sales_pace": "On Track" if live_kpis.sales_vs_forecast >= 95 else "Behind"
            }
        }
    
    @router.post("/checklists/assign", response_model=ChecklistResponse)
    async def assign_checklist(restaurant_id: str, user_id: str, shift_phase: ShiftPhase):
        """Assign a checklist to a team member"""
        checklist = generate_checklist_for_shift(restaurant_id, user_id, shift_phase)
        mock_checklists.append(checklist)
        return checklist
    
    @router.get("/checklists/{checklist_id}", response_model=ChecklistResponse)
    async def get_checklist(checklist_id: str):
        """Get specific checklist details"""
        checklist = next((cl for cl in mock_checklists if cl.id == checklist_id), None)
        if not checklist:
            raise HTTPException(status_code=404, detail="Checklist not found")
        return checklist
    
    @router.post("/checklists/{checklist_id}/complete-task")
    async def complete_task(checklist_id: str, task_completion: TaskCompletionRequest):
        """Mark a task as completed in a checklist"""
        checklist = next((cl for cl in mock_checklists if cl.id == checklist_id), None)
        if not checklist:
            raise HTTPException(status_code=404, detail="Checklist not found")
            
        if task_completion.task_id not in checklist.completed_tasks:
            checklist.completed_tasks.append(task_completion.task_id)
            checklist.completion_percentage = (len(checklist.completed_tasks) / checklist.total_tasks) * 100
            checklist.updated_at = datetime.now()
            
            if checklist.completion_percentage == 100:
                checklist.status = TaskStatus.COMPLETED
                
        return {"success": True, "completion_percentage": checklist.completion_percentage}
    
    @router.get("/kpis/live/{restaurant_id}", response_model=LiveKPIResponse)
    async def get_live_kpis(restaurant_id: str):
        """Get real-time KPIs for restaurant operations"""
        return calculate_live_kpis(restaurant_id)
    
    @router.post("/communications/send")
    async def send_communication(message: CommunicationMessageRequest):
        """Send message between FOH and BOH teams"""
        comm_id = f"msg_{len(mock_communications) + 1}"
        
        communication = {
            "id": comm_id,
            "restaurant_id": "rest_001",  # Would be extracted from auth
            "sender_id": message.sender_id,
            "sender_role": message.sender_role,
            "recipient_role": message.recipient_role,
            "message_type": message.message_type,
            "content": message.content,
            "priority": message.priority,
            "related_order_id": message.related_order_id,
            "timestamp": datetime.now(),
            "read": False
        }
        
        mock_communications.append(communication)
        
        # In production, this would trigger real-time notifications
        return {"success": True, "message_id": comm_id}
    
    @router.get("/communications/{restaurant_id}")
    async def get_communications(restaurant_id: str, limit: int = 20):
        """Get recent communications for restaurant"""
        restaurant_comms = [msg for msg in mock_communications if msg.get("restaurant_id") == restaurant_id]
        return restaurant_comms[-limit:]
    
    @router.get("/inventory/alerts/{restaurant_id}")
    async def get_inventory_alerts(restaurant_id: str):
        """Get low inventory alerts"""
        # Mock inventory alerts
        alerts = [
            {
                "item": "Prime Rib",
                "current_stock": 2,
                "par_level": 10,
                "urgency": "high",
                "last_updated": datetime.now()
            },
            {
                "item": "Salmon Fillets", 
                "current_stock": 8,
                "par_level": 20,
                "urgency": "medium",
                "last_updated": datetime.now()
            }
        ]
        return alerts
    
    @router.post("/pos/sync/{restaurant_id}")
    async def sync_pos_data(restaurant_id: str):
        """Sync data with POS system"""
        # Mock POS integration
        sync_result = {
            "timestamp": datetime.now(),
            "sales_data_synced": True,
            "menu_items_updated": 47,
            "inventory_updated": True,
            "last_sync": datetime.now(),
            "status": "success"
        }
        return sync_result
    
    @router.get("/shift/summary/{restaurant_id}")
    async def get_shift_summary(restaurant_id: str, date: Optional[str] = None):
        """Get comprehensive shift summary"""
        target_date = date if date else datetime.now().strftime("%Y-%m-%d")
        
        # Mock shift summary data
        summary = {
            "date": target_date,
            "restaurant_id": restaurant_id,
            "total_covers": 127,
            "total_sales": 6847.50,
            "labor_cost_percentage": 31.2,
            "food_cost_percentage": 28.7,
            "average_ticket_time": 11.4,
            "customer_satisfaction": 4.6,
            "staff_performance": {
                "checklists_completed": 12,
                "checklists_total": 12,
                "completion_rate": 100.0
            },
            "notable_events": [
                "Busy lunch rush - handled 45 covers in 90 minutes",
                "New server completed first shift successfully",
                "Kitchen equipment maintenance completed"
            ]
        }
        return summary
    
    return router

