"""
BiteBase Intelligence Models
Import all database models for proper initialization
"""

from .restaurant import (
    Restaurant,
    MenuItem,
    RestaurantReview,
    RestaurantAnalytics,
    LocationAnalysis
)

from .dashboard import (
    Dashboard,
    DashboardWidget,
    DashboardShare,
    DashboardTemplate,
    DashboardExport,
    DashboardAnalytics
)

from .widget import (
    WidgetTemplate,
    WidgetDataSource,
    WidgetInteraction,
    WidgetCache,
    WidgetAlert,
    WidgetComment
)

__all__ = [
    # Restaurant models
    "Restaurant",
    "MenuItem", 
    "RestaurantReview",
    "RestaurantAnalytics",
    "LocationAnalysis",
    
    # Dashboard models
    "Dashboard",
    "DashboardWidget",
    "DashboardShare",
    "DashboardTemplate",
    "DashboardExport",
    "DashboardAnalytics",
    
    # Widget models
    "WidgetTemplate",
    "WidgetDataSource",
    "WidgetInteraction",
    "WidgetCache",
    "WidgetAlert",
    "WidgetComment"
]