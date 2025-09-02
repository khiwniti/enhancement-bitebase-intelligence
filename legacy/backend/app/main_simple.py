"""
Simplified BiteBase Intelligence API for testing
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI application
app = FastAPI(
    title="BiteBase Intelligence API",
    description="AI-powered restaurant intelligence platform",
    version="2.0.0",
    docs_url="/docs"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "BiteBase Intelligence 2.0 API",
        "version": "2.0.0",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "bitebase-api"}

# Mock API endpoints for testing
@app.get("/api/v1/dashboards/")
async def get_dashboards():
    return {"dashboards": [], "status": "success"}

@app.get("/api/v1/nl-query/suggestions")
async def get_nl_suggestions():
    return {"suggestions": ["Show revenue trends", "Customer analysis"], "status": "success"}

@app.get("/api/v1/insights/")
async def get_insights():
    return {"insights": [], "status": "success"}

@app.get("/api/v1/connectors/")
async def get_connectors():
    return {"connectors": [], "status": "success"}

@app.get("/api/v1/performance/cache/stats")
async def get_cache_stats():
    return {"cache_stats": {"hit_rate": 0.87, "size": "150MB"}, "status": "success"}

@app.get("/api/v1/security/security/health")
async def get_security_health():
    return {"security_health": "operational", "status": "success"}

@app.post("/api/v1/nl-query/process")
async def process_nl_query(query_data: dict):
    return {"sql": "SELECT * FROM restaurants", "confidence": 0.95, "status": "success"}

@app.post("/api/v1/dashboards/")
async def create_dashboard(dashboard_data: dict):
    return {"id": "test-dashboard", "status": "created"}

@app.get("/api/v1/collaboration/sessions/test/presence")
async def get_presence():
    return {"users": [], "status": "success"}

@app.post("/api/v1/collaboration/sessions/test/join")
async def join_session(session_data: dict):
    return {"session_id": "test", "status": "joined"}

@app.get("/api/v1/performance/query-optimization/recommendations")
async def get_query_recommendations():
    return {"recommendations": [], "status": "success"}

@app.get("/api/v1/performance/query-optimization/report")
async def get_query_report():
    return {"report": "All queries optimized", "status": "success"}

@app.get("/api/v1/security/rbac/security-report")
async def get_rbac_report():
    return {"rbac_status": "secure", "status": "success"}

@app.get("/api/v1/security/audit/events")
async def get_audit_events():
    return {"events": [], "status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)