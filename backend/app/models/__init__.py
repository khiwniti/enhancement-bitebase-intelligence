"""
BiteBase Intelligence Models
Import all database models for proper initialization
"""

from .user import (
    User,
    UserRole,
    UserStatus,
    RefreshToken,
    UserSession,
    APIKey,
    EmailVerification,
    PasswordReset
)

from .restaurant import (
    Restaurant,
    MenuItem,
    RestaurantReview,
    RestaurantAnalytics,
    LocationAnalysis,
    Staff,
    Shift,
    InventoryItem
)

from .restaurant_management import (
    StockMovement,
    Table,
    Reservation,
    Order,
    OrderItem,
    Transaction,
    FinancialRecord
)
from .campaign_management import (
    Campaign,
    ABTest,
    CampaignMetrics,
    CampaignAudience,
    CampaignTemplate,
    CampaignType,
    CampaignStatus,
    CampaignChannel,
    ABTestStatus
)

from .pos_integration import (
    POSIntegration,
    POSSyncLog,
    POSDataMapping,
    POSWebhook,
    POSLocation,
    POSConnectorHealth,
    POSProvider,
    POSConnectionStatus,
    SyncStatus,
    DataType
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

# 4P Framework models
from .product import (
    IngredientCost,
    MenuItemIngredient,
    MenuItemCost,
    PricingHistory,
    SeasonalTrend
)

from .place import (
    CustomerLocation,
    SiteScore,
    DeliveryHotspot,
    TrafficPattern
)

from .price import (
    ForecastModel,
    RevenueForecast,
    CustomerSpendingPattern,
    PriceElasticity,
    RevenueOptimization
)

from .promotion import (
    CustomerSegment,
    CustomerSegmentAssignment,
    AutomatedCampaign,
    LoyaltyProgram,
    LoyaltyTransaction
)

__all__ = [
    # User models
    "User",
    "UserRole",
    "UserStatus",
    "RefreshToken",
    "UserSession",
    "APIKey",
    "EmailVerification",
    "PasswordReset",

    # Restaurant models
    "Restaurant",
    "MenuItem",
    "RestaurantReview",
    "RestaurantAnalytics",
    "LocationAnalysis",
    "Staff",
    "Shift",
    "InventoryItem",

    # Restaurant management models
    "StockMovement",
    "Table",
    "Reservation",
    "Order",
    "OrderItem",
    "Transaction",
    "FinancialRecord",

    # Campaign management models
    "Campaign",
    "ABTest",
    "CampaignMetrics",
    "CampaignAudience",
    "CampaignTemplate",
    "CampaignType",
    "CampaignStatus",
    "CampaignChannel",
    "ABTestStatus",

    # POS integration models
    "POSIntegration",
    "POSSyncLog",
    "POSDataMapping",
    "POSWebhook",
    "POSLocation",
    "POSConnectorHealth",
    "POSProvider",
    "POSConnectionStatus",
    "SyncStatus",
    "DataType",

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
    "WidgetComment",

    # 4P Framework models
    # Product Intelligence
    "IngredientCost",
    "MenuItemIngredient",
    "MenuItemCost",
    "PricingHistory",
    "SeasonalTrend",

    # Place Intelligence
    "CustomerLocation",
    "SiteScore",
    "DeliveryHotspot",
    "TrafficPattern",

    # Price Intelligence
    "ForecastModel",
    "RevenueForecast",
    "CustomerSpendingPattern",
    "PriceElasticity",
    "RevenueOptimization",

    # Promotion Intelligence
    "CustomerSegment",
    "CustomerSegmentAssignment",
    "AutomatedCampaign",
    "LoyaltyProgram",
    "LoyaltyTransaction"
]