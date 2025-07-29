#!/usr/bin/env python3
"""
WebSocket Test Script for BiteBase Intelligence
Tests real-time notifications, collaboration, and insights WebSocket endpoints
"""

import asyncio
import json
import websockets
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# WebSocket endpoints to test
ENDPOINTS = {
    "notifications": "ws://localhost:8000/api/v1/notifications/ws/test-user-123",
    "collaboration": "ws://localhost:8000/api/v1/collaboration/ws/dashboard-123/user-123?username=TestUser&avatar_url=",
    "insights": "ws://localhost:8000/api/v1/insights/ws/test-user-123"
}

async def test_notifications_websocket():
    """Test notifications WebSocket endpoint"""
    try:
        logger.info("Testing notifications WebSocket...")
        
        async with websockets.connect(ENDPOINTS["notifications"]) as websocket:
            logger.info("✅ Connected to notifications WebSocket")
            
            # Send ping
            await websocket.send(json.dumps({
                "type": "ping",
                "timestamp": datetime.now().isoformat()
            }))
            
            # Wait for pong
            response = await websocket.recv()
            data = json.loads(response)
            logger.info(f"📨 Received: {data.get('type', 'unknown')}")
            
            # Request notifications list
            await websocket.send(json.dumps({
                "type": "get_notifications",
                "unread_only": False
            }))
            
            # Wait for notifications list
            response = await websocket.recv()
            data = json.loads(response)
            logger.info(f"📋 Notifications: {len(data.get('notifications', []))} items")
            
            logger.info("✅ Notifications WebSocket test completed")
            
    except Exception as e:
        logger.error(f"❌ Notifications WebSocket test failed: {str(e)}")

async def test_collaboration_websocket():
    """Test collaboration WebSocket endpoint"""
    try:
        logger.info("Testing collaboration WebSocket...")
        
        async with websockets.connect(ENDPOINTS["collaboration"]) as websocket:
            logger.info("✅ Connected to collaboration WebSocket")
            
            # Wait for session joined message
            response = await websocket.recv()
            data = json.loads(response)
            logger.info(f"🤝 Session event: {data.get('type', 'unknown')}")
            
            # Send cursor position update
            await websocket.send(json.dumps({
                "type": "cursor_update",
                "data": {
                    "x": 100,
                    "y": 200,
                    "element_id": "widget-123"
                }
            }))
            
            logger.info("✅ Collaboration WebSocket test completed")
            
    except Exception as e:
        logger.error(f"❌ Collaboration WebSocket test failed: {str(e)}")

async def test_insights_websocket():
    """Test insights WebSocket endpoint"""
    try:
        logger.info("Testing insights WebSocket...")
        
        async with websockets.connect(ENDPOINTS["insights"]) as websocket:
            logger.info("✅ Connected to insights WebSocket")
            
            # Wait for connection confirmation
            response = await websocket.recv()
            data = json.loads(response)
            logger.info(f"🧠 Insights event: {data.get('type', 'unknown')}")
            
            # Send ping
            await websocket.send(json.dumps({
                "type": "ping"
            }))
            
            # Wait for pong
            response = await websocket.recv()
            data = json.loads(response)
            logger.info(f"📨 Received: {data.get('type', 'unknown')}")
            
            # Subscribe to restaurant insights
            await websocket.send(json.dumps({
                "type": "subscribe_restaurant",
                "restaurant_id": "restaurant-123"
            }))
            
            # Wait for subscription confirmation
            response = await websocket.recv()
            data = json.loads(response)
            logger.info(f"📊 Subscription: {data.get('type', 'unknown')}")
            
            logger.info("✅ Insights WebSocket test completed")
            
    except Exception as e:
        logger.error(f"❌ Insights WebSocket test failed: {str(e)}")

async def test_notification_api():
    """Test notification REST API"""
    try:
        import aiohttp
        
        logger.info("Testing notification REST API...")
        
        async with aiohttp.ClientSession() as session:
            # Send a test notification
            notification_data = {
                "user_id": "test-user-123",
                "type": "system",
                "title": "WebSocket Test Notification",
                "message": "This is a test notification sent via REST API to verify WebSocket delivery.",
                "priority": "medium",
                "action_url": "http://localhost:50513/dashboard",
                "action_text": "View Dashboard"
            }
            
            async with session.post(
                "http://localhost:8000/api/v1/notifications/send",
                json=notification_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"✅ Notification sent: {result.get('notification_id')}")
                else:
                    logger.error(f"❌ Failed to send notification: {response.status}")
                    
    except ImportError:
        logger.warning("⚠️ aiohttp not available, skipping REST API test")
    except Exception as e:
        logger.error(f"❌ Notification API test failed: {str(e)}")

async def run_all_tests():
    """Run all WebSocket tests"""
    logger.info("🚀 Starting WebSocket tests for BiteBase Intelligence")
    logger.info("=" * 60)
    
    # Test each WebSocket endpoint
    await test_notifications_websocket()
    await asyncio.sleep(1)
    
    await test_collaboration_websocket()
    await asyncio.sleep(1)
    
    await test_insights_websocket()
    await asyncio.sleep(1)
    
    await test_notification_api()
    
    logger.info("=" * 60)
    logger.info("🎉 All WebSocket tests completed!")

if __name__ == "__main__":
    try:
        asyncio.run(run_all_tests())
    except KeyboardInterrupt:
        logger.info("🛑 Tests interrupted by user")
    except Exception as e:
        logger.error(f"💥 Test suite failed: {str(e)}")
