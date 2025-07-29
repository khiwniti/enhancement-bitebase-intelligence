"""
Campaign Management API Endpoints

FastAPI routes for campaign management operations.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.services.campaign.campaign_management_service import CampaignManagementService
from app.schemas.campaign_management import (
    CampaignCreate, CampaignUpdate, CampaignResponse, CampaignListResponse,
    ABTestCreate, ABTestResponse, CampaignMetricsCreate, CampaignMetricsResponse,
    CampaignAudienceCreate, CampaignAudienceResponse, CampaignTemplateCreate,
    CampaignTemplateResponse, CampaignPerformanceResponse, CampaignQueryParams,
    CampaignPerformanceQueryParams, CampaignStatusEnum, CampaignTypeEnum
)

router = APIRouter()


@router.post("/campaigns", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    restaurant_id: str,
    campaign_data: CampaignCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new marketing campaign"""
    try:
        campaign = await CampaignManagementService.create_campaign(
            db=db,
            restaurant_id=restaurant_id,
            campaign_data=campaign_data.dict()
        )
        return campaign
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create campaign: {str(e)}"
        )


@router.get("/campaigns", response_model=List[CampaignResponse])
async def get_campaigns(
    restaurant_id: str,
    status_filter: Optional[CampaignStatusEnum] = Query(None, alias="status"),
    type_filter: Optional[CampaignTypeEnum] = Query(None, alias="type"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """Get campaigns for a restaurant with optional filtering"""
    try:
        campaigns = await CampaignManagementService.get_campaigns(
            db=db,
            restaurant_id=restaurant_id,
            status=status_filter,
            campaign_type=type_filter,
            limit=limit,
            offset=offset
        )
        return campaigns
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to retrieve campaigns: {str(e)}"
        )


@router.get("/campaigns/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: str,
    restaurant_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific campaign by ID"""
    campaign = await CampaignManagementService.get_campaign_by_id(
        db=db,
        campaign_id=campaign_id,
        restaurant_id=restaurant_id
    )
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    return campaign


@router.put("/campaigns/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: str,
    restaurant_id: str,
    update_data: CampaignUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing campaign"""
    campaign = await CampaignManagementService.update_campaign(
        db=db,
        campaign_id=campaign_id,
        restaurant_id=restaurant_id,
        update_data=update_data.dict(exclude_unset=True)
    )
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    return campaign


@router.delete("/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign(
    campaign_id: str,
    restaurant_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a campaign"""
    success = await CampaignManagementService.delete_campaign(
        db=db,
        campaign_id=campaign_id,
        restaurant_id=restaurant_id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )


@router.post("/campaigns/{campaign_id}/ab-tests", response_model=ABTestResponse, status_code=status.HTTP_201_CREATED)
async def create_ab_test(
    campaign_id: str,
    restaurant_id: str,
    ab_test_data: ABTestCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create an A/B test for a campaign"""
    ab_test = await CampaignManagementService.create_ab_test(
        db=db,
        campaign_id=campaign_id,
        restaurant_id=restaurant_id,
        ab_test_data=ab_test_data.dict()
    )
    
    if not ab_test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    return ab_test


@router.post("/campaigns/{campaign_id}/metrics", response_model=CampaignMetricsResponse, status_code=status.HTTP_201_CREATED)
async def record_campaign_metrics(
    campaign_id: str,
    restaurant_id: str,
    metrics_data: CampaignMetricsCreate,
    db: AsyncSession = Depends(get_db)
):
    """Record daily metrics for a campaign"""
    # Verify campaign exists and belongs to restaurant
    campaign = await CampaignManagementService.get_campaign_by_id(
        db=db,
        campaign_id=campaign_id,
        restaurant_id=restaurant_id
    )
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    try:
        metrics = await CampaignManagementService.record_campaign_metrics(
            db=db,
            campaign_id=campaign_id,
            metrics_data=metrics_data.dict()
        )
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to record metrics: {str(e)}"
        )


@router.get("/campaigns/{campaign_id}/performance", response_model=CampaignPerformanceResponse)
async def get_campaign_performance(
    campaign_id: str,
    restaurant_id: str,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get aggregated performance metrics for a campaign"""
    from datetime import datetime
    
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    performance = await CampaignManagementService.get_campaign_performance(
        db=db,
        campaign_id=campaign_id,
        restaurant_id=restaurant_id,
        start_date=start_dt,
        end_date=end_dt
    )
    
    if not performance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    return performance


@router.post("/campaigns/{campaign_id}/audiences", response_model=CampaignAudienceResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign_audience(
    campaign_id: str,
    restaurant_id: str,
    audience_data: CampaignAudienceCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a targeted audience for a campaign"""
    audience = await CampaignManagementService.create_campaign_audience(
        db=db,
        campaign_id=campaign_id,
        restaurant_id=restaurant_id,
        audience_data=audience_data.dict()
    )
    
    if not audience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    return audience


@router.get("/campaign-templates", response_model=List[CampaignTemplateResponse])
async def get_campaign_templates(
    restaurant_id: str,
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get campaign templates for a restaurant"""
    try:
        templates = await CampaignManagementService.get_campaign_templates(
            db=db,
            restaurant_id=restaurant_id,
            category=category
        )
        return templates
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to retrieve templates: {str(e)}"
        )


@router.post("/campaign-templates", response_model=CampaignTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign_template(
    restaurant_id: str,
    template_data: CampaignTemplateCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new campaign template"""
    try:
        template = await CampaignManagementService.create_campaign_template(
            db=db,
            restaurant_id=restaurant_id,
            template_data=template_data.dict()
        )
        return template
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create template: {str(e)}"
        )
