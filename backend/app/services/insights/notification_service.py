"""
BiteBase Intelligence Notification Service
Handles notifications and alerts for insights
"""

import asyncio
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload

from app.models.insights import Insight, InsightNotification, InsightSeverity
from app.core.config import settings

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service for managing insight notifications and alerts
    Supports multiple notification channels and delivery methods
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        
        # Notification configurations
        self.config = {
            'max_notifications_per_hour': 10,
            'notification_cooldown_minutes': 30,
            'batch_notification_size': 5,
            'retry_attempts': 3,
            'retry_delay_seconds': 60
        }
        
        # Notification channels
        self.channels = {
            'email': self._send_email_notification,
            'push': self._send_push_notification,
            'webhook': self._send_webhook_notification,
            'websocket': self._send_websocket_notification
        }
        
        # Severity-based notification rules
        self.notification_rules = {
            InsightSeverity.CRITICAL: {
                'channels': ['email', 'push', 'websocket'],
                'immediate': True,
                'max_delay_minutes': 0
            },
            InsightSeverity.HIGH: {
                'channels': ['email', 'websocket'],
                'immediate': True,
                'max_delay_minutes': 5
            },
            InsightSeverity.MEDIUM: {
                'channels': ['websocket'],
                'immediate': False,
                'max_delay_minutes': 30
            },
            InsightSeverity.LOW: {
                'channels': ['websocket'],
                'immediate': False,
                'max_delay_minutes': 60
            }
        }
        
        # Performance tracking
        self.notification_stats = {
            'notifications_sent': 0,
            'notifications_failed': 0,
            'avg_delivery_time': 0.0
        }
    
    async def send_insight_notification(self, insight: Insight, recipients: Optional[List[str]] = None) -> bool:
        """
        Send notifications for a new insight based on severity and rules
        """
        try:
            # Get notification rules for this severity
            rules = self.notification_rules.get(insight.severity, self.notification_rules[InsightSeverity.MEDIUM])
            
            # Check if we should send notifications (rate limiting)
            if not await self._should_send_notification(insight):
                logger.info(f"Skipping notification for insight {insight.id} due to rate limiting")
                return False
            
            # Get recipients (default to restaurant owners/managers)
            if not recipients:
                recipients = await self._get_default_recipients(insight.restaurant_id)
            
            if not recipients:
                logger.warning(f"No recipients found for insight {insight.id}")
                return False
            
            # Send notifications through configured channels
            success_count = 0
            total_channels = len(rules['channels'])
            
            for channel in rules['channels']:
                if channel in self.channels:
                    try:
                        # Send to all recipients for this channel
                        for recipient in recipients:
                            success = await self._send_notification(
                                insight, recipient, channel, rules['immediate']
                            )
                            if success:
                                success_count += 1
                    except Exception as e:
                        logger.error(f"Error sending {channel} notification for insight {insight.id}: {str(e)}")
                        continue
            
            # Update statistics
            self.notification_stats['notifications_sent'] += success_count
            
            return success_count > 0
            
        except Exception as e:
            logger.error(f"Error sending insight notification: {str(e)}")
            self.notification_stats['notifications_failed'] += 1
            return False
    
    async def _should_send_notification(self, insight: Insight) -> bool:
        """Check if we should send notification based on rate limiting and cooldown"""
        try:
            # Check hourly rate limit
            one_hour_ago = datetime.utcnow() - timedelta(hours=1)
            
            recent_notifications_query = select(InsightNotification).where(
                and_(
                    InsightNotification.created_at >= one_hour_ago,
                    InsightNotification.status.in_(['sent', 'delivered'])
                )
            )
            
            result = await self.db.execute(recent_notifications_query)
            recent_count = len(result.scalars().all())
            
            if recent_count >= self.config['max_notifications_per_hour']:
                # Allow critical notifications to bypass rate limit
                if insight.severity != InsightSeverity.CRITICAL:
                    return False
            
            # Check cooldown for similar insights
            cooldown_time = datetime.utcnow() - timedelta(minutes=self.config['notification_cooldown_minutes'])
            
            similar_notifications_query = select(InsightNotification).join(Insight).where(
                and_(
                    Insight.insight_type == insight.insight_type,
                    Insight.restaurant_id == insight.restaurant_id,
                    InsightNotification.created_at >= cooldown_time,
                    InsightNotification.status.in_(['sent', 'delivered'])
                )
            )
            
            result = await self.db.execute(similar_notifications_query)
            similar_notifications = result.scalars().all()
            
            # Allow if no similar notifications recently, or if this is critical
            return len(similar_notifications) == 0 or insight.severity == InsightSeverity.CRITICAL
            
        except Exception as e:
            logger.error(f"Error checking notification rate limits: {str(e)}")
            return True  # Default to allowing notifications
    
    async def _get_default_recipients(self, restaurant_id: Optional[str]) -> List[str]:
        """Get default notification recipients for a restaurant"""
        try:
            # In a real implementation, this would query user roles and preferences
            # For now, return a mock list of recipients
            
            if restaurant_id:
                # Restaurant-specific recipients (owners, managers)
                return [
                    f"owner-{restaurant_id}@example.com",
                    f"manager-{restaurant_id}@example.com"
                ]
            else:
                # System-wide recipients for general insights
                return [
                    "admin@bitebase.app",
                    "insights@bitebase.app"
                ]
                
        except Exception as e:
            logger.error(f"Error getting default recipients: {str(e)}")
            return []
    
    async def _send_notification(self, insight: Insight, recipient: str, channel: str, immediate: bool) -> bool:
        """Send notification through specified channel"""
        try:
            # Create notification record
            notification = InsightNotification(
                id=str(uuid.uuid4()),
                insight_id=insight.id,
                recipient_id=recipient,
                notification_type=channel,
                channel=channel,
                subject=self._generate_notification_subject(insight),
                message=self._generate_notification_message(insight),
                status='pending'
            )
            
            self.db.add(notification)
            await self.db.commit()
            await self.db.refresh(notification)
            
            # Send through appropriate channel
            if channel in self.channels:
                success = await self.channels[channel](notification, insight, immediate)
                
                # Update notification status
                notification.status = 'sent' if success else 'failed'
                notification.sent_at = datetime.utcnow() if success else None
                
                if not success:
                    notification.error_message = "Failed to send notification"
                
                await self.db.commit()
                
                return success
            else:
                logger.error(f"Unknown notification channel: {channel}")
                notification.status = 'failed'
                notification.error_message = f"Unknown channel: {channel}"
                await self.db.commit()
                return False
                
        except Exception as e:
            logger.error(f"Error sending notification: {str(e)}")
            return False
    
    def _generate_notification_subject(self, insight: Insight) -> str:
        """Generate notification subject line"""
        severity_prefix = {
            InsightSeverity.CRITICAL: "🚨 CRITICAL",
            InsightSeverity.HIGH: "⚠️ HIGH PRIORITY",
            InsightSeverity.MEDIUM: "📊 INSIGHT",
            InsightSeverity.LOW: "💡 INFO"
        }.get(insight.severity, "📊 INSIGHT")
        
        return f"{severity_prefix}: {insight.title}"
    
    def _generate_notification_message(self, insight: Insight) -> str:
        """Generate notification message content"""
        message = f"""
New Business Insight Detected

Title: {insight.title}
Severity: {insight.severity.value.title()}
Confidence: {insight.confidence_score:.1%}
Impact: {insight.impact_score:.1%}

Description:
{insight.description}

Explanation:
{insight.explanation}

Recommendations:
"""
        
        if insight.recommendations:
            for i, rec in enumerate(insight.recommendations, 1):
                message += f"{i}. {rec}\n"
        else:
            message += "No specific recommendations available.\n"
        
        message += f"\nDetected at: {insight.detected_at.strftime('%Y-%m-%d %H:%M:%S UTC')}"
        
        if insight.restaurant_id:
            message += f"\nRestaurant ID: {insight.restaurant_id}"
        
        return message
    
    async def _send_email_notification(self, notification: InsightNotification, insight: Insight, immediate: bool) -> bool:
        """Send email notification"""
        try:
            # In a real implementation, this would use an email service like SendGrid, SES, etc.
            logger.info(f"Sending email notification to {notification.recipient_id}")
            logger.info(f"Subject: {notification.subject}")
            logger.info(f"Message: {notification.message[:200]}...")
            
            # Simulate email sending delay
            if not immediate:
                await asyncio.sleep(0.1)
            
            # Mark as delivered (in real implementation, this would be based on email service response)
            notification.delivered_at = datetime.utcnow()
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending email notification: {str(e)}")
            return False
    
    async def _send_push_notification(self, notification: InsightNotification, insight: Insight, immediate: bool) -> bool:
        """Send push notification"""
        try:
            # In a real implementation, this would use a push notification service
            logger.info(f"Sending push notification to {notification.recipient_id}")
            logger.info(f"Title: {notification.subject}")
            
            # Create push notification payload
            push_payload = {
                'title': notification.subject,
                'body': insight.description,
                'data': {
                    'insight_id': insight.id,
                    'severity': insight.severity.value,
                    'type': insight.insight_type.value
                }
            }
            
            # Simulate push notification sending
            if not immediate:
                await asyncio.sleep(0.05)
            
            notification.delivered_at = datetime.utcnow()
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending push notification: {str(e)}")
            return False
    
    async def _send_webhook_notification(self, notification: InsightNotification, insight: Insight, immediate: bool) -> bool:
        """Send webhook notification"""
        try:
            # In a real implementation, this would make HTTP requests to configured webhooks
            logger.info(f"Sending webhook notification for insight {insight.id}")
            
            # Create webhook payload
            webhook_payload = {
                'event': 'insight_detected',
                'insight': {
                    'id': insight.id,
                    'title': insight.title,
                    'description': insight.description,
                    'type': insight.insight_type.value,
                    'severity': insight.severity.value,
                    'confidence': insight.confidence_score,
                    'impact': insight.impact_score,
                    'detected_at': insight.detected_at.isoformat(),
                    'restaurant_id': insight.restaurant_id
                },
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Simulate webhook sending
            if not immediate:
                await asyncio.sleep(0.1)
            
            notification.delivered_at = datetime.utcnow()
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending webhook notification: {str(e)}")
            return False
    
    async def _send_websocket_notification(self, notification: InsightNotification, insight: Insight, immediate: bool) -> bool:
        """Send WebSocket notification for real-time updates"""
        try:
            # In a real implementation, this would broadcast to connected WebSocket clients
            logger.info(f"Broadcasting WebSocket notification for insight {insight.id}")
            
            # Create WebSocket message
            ws_message = {
                'type': 'insight_notification',
                'data': {
                    'insight_id': insight.id,
                    'title': insight.title,
                    'description': insight.description,
                    'severity': insight.severity.value,
                    'confidence': insight.confidence_score,
                    'impact': insight.impact_score,
                    'restaurant_id': insight.restaurant_id,
                    'detected_at': insight.detected_at.isoformat()
                },
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # This would be handled by the WebSocket manager in a real implementation
            # For now, we'll just log it
            logger.info(f"WebSocket message: {ws_message}")
            
            notification.delivered_at = datetime.utcnow()
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending WebSocket notification: {str(e)}")
            return False
    
    async def send_batch_notifications(self, insights: List[Insight], recipients: Optional[List[str]] = None) -> Dict[str, int]:
        """Send notifications for multiple insights in batch"""
        try:
            results = {'success': 0, 'failed': 0}
            
            # Group insights by severity for efficient processing
            insights_by_severity = {}
            for insight in insights:
                if insight.severity not in insights_by_severity:
                    insights_by_severity[insight.severity] = []
                insights_by_severity[insight.severity].append(insight)
            
            # Process critical and high severity first
            priority_order = [InsightSeverity.CRITICAL, InsightSeverity.HIGH, InsightSeverity.MEDIUM, InsightSeverity.LOW]
            
            for severity in priority_order:
                if severity in insights_by_severity:
                    for insight in insights_by_severity[severity]:
                        success = await self.send_insight_notification(insight, recipients)
                        if success:
                            results['success'] += 1
                        else:
                            results['failed'] += 1
            
            return results
            
        except Exception as e:
            logger.error(f"Error sending batch notifications: {str(e)}")
            return {'success': 0, 'failed': len(insights)}
    
    async def retry_failed_notifications(self) -> int:
        """Retry failed notifications"""
        try:
            # Get failed notifications that haven't exceeded retry limit
            failed_notifications_query = select(InsightNotification).where(
                and_(
                    InsightNotification.status == 'failed',
                    InsightNotification.retry_count < self.config['retry_attempts']
                )
            ).options(selectinload(InsightNotification.insight))
            
            result = await self.db.execute(failed_notifications_query)
            failed_notifications = result.scalars().all()
            
            retry_count = 0
            
            for notification in failed_notifications:
                try:
                    # Wait before retry
                    await asyncio.sleep(self.config['retry_delay_seconds'])
                    
                    # Retry sending
                    success = await self.channels[notification.notification_type](
                        notification, notification.insight, True
                    )
                    
                    # Update notification
                    notification.retry_count += 1
                    
                    if success:
                        notification.status = 'sent'
                        notification.sent_at = datetime.utcnow()
                        notification.error_message = None
                        retry_count += 1
                    else:
                        notification.error_message = f"Retry {notification.retry_count} failed"
                    
                    await self.db.commit()
                    
                except Exception as e:
                    logger.error(f"Error retrying notification {notification.id}: {str(e)}")
                    notification.retry_count += 1
                    notification.error_message = f"Retry error: {str(e)}"
                    await self.db.commit()
            
            return retry_count
            
        except Exception as e:
            logger.error(f"Error retrying failed notifications: {str(e)}")
            return 0
    
    async def get_notification_history(self, recipient_id: Optional[str] = None, limit: int = 50) -> List[InsightNotification]:
        """Get notification history"""
        try:
            query = select(InsightNotification).options(selectinload(InsightNotification.insight))
            
            if recipient_id:
                query = query.where(InsightNotification.recipient_id == recipient_id)
            
            query = query.order_by(InsightNotification.created_at.desc()).limit(limit)
            
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            logger.error(f"Error getting notification history: {str(e)}")
            return []
    
    async def mark_notification_as_read(self, notification_id: str) -> bool:
        """Mark notification as read"""
        try:
            query = select(InsightNotification).where(InsightNotification.id == notification_id)
            result = await self.db.execute(query)
            notification = result.scalar_one_or_none()
            
            if notification:
                notification.read_at = datetime.utcnow()
                await self.db.commit()
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error marking notification as read: {str(e)}")
            return False
    
    async def update_notification_preferences(self, user_id: str, preferences: Dict[str, Any]) -> bool:
        """Update user notification preferences"""
        try:
            # In a real implementation, this would update user preferences in the database
            logger.info(f"Updating notification preferences for user {user_id}: {preferences}")
            
            # This would typically involve:
            # 1. Validating preferences
            # 2. Updating user preferences table
            # 3. Adjusting notification rules accordingly
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating notification preferences: {str(e)}")
            return False
    
    def get_notification_stats(self) -> Dict[str, Any]:
        """Get notification service statistics"""
        return {
            **self.notification_stats,
            'config': self.config,
            'supported_channels': list(self.channels.keys())
        }
    
    async def cleanup_old_notifications(self, days_to_keep: int = 30) -> int:
        """Clean up old notifications"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
            
            # Delete old notifications
            delete_query = select(InsightNotification).where(
                InsightNotification.created_at < cutoff_date
            )
            
            result = await self.db.execute(delete_query)
            old_notifications = result.scalars().all()
            
            for notification in old_notifications:
                await self.db.delete(notification)
            
            await self.db.commit()
            
            return len(old_notifications)
            
        except Exception as e:
            logger.error(f"Error cleaning up old notifications: {str(e)}")
            return 0