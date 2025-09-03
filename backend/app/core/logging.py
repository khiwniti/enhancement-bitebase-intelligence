"""
Logging configuration for BiteBase Intelligence API
Provides structured logging with correlation IDs and performance metrics
"""

import logging
import sys
import json
import time
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from contextvars import ContextVar
from logging.handlers import RotatingFileHandler

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Context variable for request correlation ID
correlation_id: ContextVar[str] = ContextVar('correlation_id', default='')

class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured JSON logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as structured JSON"""
        
        log_data = {
            'timestamp': datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
            'correlation_id': correlation_id.get(),
            'service': 'bitebase-intelligence-api'
        }
        
        # Add exception information if present
        if record.exc_info:
            log_data['exception'] = {
                'type': record.exc_info[0].__name__,
                'message': str(record.exc_info[1]),
                'traceback': self.formatException(record.exc_info)
            }
        
        # Add extra fields from log record
        extra_fields = {
            k: v for k, v in record.__dict__.items()
            if k not in ('name', 'msg', 'args', 'levelname', 'levelno', 'pathname',
                        'filename', 'module', 'exc_info', 'exc_text', 'stack_info',
                        'lineno', 'funcName', 'created', 'msecs', 'relativeCreated',
                        'thread', 'threadName', 'processName', 'process', 'getMessage')
        }
        
        if extra_fields:
            log_data['extra'] = extra_fields
        
        return json.dumps(log_data, ensure_ascii=False)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and responses"""
    
    async def dispatch(self, request: Request, call_next):
        """Process request and log details"""
        
        # Generate correlation ID for this request
        request_id = str(uuid.uuid4())
        correlation_id.set(request_id)
        
        # Add correlation ID to request headers for downstream services
        request.headers.__dict__['_list'].append((b'x-correlation-id', request_id.encode()))
        
        # Log request start
        start_time = time.time()
        client_ip = request.client.host if request.client else 'unknown'
        user_agent = request.headers.get('user-agent', 'unknown')
        
        logger = logging.getLogger('bitebase.api.requests')
        logger.info(
            "Request started",
            extra={
                'method': request.method,
                'url': str(request.url),
                'client_ip': client_ip,
                'user_agent': user_agent,
                'request_id': request_id
            }
        )
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate request duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Log request completion
            logger.info(
                "Request completed",
                extra={
                    'method': request.method,
                    'url': str(request.url),
                    'status_code': response.status_code,
                    'duration_ms': round(duration_ms, 2),
                    'request_id': request_id
                }
            )
            
            # Add correlation ID to response headers
            response.headers['x-correlation-id'] = request_id
            
            return response
            
        except Exception as e:
            # Calculate request duration for failed requests
            duration_ms = (time.time() - start_time) * 1000
            
            # Log request failure
            logger.error(
                "Request failed",
                extra={
                    'method': request.method,
                    'url': str(request.url),
                    'duration_ms': round(duration_ms, 2),
                    'error': str(e),
                    'request_id': request_id
                },
                exc_info=True
            )
            
            raise

def setup_logging(
    log_level: str = "INFO",
    log_file: Optional[str] = None,
    max_file_size: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 5,
    enable_structured_logging: bool = True
) -> None:
    """
    Setup application logging configuration
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional log file path
        max_file_size: Maximum log file size before rotation
        backup_count: Number of backup files to keep
        enable_structured_logging: Whether to use structured JSON logging
    """
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Choose formatter
    if enable_structured_logging:
        formatter = StructuredFormatter()
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # File handler (if specified)
    if log_file:
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=max_file_size,
            backupCount=backup_count,
            encoding='utf-8'
        )
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
    
    # Configure specific loggers
    configure_logger_levels()

def configure_logger_levels():
    """Configure specific logger levels"""
    
    # Application loggers
    logging.getLogger('bitebase').setLevel(logging.INFO)
    logging.getLogger('bitebase.api').setLevel(logging.INFO)
    logging.getLogger('bitebase.api.requests').setLevel(logging.INFO)
    logging.getLogger('bitebase.services').setLevel(logging.INFO)
    logging.getLogger('bitebase.database').setLevel(logging.WARNING)
    
    # Third-party loggers
    logging.getLogger('uvicorn').setLevel(logging.INFO)
    logging.getLogger('uvicorn.access').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy').setLevel(logging.WARNING)
    logging.getLogger('fastapi').setLevel(logging.INFO)

def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with the specified name
    
    Args:
        name: Logger name (e.g., 'bitebase.api.auth')
        
    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)

def log_performance(operation: str, duration_ms: float, **kwargs):
    """
    Log performance metrics for operations
    
    Args:
        operation: Operation name
        duration_ms: Duration in milliseconds
        **kwargs: Additional context data
    """
    logger = get_logger('bitebase.performance')
    logger.info(
        f"Performance: {operation}",
        extra={
            'operation': operation,
            'duration_ms': round(duration_ms, 2),
            'correlation_id': correlation_id.get(),
            **kwargs
        }
    )

def log_security_event(event_type: str, severity: str, details: Dict[str, Any], user_id: Optional[str] = None):
    """
    Log security-related events
    
    Args:
        event_type: Type of security event
        severity: Event severity (low, medium, high, critical)
        details: Event details
        user_id: Optional user ID associated with event
    """
    logger = get_logger('bitebase.security')
    
    log_data = {
        'event_type': event_type,
        'severity': severity,
        'details': details,
        'correlation_id': correlation_id.get()
    }
    
    if user_id:
        log_data['user_id'] = user_id
    
    if severity == 'critical':
        logger.critical(f"Security event: {event_type}", extra=log_data)
    elif severity == 'high':
        logger.error(f"Security event: {event_type}", extra=log_data)
    elif severity == 'medium':
        logger.warning(f"Security event: {event_type}", extra=log_data)
    else:
        logger.info(f"Security event: {event_type}", extra=log_data)

def log_business_event(event_type: str, entity_type: str, entity_id: str, details: Dict[str, Any], user_id: Optional[str] = None):
    """
    Log business-related events for analytics
    
    Args:
        event_type: Type of business event (created, updated, deleted, etc.)
        entity_type: Type of entity (user, restaurant, subscription, etc.)
        entity_id: Entity identifier
        details: Event details
        user_id: Optional user ID who performed the action
    """
    logger = get_logger('bitebase.business')
    
    log_data = {
        'event_type': event_type,
        'entity_type': entity_type,
        'entity_id': entity_id,
        'details': details,
        'correlation_id': correlation_id.get()
    }
    
    if user_id:
        log_data['user_id'] = user_id
    
    logger.info(f"Business event: {entity_type} {event_type}", extra=log_data)