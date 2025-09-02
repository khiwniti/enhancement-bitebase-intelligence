"""
Comprehensive Error Handling Middleware
Provides centralized error handling, validation, and response formatting
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import ValidationError
import logging
import traceback
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import json

logger = logging.getLogger(__name__)

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware for centralized error handling"""
    
    async def dispatch(self, request: Request, call_next):
        """Process request and handle any errors"""
        error_id = str(uuid.uuid4())
        
        try:
            response = await call_next(request)
            return response
            
        except HTTPException as e:
            return await self.handle_http_exception(request, e, error_id)
            
        except RequestValidationError as e:
            return await self.handle_validation_error(request, e, error_id)
            
        except ValidationError as e:
            return await self.handle_pydantic_validation_error(request, e, error_id)
            
        except Exception as e:
            return await self.handle_general_exception(request, e, error_id)
    
    async def handle_http_exception(self, request: Request, exc: HTTPException, error_id: str) -> JSONResponse:
        """Handle HTTP exceptions"""
        error_response = {
            "success": False,
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "type": "http_error",
                "error_id": error_id,
                "timestamp": datetime.utcnow().isoformat(),
                "path": str(request.url.path)
            }
        }
        
        # Log error details
        logger.warning(f"HTTP Exception {exc.status_code}: {exc.detail} - Error ID: {error_id}")
        
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response
        )
    
    async def handle_validation_error(self, request: Request, exc: RequestValidationError, error_id: str) -> JSONResponse:
        """Handle request validation errors"""
        validation_errors = []
        
        for error in exc.errors():
            validation_errors.append({
                "field": ".".join(str(x) for x in error["loc"]),
                "message": error["msg"],
                "type": error["type"],
                "input": error.get("input")
            })
        
        error_response = {
            "success": False,
            "error": {
                "code": status.HTTP_422_UNPROCESSABLE_ENTITY,
                "message": "Validation error",
                "type": "validation_error",
                "error_id": error_id,
                "timestamp": datetime.utcnow().isoformat(),
                "path": str(request.url.path),
                "details": validation_errors
            }
        }
        
        logger.warning(f"Validation Error: {validation_errors} - Error ID: {error_id}")
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=error_response
        )
    
    async def handle_pydantic_validation_error(self, request: Request, exc: ValidationError, error_id: str) -> JSONResponse:
        """Handle Pydantic validation errors"""
        validation_errors = []
        
        for error in exc.errors():
            validation_errors.append({
                "field": ".".join(str(x) for x in error["loc"]),
                "message": error["msg"],
                "type": error["type"]
            })
        
        error_response = {
            "success": False,
            "error": {
                "code": status.HTTP_422_UNPROCESSABLE_ENTITY,
                "message": "Data validation error",
                "type": "pydantic_validation_error",
                "error_id": error_id,
                "timestamp": datetime.utcnow().isoformat(),
                "path": str(request.url.path),
                "details": validation_errors
            }
        }
        
        logger.warning(f"Pydantic Validation Error: {validation_errors} - Error ID: {error_id}")
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=error_response
        )
    
    async def handle_general_exception(self, request: Request, exc: Exception, error_id: str) -> JSONResponse:
        """Handle general exceptions"""
        error_message = "Internal server error"
        
        # Log full error details
        logger.error(f"Unhandled Exception - Error ID: {error_id}")
        logger.error(f"Exception Type: {type(exc).__name__}")
        logger.error(f"Exception Message: {str(exc)}")
        logger.error(f"Request Path: {request.url.path}")
        logger.error(f"Request Method: {request.method}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        error_response = {
            "success": False,
            "error": {
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message": error_message,
                "type": "internal_error",
                "error_id": error_id,
                "timestamp": datetime.utcnow().isoformat(),
                "path": str(request.url.path)
            }
        }
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_response
        )

# Utility functions for consistent error responses
def create_error_response(
    message: str,
    status_code: int = status.HTTP_400_BAD_REQUEST,
    error_type: str = "client_error",
    details: Optional[Dict[str, Any]] = None
) -> HTTPException:
    """Create a standardized error response"""
    error_data = {
        "code": status_code,
        "message": message,
        "type": error_type,
        "error_id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if details:
        error_data["details"] = details
    
    raise HTTPException(status_code=status_code, detail=error_data)

def create_validation_error(
    field: str,
    message: str,
    value: Any = None
) -> HTTPException:
    """Create a validation error response"""
    details = {
        "field": field,
        "message": message,
        "type": "validation_error"
    }
    
    if value is not None:
        details["input"] = value
    
    return create_error_response(
        message=f"Validation error in field '{field}': {message}",
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        error_type="validation_error",
        details=details
    )

def create_not_found_error(resource: str, identifier: str = None) -> HTTPException:
    """Create a not found error response"""
    message = f"{resource} not found"
    if identifier:
        message += f" with identifier: {identifier}"
    
    return create_error_response(
        message=message,
        status_code=status.HTTP_404_NOT_FOUND,
        error_type="not_found_error",
        details={"resource": resource, "identifier": identifier}
    )

def create_permission_error(action: str, resource: str = None) -> HTTPException:
    """Create a permission denied error response"""
    message = f"Permission denied for action: {action}"
    if resource:
        message += f" on resource: {resource}"
    
    return create_error_response(
        message=message,
        status_code=status.HTTP_403_FORBIDDEN,
        error_type="permission_error",
        details={"action": action, "resource": resource}
    )

def create_rate_limit_error(limit: int, window: str) -> HTTPException:
    """Create a rate limit error response"""
    return create_error_response(
        message=f"Rate limit exceeded: {limit} requests per {window}",
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        error_type="rate_limit_error",
        details={"limit": limit, "window": window}
    )

# Success response utilities
def create_success_response(
    data: Any = None,
    message: str = "Operation completed successfully",
    meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Create a standardized success response"""
    response = {
        "success": True,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if data is not None:
        response["data"] = data
    
    if meta:
        response["meta"] = meta
    
    return response

def create_paginated_response(
    data: list,
    total: int,
    page: int = 1,
    page_size: int = 20,
    message: str = "Data retrieved successfully"
) -> Dict[str, Any]:
    """Create a paginated response"""
    total_pages = (total + page_size - 1) // page_size
    
    return create_success_response(
        data=data,
        message=message,
        meta={
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        }
    )
