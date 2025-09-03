"""
Data Connector Framework Exceptions
Custom exceptions for connector operations
"""

from typing import Optional, Dict, Any


class ConnectorError(Exception):
    """Base exception for all connector-related errors"""
    
    def __init__(
        self,
        message: str,
        connector_type: Optional[str] = None,
        connector_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        self.connector_type = connector_type
        self.connector_id = connector_id
        self.details = details or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for API responses"""
        return {
            'error_type': self.__class__.__name__,
            'message': self.message,
            'connector_type': self.connector_type,
            'connector_id': self.connector_id,
            'details': self.details
        }


class ConnectionError(ConnectorError):
    """Raised when connection to data source fails"""
    pass


class AuthenticationError(ConnectorError):
    """Raised when authentication to data source fails"""
    pass


class QueryError(ConnectorError):
    """Raised when query execution fails"""
    
    def __init__(
        self,
        message: str,
        query: Optional[str] = None,
        connector_type: Optional[str] = None,
        connector_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, connector_type, connector_id, details)
        self.query = query
    
    def to_dict(self) -> Dict[str, Any]:
        result = super().to_dict()
        result['query'] = self.query
        return result


class SchemaError(ConnectorError):
    """Raised when schema discovery or validation fails"""
    pass


class ConfigurationError(ConnectorError):
    """Raised when connector configuration is invalid"""
    pass


class TimeoutError(ConnectorError):
    """Raised when operations timeout"""
    pass


class RateLimitError(ConnectorError):
    """Raised when rate limits are exceeded"""
    
    def __init__(
        self,
        message: str,
        retry_after: Optional[int] = None,
        connector_type: Optional[str] = None,
        connector_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, connector_type, connector_id, details)
        self.retry_after = retry_after
    
    def to_dict(self) -> Dict[str, Any]:
        result = super().to_dict()
        result['retry_after'] = self.retry_after
        return result


class DataValidationError(ConnectorError):
    """Raised when data validation fails"""
    pass


class PermissionError(ConnectorError):
    """Raised when insufficient permissions for operation"""
    pass