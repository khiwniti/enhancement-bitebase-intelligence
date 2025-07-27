"""
BiteBase Intelligence Insights API
REST endpoints and WebSocket support for automated insights
"""

import asyncio
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.insights import Insight, InsightFeedback, InsightMetrics, InsightPattern
from app.schemas.insights import (
    InsightResponse, InsightListResponse, InsightSearchParams, InsightCreate,
    InsightUpdate, InsightFeedbackCreate, InsightFeedbackResponse,
    InsightMetricsResponse, InsightGenerationRequest, InsightGenerationResponse,
    RealtimeInsightUpdate
)
from app.services.insights import InsightsEngine, NotificationService

logger = logging.getLogger(__name__)

router = APIRouter()

# WebSocket connection manager
class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: Optional[str] = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: Optional[str] = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {str(e)}")
    
    async def send_to_user(self, message: dict, user_id: str):
        if user_id in self.user_connections:
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to user {user_id}: {str(e)}")
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {str(e)}")

# Global WebSocket manager instance
websocket_manager = WebSocketManager()


# Background task for real-time insights generation
async def background_insights_generation(db: AsyncSession):
    """Background task to continuously generate insights"""
    try:
        insights_engine = InsightsEngine(db)
        
        while True:
            # Generate insights for all active restaurants
            insights = await insights_engine.generate_insights()
            
            # Broadcast new insights via WebSocket
            for insight in insights:
                update_message = RealtimeInsightUpdate(
                    event_type="new_insight",
                    insight=insight,
                    timestamp=datetime.utcnow()
                )
                
                await websocket_manager.broadcast(update_message.dict())
            
            # Wait before next generation cycle (5 minutes)
            await asyncio.sleep(300)
            
    except Exception as e:
        logger.error(f"Error in background insights generation: {str(e)}")


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time insights streaming"""
    await websocket_manager.connect(websocket, user_id)
    
    try:
        # Send initial connection confirmation
        await websocket_manager.send_personal_message({
            "type": "connection_established",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }, websocket)
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for messages from client
                data = await websocket.receive_json()
                
                # Handle different message types
                if data.get("type") == "ping":
                    await websocket_manager.send_personal_message({
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat()
                    }, websocket)
                
                elif data.get("type") == "subscribe_restaurant":
                    restaurant_id = data.get("restaurant_id")
                    # In a real implementation, you'd track restaurant subscriptions
                    await websocket_manager.send_personal_message({
                        "type": "subscription_confirmed",
                        "restaurant_id": restaurant_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }, websocket)
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {str(e)}")
                break
                
    except WebSocketDisconnect:
        pass
    finally:
        websocket_manager.disconnect(websocket, user_id)


@router.get("/", response_model=InsightListResponse)
async def get_insights(
    params: InsightSearchParams = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Get insights with filtering and pagination"""
    try:
        # Build query
        query = select(Insight).options(selectinload(Insight.anomalies))
        
        # Apply filters
        if params.insight_type:
            query = query.where(Insight.insight_type == params.insight_type)
        
        if params.severity:
            query = query.where(Insight.severity == params.severity)
        
        if params.status:
            query = query.where(Insight.status == params.status)
        
        if params.restaurant_id:
            query = query.where(Insight.restaurant_id == str(params.restaurant_id))
        
        if params.min_confidence:
            query = query.where(Insight.confidence_score >= params.min_confidence)
        
        if params.min_impact:
            query = query.where(Insight.impact_score >= params.min_impact)
        
        if params.date_from:
            query = query.where(Insight.detected_at >= params.date_from)
        
        if params.date_to:
            query = query.where(Insight.detected_at <= params.date_to)
        
        # Get total count
        count_query = select(func.count(Insight.id))
        count_query = count_query.where(*query.whereclause.clauses) if query.whereclause is not None else count_query
        count_result = await db.execute(count_query)
        total = count_result.scalar()
        
        # Apply sorting
        if params.sort_by == "detected_at":
            if params.sort_order == "desc":
                query = query.order_by(desc(Insight.detected_at))
            else:
                query = query.order_by(Insight.detected_at)
        elif params.sort_by == "confidence_score":
            if params.sort_order == "desc":
                query = query.order_by(desc(Insight.confidence_score))
            else:
                query = query.order_by(Insight.confidence_score)
        elif params.sort_by == "impact_score":
            if params.sort_order == "desc":
                query = query.order_by(desc(Insight.impact_score))
            else:
                query = query.order_by(Insight.impact_score)
        else:
            query = query.order_by(desc(Insight.detected_at))
        
        # Apply pagination
        query = query.offset(params.skip).limit(params.limit)
        
        # Execute query
        result = await db.execute(query)
        insights = result.scalars().all()
        
        # Convert to response models
        insight_responses = [InsightResponse.from_orm(insight) for insight in insights]
        
        return InsightListResponse(
            insights=insight_responses,
            total=total,
            skip=params.skip,
            limit=params.limit,
            has_more=params.skip + params.limit < total
        )
        
    except Exception as e:
        logger.error(f"Error getting insights: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve insights")


@router.get("/{insight_id}", response_model=InsightResponse)
async def get_insight(insight_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific insight by ID"""
    try:
        query = select(Insight).options(
            selectinload(Insight.anomalies)
        ).where(Insight.id == insight_id)
        
        result = await db.execute(query)
        insight = result.scalar_one_or_none()
        
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        
        # Increment view count
        insight.views_count += 1
        await db.commit()
        
        return InsightResponse.from_orm(insight)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting insight {insight_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve insight")


@router.put("/{insight_id}", response_model=InsightResponse)
async def update_insight(
    insight_id: str,
    update_data: InsightUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an insight (acknowledge, resolve, etc.)"""
    try:
        query = select(Insight).where(Insight.id == insight_id)
        result = await db.execute(query)
        insight = result.scalar_one_or_none()
        
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        
        # Update fields
        if update_data.status is not None:
            insight.status = update_data.status
            
            if update_data.status.value == "acknowledged":
                insight.acknowledged_at = datetime.utcnow()
                insight.acknowledged_by = str(update_data.acknowledged_by) if update_data.acknowledged_by else None
            elif update_data.status.value == "resolved":
                insight.resolved_at = datetime.utcnow()
                insight.resolved_by = str(update_data.resolved_by) if update_data.resolved_by else None
        
        if update_data.user_rating is not None:
            insight.user_rating = update_data.user_rating
        
        if update_data.user_feedback is not None:
            insight.user_feedback = update_data.user_feedback
        
        if update_data.false_positive is not None:
            insight.false_positive = update_data.false_positive
        
        insight.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(insight)
        
        # Broadcast update via WebSocket
        update_message = RealtimeInsightUpdate(
            event_type="insight_updated",
            insight=InsightResponse.from_orm(insight),
            timestamp=datetime.utcnow()
        )
        
        await websocket_manager.broadcast(update_message.dict())
        
        return InsightResponse.from_orm(insight)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating insight {insight_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update insight")


@router.post("/generate", response_model=InsightGenerationResponse)
async def generate_insights(
    request: InsightGenerationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Manually trigger insights generation"""
    try:
        job_id = uuid.uuid4()
        start_time = datetime.utcnow()
        
        # Create insights engine
        insights_engine = InsightsEngine(db)
        
        # Generate insights
        insights = await insights_engine.generate_insights(
            restaurant_ids=[str(rid) for rid in request.restaurant_ids] if request.restaurant_ids else None,
            insight_types=request.insight_types,
            force_regenerate=request.force_regenerate
        )
        
        processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        # Broadcast new insights via WebSocket
        for insight in insights:
            update_message = RealtimeInsightUpdate(
                event_type="new_insight",
                insight=insight,
                timestamp=datetime.utcnow()
            )
            
            await websocket_manager.broadcast(update_message.dict())
        
        return InsightGenerationResponse(
            job_id=job_id,
            status="completed",
            insights_generated=len(insights),
            processing_time_ms=processing_time,
            errors=[]
        )
        
    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        return InsightGenerationResponse(
            job_id=uuid.uuid4(),
            status="failed",
            insights_generated=0,
            processing_time_ms=0,
            errors=[str(e)]
        )


@router.post("/{insight_id}/feedback", response_model=InsightFeedbackResponse)
async def submit_insight_feedback(
    insight_id: str,
    feedback_data: InsightFeedbackCreate,
    db: AsyncSession = Depends(get_db)
):
    """Submit feedback for an insight"""
    try:
        # Verify insight exists
        insight_query = select(Insight).where(Insight.id == insight_id)
        insight_result = await db.execute(insight_query)
        insight = insight_result.scalar_one_or_none()
        
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        
        # Create feedback record
        feedback = InsightFeedback(
            id=str(uuid.uuid4()),
            insight_id=insight_id,
            user_id=str(feedback_data.user_id),
            rating=feedback_data.rating,
            feedback_text=feedback_data.feedback_text,
            accuracy_rating=feedback_data.accuracy_rating,
            usefulness_rating=feedback_data.usefulness_rating,
            timeliness_rating=feedback_data.timeliness_rating,
            action_taken=feedback_data.action_taken,
            action_result=feedback_data.action_result,
            is_false_positive=feedback_data.is_false_positive,
            is_duplicate=feedback_data.is_duplicate,
            suggested_improvements=feedback_data.suggested_improvements
        )
        
        db.add(feedback)
        await db.commit()
        await db.refresh(feedback)
        
        return InsightFeedbackResponse.from_orm(feedback)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting feedback for insight {insight_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")


@router.get("/metrics/summary", response_model=InsightMetricsResponse)
async def get_insights_metrics(
    period_type: str = Query("daily", description="Period type: hourly, daily, weekly"),
    days_back: int = Query(7, description="Number of days to look back"),
    db: AsyncSession = Depends(get_db)
):
    """Get insights performance metrics"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days_back)
        
        # Get metrics from database
        metrics_query = select(InsightMetrics).where(
            and_(
                InsightMetrics.period_type == period_type,
                InsightMetrics.date >= cutoff_date
            )
        ).order_by(desc(InsightMetrics.date)).limit(1)
        
        result = await db.execute(metrics_query)
        latest_metrics = result.scalar_one_or_none()
        
        if not latest_metrics:
            # Return default metrics if none found
            return InsightMetricsResponse(
                date=datetime.utcnow(),
                period_type=period_type,
                insights_generated=0,
                insights_by_type={},
                insights_by_severity={},
                avg_processing_time_ms=0,
                avg_confidence_score=0,
                false_positive_rate=0,
                insights_viewed=0,
                insights_acknowledged=0,
                insights_resolved=0,
                insights_dismissed=0,
                avg_user_rating=0,
                total_feedback_count=0,
                data_points_processed=0,
                anomalies_detected=0,
                notifications_sent=0
            )
        
        return InsightMetricsResponse.from_orm(latest_metrics)
        
    except Exception as e:
        logger.error(f"Error getting insights metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve metrics")


@router.get("/stats/engine")
async def get_engine_stats(db: AsyncSession = Depends(get_db)):
    """Get insights engine statistics"""
    try:
        insights_engine = InsightsEngine(db)
        stats = await insights_engine.get_processing_stats()
        
        return JSONResponse(content=stats)
        
    except Exception as e:
        logger.error(f"Error getting engine stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve engine statistics")


@router.post("/notifications/test")
async def test_notification(
    insight_id: str,
    recipients: List[str],
    db: AsyncSession = Depends(get_db)
):
    """Test notification system with a specific insight"""
    try:
        # Get insight
        insight_query = select(Insight).where(Insight.id == insight_id)
        result = await db.execute(insight_query)
        insight = result.scalar_one_or_none()
        
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        
        # Send test notification
        notification_service = NotificationService(db)
        success = await notification_service.send_insight_notification(insight, recipients)
        
        return JSONResponse(content={
            "success": success,
            "insight_id": insight_id,
            "recipients": recipients,
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending test notification: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send test notification")


@router.delete("/{insight_id}")
async def delete_insight(insight_id: str, db: AsyncSession = Depends(get_db)):
    """Delete an insight (admin only)"""
    try:
        query = select(Insight).where(Insight.id == insight_id)
        result = await db.execute(query)
        insight = result.scalar_one_or_none()
        
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        
        await db.delete(insight)
        await db.commit()
        
        # Broadcast deletion via WebSocket
        update_message = RealtimeInsightUpdate(
            event_type="insight_deleted",
            insight=None,
            timestamp=datetime.utcnow()
        )
        update_message.insight_id = insight_id  # Add insight_id for deletion events
        
        await websocket_manager.broadcast(update_message.dict())
        
        return JSONResponse(content={"message": "Insight deleted successfully"})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting insight {insight_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete insight")


@router.get("/health")
async def health_check():
    """Health check endpoint for insights service"""
    return JSONResponse(content={
        "status": "healthy",
        "service": "insights-api",
        "timestamp": datetime.utcnow().isoformat(),
        "websocket_connections": len(websocket_manager.active_connections)
    })


# Initialize background tasks when module is imported
@router.on_event("startup")
async def startup_event():
    """Initialize background tasks on startup"""
    logger.info("Starting insights API background tasks...")
    # In a real implementation, you'd start the background task here
    # asyncio.create_task(background_insights_generation(get_db()))