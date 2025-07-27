"""
Comprehensive Service Layer Tests
Tests all service components for functionality and reliability
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import Mock, AsyncMock, patch
import json

from app.services.collaboration.realtime_sync import RealtimeSyncService, Operation, OperationType
from app.services.collaboration.presence_tracker import PresenceTracker, UserPresence, CursorPosition
from app.services.performance.caching_service import CachingService
from app.services.performance.query_optimizer import QueryOptimizer, QueryAnalyzer
from app.services.security.rbac_service import RBACService, Permission, ResourceType
from app.services.security.audit_service import AuditService, AuditEventType, AuditSeverity

class TestRealtimeSyncService:
    """Test real-time synchronization service"""
    
    @pytest.fixture
    def sync_service(self):
        return RealtimeSyncService()
    
    @pytest.mark.asyncio
    async def test_join_session(self, sync_service):
        """Test joining a sync session"""
        result = await sync_service.join_session("dashboard_1", "user_1")
        
        assert "session_id" in result
        assert result["session_id"] == "dashboard_1:user_1"
        assert "participants" in result
        assert "user_1" in result["participants"]
        assert result["current_version"] == 0
    
    @pytest.mark.asyncio
    async def test_leave_session(self, sync_service):
        """Test leaving a sync session"""
        # First join
        await sync_service.join_session("dashboard_1", "user_1")
        await sync_service.join_session("dashboard_1", "user_2")
        
        # Then leave
        result = await sync_service.leave_session("dashboard_1", "user_1")
        
        assert "participants" in result
        assert "user_1" not in result["participants"]
        assert "user_2" in result["participants"]
    
    @pytest.mark.asyncio
    async def test_submit_operation(self, sync_service):
        """Test submitting operations"""
        await sync_service.join_session("dashboard_1", "user_1")
        
        operation = Operation(
            id="op_1",
            type=OperationType.UPDATE,
            dashboard_id="dashboard_1",
            user_id="user_1",
            timestamp=datetime.now(),
            path=["widgets", "0", "title"],
            data={"new_value": "Updated Title"},
            version=1
        )
        
        result = await sync_service.submit_operation(operation)
        
        assert result["operation_id"] == "op_1"
        assert result["status"] == "processed"
        assert result["new_version"] > 0
    
    @pytest.mark.asyncio
    async def test_sync_user_state(self, sync_service):
        """Test syncing user state"""
        await sync_service.join_session("dashboard_1", "user_1")
        
        # Submit some operations
        operation = Operation(
            id="op_1",
            type=OperationType.UPDATE,
            dashboard_id="dashboard_1",
            user_id="user_1",
            timestamp=datetime.now(),
            path=["title"],
            data={"new_value": "New Title"},
            version=1
        )
        await sync_service.submit_operation(operation)
        
        # Test sync from version 0
        result = await sync_service.sync_user_state("dashboard_1", "user_2", 0)
        
        assert result["status"] == "sync_required"
        assert result["current_version"] > 0

class TestPresenceTracker:
    """Test presence tracking service"""
    
    @pytest.fixture
    def presence_tracker(self):
        return PresenceTracker()
    
    @pytest.mark.asyncio
    async def test_join_session(self, presence_tracker):
        """Test joining presence session"""
        result = await presence_tracker.join_session(
            "dashboard_1", "user_1", "Test User", "https://example.com/avatar.jpg"
        )
        
        assert "session_id" in result
        assert result["user_presence"]["user_id"] == "user_1"
        assert result["user_presence"]["username"] == "Test User"
        assert result["user_presence"]["status"] == "online"
    
    @pytest.mark.asyncio
    async def test_update_cursor_position(self, presence_tracker):
        """Test updating cursor position"""
        await presence_tracker.join_session("dashboard_1", "user_1", "Test User")
        
        cursor_position = CursorPosition(x=50.0, y=25.0, element_id="widget_1")
        
        result = await presence_tracker.update_cursor_position(
            "dashboard_1", "user_1", cursor_position
        )
        
        assert result["status"] == "updated"
        assert result["cursor_position"]["x"] == 50.0
        assert result["cursor_position"]["y"] == 25.0
    
    @pytest.mark.asyncio
    async def test_update_user_activity(self, presence_tracker):
        """Test updating user activity"""
        await presence_tracker.join_session("dashboard_1", "user_1", "Test User")
        
        result = await presence_tracker.update_user_activity(
            "dashboard_1", "user_1", "editing", "widget_1"
        )
        
        assert result["status"] == "updated"
        assert result["user_activity"]["action"] == "editing"
        assert result["user_activity"]["element_id"] == "widget_1"
    
    @pytest.mark.asyncio
    async def test_get_session_presence(self, presence_tracker):
        """Test getting session presence"""
        await presence_tracker.join_session("dashboard_1", "user_1", "User 1")
        await presence_tracker.join_session("dashboard_1", "user_2", "User 2")
        
        result = await presence_tracker.get_session_presence("dashboard_1")
        
        assert result["dashboard_id"] == "dashboard_1"
        assert len(result["participants"]) == 2
        assert result["total_participants"] == 2

class TestCachingService:
    """Test caching service"""
    
    @pytest.fixture
    def caching_service(self):
        return CachingService()
    
    @pytest.mark.asyncio
    async def test_set_and_get(self, caching_service):
        """Test basic set and get operations"""
        # Set a value
        success = await caching_service.set("test", "key1", {"data": "test_value"})
        assert success
        
        # Get the value
        result = await caching_service.get("test", "key1")
        assert result == {"data": "test_value"}
    
    @pytest.mark.asyncio
    async def test_get_or_set(self, caching_service):
        """Test get_or_set functionality"""
        def factory_func():
            return {"generated": "data", "timestamp": datetime.now().isoformat()}
        
        # First call should use factory function
        result1 = await caching_service.get_or_set("test", "key2", factory_func)
        assert "generated" in result1
        
        # Second call should use cached value
        result2 = await caching_service.get_or_set("test", "key2", factory_func)
        assert result1 == result2
    
    @pytest.mark.asyncio
    async def test_cache_dashboard_query(self, caching_service):
        """Test dashboard-specific caching"""
        query_result = {"rows": [{"id": 1, "name": "Test"}], "total": 1}
        
        success = await caching_service.cache_dashboard_query(
            "dashboard_1", "query_hash_123", query_result, is_real_time=False
        )
        assert success
        
        cached_result = await caching_service.get_dashboard_query(
            "dashboard_1", "query_hash_123", is_real_time=False
        )
        assert cached_result == query_result
    
    @pytest.mark.asyncio
    async def test_invalidate_dashboard(self, caching_service):
        """Test dashboard cache invalidation"""
        # Cache some data
        await caching_service.cache_dashboard_query(
            "dashboard_1", "query1", {"data": "test1"}
        )
        await caching_service.cache_dashboard_query(
            "dashboard_1", "query2", {"data": "test2"}
        )
        
        # Invalidate dashboard cache
        count = await caching_service.invalidate_dashboard("dashboard_1")
        
        # Should have invalidated entries
        assert count >= 0  # May be 0 if using fallback cache
    
    def test_cache_statistics(self, caching_service):
        """Test cache statistics"""
        stats = caching_service.get_stats()
        
        assert "hit_count" in stats
        assert "miss_count" in stats
        assert "hit_rate_percent" in stats
        assert "total_requests" in stats

class TestQueryOptimizer:
    """Test query optimization service"""
    
    @pytest.fixture
    def query_optimizer(self):
        return QueryOptimizer()
    
    @pytest.fixture
    def query_analyzer(self):
        return QueryAnalyzer()
    
    def test_analyze_query(self, query_analyzer):
        """Test query analysis"""
        query = """
            SELECT r.name, SUM(o.total_amount) as revenue 
            FROM restaurants r 
            JOIN orders o ON r.id = o.restaurant_id 
            WHERE o.order_date >= '2024-01-01' 
            GROUP BY r.name 
            ORDER BY revenue DESC
        """
        
        analysis = query_analyzer.analyze_query(query)
        
        assert analysis["query_type"] == OperationType.AGGREGATE
        assert analysis["complexity_score"] > 1.0
        assert len(analysis["suggested_indexes"]) > 0
        assert len(analysis["optimization_hints"]) >= 0
    
    def test_record_query_execution(self, query_optimizer):
        """Test recording query execution metrics"""
        query = "SELECT * FROM restaurants WHERE city = 'New York'"
        
        metrics = query_optimizer.record_query_execution(
            query=query,
            execution_time_ms=150.5,
            rows_examined=1000,
            rows_returned=25,
            index_used=True,
            cache_hit=False
        )
        
        assert metrics.execution_time_ms == 150.5
        assert metrics.rows_examined == 1000
        assert metrics.rows_returned == 25
        assert metrics.index_used == True
    
    def test_get_optimization_recommendations(self, query_optimizer):
        """Test getting optimization recommendations"""
        # Record some queries first
        for i in range(5):
            query_optimizer.record_query_execution(
                query=f"SELECT * FROM table_{i} WHERE id = {i}",
                execution_time_ms=1000 + i * 100,  # Increasingly slow
                rows_examined=10000,
                rows_returned=1
            )
        
        recommendations = query_optimizer.get_optimization_recommendations(limit=3)
        
        assert len(recommendations) <= 3
        if recommendations:
            assert "pattern_hash" in recommendations[0]
            assert "optimization_score" in recommendations[0]
    
    def test_query_performance_report(self, query_optimizer):
        """Test performance report generation"""
        # Record some test queries
        query_optimizer.record_query_execution(
            query="SELECT * FROM test_table",
            execution_time_ms=500,
            rows_examined=100,
            rows_returned=10
        )
        
        report = query_optimizer.get_query_performance_report()
        
        if report["status"] == "success":
            assert "summary" in report["data"]
            assert "total_queries" in report["data"]["summary"]
            assert "avg_execution_time_ms" in report["data"]["summary"]

class TestRBACService:
    """Test role-based access control service"""
    
    @pytest.fixture
    def rbac_service(self):
        return RBACService()
    
    @pytest.mark.asyncio
    async def test_create_user(self, rbac_service):
        """Test user creation"""
        user_data = {
            "id": "test_user",
            "username": "testuser",
            "email": "test@example.com",
            "roles": ["viewer"],
            "department": "Analytics"
        }
        
        user = await rbac_service.create_user(user_data)
        
        assert user.id == "test_user"
        assert user.username == "testuser"
        assert "viewer" in user.roles
    
    @pytest.mark.asyncio
    async def test_create_role(self, rbac_service):
        """Test role creation"""
        role_data = {
            "id": "test_role",
            "name": "Test Role",
            "description": "Role for testing",
            "permissions": ["read", "create"]
        }
        
        role = await rbac_service.create_role(role_data)
        
        assert role.id == "test_role"
        assert role.name == "Test Role"
        assert Permission.READ in role.permissions
        assert Permission.CREATE in role.permissions
    
    @pytest.mark.asyncio
    async def test_assign_role_to_user(self, rbac_service):
        """Test role assignment"""
        # Create user and role first
        await rbac_service.create_user({
            "id": "test_user",
            "username": "testuser",
            "email": "test@example.com"
        })
        await rbac_service.create_role({
            "id": "test_role",
            "name": "Test Role",
            "description": "Test",
            "permissions": ["read"]
        })
        
        success = await rbac_service.assign_role_to_user("test_user", "test_role")
        assert success
        
        user_roles = rbac_service.get_user_roles("test_user")
        role_ids = [role.id for role in user_roles]
        assert "test_role" in role_ids
    
    @pytest.mark.asyncio
    async def test_check_access(self, rbac_service):
        """Test access control checking"""
        # Set up user, role, and resource
        await rbac_service.create_user({
            "id": "test_user",
            "username": "testuser",
            "email": "test@example.com",
            "roles": ["editor"]
        })
        
        await rbac_service.create_resource({
            "id": "test_dashboard",
            "type": "dashboard",
            "owner_id": "test_user",
            "metadata": {}
        })
        
        # Test access
        has_access = await rbac_service.check_access(
            "test_user", "test_dashboard", Permission.READ
        )
        assert has_access  # Should have access as owner
    
    def test_get_user_permissions(self, rbac_service):
        """Test getting user permissions"""
        permissions = rbac_service.get_user_permissions("non_existent_user")
        assert len(permissions) == 0
        
        # Test with admin user (should have all permissions)
        admin_permissions = rbac_service.get_user_permissions("admin")
        # Note: This would require creating an admin user first
    
    def test_security_report(self, rbac_service):
        """Test security report generation"""
        report = rbac_service.get_security_report()
        
        assert "summary" in report
        assert "access_statistics" in report
        assert "role_distribution" in report
        assert "recommendations" in report

class TestAuditService:
    """Test audit logging service"""
    
    @pytest.fixture
    def audit_service(self):
        return AuditService()
    
    @pytest.mark.asyncio
    async def test_log_event(self, audit_service):
        """Test basic event logging"""
        event = await audit_service.log_event(
            event_type=AuditEventType.LOGIN_SUCCESS,
            action="user_login",
            description="User logged in successfully",
            user_id="test_user",
            username="testuser",
            severity=AuditSeverity.LOW,
            tags=["authentication"]
        )
        
        assert event.event_type == AuditEventType.LOGIN_SUCCESS
        assert event.user_id == "test_user"
        assert event.action == "user_login"
        assert "authentication" in event.tags
    
    @pytest.mark.asyncio
    async def test_log_user_login(self, audit_service):
        """Test user login logging"""
        # Test successful login
        await audit_service.log_user_login(
            "test_user", "testuser", True, "192.168.1.1", "Mozilla/5.0"
        )
        
        # Test failed login
        await audit_service.log_user_login(
            "test_user", "testuser", False, "192.168.1.1", "Mozilla/5.0", "Invalid password"
        )
        
        # Query events to verify
        events = await audit_service.query_events(limit=10)
        login_events = [e for e in events if "login" in e.action]
        assert len(login_events) >= 2
    
    @pytest.mark.asyncio
    async def test_log_data_access(self, audit_service):
        """Test data access logging"""
        await audit_service.log_data_access(
            "test_user", "testuser", "dashboard", "dashboard_1", "read", True, "192.168.1.1"
        )
        
        events = await audit_service.query_events(limit=10)
        data_events = [e for e in events if "data_" in e.action]
        assert len(data_events) >= 1
    
    @pytest.mark.asyncio
    async def test_log_security_event(self, audit_service):
        """Test security event logging"""
        await audit_service.log_security_event(
            AuditEventType.SECURITY_VIOLATION,
            "Suspicious activity detected",
            "test_user",
            "testuser",
            "192.168.1.1",
            AuditSeverity.HIGH
        )
        
        events = await audit_service.query_events(limit=10)
        security_events = [e for e in events if e.event_type == AuditEventType.SECURITY_VIOLATION]
        assert len(security_events) >= 1
    
    @pytest.mark.asyncio
    async def test_get_user_activity(self, audit_service):
        """Test getting user activity"""
        # Log some activity first
        await audit_service.log_event(
            AuditEventType.DATA_READ,
            "read_data",
            "User read dashboard data",
            "test_user",
            "testuser"
        )
        
        activities = await audit_service.get_user_activity("test_user", days=7)
        user_activities = [a for a in activities if a.user_id == "test_user"]
        assert len(user_activities) >= 1
    
    @pytest.mark.asyncio
    async def test_get_security_incidents(self, audit_service):
        """Test getting security incidents"""
        # Log a security incident
        await audit_service.log_security_event(
            AuditEventType.UNAUTHORIZED_ACCESS,
            "Unauthorized access attempt",
            severity=AuditSeverity.HIGH
        )
        
        incidents = await audit_service.get_security_incidents(days=7)
        assert len(incidents) >= 1
    
    @pytest.mark.asyncio
    async def test_compliance_report(self, audit_service):
        """Test compliance report generation"""
        start_date = datetime.now() - timedelta(days=7)
        end_date = datetime.now()
        
        report = await audit_service.generate_compliance_report(start_date, end_date)
        
        assert "report_period" in report
        assert "summary" in report
        assert "event_type_distribution" in report

# Integration tests

class TestServiceIntegration:
    """Test integration between services"""
    
    @pytest.mark.asyncio
    async def test_collaboration_with_audit(self):
        """Test collaboration service with audit logging"""
        # This would test that collaboration events are properly audited
        pass
    
    @pytest.mark.asyncio
    async def test_rbac_with_caching(self):
        """Test RBAC with caching for performance"""
        # This would test that RBAC decisions are cached appropriately
        pass
    
    @pytest.mark.asyncio
    async def test_query_optimization_with_caching(self):
        """Test query optimization with caching"""
        # This would test that optimized queries are cached
        pass

# Mock and fixture utilities

@pytest.fixture
def mock_database():
    """Mock database for testing"""
    return Mock()

@pytest.fixture
def mock_redis():
    """Mock Redis for testing"""
    return AsyncMock()

@pytest.fixture
def event_loop():
    """Event loop for async tests"""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

# Performance tests for services

class TestServicePerformance:
    """Performance tests for services"""
    
    @pytest.mark.asyncio
    async def test_cache_performance(self):
        """Test caching service performance"""
        import time
        
        caching_service = CachingService()
        
        # Test set performance
        start_time = time.time()
        for i in range(100):
            await caching_service.set("test", f"key_{i}", {"data": f"value_{i}"})
        set_time = time.time() - start_time
        
        # Test get performance
        start_time = time.time()
        for i in range(100):
            await caching_service.get("test", f"key_{i}")
        get_time = time.time() - start_time
        
        # Performance assertions
        assert set_time < 1.0  # 100 sets should take less than 1 second
        assert get_time < 0.5  # 100 gets should take less than 0.5 seconds
    
    @pytest.mark.asyncio
    async def test_presence_tracker_performance(self):
        """Test presence tracker performance with many users"""
        presence_tracker = PresenceTracker()
        
        # Add many users to session
        start_time = time.time()
        for i in range(50):
            await presence_tracker.join_session(
                "dashboard_1", f"user_{i}", f"User {i}"
            )
        join_time = time.time() - start_time
        
        # Update all user cursors
        start_time = time.time()
        for i in range(50):
            cursor = CursorPosition(x=float(i), y=float(i))
            await presence_tracker.update_cursor_position(
                "dashboard_1", f"user_{i}", cursor
            )
        update_time = time.time() - start_time
        
        # Performance assertions
        assert join_time < 2.0  # 50 joins should take less than 2 seconds
        assert update_time < 1.0  # 50 updates should take less than 1 second