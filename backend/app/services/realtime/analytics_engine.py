"""
BiteBase Intelligence Real-time Analytics Engine
Provides real-time data processing and live dashboard updates
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set
from uuid import UUID, uuid4
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.restaurant import Restaurant
from app.models.analytics import AnalyticsEvent
from app.models.product import MenuItemCost
from app.models.place import CustomerLocation
from app.models.price import RevenueForecast
from app.models.promotion import CustomerSegment

logger = logging.getLogger(__name__)

class RealtimeMetric:
    """Represents a real-time metric update"""
    
    def __init__(self, metric_type: str, value: Any, restaurant_id: str, 
                 timestamp: datetime = None, metadata: Dict = None):
        self.id = str(uuid4())
        self.metric_type = metric_type
        self.value = value
        self.restaurant_id = restaurant_id
        self.timestamp = timestamp or datetime.utcnow()
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "metric_type": self.metric_type,
            "value": self.value,
            "restaurant_id": self.restaurant_id,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata
        }

class RealtimeAnalyticsEngine:
    """Main engine for real-time analytics processing"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.active_subscriptions: Dict[str, Set[str]] = {}  # user_id -> restaurant_ids
        self.metric_cache: Dict[str, RealtimeMetric] = {}
        self.processing_queue: asyncio.Queue = asyncio.Queue()
        self.is_running = False
        
    async def initialize(self):
        """Initialize Redis connection and start background tasks"""
        try:
            self.redis_client = redis.from_url(
                "redis://localhost:6379", 
                decode_responses=True
            )
            await self.redis_client.ping()
            logger.info("Redis connection established for real-time analytics")
        except Exception as e:
            logger.warning(f"Redis not available, using in-memory cache: {e}")
            self.redis_client = None
        
        # Start background processing
        if not self.is_running:
            self.is_running = True
            asyncio.create_task(self._process_metrics_queue())
            asyncio.create_task(self._generate_periodic_metrics())
    
    async def subscribe_user(self, user_id: str, restaurant_ids: List[str]):
        """Subscribe user to real-time updates for specific restaurants"""
        if user_id not in self.active_subscriptions:
            self.active_subscriptions[user_id] = set()
        
        self.active_subscriptions[user_id].update(restaurant_ids)
        logger.info(f"User {user_id} subscribed to restaurants: {restaurant_ids}")
    
    async def unsubscribe_user(self, user_id: str, restaurant_ids: List[str] = None):
        """Unsubscribe user from real-time updates"""
        if user_id in self.active_subscriptions:
            if restaurant_ids:
                self.active_subscriptions[user_id] -= set(restaurant_ids)
            else:
                del self.active_subscriptions[user_id]
        
        logger.info(f"User {user_id} unsubscribed from restaurants: {restaurant_ids or 'all'}")
    
    async def emit_metric(self, metric: RealtimeMetric):
        """Emit a real-time metric update"""
        await self.processing_queue.put(metric)
    
    async def get_current_metrics(self, restaurant_id: str) -> Dict[str, Any]:
        """Get current real-time metrics for a restaurant"""
        metrics = {}
        
        # Get from cache or Redis
        cache_key = f"metrics:{restaurant_id}"
        
        if self.redis_client:
            try:
                cached_data = await self.redis_client.get(cache_key)
                if cached_data:
                    metrics = json.loads(cached_data)
            except Exception as e:
                logger.error(f"Error reading from Redis: {e}")
        
        # Fallback to in-memory cache
        if not metrics:
            restaurant_metrics = {
                k: v.to_dict() for k, v in self.metric_cache.items()
                if v.restaurant_id == restaurant_id
            }
            metrics = restaurant_metrics
        
        return metrics
    
    async def _process_metrics_queue(self):
        """Background task to process metrics queue"""
        while self.is_running:
            try:
                # Process metrics in batches for efficiency
                metrics_batch = []
                
                # Collect metrics for up to 1 second or 100 metrics
                timeout = 1.0
                max_batch_size = 100
                
                try:
                    # Get first metric
                    metric = await asyncio.wait_for(
                        self.processing_queue.get(), 
                        timeout=timeout
                    )
                    metrics_batch.append(metric)
                    
                    # Collect additional metrics without waiting
                    while len(metrics_batch) < max_batch_size:
                        try:
                            metric = self.processing_queue.get_nowait()
                            metrics_batch.append(metric)
                        except asyncio.QueueEmpty:
                            break
                
                except asyncio.TimeoutError:
                    continue
                
                # Process the batch
                await self._process_metrics_batch(metrics_batch)
                
            except Exception as e:
                logger.error(f"Error in metrics processing queue: {e}")
                await asyncio.sleep(1)
    
    async def _process_metrics_batch(self, metrics: List[RealtimeMetric]):
        """Process a batch of metrics"""
        try:
            # Update cache
            for metric in metrics:
                cache_key = f"{metric.restaurant_id}:{metric.metric_type}"
                self.metric_cache[cache_key] = metric
            
            # Update Redis if available
            if self.redis_client:
                pipe = self.redis_client.pipeline()
                
                for metric in metrics:
                    cache_key = f"metrics:{metric.restaurant_id}"
                    restaurant_metrics = await self.get_current_metrics(metric.restaurant_id)
                    restaurant_metrics[metric.metric_type] = metric.to_dict()
                    
                    pipe.set(cache_key, json.dumps(restaurant_metrics), ex=3600)  # 1 hour TTL
                
                await pipe.execute()
            
            # Broadcast to subscribed users
            await self._broadcast_metrics(metrics)
            
        except Exception as e:
            logger.error(f"Error processing metrics batch: {e}")
    
    async def _broadcast_metrics(self, metrics: List[RealtimeMetric]):
        """Broadcast metrics to subscribed users"""
        # Group metrics by restaurant
        restaurant_metrics = {}
        for metric in metrics:
            if metric.restaurant_id not in restaurant_metrics:
                restaurant_metrics[metric.restaurant_id] = []
            restaurant_metrics[metric.restaurant_id].append(metric)
        
        # Send to subscribed users
        for user_id, subscribed_restaurants in self.active_subscriptions.items():
            user_updates = []
            
            for restaurant_id in subscribed_restaurants:
                if restaurant_id in restaurant_metrics:
                    user_updates.extend(restaurant_metrics[restaurant_id])
            
            if user_updates:
                update_message = {
                    "type": "realtime_metrics",
                    "updates": [metric.to_dict() for metric in user_updates],
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                # This would be sent via WebSocket manager
                # await websocket_manager.send_to_user(update_message, user_id)
                logger.debug(f"Broadcasting {len(user_updates)} metrics to user {user_id}")
    
    async def _generate_periodic_metrics(self):
        """Generate periodic metrics from database"""
        while self.is_running:
            try:
                async for db in get_db():
                    await self._generate_restaurant_metrics(db)
                    break
                
                # Wait 30 seconds before next generation
                await asyncio.sleep(30)
                
            except Exception as e:
                logger.error(f"Error in periodic metrics generation: {e}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def _generate_restaurant_metrics(self, db: AsyncSession):
        """Generate real-time metrics for all restaurants"""
        try:
            # Get all active restaurants
            result = await db.execute(
                select(Restaurant).where(Restaurant.is_active == True)
            )
            restaurants = result.scalars().all()
            
            for restaurant in restaurants:
                # Generate various real-time metrics
                await self._generate_revenue_metrics(db, restaurant.id)
                await self._generate_customer_metrics(db, restaurant.id)
                await self._generate_menu_metrics(db, restaurant.id)
                
        except Exception as e:
            logger.error(f"Error generating restaurant metrics: {e}")
    
    async def _generate_revenue_metrics(self, db: AsyncSession, restaurant_id: UUID):
        """Generate real-time revenue metrics"""
        try:
            # Current day revenue (simulated)
            current_revenue = await self._calculate_current_revenue(db, restaurant_id)
            
            metric = RealtimeMetric(
                metric_type="current_revenue",
                value=current_revenue,
                restaurant_id=str(restaurant_id),
                metadata={"period": "today"}
            )
            
            await self.emit_metric(metric)
            
        except Exception as e:
            logger.error(f"Error generating revenue metrics for {restaurant_id}: {e}")
    
    async def _generate_customer_metrics(self, db: AsyncSession, restaurant_id: UUID):
        """Generate real-time customer metrics"""
        try:
            # Active customers count (simulated)
            active_customers = await self._calculate_active_customers(db, restaurant_id)
            
            metric = RealtimeMetric(
                metric_type="active_customers",
                value=active_customers,
                restaurant_id=str(restaurant_id),
                metadata={"period": "current_hour"}
            )
            
            await self.emit_metric(metric)
            
        except Exception as e:
            logger.error(f"Error generating customer metrics for {restaurant_id}: {e}")
    
    async def _generate_menu_metrics(self, db: AsyncSession, restaurant_id: UUID):
        """Generate real-time menu performance metrics"""
        try:
            # Top performing items (simulated)
            top_items = await self._calculate_top_menu_items(db, restaurant_id)
            
            metric = RealtimeMetric(
                metric_type="top_menu_items",
                value=top_items,
                restaurant_id=str(restaurant_id),
                metadata={"period": "today", "limit": 5}
            )
            
            await self.emit_metric(metric)
            
        except Exception as e:
            logger.error(f"Error generating menu metrics for {restaurant_id}: {e}")
    
    async def _calculate_current_revenue(self, db: AsyncSession, restaurant_id: UUID) -> float:
        """Calculate current day revenue (simulated)"""
        # In a real implementation, this would query actual transaction data
        import random
        base_revenue = 1000 + random.uniform(-200, 500)
        return round(base_revenue, 2)
    
    async def _calculate_active_customers(self, db: AsyncSession, restaurant_id: UUID) -> int:
        """Calculate active customers (simulated)"""
        # In a real implementation, this would query actual customer data
        import random
        return random.randint(15, 85)
    
    async def _calculate_top_menu_items(self, db: AsyncSession, restaurant_id: UUID) -> List[Dict]:
        """Calculate top performing menu items (simulated)"""
        # In a real implementation, this would query actual sales data
        mock_items = [
            {"name": "Signature Burger", "orders": 45, "revenue": 675.00},
            {"name": "Caesar Salad", "orders": 32, "revenue": 384.00},
            {"name": "Craft Pizza", "orders": 28, "revenue": 532.00},
            {"name": "Fish Tacos", "orders": 24, "revenue": 360.00},
            {"name": "Pasta Primavera", "orders": 19, "revenue": 285.00}
        ]
        return mock_items

# Global analytics engine instance
analytics_engine = RealtimeAnalyticsEngine()
