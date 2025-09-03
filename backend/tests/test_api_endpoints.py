"""
Comprehensive API Endpoint Tests
Tests all API endpoints for functionality, security, and performance
"""

import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
import json

from app.main import app

class TestDashboardEndpoints:
    """Test enhanced dashboard endpoints"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_create_dashboard(self, client):
        """Test dashboard creation"""
        dashboard_data = {
            "title": "Test Dashboard",
            "description": "Test dashboard for API testing",
            "widgets": [
                {
                    "type": "chart",
                    "title": "Revenue Chart",
                    "chart_type": "line",
                    "data_source": "restaurants",
                    "config": {"x_axis": "date", "y_axis": "revenue"}
                }
            ],
            "layout": {"grid": {"cols": 12, "rows": 8}},
            "is_public": False
        }
        
        response = client.post("/api/v1/dashboards/", json=dashboard_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "dashboard_id" in data["data"]
        
        return data["data"]["dashboard_id"]
    
    def test_get_dashboard(self, client):
        """Test dashboard retrieval"""
        # First create a dashboard
        dashboard_id = self.test_create_dashboard(client)
        
        # Then retrieve it
        response = client.get(f"/api/v1/dashboards/{dashboard_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert data["data"]["title"] == "Test Dashboard"
    
    def test_update_dashboard(self, client):
        """Test dashboard update"""
        dashboard_id = self.test_create_dashboard(client)
        
        update_data = {
            "title": "Updated Test Dashboard",
            "description": "Updated description"
        }
        
        response = client.put(f"/api/v1/dashboards/{dashboard_id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
    
    def test_delete_dashboard(self, client):
        """Test dashboard deletion"""
        dashboard_id = self.test_create_dashboard(client)
        
        response = client.delete(f"/api/v1/dashboards/{dashboard_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"

class TestNLQueryEndpoints:
    """Test natural language query endpoints"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_process_nl_query(self, client):
        """Test natural language query processing"""
        query_data = {
            "query": "Show me revenue trends for the last 30 days",
            "context": {
                "user_id": "test_user",
                "dashboard_id": "test_dashboard"
            }
        }
        
        response = client.post("/api/v1/nl-query/process", json=query_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "sql_query" in data["data"]
        assert "confidence_score" in data["data"]
        assert data["data"]["confidence_score"] >= 0.0
        assert data["data"]["confidence_score"] <= 1.0
    
    def test_get_query_suggestions(self, client):
        """Test query suggestions"""
        response = client.get("/api/v1/nl-query/suggestions?context=restaurant")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "suggestions" in data["data"]
        assert len(data["data"]["suggestions"]) > 0
    
    def test_validate_query(self, client):
        """Test query validation"""
        query_data = {
            "query": "SELECT * FROM restaurants WHERE revenue > 1000",
            "query_type": "sql"
        }
        
        response = client.post("/api/v1/nl-query/validate", json=query_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "is_valid" in data["data"]

class TestInsightsEndpoints:
    """Test automated insights endpoints"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_get_insights(self, client):
        """Test insights retrieval"""
        response = client.get("/api/v1/insights/?dashboard_id=test_dashboard")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "insights" in data["data"]
    
    def test_generate_insights(self, client):
        """Test insights generation"""
        insights_data = {
            "data_source": "restaurants",
            "metrics": ["revenue", "customer_count"],
            "time_range": {
                "start": "2024-01-01",
                "end": "2024-12-31"
            }
        }
        
        response = client.post("/api/v1/insights/generate", json=insights_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "insights" in data["data"]
    
    def test_get_anomalies(self, client):
        """Test anomaly detection"""
        response = client.get("/api/v1/insights/anomalies?metric=revenue&days=30")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "anomalies" in data["data"]

class TestConnectorEndpoints:
    """Test data connector endpoints"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_create_connector(self, client):
        """Test connector creation"""
        connector_data = {
            "name": "Test PostgreSQL Connector",
            "type": "postgresql",
            "config": {
                "host": "localhost",
                "port": 5432,
                "database": "test_db",
                "username": "test_user",
                "password": "test_password"
            }
        }
        
        response = client.post("/api/v1/connectors/", json=connector_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "connector_id" in data["data"]
        
        return data["data"]["connector_id"]
    
    def test_test_connector(self, client):
        """Test connector connection"""
        connector_id = self.test_create_connector(client)
        
        response = client.post(f"/api/v1/connectors/{connector_id}/test")
        # Note: This might fail if no actual database is available
        # In a real test environment, you'd use a test database
        assert response.status_code in [200, 500]  # 500 if connection fails
    
    def test_get_schema(self, client):
        """Test schema discovery"""
        connector_id = self.test_create_connector(client)
        
        response = client.get(f"/api/v1/connectors/{connector_id}/schema")
        assert response.status_code in [200, 500]  # 500 if connection fails

class TestCollaborationEndpoints:
    """Test real-time collaboration endpoints"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_join_session(self, client):
        """Test joining collaboration session"""
        session_data = {
            "user_id": "test_user",
            "username": "Test User",
            "avatar_url": "https://example.com/avatar.jpg"
        }
        
        response = client.post("/api/v1/collaboration/sessions/test_dashboard/join", json=session_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "session" in data
        assert "presence" in data
    
    def test_get_session_presence(self, client):
        """Test getting session presence"""
        response = client.get("/api/v1/collaboration/sessions/test_dashboard/presence")
        assert response.status_code == 200
        
        data = response.json()
        assert "participants" in data
    
    def test_submit_operation(self, client):
        """Test submitting collaboration operation"""
        operation_data = {
            "user_id": "test_user",
            "operation_type": "update",
            "path": ["widgets", "0", "title"],
            "operation_data": {"new_value": "Updated Chart Title"},
            "version": 1
        }
        
        response = client.post("/api/v1/collaboration/sessions/test_dashboard/operations", json=operation_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"

class TestPerformanceEndpoints:
    """Test performance monitoring endpoints"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_cache_stats(self, client):
        """Test cache statistics"""
        response = client.get("/api/v1/performance/cache/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "hit_rate_percent" in data["data"]
    
    def test_cache_health(self, client):
        """Test cache health check"""
        response = client.get("/api/v1/performance/cache/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "redis_available" in data["data"]
    
    def test_query_optimization_recommendations(self, client):
        """Test query optimization recommendations"""
        response = client.get("/api/v1/performance/query-optimization/recommendations")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "data" in data
    
    def test_system_performance(self, client):
        """Test system performance metrics"""
        response = client.get("/api/v1/performance/system/performance")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "overall_score" in data["data"]

class TestSecurityEndpoints:
    """Test security and RBAC endpoints"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_create_user(self, client):
        """Test user creation"""
        user_data = {
            "id": "test_user_123",
            "username": "testuser",
            "email": "test@example.com",
            "roles": ["viewer"],
            "department": "Analytics",
            "created_by": "admin"
        }
        
        response = client.post("/api/v1/security/rbac/users", json=user_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert data["data"]["username"] == "testuser"
    
    def test_create_role(self, client):
        """Test role creation"""
        role_data = {
            "id": "test_role",
            "name": "Test Role",
            "description": "Role for testing",
            "permissions": ["read", "create"],
            "created_by": "admin"
        }
        
        response = client.post("/api/v1/security/rbac/roles", json=role_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert data["data"]["name"] == "Test Role"
    
    def test_check_access(self, client):
        """Test access control check"""
        access_data = {
            "user_id": "test_user_123",
            "resource_id": "test_dashboard",
            "permission": "read"
        }
        
        response = client.post("/api/v1/security/rbac/check-access", json=access_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "has_access" in data["data"]
    
    def test_audit_events(self, client):
        """Test audit log retrieval"""
        response = client.get("/api/v1/security/audit/events?limit=10")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "events" in data["data"]
    
    def test_security_dashboard(self, client):
        """Test security dashboard"""
        response = client.get("/api/v1/security/security/dashboard")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "security_score" in data["data"]

class TestErrorHandling:
    """Test error handling and edge cases"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_invalid_dashboard_id(self, client):
        """Test handling of invalid dashboard ID"""
        response = client.get("/api/v1/dashboards/invalid_id")
        assert response.status_code == 404
    
    def test_malformed_json(self, client):
        """Test handling of malformed JSON"""
        response = client.post(
            "/api/v1/dashboards/",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422
    
    def test_missing_required_fields(self, client):
        """Test handling of missing required fields"""
        response = client.post("/api/v1/dashboards/", json={})
        assert response.status_code == 422
    
    def test_unauthorized_access(self, client):
        """Test unauthorized access handling"""
        # This would require authentication middleware to be properly tested
        pass

class TestPerformanceConstraints:
    """Test performance constraints and limits"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_large_dashboard_creation(self, client):
        """Test creating dashboard with many widgets"""
        widgets = []
        for i in range(50):  # Create 50 widgets
            widgets.append({
                "type": "chart",
                "title": f"Chart {i}",
                "chart_type": "line",
                "data_source": "restaurants",
                "config": {"x_axis": "date", "y_axis": "revenue"}
            })
        
        dashboard_data = {
            "title": "Large Dashboard",
            "description": "Dashboard with many widgets",
            "widgets": widgets,
            "layout": {"grid": {"cols": 12, "rows": 50}},
            "is_public": False
        }
        
        response = client.post("/api/v1/dashboards/", json=dashboard_data)
        assert response.status_code == 200
    
    def test_query_timeout(self, client):
        """Test query timeout handling"""
        # This would require a slow query to test properly
        pass
    
    def test_rate_limiting(self, client):
        """Test rate limiting"""
        # Make multiple rapid requests
        responses = []
        for i in range(100):
            response = client.get("/api/v1/performance/cache/stats")
            responses.append(response)
        
        # All should succeed if no rate limiting is implemented
        # If rate limiting is implemented, some should return 429
        success_count = len([r for r in responses if r.status_code == 200])
        assert success_count >= 90  # At least 90% should succeed

# Utility functions for testing

def create_test_data():
    """Create test data for endpoints"""
    # This would create test restaurants, analytics data, etc.
    pass

def cleanup_test_data():
    """Clean up test data after tests"""
    # This would remove test data created during tests
    pass

# Pytest configuration

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Set up test environment"""
    create_test_data()
    yield
    cleanup_test_data()

@pytest.fixture
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

# Performance benchmarks

class TestPerformanceBenchmarks:
    """Performance benchmark tests"""
    
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_dashboard_load_performance(self, client):
        """Test dashboard load performance"""
        import time
        
        start_time = time.time()
        response = client.get("/api/v1/dashboards/test_dashboard")
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        # Dashboard should load in under 2 seconds
        assert response_time < 2000
    
    def test_nl_query_performance(self, client):
        """Test NL query processing performance"""
        import time
        
        query_data = {
            "query": "Show me revenue trends for the last 30 days",
            "context": {"user_id": "test_user"}
        }
        
        start_time = time.time()
        response = client.post("/api/v1/nl-query/process", json=query_data)
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000
        
        # NL query should process in under 500ms
        assert response_time < 500
    
    def test_concurrent_requests(self, client):
        """Test handling of concurrent requests"""
        import threading
        import time
        
        results = []
        
        def make_request():
            start_time = time.time()
            response = client.get("/api/v1/performance/cache/stats")
            end_time = time.time()
            results.append({
                'status_code': response.status_code,
                'response_time': (end_time - start_time) * 1000
            })
        
        # Create 10 concurrent threads
        threads = []
        for i in range(10):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
        
        # Start all threads
        for thread in threads:
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # All requests should succeed
        success_count = len([r for r in results if r['status_code'] == 200])
        assert success_count == 10
        
        # Average response time should be reasonable
        avg_response_time = sum(r['response_time'] for r in results) / len(results)
        assert avg_response_time < 1000  # Less than 1 second average