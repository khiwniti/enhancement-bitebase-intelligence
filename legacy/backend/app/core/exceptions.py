"""
Custom exception classes for BiteBase Intelligence API
Provides structured error handling and consistent error responses
"""

from typing import Optional, Dict, Any
from fastapi import HTTPException, status

class BiteBaseException(Exception):
    """Base exception class for BiteBase Intelligence"""
    
    def __init__(
        self, 
        message: str, 
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(message)

class ValidationError(BiteBaseException):
    """Raised when input validation fails"""
    
    def __init__(self, message: str, field: Optional[str] = None, value: Optional[Any] = None):
        details = {}
        if field:
            details['field'] = field
        if value is not None:
            details['value'] = str(value)
        
        super().__init__(
            message=message,
            error_code='VALIDATION_ERROR',
            details=details
        )

class AuthenticationError(BiteBaseException):
    """Raised when authentication fails"""
    
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            error_code='AUTHENTICATION_ERROR'
        )

class AuthorizationError(BiteBaseException):
    """Raised when authorization fails"""
    
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(
            message=message,
            error_code='AUTHORIZATION_ERROR'
        )

class ResourceNotFoundError(BiteBaseException):
    """Raised when a requested resource is not found"""
    
    def __init__(self, resource_type: str, resource_id: Optional[str] = None):
        message = f"{resource_type} not found"
        if resource_id:
            message += f": {resource_id}"
        
        super().__init__(
            message=message,
            error_code='RESOURCE_NOT_FOUND',
            details={'resource_type': resource_type, 'resource_id': resource_id}
        )

class BusinessLogicError(BiteBaseException):
    """Raised when business logic constraints are violated"""
    
    def __init__(self, message: str, constraint: Optional[str] = None):
        details = {}
        if constraint:
            details['constraint'] = constraint
            
        super().__init__(
            message=message,
            error_code='BUSINESS_LOGIC_ERROR',
            details=details
        )

class ExternalServiceError(BiteBaseException):
    """Raised when external service calls fail"""
    
    def __init__(self, service_name: str, message: str, status_code: Optional[int] = None):
        super().__init__(
            message=f"{service_name}: {message}",
            error_code='EXTERNAL_SERVICE_ERROR',
            details={
                'service': service_name,
                'status_code': status_code
            }
        )

class RateLimitError(BiteBaseException):
    """Raised when rate limits are exceeded"""
    
    def __init__(self, limit: int, window: str, reset_time: Optional[str] = None):
        message = f"Rate limit exceeded: {limit} requests per {window}"
        details = {
            'limit': limit,
            'window': window
        }
        if reset_time:
            details['reset_time'] = reset_time
            
        super().__init__(
            message=message,
            error_code='RATE_LIMIT_EXCEEDED',
            details=details
        )

class DataIntegrityError(BiteBaseException):
    """Raised when data integrity constraints are violated"""
    
    def __init__(self, message: str, constraint: Optional[str] = None):
        details = {}
        if constraint:
            details['constraint'] = constraint
            
        super().__init__(
            message=message,
            error_code='DATA_INTEGRITY_ERROR',
            details=details
        )

class ConfigurationError(BiteBaseException):
    """Raised when system configuration is invalid"""
    
    def __init__(self, message: str, config_key: Optional[str] = None):
        details = {}
        if config_key:
            details['config_key'] = config_key
            
        super().__init__(
            message=message,
            error_code='CONFIGURATION_ERROR',
            details=details
        )

# HTTP Exception factories for common use cases
def create_http_exception(
    exception: BiteBaseException,
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
) -> HTTPException:
    """Convert BiteBase exception to HTTP exception"""
    
    detail = {
        'success': False,
        'error': {
            'code': exception.error_code or 'INTERNAL_ERROR',
            'message': exception.message,
            'details': exception.details
        }
    }
    
    return HTTPException(status_code=status_code, detail=detail)

def create_validation_exception(message: str, field: Optional[str] = None) -> HTTPException:
    """Create HTTP exception for validation errors"""
    exception = ValidationError(message, field)
    return create_http_exception(exception, status.HTTP_422_UNPROCESSABLE_ENTITY)

def create_not_found_exception(resource_type: str, resource_id: Optional[str] = None) -> HTTPException:
    """Create HTTP exception for resource not found"""
    exception = ResourceNotFoundError(resource_type, resource_id)
    return create_http_exception(exception, status.HTTP_404_NOT_FOUND)

def create_unauthorized_exception(message: str = "Authentication required") -> HTTPException:
    """Create HTTP exception for authentication errors"""
    exception = AuthenticationError(message)
    return create_http_exception(exception, status.HTTP_401_UNAUTHORIZED)

def create_forbidden_exception(message: str = "Insufficient permissions") -> HTTPException:
    """Create HTTP exception for authorization errors"""
    exception = AuthorizationError(message)
    return create_http_exception(exception, status.HTTP_403_FORBIDDEN)

def create_rate_limit_exception(limit: int, window: str, reset_time: Optional[str] = None) -> HTTPException:
    """Create HTTP exception for rate limit errors"""
    exception = RateLimitError(limit, window, reset_time)
    return create_http_exception(exception, status.HTTP_429_TOO_MANY_REQUESTS)

def create_service_unavailable_exception(service_name: str, message: str = "Service temporarily unavailable") -> HTTPException:
    """Create HTTP exception for service unavailability"""
    exception = ExternalServiceError(service_name, message)
    return create_http_exception(exception, status.HTTP_503_SERVICE_UNAVAILABLE)