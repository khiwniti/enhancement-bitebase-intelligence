"""
BiteBase Intelligence POS Integration Schemas
Pydantic models for POS integration API requests and responses
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

from app.models.pos_integration import POSProvider, POSConnectionStatus, SyncStatus, DataType


# Request schemas
class POSIntegrationCreate(BaseModel):
    """Schema for creating a new POS integration"""
    restaurant_id: str = Field(..., description="Restaurant ID")
    location_id: Optional[str] = Field(None, description="Location ID for multi-location support")
    provider: POSProvider = Field(..., description="POS provider")
    provider_name: str = Field(..., min_length=1, max_length=100, description="Provider display name")
    connection_config: Dict[str, Any] = Field(..., description="Connection configuration")
    enabled_data_types: List[str] = Field(..., description="Enabled data types for sync")
    auto_sync_enabled: bool = Field(True, description="Enable automatic synchronization")
    sync_interval_minutes: int = Field(15, ge=1, le=1440, description="Sync interval in minutes")
    
    @validator('enabled_data_types')
    def validate_data_types(cls, v):
        valid_types = [dt.value for dt in DataType]
        for data_type in v:
            if data_type not in valid_types:
                raise ValueError(f"Invalid data type: {data_type}")
        return v


class POSIntegrationUpdate(BaseModel):
    """Schema for updating a POS integration"""
    provider_name: Optional[str] = Field(None, min_length=1, max_length=100)
    connection_config: Optional[Dict[str, Any]] = None
    enabled_data_types: Optional[List[str]] = None
    auto_sync_enabled: Optional[bool] = None
    sync_interval_minutes: Optional[int] = Field(None, ge=1, le=1440)
    
    @validator('enabled_data_types')
    def validate_data_types(cls, v):
        if v is not None:
            valid_types = [dt.value for dt in DataType]
            for data_type in v:
                if data_type not in valid_types:
                    raise ValueError(f"Invalid data type: {data_type}")
        return v


class POSConnectionTest(BaseModel):
    """Schema for testing POS connection"""
    integration_id: str = Field(..., description="Integration ID to test")


class POSSyncRequest(BaseModel):
    """Schema for requesting data synchronization"""
    integration_id: str = Field(..., description="Integration ID")
    data_types: Optional[List[str]] = Field(None, description="Specific data types to sync")
    sync_type: str = Field("manual", description="Type of sync (manual, scheduled, real_time)")
    
    @validator('data_types')
    def validate_data_types(cls, v):
        if v is not None:
            valid_types = [dt.value for dt in DataType]
            for data_type in v:
                if data_type not in valid_types:
                    raise ValueError(f"Invalid data type: {data_type}")
        return v


class POSDataMappingCreate(BaseModel):
    """Schema for creating data field mappings"""
    integration_id: str = Field(..., description="Integration ID")
    data_type: DataType = Field(..., description="Data type")
    pos_field_name: str = Field(..., min_length=1, max_length=200, description="POS field name")
    bitebase_field_name: str = Field(..., min_length=1, max_length=200, description="BiteBase field name")
    transformation_rules: Optional[Dict[str, Any]] = Field(None, description="Data transformation rules")
    is_required: bool = Field(False, description="Whether field is required")
    default_value: Optional[str] = Field(None, max_length=500, description="Default value")
    validation_rules: Optional[Dict[str, Any]] = Field(None, description="Field validation rules")


class POSLocationCreate(BaseModel):
    """Schema for creating a POS location"""
    restaurant_id: str = Field(..., description="Restaurant ID")
    name: str = Field(..., min_length=1, max_length=200, description="Location name")
    address: Optional[str] = Field(None, description="Location address")
    city: Optional[str] = Field(None, max_length=100, description="City")
    state: Optional[str] = Field(None, max_length=50, description="State")
    zip_code: Optional[str] = Field(None, max_length=20, description="ZIP code")
    country: Optional[str] = Field(None, max_length=50, description="Country")
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Latitude")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Longitude")
    timezone: Optional[str] = Field(None, max_length=50, description="Timezone")
    phone_number: Optional[str] = Field(None, max_length=20, description="Phone number")
    email: Optional[str] = Field(None, max_length=200, description="Email address")


# Response schemas
class POSIntegrationResponse(BaseModel):
    """Schema for POS integration response"""
    id: str
    restaurant_id: str
    location_id: Optional[str]
    provider: POSProvider
    provider_name: str
    provider_version: Optional[str]
    status: POSConnectionStatus
    enabled_data_types: List[str]
    auto_sync_enabled: bool
    sync_interval_minutes: int
    last_connected_at: Optional[datetime]
    last_sync_at: Optional[datetime]
    last_error: Optional[str]
    error_count: int
    total_syncs: int
    successful_syncs: int
    average_sync_duration: Optional[float]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class POSSyncLogResponse(BaseModel):
    """Schema for sync log response"""
    id: str
    integration_id: str
    sync_type: str
    data_types: List[str]
    status: SyncStatus
    started_at: datetime
    completed_at: Optional[datetime]
    duration_seconds: Optional[float]
    records_processed: int
    records_created: int
    records_updated: int
    records_failed: int
    error_message: Optional[str]
    retry_count: int
    
    class Config:
        from_attributes = True


class POSDataMappingResponse(BaseModel):
    """Schema for data mapping response"""
    id: str
    integration_id: str
    data_type: DataType
    pos_field_name: str
    bitebase_field_name: str
    transformation_rules: Optional[Dict[str, Any]]
    is_required: bool
    default_value: Optional[str]
    validation_rules: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class POSLocationResponse(BaseModel):
    """Schema for POS location response"""
    id: str
    restaurant_id: str
    name: str
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    country: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    timezone: Optional[str]
    phone_number: Optional[str]
    email: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class POSConnectionTestResponse(BaseModel):
    """Schema for connection test response"""
    success: bool
    message: str
    response_time_ms: Optional[int] = None
    provider_info: Optional[Dict[str, Any]] = None


class POSHealthResponse(BaseModel):
    """Schema for integration health response"""
    integration_id: str
    status: str
    last_sync: Optional[str]
    success_rate: float
    total_syncs: int
    successful_syncs: int
    error_count: int
    average_sync_duration: Optional[float]
    recent_syncs: List[Dict[str, Any]]
    health_check: Optional[Dict[str, Any]]


class POSProviderInfo(BaseModel):
    """Schema for POS provider information"""
    provider: POSProvider
    name: str
    description: str
    supported_data_types: List[str]
    features: List[str]
    setup_requirements: List[str]
    documentation_url: Optional[str]
    logo_url: Optional[str]


class POSIntegrationStats(BaseModel):
    """Schema for integration statistics"""
    total_integrations: int
    active_integrations: int
    providers_used: List[str]
    total_syncs_today: int
    successful_syncs_today: int
    average_sync_duration: Optional[float]
    data_types_synced: Dict[str, int]
    sync_frequency_distribution: Dict[str, int]


class POSBulkSyncRequest(BaseModel):
    """Schema for bulk synchronization request"""
    integration_ids: List[str] = Field(..., min_items=1, description="List of integration IDs")
    data_types: Optional[List[str]] = Field(None, description="Specific data types to sync")
    sync_type: str = Field("manual", description="Type of sync")
    
    @validator('data_types')
    def validate_data_types(cls, v):
        if v is not None:
            valid_types = [dt.value for dt in DataType]
            for data_type in v:
                if data_type not in valid_types:
                    raise ValueError(f"Invalid data type: {data_type}")
        return v


class POSBulkSyncResponse(BaseModel):
    """Schema for bulk synchronization response"""
    total_requested: int
    sync_jobs_created: List[str]
    failed_integrations: List[Dict[str, str]]
    estimated_completion_time: Optional[str]
