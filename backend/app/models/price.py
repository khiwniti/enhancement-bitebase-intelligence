"""
Price Intelligence Models for BiteBase Intelligence
SQLAlchemy models for revenue forecasting, spending analysis, and price optimization
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, Numeric, Index, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class ForecastModel(Base):
    """ML models for revenue forecasting"""
    __tablename__ = "forecast_models"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Model configuration
    model_name = Column(String(100), nullable=False)
    model_type = Column(String(50), nullable=False)  # prophet, arima, lstm, linear_regression
    model_version = Column(String(20), nullable=False, default="1.0")
    model_parameters = Column(JSON, nullable=False)
    
    # Training configuration
    training_data_period = Column(String(100), nullable=False)  # "last_12_months", "last_2_years"
    training_start_date = Column(DateTime, nullable=False)
    training_end_date = Column(DateTime, nullable=False)
    feature_columns = Column(JSON, nullable=False)  # List of features used
    target_column = Column(String(50), nullable=False)  # revenue, orders, customers
    
    # Model performance
    accuracy_metrics = Column(JSON, nullable=False)  # MAE, RMSE, MAPE, R²
    cross_validation_score = Column(Numeric(5, 4), nullable=True)
    test_set_accuracy = Column(Numeric(5, 4), nullable=True)
    confidence_interval = Column(Numeric(3, 2), nullable=True)  # 0.95 for 95%
    
    # Model status
    is_active = Column(Boolean, default=True)
    last_trained = Column(DateTime, nullable=False)
    next_retrain_date = Column(DateTime, nullable=True)
    training_frequency_days = Column(Integer, default=30)
    
    # Performance tracking
    prediction_count = Column(Integer, default=0)
    successful_predictions = Column(Integer, default=0)
    average_prediction_error = Column(Numeric(8, 4), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="forecast_models")
    revenue_forecasts = relationship("RevenueForecast", back_populates="model")
    created_by_user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_forecast_models_restaurant', 'restaurant_id'),
        Index('idx_forecast_models_active', 'is_active'),
        Index('idx_forecast_models_type', 'model_type'),
        Index('idx_forecast_models_last_trained', 'last_trained'),
    )


class RevenueForecast(Base):
    """Revenue predictions and actual results tracking"""
    __tablename__ = "revenue_forecasts"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    model_id = Column(String(36), ForeignKey("forecast_models.id"), nullable=False)
    
    # Forecast details
    forecast_date = Column(DateTime, nullable=False)  # Date being predicted
    forecast_period = Column(String(20), nullable=False)  # daily, weekly, monthly
    forecast_horizon_days = Column(Integer, nullable=False)  # Days ahead predicted
    
    # Revenue predictions
    predicted_revenue = Column(Numeric(12, 2), nullable=False)
    confidence_interval_lower = Column(Numeric(12, 2), nullable=False)
    confidence_interval_upper = Column(Numeric(12, 2), nullable=False)
    prediction_variance = Column(Numeric(12, 2), nullable=True)
    
    # Supporting predictions
    predicted_orders = Column(Integer, nullable=True)
    predicted_customers = Column(Integer, nullable=True)
    predicted_avg_order_value = Column(Numeric(10, 2), nullable=True)
    
    # Actual results (filled after the fact)
    actual_revenue = Column(Numeric(12, 2), nullable=True)
    actual_orders = Column(Integer, nullable=True)
    actual_customers = Column(Integer, nullable=True)
    actual_avg_order_value = Column(Numeric(10, 2), nullable=True)
    
    # Accuracy metrics (calculated after actual data available)
    prediction_error = Column(Numeric(12, 2), nullable=True)
    prediction_error_percentage = Column(Numeric(5, 2), nullable=True)
    absolute_error = Column(Numeric(12, 2), nullable=True)
    within_confidence_interval = Column(Boolean, nullable=True)
    
    # External factors considered
    weather_factor = Column(Numeric(3, 2), nullable=True)
    holiday_factor = Column(Numeric(3, 2), nullable=True)
    event_factor = Column(Numeric(3, 2), nullable=True)
    seasonal_factor = Column(Numeric(3, 2), nullable=True)
    marketing_factor = Column(Numeric(3, 2), nullable=True)
    
    # Forecast metadata
    prediction_created_at = Column(DateTime, nullable=False)
    actual_data_updated_at = Column(DateTime, nullable=True)
    is_validated = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="revenue_forecasts")
    model = relationship("ForecastModel", back_populates="revenue_forecasts")
    
    # Indexes
    __table_args__ = (
        Index('idx_revenue_forecasts_restaurant_date', 'restaurant_id', 'forecast_date'),
        Index('idx_revenue_forecasts_model', 'model_id'),
        Index('idx_revenue_forecasts_period', 'forecast_period'),
        Index('idx_revenue_forecasts_validated', 'is_validated'),
        Index('idx_revenue_forecasts_created', 'prediction_created_at'),
    )


class CustomerSpendingPattern(Base):
    """Analyze customer spending behaviors and patterns"""
    __tablename__ = "customer_spending_patterns"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    customer_id = Column(String(36), nullable=True)  # Optional for privacy
    
    # Customer identification (anonymized)
    anonymized_customer_id = Column(String(255), nullable=False)
    customer_segment = Column(String(50), nullable=True)  # high_value, regular, occasional, new
    
    # Spending metrics
    total_lifetime_value = Column(Numeric(12, 2), nullable=False, default=0)
    average_order_value = Column(Numeric(10, 2), nullable=False, default=0)
    median_order_value = Column(Numeric(10, 2), nullable=True)
    order_frequency_days = Column(Numeric(6, 2), nullable=True)  # Average days between orders
    
    # RFM Analysis (Recency, Frequency, Monetary)
    rfm_recency_score = Column(Integer, nullable=True)  # 1-5 scale
    rfm_frequency_score = Column(Integer, nullable=True)  # 1-5 scale
    rfm_monetary_score = Column(Integer, nullable=True)  # 1-5 scale
    rfm_combined_score = Column(String(10), nullable=True)  # "555" for best customers
    
    # Behavioral patterns
    preferred_order_times = Column(JSON, nullable=True)  # Array of preferred hours
    preferred_days = Column(JSON, nullable=True)  # Array of preferred days
    preferred_menu_categories = Column(JSON, nullable=True)
    price_sensitivity_score = Column(Numeric(3, 2), nullable=True)  # 0-1, higher = more sensitive
    
    # Trend analysis
    spending_trend = Column(String(20), nullable=True)  # increasing, decreasing, stable
    trend_percentage = Column(Numeric(5, 2), nullable=True)  # Monthly change percentage
    seasonality_factor = Column(Numeric(3, 2), nullable=True)
    
    # Prediction metrics
    predicted_next_order_date = Column(DateTime, nullable=True)
    predicted_next_order_value = Column(Numeric(10, 2), nullable=True)
    churn_probability = Column(Numeric(3, 2), nullable=True)  # 0-1
    upsell_potential_score = Column(Numeric(3, 2), nullable=True)  # 0-1
    
    # Analysis period
    analysis_start_date = Column(DateTime, nullable=False)
    analysis_end_date = Column(DateTime, nullable=False)
    total_orders_analyzed = Column(Integer, nullable=False)
    data_quality_score = Column(Numeric(3, 2), nullable=True)  # 0-1
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="customer_spending_patterns")
    
    # Indexes
    __table_args__ = (
        Index('idx_customer_spending_restaurant', 'restaurant_id'),
        Index('idx_customer_spending_anonymized', 'anonymized_customer_id'),
        Index('idx_customer_spending_segment', 'customer_segment'),
        Index('idx_customer_spending_rfm', 'rfm_combined_score'),
        Index('idx_customer_spending_ltv', 'total_lifetime_value'),
    )


class PriceElasticity(Base):
    """Track price elasticity for menu items"""
    __tablename__ = "price_elasticity"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    menu_item_id = Column(String(36), ForeignKey("menu_items.id"), nullable=False)
    
    # Price change details
    price_change_date = Column(DateTime, nullable=False)
    old_price = Column(Numeric(10, 2), nullable=False)
    new_price = Column(Numeric(10, 2), nullable=False)
    price_change_percentage = Column(Numeric(5, 2), nullable=False)
    
    # Demand response
    demand_before_period_days = Column(Integer, nullable=False, default=30)
    demand_after_period_days = Column(Integer, nullable=False, default=30)
    orders_before = Column(Integer, nullable=False)
    orders_after = Column(Integer, nullable=False)
    demand_change_percentage = Column(Numeric(5, 2), nullable=False)
    
    # Elasticity calculation
    price_elasticity_coefficient = Column(Numeric(6, 4), nullable=False)
    elasticity_category = Column(String(20), nullable=False)  # elastic, inelastic, unit_elastic
    
    # Revenue impact
    revenue_before = Column(Numeric(12, 2), nullable=False)
    revenue_after = Column(Numeric(12, 2), nullable=False)
    revenue_change_percentage = Column(Numeric(5, 2), nullable=False)
    profit_impact = Column(Numeric(12, 2), nullable=True)
    
    # Statistical significance
    confidence_level = Column(Numeric(3, 2), nullable=True)  # 0.95 for 95%
    p_value = Column(Numeric(6, 5), nullable=True)
    is_statistically_significant = Column(Boolean, nullable=True)
    sample_size = Column(Integer, nullable=False)
    
    # External factors
    seasonal_adjustment = Column(Numeric(3, 2), nullable=True)
    marketing_impact_adjustment = Column(Numeric(3, 2), nullable=True)
    competition_impact = Column(Numeric(3, 2), nullable=True)
    
    # Recommendations
    optimal_price_recommendation = Column(Numeric(10, 2), nullable=True)
    expected_demand_at_optimal = Column(Integer, nullable=True)
    expected_revenue_at_optimal = Column(Numeric(12, 2), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    analyzed_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="price_elasticity_data")
    menu_item = relationship("MenuItem", back_populates="price_elasticity_data")
    analyzed_by_user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_price_elasticity_restaurant', 'restaurant_id'),
        Index('idx_price_elasticity_item', 'menu_item_id'),
        Index('idx_price_elasticity_date', 'price_change_date'),
        Index('idx_price_elasticity_category', 'elasticity_category'),
        Index('idx_price_elasticity_coefficient', 'price_elasticity_coefficient'),
    )


class RevenueOptimization(Base):
    """Track revenue optimization experiments and results"""
    __tablename__ = "revenue_optimization"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Optimization experiment details
    experiment_name = Column(String(255), nullable=False)
    experiment_type = Column(String(50), nullable=False)  # pricing, bundling, promotion, menu_mix
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    status = Column(String(20), nullable=False, default="active")  # active, completed, paused, cancelled
    
    # Baseline metrics (before optimization)
    baseline_revenue = Column(Numeric(12, 2), nullable=False)
    baseline_orders = Column(Integer, nullable=False)
    baseline_avg_order_value = Column(Numeric(10, 2), nullable=False)
    baseline_profit_margin = Column(Numeric(5, 2), nullable=False)
    
    # Target metrics
    target_revenue_increase = Column(Numeric(5, 2), nullable=True)  # Percentage
    target_profit_increase = Column(Numeric(5, 2), nullable=True)  # Percentage
    target_order_increase = Column(Numeric(5, 2), nullable=True)  # Percentage
    
    # Current results
    current_revenue = Column(Numeric(12, 2), nullable=True)
    current_orders = Column(Integer, nullable=True)
    current_avg_order_value = Column(Numeric(10, 2), nullable=True)
    current_profit_margin = Column(Numeric(5, 2), nullable=True)
    
    # Performance metrics
    revenue_improvement_percentage = Column(Numeric(5, 2), nullable=True)
    profit_improvement_percentage = Column(Numeric(5, 2), nullable=True)
    order_volume_change_percentage = Column(Numeric(5, 2), nullable=True)
    customer_satisfaction_impact = Column(Numeric(3, 2), nullable=True)
    
    # Optimization strategies applied
    strategies_applied = Column(JSON, nullable=False)  # Array of strategy descriptions
    menu_items_affected = Column(JSON, nullable=True)  # Array of menu item IDs
    price_changes_made = Column(JSON, nullable=True)  # Array of price change details
    
    # Statistical analysis
    statistical_significance = Column(Boolean, nullable=True)
    confidence_interval = Column(Numeric(3, 2), nullable=True)
    sample_size = Column(Integer, nullable=True)
    
    # Recommendations and next steps
    recommendations = Column(JSON, nullable=True)
    next_optimization_suggestions = Column(JSON, nullable=True)
    should_continue = Column(Boolean, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="revenue_optimizations")
    created_by_user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_revenue_optimization_restaurant', 'restaurant_id'),
        Index('idx_revenue_optimization_type', 'experiment_type'),
        Index('idx_revenue_optimization_status', 'status'),
        Index('idx_revenue_optimization_dates', 'start_date', 'end_date'),
    )
