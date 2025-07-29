"""
Integration tests for BiteBase Intelligence API endpoints
Tests the complete API functionality including authentication, CRUD operations, and business logic
"""

import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import json

from app.main import app
from app.core.database import get_db
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.menu_item import MenuItem
from app.models.location import Location
from app.core.security import create_access_token

# Test client setup
client = TestClient(app)

class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_register_user(self):
        """Test user registration"""
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
            "restaurant_name": "Test Restaurant"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["status"] == "success"
        assert "user" in data["data"]
        assert data["data"]["user"]["email"] == user_data["email"]
    
    def test_login_user(self):
        """Test user login"""
        # First register a user
        user_data = {
            "email": "login@example.com",
            "password": "testpassword123",
            "full_name": "Login User",
            "restaurant_name": "Login Restaurant"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        # Then login
        login_data = {
            "email": "login@example.com",
            "password": "testpassword123"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "access_token" in data["data"]
        assert "token_type" in data["data"]
    
    def test_get_current_user(self):
        """Test getting current user info"""
        # Create and login user
        token = self._create_test_user_and_get_token()
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "user" in data["data"]
    
    def _create_test_user_and_get_token(self):
        """Helper method to create user and return token"""
        user_data = {
            "email": "auth@example.com",
            "password": "testpassword123",
            "full_name": "Auth User",
            "restaurant_name": "Auth Restaurant"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        login_response = client.post("/api/v1/auth/login", json={
            "email": "auth@example.com",
            "password": "testpassword123"
        })
        
        return login_response.json()["data"]["access_token"]

class TestProductIntelligence:
    """Test Product Intelligence endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.token = self._create_test_user_and_get_token()
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_menu_engineering_dashboard(self):
        """Test menu engineering dashboard endpoint"""
        response = client.get("/api/v1/product/menu-engineering", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "menu_analysis" in data["data"]
    
    def test_cost_analysis(self):
        """Test cost analysis endpoints"""
        # Get cost analysis
        response = client.get("/api/v1/product/cost-analysis", headers=self.headers)
        assert response.status_code == 200
        
        # Update cost analysis
        cost_data = {
            "item_id": "test-item-1",
            "ingredient_cost": 5.50,
            "labor_cost": 2.00,
            "overhead_cost": 1.50
        }
        
        response = client.post("/api/v1/product/cost-analysis", json=cost_data, headers=self.headers)
        assert response.status_code == 200
    
    def test_menu_items_crud(self):
        """Test menu items CRUD operations"""
        # Create menu item
        item_data = {
            "name": "Test Pizza",
            "description": "Delicious test pizza",
            "price": 15.99,
            "category": "Main Course",
            "cost": 6.50,
            "ingredients": ["dough", "sauce", "cheese"]
        }
        
        response = client.post("/api/v1/product/menu-items", json=item_data, headers=self.headers)
        assert response.status_code == 201
        
        data = response.json()
        item_id = data["data"]["item"]["id"]
        
        # Read menu item
        response = client.get(f"/api/v1/product/menu-items/{item_id}", headers=self.headers)
        assert response.status_code == 200
        
        # Update menu item
        update_data = {"price": 16.99}
        response = client.put(f"/api/v1/product/menu-items/{item_id}", json=update_data, headers=self.headers)
        assert response.status_code == 200
        
        # Delete menu item
        response = client.delete(f"/api/v1/product/menu-items/{item_id}", headers=self.headers)
        assert response.status_code == 200
    
    def _create_test_user_and_get_token(self):
        """Helper method to create user and return token"""
        user_data = {
            "email": "product@example.com",
            "password": "testpassword123",
            "full_name": "Product User",
            "restaurant_name": "Product Restaurant"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        login_response = client.post("/api/v1/auth/login", json={
            "email": "product@example.com",
            "password": "testpassword123"
        })
        
        return login_response.json()["data"]["access_token"]

class TestPlaceIntelligence:
    """Test Place Intelligence endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.token = self._create_test_user_and_get_token()
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_customer_density_analysis(self):
        """Test customer density analysis"""
        response = client.get("/api/v1/place/customer-density", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "density_data" in data["data"]
    
    def test_site_selection(self):
        """Test site selection analysis"""
        # Get site selection data
        response = client.get("/api/v1/place/site-selection", headers=self.headers)
        assert response.status_code == 200
        
        # Analyze potential site
        site_data = {
            "latitude": 40.7128,
            "longitude": -74.0060,
            "radius": 1000,
            "criteria": ["foot_traffic", "competition", "demographics"]
        }
        
        response = client.post("/api/v1/place/site-selection/analyze", json=site_data, headers=self.headers)
        assert response.status_code == 200
    
    def test_delivery_hotspots(self):
        """Test delivery hotspots analysis"""
        response = client.get("/api/v1/place/delivery-hotspots", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "hotspots" in data["data"]
    
    def _create_test_user_and_get_token(self):
        """Helper method to create user and return token"""
        user_data = {
            "email": "place@example.com",
            "password": "testpassword123",
            "full_name": "Place User",
            "restaurant_name": "Place Restaurant"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        login_response = client.post("/api/v1/auth/login", json={
            "email": "place@example.com",
            "password": "testpassword123"
        })
        
        return login_response.json()["data"]["access_token"]

class TestPriceIntelligence:
    """Test Price Intelligence endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.token = self._create_test_user_and_get_token()
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_revenue_forecasting(self):
        """Test revenue forecasting"""
        # Get current forecast
        response = client.get("/api/v1/price/revenue-forecast", headers=self.headers)
        assert response.status_code == 200
        
        # Generate new forecast
        forecast_data = {
            "period": "monthly",
            "horizon": 3,
            "factors": ["seasonality", "trends", "promotions"]
        }
        
        response = client.post("/api/v1/price/revenue-forecast/generate", json=forecast_data, headers=self.headers)
        assert response.status_code == 200
    
    def test_spending_analysis(self):
        """Test spending analysis"""
        response = client.get("/api/v1/price/spending-analysis", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "spending_patterns" in data["data"]
    
    def test_price_elasticity(self):
        """Test price elasticity analysis"""
        # Get elasticity data
        response = client.get("/api/v1/price/elasticity", headers=self.headers)
        assert response.status_code == 200
        
        # Calculate elasticity
        elasticity_data = {
            "item_id": "test-item-1",
            "price_changes": [
                {"price": 10.00, "quantity": 100},
                {"price": 12.00, "quantity": 85},
                {"price": 15.00, "quantity": 70}
            ]
        }
        
        response = client.post("/api/v1/price/elasticity/calculate", json=elasticity_data, headers=self.headers)
        assert response.status_code == 200
    
    def _create_test_user_and_get_token(self):
        """Helper method to create user and return token"""
        user_data = {
            "email": "price@example.com",
            "password": "testpassword123",
            "full_name": "Price User",
            "restaurant_name": "Price Restaurant"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        login_response = client.post("/api/v1/auth/login", json={
            "email": "price@example.com",
            "password": "testpassword123"
        })
        
        return login_response.json()["data"]["access_token"]

class TestPromotionIntelligence:
    """Test Promotion Intelligence endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.token = self._create_test_user_and_get_token()
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_customer_segmentation(self):
        """Test customer segmentation"""
        # Get segments
        response = client.get("/api/v1/promotion/customer-segments", headers=self.headers)
        assert response.status_code == 200
        
        # Create new segment
        segment_data = {
            "name": "High Value Customers",
            "criteria": {
                "min_order_value": 50.00,
                "min_frequency": 5,
                "recency_days": 30
            }
        }
        
        response = client.post("/api/v1/promotion/customer-segments", json=segment_data, headers=self.headers)
        assert response.status_code == 201
    
    def test_campaign_management(self):
        """Test campaign CRUD operations"""
        # Create campaign
        campaign_data = {
            "name": "Summer Special",
            "type": "discount",
            "target_segment": "all_customers",
            "discount_percentage": 15,
            "start_date": "2024-06-01",
            "end_date": "2024-08-31"
        }
        
        response = client.post("/api/v1/promotion/campaigns", json=campaign_data, headers=self.headers)
        assert response.status_code == 201
        
        data = response.json()
        campaign_id = data["data"]["campaign"]["id"]
        
        # Get campaign
        response = client.get(f"/api/v1/promotion/campaigns/{campaign_id}", headers=self.headers)
        assert response.status_code == 200
        
        # Update campaign
        update_data = {"discount_percentage": 20}
        response = client.put(f"/api/v1/promotion/campaigns/{campaign_id}", json=update_data, headers=self.headers)
        assert response.status_code == 200
        
        # Delete campaign
        response = client.delete(f"/api/v1/promotion/campaigns/{campaign_id}", headers=self.headers)
        assert response.status_code == 200
    
    def test_loyalty_analytics(self):
        """Test loyalty analytics"""
        response = client.get("/api/v1/promotion/loyalty-analytics", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "loyalty_metrics" in data["data"]
    
    def _create_test_user_and_get_token(self):
        """Helper method to create user and return token"""
        user_data = {
            "email": "promotion@example.com",
            "password": "testpassword123",
            "full_name": "Promotion User",
            "restaurant_name": "Promotion Restaurant"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        login_response = client.post("/api/v1/auth/login", json={
            "email": "promotion@example.com",
            "password": "testpassword123"
        })
        
        return login_response.json()["data"]["access_token"]

class TestAnalyticsAndAI:
    """Test Analytics and AI endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.token = self._create_test_user_and_get_token()
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_live_dashboard(self):
        """Test live dashboard data"""
        response = client.get("/api/v1/analytics/live-dashboard", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "metrics" in data["data"]
    
    def test_ai_forecasting(self):
        """Test AI forecasting"""
        forecast_request = {
            "metric": "revenue",
            "period": "daily",
            "horizon": 7,
            "include_confidence": True
        }
        
        response = client.post("/api/v1/ai/forecast", json=forecast_request, headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "forecast" in data["data"]
    
    def test_anomaly_detection(self):
        """Test anomaly detection"""
        # Get current anomalies
        response = client.get("/api/v1/ai/anomalies", headers=self.headers)
        assert response.status_code == 200
        
        # Trigger anomaly detection
        detection_request = {
            "metrics": ["revenue", "order_count", "avg_order_value"],
            "sensitivity": "medium",
            "time_range": "24h"
        }
        
        response = client.post("/api/v1/ai/anomalies/detect", json=detection_request, headers=self.headers)
        assert response.status_code == 200
    
    def _create_test_user_and_get_token(self):
        """Helper method to create user and return token"""
        user_data = {
            "email": "analytics@example.com",
            "password": "testpassword123",
            "full_name": "Analytics User",
            "restaurant_name": "Analytics Restaurant"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        login_response = client.post("/api/v1/auth/login", json={
            "email": "analytics@example.com",
            "password": "testpassword123"
        })
        
        return login_response.json()["data"]["access_token"]

class TestSecurity:
    """Test security endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.token = self._create_test_user_and_get_token()
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_vulnerability_scan(self):
        """Test vulnerability scanning"""
        response = client.post("/api/v1/security/enterprise/vulnerability-scan", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "scan_id" in data["data"]
    
    def test_audit_logs(self):
        """Test audit log retrieval"""
        response = client.get("/api/v1/security/enterprise/audit-logs", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "success"
        assert "logs" in data["data"]
    
    def _create_test_user_and_get_token(self):
        """Helper method to create user and return token"""
        user_data = {
            "email": "security@example.com",
            "password": "testpassword123",
            "full_name": "Security User",
            "restaurant_name": "Security Restaurant"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        login_response = client.post("/api/v1/auth/login", json={
            "email": "security@example.com",
            "password": "testpassword123"
        })
        
        return login_response.json()["data"]["access_token"]

class TestRateLimiting:
    """Test rate limiting functionality"""
    
    def test_rate_limit_enforcement(self):
        """Test that rate limiting is enforced"""
        # Create user and get token
        token = self._create_test_user_and_get_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        # Make requests up to the limit
        for i in range(10):
            response = client.get("/api/v1/analytics/live-dashboard", headers=headers)
            assert response.status_code == 200
        
        # Check rate limit headers
        assert "X-RateLimit-Limit" in response.headers
        assert "X-RateLimit-Remaining" in response.headers
    
    def _create_test_user_and_get_token(self):
        """Helper method to create user and return token"""
        user_data = {
            "email": "ratelimit@example.com",
            "password": "testpassword123",
            "full_name": "Rate Limit User",
            "restaurant_name": "Rate Limit Restaurant"
        }
        client.post("/api/v1/auth/register", json=user_data)
        
        login_response = client.post("/api/v1/auth/login", json={
            "email": "ratelimit@example.com",
            "password": "testpassword123"
        })
        
        return login_response.json()["data"]["access_token"]

# Test configuration
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
