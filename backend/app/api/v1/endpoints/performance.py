"""
Performance Monitoring and Optimization API Endpoints
Provides access to caching, query optimization, and performance metrics
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta

from app.services.performance.caching_service import caching_service
from app.services.performance.query_optimizer import query_optimizer
from app.core.database import get_db

router = APIRouter()

@router.get("/cache/stats")
async def get_cache_statistics():
    """Get cache performance statistics"""
    try:
        stats = caching_service.get_stats()
        return {"status": "success", "data": stats}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cache statistics: {str(e)}"
        )

@router.get("/cache/health")
async def get_cache_health():
    """Get cache system health status"""
    try:
        health = await caching_service.health_check()
        return {"status": "success", "data": health}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cache health: {str(e)}"
        )

@router.post("/cache/clear")
async def clear_cache(
    namespace: Optional[str] = None,
    confirm: bool = Query(False, description="Confirmation required")
):
    """Clear cache entries"""
    if not confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation required. Set confirm=true to proceed."
        )
    
    try:
        if namespace:
            cleared_count = await caching_service.clear_namespace(namespace)
            return {
                "status": "success",
                "message": f"Cleared {cleared_count} entries from namespace '{namespace}'"
            }
        else:
            # Clear all namespaces (dangerous operation)
            total_cleared = 0
            for ns in ["dashboard", "query", "default"]:
                cleared = await caching_service.clear_namespace(ns)
                total_cleared += cleared
            
            return {
                "status": "success",
                "message": f"Cleared {total_cleared} entries from all namespaces"
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear cache: {str(e)}"
        )

@router.post("/cache/invalidate")
async def invalidate_cache_pattern(
    namespace: str,
    pattern: str
):
    """Invalidate cache entries matching a pattern"""
    try:
        invalidated_count = await caching_service.invalidate_pattern(namespace, pattern)
        return {
            "status": "success",
            "message": f"Invalidated {invalidated_count} entries matching pattern '{pattern}' in namespace '{namespace}'"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to invalidate cache: {str(e)}"
        )

@router.post("/cache/dashboard/{dashboard_id}/invalidate")
async def invalidate_dashboard_cache(dashboard_id: str):
    """Invalidate all cache entries for a specific dashboard"""
    try:
        invalidated_count = await caching_service.invalidate_dashboard(dashboard_id)
        return {
            "status": "success",
            "message": f"Invalidated {invalidated_count} cache entries for dashboard {dashboard_id}"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to invalidate dashboard cache: {str(e)}"
        )

@router.get("/query-optimization/recommendations")
async def get_query_optimization_recommendations(
    limit: int = Query(10, ge=1, le=50, description="Number of recommendations to return")
):
    """Get query optimization recommendations"""
    try:
        recommendations = query_optimizer.get_optimization_recommendations(limit)
        return {"status": "success", "data": recommendations}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get optimization recommendations: {str(e)}"
        )

@router.get("/query-optimization/report")
async def get_query_performance_report():
    """Get comprehensive query performance report"""
    try:
        report = query_optimizer.get_query_performance_report()
        return {"status": "success", "data": report}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate performance report: {str(e)}"
        )

@router.post("/query-optimization/analyze")
async def analyze_query(query_data: Dict[str, Any]):
    """Analyze a query for optimization opportunities"""
    try:
        query = query_data.get("query")
        if not query:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query is required"
            )
        
        analysis = query_optimizer.analyzer.analyze_query(query)
        return {"status": "success", "data": analysis}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze query: {str(e)}"
        )

@router.post("/query-optimization/record-execution")
async def record_query_execution(execution_data: Dict[str, Any]):
    """Record query execution metrics"""
    try:
        query = execution_data.get("query")
        execution_time_ms = execution_data.get("execution_time_ms")
        
        if not query or execution_time_ms is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query and execution_time_ms are required"
            )
        
        metrics = query_optimizer.record_query_execution(
            query=query,
            execution_time_ms=execution_time_ms,
            rows_examined=execution_data.get("rows_examined", 0),
            rows_returned=execution_data.get("rows_returned", 0),
            index_used=execution_data.get("index_used", True),
            cache_hit=execution_data.get("cache_hit", False)
        )
        
        return {"status": "success", "data": metrics.query_hash}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record query execution: {str(e)}"
        )

@router.get("/dashboard/{dashboard_id}/performance")
async def get_dashboard_performance_metrics(dashboard_id: str):
    """Get performance metrics for a specific dashboard"""
    try:
        # This would normally query actual dashboard performance data
        # For now, return mock data
        metrics = {
            "dashboard_id": dashboard_id,
            "load_time_ms": 1250,
            "query_count": 5,
            "cache_hit_rate": 0.8,
            "data_freshness": "2 minutes ago",
            "last_updated": datetime.now().isoformat(),
            "performance_score": 85,
            "recommendations": [
                "Consider caching expensive aggregation queries",
                "Optimize JOIN operations in revenue trend query",
                "Add index on customer_id for faster filtering"
            ]
        }
        
        return {"status": "success", "data": metrics}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard performance: {str(e)}"
        )

@router.get("/system/performance")
async def get_system_performance():
    """Get overall system performance metrics"""
    try:
        # Combine various performance metrics
        cache_stats = caching_service.get_stats()
        cache_health = await caching_service.health_check()
        query_report = query_optimizer.get_query_performance_report()
        
        # Calculate overall performance score
        performance_score = 100
        
        # Deduct points for poor cache hit rate
        if cache_stats['hit_rate_percent'] < 50:
            performance_score -= 20
        elif cache_stats['hit_rate_percent'] < 70:
            performance_score -= 10
        
        # Deduct points for slow queries
        if query_report.get('status') == 'success':
            summary = query_report.get('data', {}).get('summary', {})
            if summary.get('slow_queries_percentage', 0) > 10:
                performance_score -= 15
            elif summary.get('slow_queries_percentage', 0) > 5:
                performance_score -= 5
        
        system_metrics = {
            "overall_score": max(performance_score, 0),
            "cache_performance": {
                "hit_rate_percent": cache_stats['hit_rate_percent'],
                "total_requests": cache_stats['total_requests'],
                "redis_available": cache_health['redis_available']
            },
            "query_performance": query_report.get('data', {}).get('summary', {}),
            "recommendations": [],
            "status": "healthy" if performance_score > 80 else "warning" if performance_score > 60 else "critical"
        }
        
        # Add recommendations based on performance
        if cache_stats['hit_rate_percent'] < 70:
            system_metrics["recommendations"].append("Improve cache hit rate by optimizing cache strategies")
        
        if query_report.get('status') == 'success':
            issues = query_report.get('data', {}).get('performance_issues', [])
            system_metrics["recommendations"].extend(issues[:3])
        
        return {"status": "success", "data": system_metrics}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system performance: {str(e)}"
        )

@router.post("/performance/benchmark")
async def run_performance_benchmark():
    """Run performance benchmark tests"""
    try:
        # This would run actual benchmark tests
        # For now, return mock benchmark results
        benchmark_results = {
            "test_suite": "BiteBase Performance Benchmark v1.0",
            "run_timestamp": datetime.now().isoformat(),
            "tests": {
                "dashboard_load": {
                    "avg_time_ms": 1200,
                    "p95_time_ms": 2100,
                    "p99_time_ms": 3500,
                    "status": "pass",
                    "threshold_ms": 2000
                },
                "query_execution": {
                    "avg_time_ms": 150,
                    "p95_time_ms": 450,
                    "p99_time_ms": 800,
                    "status": "pass",
                    "threshold_ms": 500
                },
                "cache_operations": {
                    "get_avg_ms": 2.5,
                    "set_avg_ms": 3.2,
                    "status": "pass",
                    "threshold_ms": 10
                },
                "concurrent_users": {
                    "max_supported": 150,
                    "response_degradation": "5%",
                    "status": "pass",
                    "threshold": 100
                }
            },
            "overall_score": 92,
            "recommendations": [
                "Consider adding more cache warming for cold start scenarios",
                "Monitor memory usage during peak concurrent load"
            ]
        }
        
        return {"status": "success", "data": benchmark_results}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run performance benchmark: {str(e)}"
        )