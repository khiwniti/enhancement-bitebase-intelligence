"""
Input Validation Utilities
Provides comprehensive validation functions for API endpoints
"""

import re
import uuid
from typing import Any, List, Optional, Dict, Union
from datetime import datetime, date
from pydantic import BaseModel, Field, validator
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)

# Common validation patterns
EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
PHONE_PATTERN = re.compile(r'^\+?1?-?\.?\s?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$')
UUID_PATTERN = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', re.IGNORECASE)

class ValidationError(Exception):
    """Custom validation error"""
    def __init__(self, field: str, message: str, value: Any = None):
        self.field = field
        self.message = message
        self.value = value
        super().__init__(f"Validation error in field '{field}': {message}")

def validate_email(email: str, field_name: str = "email") -> str:
    """Validate email address format"""
    if not email:
        raise ValidationError(field_name, "Email is required")
    
    if not EMAIL_PATTERN.match(email):
        raise ValidationError(field_name, "Invalid email format", email)
    
    if len(email) > 254:
        raise ValidationError(field_name, "Email too long (max 254 characters)", email)
    
    return email.lower().strip()

def validate_phone(phone: str, field_name: str = "phone") -> str:
    """Validate phone number format"""
    if not phone:
        raise ValidationError(field_name, "Phone number is required")
    
    # Remove all non-digit characters for validation
    digits_only = re.sub(r'\D', '', phone)
    
    if len(digits_only) < 10 or len(digits_only) > 15:
        raise ValidationError(field_name, "Phone number must be 10-15 digits", phone)
    
    return phone.strip()

def validate_uuid(value: Union[str, uuid.UUID], field_name: str = "id") -> uuid.UUID:
    """Validate UUID format"""
    if isinstance(value, uuid.UUID):
        return value
    
    if not value:
        raise ValidationError(field_name, "UUID is required")
    
    try:
        return uuid.UUID(str(value))
    except ValueError:
        raise ValidationError(field_name, "Invalid UUID format", value)

def validate_coordinates(latitude: float, longitude: float) -> tuple[float, float]:
    """Validate geographic coordinates"""
    if not isinstance(latitude, (int, float)):
        raise ValidationError("latitude", "Latitude must be a number", latitude)
    
    if not isinstance(longitude, (int, float)):
        raise ValidationError("longitude", "Longitude must be a number", longitude)
    
    if not -90 <= latitude <= 90:
        raise ValidationError("latitude", "Latitude must be between -90 and 90", latitude)
    
    if not -180 <= longitude <= 180:
        raise ValidationError("longitude", "Longitude must be between -180 and 180", longitude)
    
    return float(latitude), float(longitude)

def validate_date_range(start_date: Optional[date], end_date: Optional[date]) -> tuple[Optional[date], Optional[date]]:
    """Validate date range"""
    if start_date and end_date:
        if start_date > end_date:
            raise ValidationError("date_range", "Start date must be before end date")
        
        # Check if date range is reasonable (not more than 5 years)
        if (end_date - start_date).days > 1825:
            raise ValidationError("date_range", "Date range cannot exceed 5 years")
    
    return start_date, end_date

def validate_pagination(page: int = 1, page_size: int = 20) -> tuple[int, int]:
    """Validate pagination parameters"""
    if page < 1:
        raise ValidationError("page", "Page must be greater than 0", page)
    
    if page_size < 1:
        raise ValidationError("page_size", "Page size must be greater than 0", page_size)
    
    if page_size > 100:
        raise ValidationError("page_size", "Page size cannot exceed 100", page_size)
    
    return page, page_size

def validate_string_length(value: str, field_name: str, min_length: int = 0, max_length: int = 255) -> str:
    """Validate string length"""
    if not isinstance(value, str):
        raise ValidationError(field_name, "Value must be a string", value)
    
    value = value.strip()
    
    if len(value) < min_length:
        raise ValidationError(field_name, f"Minimum length is {min_length} characters", value)
    
    if len(value) > max_length:
        raise ValidationError(field_name, f"Maximum length is {max_length} characters", value)
    
    return value

def validate_numeric_range(value: Union[int, float], field_name: str, min_value: Optional[float] = None, max_value: Optional[float] = None) -> Union[int, float]:
    """Validate numeric value within range"""
    if not isinstance(value, (int, float)):
        raise ValidationError(field_name, "Value must be a number", value)
    
    if min_value is not None and value < min_value:
        raise ValidationError(field_name, f"Value must be at least {min_value}", value)
    
    if max_value is not None and value > max_value:
        raise ValidationError(field_name, f"Value must be at most {max_value}", value)
    
    return value

def validate_enum_value(value: str, field_name: str, allowed_values: List[str]) -> str:
    """Validate enum value"""
    if not isinstance(value, str):
        raise ValidationError(field_name, "Value must be a string", value)
    
    if value not in allowed_values:
        raise ValidationError(field_name, f"Value must be one of: {', '.join(allowed_values)}", value)
    
    return value

def validate_list_items(items: List[Any], field_name: str, min_items: int = 0, max_items: int = 100, item_validator: Optional[callable] = None) -> List[Any]:
    """Validate list items"""
    if not isinstance(items, list):
        raise ValidationError(field_name, "Value must be a list", items)
    
    if len(items) < min_items:
        raise ValidationError(field_name, f"Minimum {min_items} items required", items)
    
    if len(items) > max_items:
        raise ValidationError(field_name, f"Maximum {max_items} items allowed", items)
    
    if item_validator:
        validated_items = []
        for i, item in enumerate(items):
            try:
                validated_items.append(item_validator(item))
            except ValidationError as e:
                raise ValidationError(f"{field_name}[{i}]", e.message, item)
        return validated_items
    
    return items

def validate_json_data(data: Dict[str, Any], required_fields: List[str] = None, optional_fields: List[str] = None) -> Dict[str, Any]:
    """Validate JSON data structure"""
    if not isinstance(data, dict):
        raise ValidationError("data", "Data must be a JSON object", data)
    
    if required_fields:
        for field in required_fields:
            if field not in data:
                raise ValidationError(field, f"Required field '{field}' is missing")
    
    if optional_fields:
        allowed_fields = set(required_fields or []) | set(optional_fields)
        extra_fields = set(data.keys()) - allowed_fields
        if extra_fields:
            raise ValidationError("data", f"Unexpected fields: {', '.join(extra_fields)}")
    
    return data

# Common validation schemas
class PaginationParams(BaseModel):
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")

class DateRangeParams(BaseModel):
    start_date: Optional[date] = Field(None, description="Start date")
    end_date: Optional[date] = Field(None, description="End date")
    
    @validator('end_date')
    def validate_date_range(cls, v, values):
        if v and 'start_date' in values and values['start_date']:
            if v < values['start_date']:
                raise ValueError('End date must be after start date')
        return v

class CoordinatesParams(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude")

class SearchParams(BaseModel):
    query: Optional[str] = Field(None, max_length=255, description="Search query")
    filters: Optional[Dict[str, Any]] = Field(None, description="Search filters")
    sort_by: Optional[str] = Field(None, description="Sort field")
    sort_order: Optional[str] = Field("asc", pattern="^(asc|desc)$", description="Sort order")

# Validation decorators
def validate_request_data(validator_func: callable):
    """Decorator to validate request data"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            try:
                # Apply validation
                if 'request' in kwargs:
                    kwargs['request'] = validator_func(kwargs['request'])
                return await func(*args, **kwargs)
            except ValidationError as e:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail={
                        "field": e.field,
                        "message": e.message,
                        "value": e.value
                    }
                )
        return wrapper
    return decorator

def safe_validate(validator_func: callable, value: Any, default: Any = None) -> Any:
    """Safely validate a value, returning default on error"""
    try:
        return validator_func(value)
    except ValidationError as e:
        logger.warning(f"Validation failed for value {value}: {e.message}")
        return default
    except Exception as e:
        logger.error(f"Unexpected error during validation: {str(e)}")
        return default
