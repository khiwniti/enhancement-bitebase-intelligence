"""
BiteBase Intelligence Natural Language Query API
FastAPI endpoints for natural language query processing
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import logging

from app.core.database import get_db
from app.schemas.nl_query import (
    NLQueryRequest, NLQueryResponse, QuerySuggestionResponse,
    QueryFeedback, QueryHistoryResponse, QueryPerformanceMetrics
)
from app.services.nl_query.nl_processor import NLProcessor

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/process", response_model=NLQueryResponse)
async def process_natural_language_query(
    request: NLQueryRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = "default_user"  # In production, get from JWT token
):
    """
    Process a natural language query and return structured results
    """
    try:
        # Initialize NL processor
        nl_processor = NLProcessor(db)
        
        # Process the query
        result = await nl_processor.process_query(request, user_id)
        
        return result
        
    except Exception as e:
        logger.error(f"NL query processing error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process natural language query: {str(e)}"
        )


@router.get("/suggestions", response_model=QuerySuggestionResponse)
async def get_query_suggestions(
    partial_query: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: str = "default_user"
):
    """
    Get query suggestions for auto-complete
    """
    try:
        nl_processor = NLProcessor(db)
        
        # Get context for suggestions
        context = await nl_processor.context_manager.get_user_context(user_id)
        
        # Get suggestions
        suggestions = await nl_processor.get_query_suggestions(partial_query or "", context)
        
        # Categorize suggestions
        categories = {
            "revenue": [s for s in suggestions if any(word in s.lower() for word in ['revenue', 'sales', 'income'])],
            "customers": [s for s in suggestions if any(word in s.lower() for word in ['customer', 'visitor', 'traffic'])],
            "menu": [s for s in suggestions if any(word in s.lower() for word in ['menu', 'item', 'dish', 'food'])],
            "location": [s for s in suggestions if any(word in s.lower() for word in ['location', 'branch', 'store'])],
            "general": [s for s in suggestions if s not in sum([
                categories.get("revenue", []),
                categories.get("customers", []),
                categories.get("menu", []),
                categories.get("location", [])
            ], [])]
        }
        
        # Example queries
        examples = [
            "Show me revenue by location for last month",
            "What are the top 10 menu items this quarter?",
            "How many customers visited last week?",
            "Compare revenue across all locations",
            "Show customer trends over the last 6 months"
        ]
        
        return QuerySuggestionResponse(
            suggestions=suggestions,
            categories=categories,
            examples=examples
        )
        
    except Exception as e:
        logger.error(f"Query suggestions error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get query suggestions: {str(e)}"
        )


@router.post("/feedback")
async def submit_query_feedback(
    feedback: QueryFeedback,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit feedback for a processed query
    """
    try:
        # Store feedback in background
        background_tasks.add_task(
            _store_query_feedback,
            db, feedback
        )
        
        return {"message": "Feedback submitted successfully"}
        
    except Exception as e:
        logger.error(f"Query feedback error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit feedback: {str(e)}"
        )


@router.get("/history", response_model=QueryHistoryResponse)
async def get_query_history(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    user_id: str = "default_user"
):
    """
    Get user's query history
    """
    try:
        from sqlalchemy import select, desc
        from app.models.nl_query import NLQueryHistory
        
        # Get user's query history
        query = select(NLQueryHistory).where(
            NLQueryHistory.user_id == user_id
        ).order_by(desc(NLQueryHistory.created_at)).limit(limit).offset(offset)
        
        result = await db.execute(query)
        history_entries = result.scalars().all()
        
        # Convert to response format
        queries = []
        for entry in history_entries:
            queries.append({
                "id": entry.id,
                "query": entry.original_query,
                "success": entry.success,
                "confidence": entry.confidence_score,
                "chart_type": entry.chart_type,
                "created_at": entry.created_at.isoformat(),
                "execution_time_ms": entry.execution_time_ms
            })
        
        # Calculate statistics
        total_queries = len(history_entries)
        successful_queries = sum(1 for q in queries if q["success"])
        success_rate = successful_queries / total_queries if total_queries > 0 else 0.0
        avg_confidence = sum(q["confidence"] for q in queries) / total_queries if total_queries > 0 else 0.0
        
        # Get popular patterns (simplified)
        popular_patterns = [
            "revenue analysis queries",
            "menu performance queries", 
            "customer metrics queries"
        ]
        
        return QueryHistoryResponse(
            queries=queries,
            total=total_queries,
            success_rate=success_rate,
            avg_confidence=avg_confidence,
            popular_patterns=popular_patterns
        )
        
    except Exception as e:
        logger.error(f"Query history error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get query history: {str(e)}"
        )


@router.get("/metrics", response_model=QueryPerformanceMetrics)
async def get_query_performance_metrics(
    db: AsyncSession = Depends(get_db),
    user_id: str = "default_user"
):
    """
    Get performance metrics for NL query processing
    """
    try:
        nl_processor = NLProcessor(db)
        
        # Get processing statistics
        stats = await nl_processor.get_processing_stats()
        
        # Get database metrics
        from sqlalchemy import select, func
        from app.models.nl_query import NLQueryHistory
        
        # Calculate metrics from database
        metrics_query = select(
            func.avg(NLQueryHistory.processing_time_ms).label('avg_processing_time'),
            func.avg(NLQueryHistory.execution_time_ms).label('avg_execution_time'),
            func.avg(NLQueryHistory.confidence_score).label('avg_confidence'),
            func.count().label('total_queries'),
            func.sum(func.cast(NLQueryHistory.success, int)).label('successful_queries')
        ).where(NLQueryHistory.user_id == user_id)
        
        result = await db.execute(metrics_query)
        db_metrics = result.first()
        
        if db_metrics and db_metrics.total_queries:
            success_rate = db_metrics.successful_queries / db_metrics.total_queries
            avg_processing_time = db_metrics.avg_processing_time or 0
            avg_execution_time = db_metrics.avg_execution_time or 0
            avg_confidence = db_metrics.avg_confidence or 0
            total_queries = db_metrics.total_queries
        else:
            success_rate = 0.0
            avg_processing_time = 0.0
            avg_execution_time = 0.0
            avg_confidence = 0.0
            total_queries = 0
        
        return QueryPerformanceMetrics(
            avg_processing_time=avg_processing_time,
            avg_execution_time=avg_execution_time,
            success_rate=success_rate,
            avg_confidence=avg_confidence,
            total_queries=total_queries,
            cache_hit_rate=stats.get('cache_hit_rate', 0.0)
        )
        
    except Exception as e:
        logger.error(f"Query metrics error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get query metrics: {str(e)}"
        )


@router.post("/validate")
async def validate_query(
    request: NLQueryRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str = "default_user"
):
    """
    Validate a natural language query without executing it
    """
    try:
        nl_processor = NLProcessor(db)
        
        # Process query without execution
        request.auto_execute = False
        result = await nl_processor.process_query(request, user_id)
        
        # Return validation result
        return {
            "valid": result.success,
            "confidence": result.confidence.overall_confidence,
            "intent": result.processed_query.intent.intent_type,
            "entities": len(result.processed_query.entities),
            "sql_generated": bool(result.generated_sql.strip()),
            "errors": result.errors,
            "suggestions": result.suggestions
        }
        
    except Exception as e:
        logger.error(f"Query validation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to validate query: {str(e)}"
        )


async def _store_query_feedback(db: AsyncSession, feedback: QueryFeedback):
    """Background task to store query feedback"""
    try:
        from app.models.nl_query import NLQueryHistory
        from sqlalchemy import select, update
        
        # Update the query history entry with feedback
        update_query = update(NLQueryHistory).where(
            NLQueryHistory.id == str(feedback.query_id)
        ).values(
            user_feedback=feedback.feedback_text,
            user_rating=feedback.rating,
            was_helpful=feedback.was_helpful
        )
        
        await db.execute(update_query)
        await db.commit()
        
        logger.info(f"Stored feedback for query {feedback.query_id}")
        
    except Exception as e:
        logger.error(f"Error storing query feedback: {str(e)}")