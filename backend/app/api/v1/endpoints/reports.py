"""
Reports API endpoints for BiteBase Intelligence
Comprehensive report generation and management system
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
import json
import uuid

router = APIRouter()

# Data Models
class ReportTemplate(BaseModel):
    id: str
    name: str
    description: str
    type: str
    parameters: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class ReportRequest(BaseModel):
    name: str
    type: str = Field(..., description="Report type: sales, customer, market, discovery, competitor")
    parameters: Dict[str, Any] = Field(default_factory=dict)
    format: str = Field(default="json", description="Export format: json, pdf, excel, csv")
    schedule: Optional[str] = None
    template_id: Optional[str] = None

class Report(BaseModel):
    id: str
    name: str
    type: str
    status: str = Field(default="pending", description="Status: pending, processing, completed, failed")
    parameters: Dict[str, Any]
    data: Optional[Dict[str, Any]] = None
    format: str
    file_url: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    created_by: Optional[str] = None
    schedule: Optional[str] = None
    template_id: Optional[str] = None

class ReportSummary(BaseModel):
    id: str
    name: str
    type: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    file_url: Optional[str] = None

# Mock data storage (replace with actual database)
reports_db: Dict[str, Report] = {}
templates_db: Dict[str, ReportTemplate] = {}

# Initialize with sample templates
def init_sample_templates():
    templates = [
        {
            "id": "sales-template-1",
            "name": "Monthly Sales Report",
            "description": "Comprehensive monthly sales analysis",
            "type": "sales",
            "parameters": {
                "period": "monthly",
                "metrics": ["revenue", "orders", "customers", "growth"],
                "charts": ["revenue_trend", "top_products", "customer_segments"]
            }
        },
        {
            "id": "market-template-1", 
            "name": "Market Analysis Report",
            "description": "Market trends and competitive analysis",
            "type": "market",
            "parameters": {
                "analysis_type": "competitive",
                "metrics": ["market_share", "competitor_analysis", "trends"],
                "geographic_scope": "city"
            }
        },
        {
            "id": "customer-template-1",
            "name": "Customer Insights Report", 
            "description": "Customer behavior and segmentation analysis",
            "type": "customer",
            "parameters": {
                "segments": ["demographics", "behavior", "preferences"],
                "metrics": ["retention", "lifetime_value", "satisfaction"]
            }
        }
    ]
    
    for template_data in templates:
        template = ReportTemplate(
            **template_data,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        templates_db[template.id] = template

# Initialize templates
init_sample_templates()

@router.get("/", response_model=List[ReportSummary])
async def get_reports(
    type: Optional[str] = Query(None, description="Filter by report type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100)
):
    """Get all reports with optional filtering"""
    reports = list(reports_db.values())
    
    # Apply filters
    if type:
        reports = [r for r in reports if r.type == type]
    if status:
        reports = [r for r in reports if r.status == status]
    
    # Sort by creation date (newest first)
    reports.sort(key=lambda x: x.created_at, reverse=True)
    
    # Limit results
    reports = reports[:limit]
    
    # Convert to summary format
    summaries = [
        ReportSummary(
            id=r.id,
            name=r.name,
            type=r.type,
            status=r.status,
            created_at=r.created_at,
            completed_at=r.completed_at,
            file_url=r.file_url
        )
        for r in reports
    ]
    
    return summaries

@router.get("/{report_id}", response_model=Report)
async def get_report(report_id: str):
    """Get specific report by ID"""
    if report_id not in reports_db:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return reports_db[report_id]

@router.post("/generate", response_model=Report)
async def generate_report(request: ReportRequest):
    """Generate a new report"""
    report_id = str(uuid.uuid4())
    
    # Create report record
    report = Report(
        id=report_id,
        name=request.name,
        type=request.type,
        parameters=request.parameters,
        format=request.format,
        schedule=request.schedule,
        template_id=request.template_id,
        created_at=datetime.now(),
        status="processing"
    )
    
    # Generate report data based on type
    report_data = await generate_report_data(request.type, request.parameters)
    
    # Update report with generated data
    report.data = report_data
    report.status = "completed"
    report.completed_at = datetime.now()
    report.file_url = f"/api/v1/reports/{report_id}/download"
    
    # Store in database
    reports_db[report_id] = report
    
    return report

@router.get("/{report_id}/download")
async def download_report(report_id: str):
    """Download report file"""
    if report_id not in reports_db:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report = reports_db[report_id]
    
    if report.status != "completed":
        raise HTTPException(status_code=400, detail="Report not ready for download")
    
    # Return report data (in production, this would return actual file)
    return {
        "report_id": report_id,
        "format": report.format,
        "data": report.data,
        "generated_at": report.completed_at
    }

@router.delete("/{report_id}")
async def delete_report(report_id: str):
    """Delete a report"""
    if report_id not in reports_db:
        raise HTTPException(status_code=404, detail="Report not found")
    
    del reports_db[report_id]
    
    return {"message": "Report deleted successfully"}

@router.get("/templates/", response_model=List[ReportTemplate])
async def get_report_templates():
    """Get all available report templates"""
    return list(templates_db.values())

@router.get("/templates/{template_id}", response_model=ReportTemplate)
async def get_report_template(template_id: str):
    """Get specific report template"""
    if template_id not in templates_db:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return templates_db[template_id]

async def generate_report_data(report_type: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Generate report data based on type and parameters"""
    
    if report_type == "sales":
        return await generate_sales_report_data(parameters)
    elif report_type == "customer":
        return await generate_customer_report_data(parameters)
    elif report_type == "market":
        return await generate_market_report_data(parameters)
    elif report_type == "discovery":
        return await generate_discovery_report_data(parameters)
    elif report_type == "competitor":
        return await generate_competitor_report_data(parameters)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown report type: {report_type}")

async def generate_sales_report_data(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Generate sales report data"""
    return {
        "summary": {
            "total_revenue": 125000,
            "total_orders": 1250,
            "average_order_value": 100,
            "growth_rate": 12.5
        },
        "trends": {
            "daily_revenue": [3500, 4200, 3800, 4500, 5200, 4800, 4100],
            "weekly_growth": 8.3,
            "monthly_growth": 12.5
        },
        "top_products": [
            {"name": "Pad Thai", "revenue": 15000, "orders": 300},
            {"name": "Green Curry", "revenue": 12000, "orders": 240},
            {"name": "Tom Yum", "revenue": 10000, "orders": 200}
        ],
        "customer_segments": {
            "new_customers": 30,
            "returning_customers": 70,
            "vip_customers": 15
        }
    }

async def generate_customer_report_data(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Generate customer report data"""
    return {
        "demographics": {
            "age_groups": {"18-25": 25, "26-35": 40, "36-45": 25, "46+": 10},
            "gender": {"male": 45, "female": 55},
            "location": {"local": 70, "tourist": 30}
        },
        "behavior": {
            "avg_visits_per_month": 3.2,
            "avg_spending_per_visit": 85,
            "preferred_order_time": "19:00-21:00",
            "popular_days": ["Friday", "Saturday", "Sunday"]
        },
        "satisfaction": {
            "overall_rating": 4.3,
            "food_quality": 4.5,
            "service": 4.2,
            "value_for_money": 4.1
        }
    }

async def generate_market_report_data(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Generate market analysis report data"""
    return {
        "market_overview": {
            "total_restaurants": 1250,
            "market_size": "2.5B THB",
            "growth_rate": 8.5,
            "competition_level": "high"
        },
        "competitive_analysis": {
            "direct_competitors": 15,
            "market_share": 3.2,
            "competitive_advantages": ["location", "price", "quality"],
            "threats": ["new_entrants", "delivery_apps"]
        },
        "opportunities": [
            "Expand delivery radius",
            "Add breakfast menu",
            "Corporate catering",
            "Weekend promotions"
        ]
    }

async def generate_discovery_report_data(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Generate discovery report data"""
    return {
        "location_analysis": {
            "foot_traffic": "high",
            "accessibility": "excellent",
            "parking": "limited",
            "public_transport": "good"
        },
        "target_market": {
            "primary": "office_workers",
            "secondary": "tourists",
            "demographics": "25-45_years",
            "spending_power": "medium_to_high"
        },
        "recommendations": [
            "Focus on lunch menu for office workers",
            "Add tourist-friendly options",
            "Improve parking situation",
            "Leverage public transport accessibility"
        ]
    }

async def generate_competitor_report_data(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Generate competitor analysis report data"""
    return {
        "competitors": [
            {
                "name": "Thai Garden Restaurant",
                "distance": "0.2km",
                "rating": 4.2,
                "price_range": "$$",
                "strengths": ["authentic_taste", "good_location"],
                "weaknesses": ["slow_service", "limited_seating"]
            },
            {
                "name": "Bangkok Kitchen",
                "distance": "0.5km", 
                "rating": 4.0,
                "price_range": "$$$",
                "strengths": ["premium_ambiance", "excellent_service"],
                "weaknesses": ["high_prices", "limited_parking"]
            }
        ],
        "competitive_positioning": {
            "price_advantage": True,
            "quality_rating": 4.3,
            "unique_selling_points": ["fast_service", "authentic_recipes", "good_value"]
        },
        "market_gaps": [
            "Late night dining",
            "Healthy options",
            "Family packages",
            "Corporate lunch deals"
        ]
    }
