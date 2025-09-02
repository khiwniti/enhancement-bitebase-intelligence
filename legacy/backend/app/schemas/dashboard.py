"""
BiteBase Intelligence Dashboard Schemas
Pydantic models for dashboard API request/response validation
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import uuid


# Grid and Layout Schemas
class GridPosition(BaseModel):
    """Grid position configuration"""
    x: int = Field(..., ge=0, description="X coordinate in grid")
    y: int = Field(..., ge=0, description="Y coordinate in grid")
    w: int = Field(..., ge=1, description="Width in grid units")
    h: int = Field(..., ge=1, description="Height in grid units")


class ResponsiveBreakpoints(BaseModel):
    """Responsive breakpoint configuration"""
    sm: int = Field(640, ge=320, description="Small screen breakpoint")
    md: int = Field(768, ge=640, description="Medium screen breakpoint")
    lg: int = Field(1024, ge=768, description="Large screen breakpoint")
    xl: int = Field(1280, ge=1024, description="Extra large screen breakpoint")


class GridLayoutConfig(BaseModel):
    """Grid layout configuration"""
    breakpoints: ResponsiveBreakpoints = Field(default_factory=ResponsiveBreakpoints)
    cols: Dict[str, int] = Field(
        default={"sm": 2, "md": 4, "lg": 6, "xl": 8},
        description="Columns per breakpoint"
    )
    row_height: int = Field(100, ge=50, le=500, description="Row height in pixels")
    margin: List[int] = Field([16, 16], description="Margin [x, y] in pixels")
    container_padding: List[int] = Field([16, 16], description="Container padding [x, y]")
    is_draggable: bool = Field(True, description="Enable dragging")
    is_resizable: bool = Field(True, description="Enable resizing")
    use_css_transforms: bool = Field(True, description="Use CSS transforms")


# Theme Schemas
class DashboardColors(BaseModel):
    """Dashboard color configuration"""
    primary: str = Field(..., description="Primary color")
    secondary: str = Field(..., description="Secondary color")
    background: str = Field(..., description="Background color")
    surface: str = Field(..., description="Surface color")
    text: str = Field(..., description="Text color")
    text_secondary: str = Field(..., description="Secondary text color")
    border: str = Field(..., description="Border color")
    accent: str = Field(..., description="Accent color")


class TypographyFontSize(BaseModel):
    """Typography font size configuration"""
    xs: str = Field("0.75rem", description="Extra small font size")
    sm: str = Field("0.875rem", description="Small font size")
    base: str = Field("1rem", description="Base font size")
    lg: str = Field("1.125rem", description="Large font size")
    xl: str = Field("1.25rem", description="Extra large font size")


class TypographyFontWeight(BaseModel):
    """Typography font weight configuration"""
    normal: int = Field(400, ge=100, le=900, description="Normal font weight")
    medium: int = Field(500, ge=100, le=900, description="Medium font weight")
    semibold: int = Field(600, ge=100, le=900, description="Semibold font weight")
    bold: int = Field(700, ge=100, le=900, description="Bold font weight")


class DashboardTypography(BaseModel):
    """Dashboard typography configuration"""
    font_family: str = Field("var(--font-sans)", description="Font family")
    font_size: TypographyFontSize = Field(default_factory=TypographyFontSize)
    font_weight: TypographyFontWeight = Field(default_factory=TypographyFontWeight)


class DashboardSpacing(BaseModel):
    """Dashboard spacing configuration"""
    xs: int = Field(4, ge=0, description="Extra small spacing")
    sm: int = Field(8, ge=0, description="Small spacing")
    md: int = Field(16, ge=0, description="Medium spacing")
    lg: int = Field(24, ge=0, description="Large spacing")
    xl: int = Field(32, ge=0, description="Extra large spacing")


class DashboardBorderRadius(BaseModel):
    """Dashboard border radius configuration"""
    sm: int = Field(4, ge=0, description="Small border radius")
    md: int = Field(8, ge=0, description="Medium border radius")
    lg: int = Field(12, ge=0, description="Large border radius")


class DashboardTheme(BaseModel):
    """Dashboard theme configuration"""
    name: str = Field(..., min_length=1, max_length=100, description="Theme name")
    colors: DashboardColors = Field(..., description="Color configuration")
    typography: DashboardTypography = Field(default_factory=DashboardTypography)
    spacing: DashboardSpacing = Field(default_factory=DashboardSpacing)
    border_radius: DashboardBorderRadius = Field(default_factory=DashboardBorderRadius)


# Settings Schemas
class AccessibilitySettings(BaseModel):
    """Accessibility settings"""
    enable_keyboard_navigation: bool = Field(True, description="Enable keyboard navigation")
    enable_screen_reader: bool = Field(True, description="Enable screen reader support")
    high_contrast: bool = Field(False, description="Enable high contrast mode")
    reduced_motion: bool = Field(False, description="Reduce motion and animations")


class DashboardSettings(BaseModel):
    """Dashboard settings configuration"""
    auto_save: bool = Field(True, description="Enable auto-save")
    auto_save_interval: int = Field(30000, ge=5000, le=300000, description="Auto-save interval in ms")
    enable_real_time: bool = Field(True, description="Enable real-time updates")
    enable_animations: bool = Field(True, description="Enable animations")
    enable_tooltips: bool = Field(True, description="Enable tooltips")
    enable_export: bool = Field(True, description="Enable export functionality")
    enable_sharing: bool = Field(True, description="Enable sharing functionality")
    max_history_steps: int = Field(50, ge=10, le=200, description="Maximum undo/redo steps")
    performance_mode: str = Field("balanced", pattern="^(high|balanced|low)$", description="Performance mode")
    accessibility: AccessibilitySettings = Field(default_factory=AccessibilitySettings)


# Widget Schemas
class WidgetConfig(BaseModel):
    """Widget configuration"""
    chart_props: Optional[Dict[str, Any]] = Field(None, description="Chart-specific properties")
    background_color: Optional[str] = Field(None, description="Background color")
    border_color: Optional[str] = Field(None, description="Border color")
    border_width: Optional[int] = Field(None, ge=0, le=10, description="Border width")
    border_radius: Optional[int] = Field(None, ge=0, le=50, description="Border radius")
    padding: Optional[int] = Field(None, ge=0, le=50, description="Padding")
    data_source: Optional[str] = Field(None, description="Data source identifier")
    refresh_interval: Optional[int] = Field(None, ge=5, description="Refresh interval in seconds")
    clickable: bool = Field(True, description="Enable click interactions")
    hoverable: bool = Field(True, description="Enable hover interactions")
    exportable: bool = Field(True, description="Enable export functionality")
    custom_props: Optional[Dict[str, Any]] = Field(None, description="Custom properties")


class DashboardWidgetBase(BaseModel):
    """Base dashboard widget data"""
    type: str = Field(..., pattern="^(chart|text|image|metric|table|custom)$", description="Widget type")
    chart_type: Optional[str] = Field(None, description="Chart type if widget type is chart")
    title: str = Field(..., min_length=1, max_length=255, description="Widget title")
    description: Optional[str] = Field(None, max_length=1000, description="Widget description")
    position: GridPosition = Field(..., description="Widget position in grid")
    config: WidgetConfig = Field(default_factory=WidgetConfig, description="Widget configuration")


class DashboardWidgetCreate(DashboardWidgetBase):
    """Schema for creating dashboard widgets"""
    dashboard_id: uuid.UUID = Field(..., description="Dashboard ID")


class DashboardWidgetUpdate(BaseModel):
    """Schema for updating dashboard widgets"""
    type: Optional[str] = Field(None, pattern="^(chart|text|image|metric|table|custom)$")
    chart_type: Optional[str] = None
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    position: Optional[GridPosition] = None
    config: Optional[WidgetConfig] = None


class DashboardWidgetResponse(DashboardWidgetBase):
    """Schema for dashboard widget responses"""
    id: uuid.UUID = Field(..., description="Widget unique identifier")
    dashboard_id: uuid.UUID = Field(..., description="Dashboard ID")
    version: int = Field(..., description="Widget version")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True


# Dashboard Schemas
class DashboardBase(BaseModel):
    """Base dashboard data"""
    name: str = Field(..., min_length=1, max_length=255, description="Dashboard name")
    description: Optional[str] = Field(None, max_length=2000, description="Dashboard description")
    layout: GridLayoutConfig = Field(default_factory=GridLayoutConfig, description="Layout configuration")
    theme: DashboardTheme = Field(..., description="Theme configuration")
    settings: DashboardSettings = Field(default_factory=DashboardSettings, description="Dashboard settings")
    is_public: bool = Field(False, description="Public visibility")
    tags: Optional[List[str]] = Field(None, description="Dashboard tags")


class DashboardCreate(DashboardBase):
    """Schema for creating dashboards"""
    author: str = Field(..., min_length=1, max_length=255, description="Dashboard author")
    user_id: uuid.UUID = Field(..., description="User ID of the creator")


class DashboardUpdate(BaseModel):
    """Schema for updating dashboards"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    layout: Optional[GridLayoutConfig] = None
    theme: Optional[DashboardTheme] = None
    settings: Optional[DashboardSettings] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None


class DashboardResponse(DashboardBase):
    """Schema for dashboard responses"""
    id: uuid.UUID = Field(..., description="Dashboard unique identifier")
    user_id: uuid.UUID = Field(..., description="Owner user ID")
    author: str = Field(..., description="Dashboard author")
    version: int = Field(..., description="Dashboard version")
    view_count: int = Field(0, description="Number of views")
    last_viewed_at: Optional[datetime] = Field(None, description="Last viewed timestamp")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    widgets: List[DashboardWidgetResponse] = Field([], description="Dashboard widgets")
    
    class Config:
        from_attributes = True


class DashboardListResponse(BaseModel):
    """Response schema for dashboard list endpoints"""
    dashboards: List[DashboardResponse] = Field(..., description="List of dashboards")
    total: int = Field(..., ge=0, description="Total number of matching dashboards")
    skip: int = Field(..., ge=0, description="Number of records skipped")
    limit: int = Field(..., ge=1, description="Maximum number of results requested")
    has_more: bool = Field(..., description="Whether more results are available")


class DashboardSearchParams(BaseModel):
    """Parameters for dashboard search"""
    query: Optional[str] = Field(None, max_length=255, description="Search query")
    author: Optional[str] = Field(None, max_length=255, description="Filter by author")
    tags: Optional[List[str]] = Field(None, description="Filter by tags")
    is_public: Optional[bool] = Field(None, description="Filter by public status")
    created_after: Optional[datetime] = Field(None, description="Filter by creation date")
    created_before: Optional[datetime] = Field(None, description="Filter by creation date")
    
    # Pagination
    skip: int = Field(0, ge=0, description="Number of records to skip")
    limit: int = Field(50, ge=1, le=500, description="Maximum number of results")
    
    # Sorting
    sort_by: Optional[str] = Field("updated_at", description="Sort field")
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$", description="Sort order")


# Export Schemas
class ExportOptions(BaseModel):
    """Dashboard export options"""
    format: str = Field(..., pattern="^(json|pdf|png|svg)$", description="Export format")
    quality: Optional[int] = Field(None, ge=1, le=100, description="Export quality (1-100)")
    width: Optional[int] = Field(None, ge=100, le=5000, description="Export width in pixels")
    height: Optional[int] = Field(None, ge=100, le=5000, description="Export height in pixels")
    include_data: bool = Field(True, description="Include data in export")
    include_config: bool = Field(True, description="Include configuration in export")
    background_color: Optional[str] = Field(None, description="Background color for export")


class ExportRequest(BaseModel):
    """Dashboard export request"""
    dashboard_id: uuid.UUID = Field(..., description="Dashboard ID to export")
    options: ExportOptions = Field(..., description="Export options")


class ExportResponse(BaseModel):
    """Dashboard export response"""
    export_id: uuid.UUID = Field(..., description="Export job ID")
    status: str = Field(..., description="Export status")
    download_url: Optional[str] = Field(None, description="Download URL when ready")
    expires_at: Optional[datetime] = Field(None, description="Download expiration")
    created_at: datetime = Field(..., description="Export creation timestamp")


# Share Schemas
class ShareSettings(BaseModel):
    """Dashboard sharing settings"""
    is_public: bool = Field(False, description="Public access")
    allow_edit: bool = Field(False, description="Allow editing")
    allow_comment: bool = Field(False, description="Allow comments")
    allow_export: bool = Field(True, description="Allow export")
    expires_at: Optional[datetime] = Field(None, description="Share expiration")
    password: Optional[str] = Field(None, min_length=4, max_length=50, description="Access password")


class ShareRequest(BaseModel):
    """Dashboard share request"""
    dashboard_id: uuid.UUID = Field(..., description="Dashboard ID to share")
    settings: ShareSettings = Field(..., description="Share settings")


class ShareResponse(BaseModel):
    """Dashboard share response"""
    share_id: uuid.UUID = Field(..., description="Share identifier")
    share_url: str = Field(..., description="Share URL")
    qr_code: Optional[str] = Field(None, description="QR code for sharing")
    created_at: datetime = Field(..., description="Share creation timestamp")
    expires_at: Optional[datetime] = Field(None, description="Share expiration")


# Duplicate Schema
class DuplicateRequest(BaseModel):
    """Dashboard duplication request"""
    name: str = Field(..., min_length=1, max_length=255, description="New dashboard name")
    description: Optional[str] = Field(None, max_length=2000, description="New dashboard description")
    copy_widgets: bool = Field(True, description="Copy widgets to new dashboard")
    copy_data: bool = Field(False, description="Copy widget data to new dashboard")