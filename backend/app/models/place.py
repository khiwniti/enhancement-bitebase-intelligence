"""
Place Intelligence Models for BiteBase Intelligence
SQLAlchemy models for customer density analysis, site selection, and location optimization
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, Numeric, Index, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class CustomerLocation(Base):
    """Track customer locations for density analysis"""
    __tablename__ = "customer_locations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    customer_id = Column(String(36), nullable=True)  # Optional for privacy
    
    # Location data (using high precision for accurate mapping)
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    address = Column(Text, nullable=True)
    postal_code = Column(String(20), nullable=True)
    
    # Visit patterns
    visit_frequency = Column(Integer, nullable=False, default=1)
    last_visit = Column(DateTime, nullable=False)
    first_visit = Column(DateTime, nullable=False)
    total_visits = Column(Integer, nullable=False, default=1)
    
    # Privacy and anonymization
    anonymized_id = Column(String(255), nullable=False, unique=True)
    is_anonymized = Column(Boolean, default=True)
    consent_given = Column(Boolean, default=False)
    
    # Customer behavior
    average_order_value = Column(Numeric(10, 2), nullable=True)
    preferred_order_time = Column(String(20), nullable=True)  # morning, afternoon, evening, night
    delivery_preference = Column(String(20), nullable=True)  # pickup, delivery, dine_in
    
    # Geospatial clustering
    cluster_id = Column(String(36), nullable=True)
    density_zone = Column(String(50), nullable=True)  # high, medium, low
    distance_from_restaurant = Column(Numeric(8, 2), nullable=True)  # in kilometers
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="customer_locations")
    
    # Indexes for geospatial queries
    __table_args__ = (
        Index('idx_customer_locations_restaurant', 'restaurant_id'),
        Index('idx_customer_locations_coords', 'latitude', 'longitude'),
        Index('idx_customer_locations_cluster', 'cluster_id'),
        Index('idx_customer_locations_last_visit', 'last_visit'),
        Index('idx_customer_locations_anonymized', 'anonymized_id'),
    )


class SiteScore(Base):
    """Site selection scoring for potential restaurant locations"""
    __tablename__ = "site_scores"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String(36), nullable=False)  # Group related analyses
    
    # Location coordinates
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    address = Column(Text, nullable=True)
    postal_code = Column(String(20), nullable=True)
    
    # Overall scoring (0-10 scale)
    overall_score = Column(Numeric(3, 2), nullable=False)
    recommendation = Column(String(20), nullable=False)  # excellent, good, fair, poor
    
    # Detailed scoring components (0-10 scale each)
    demographic_score = Column(Numeric(3, 2), nullable=False)
    competition_score = Column(Numeric(3, 2), nullable=False)
    accessibility_score = Column(Numeric(3, 2), nullable=False)
    cost_score = Column(Numeric(3, 2), nullable=False)
    foot_traffic_score = Column(Numeric(3, 2), nullable=False)
    parking_score = Column(Numeric(3, 2), nullable=False)
    visibility_score = Column(Numeric(3, 2), nullable=False)
    
    # Demographic analysis
    population_density = Column(Numeric(10, 2), nullable=True)
    median_income = Column(Numeric(12, 2), nullable=True)
    age_distribution = Column(JSON, nullable=True)  # Age group percentages
    household_size = Column(Numeric(3, 2), nullable=True)
    education_level = Column(JSON, nullable=True)  # Education distribution
    
    # Competition analysis
    competitor_count_500m = Column(Integer, nullable=True)
    competitor_count_1km = Column(Integer, nullable=True)
    nearest_competitor_distance = Column(Numeric(8, 2), nullable=True)
    market_saturation_index = Column(Numeric(3, 2), nullable=True)
    competitive_advantage_factors = Column(JSON, nullable=True)
    
    # Accessibility and infrastructure
    public_transport_score = Column(Numeric(3, 2), nullable=True)
    road_accessibility = Column(Numeric(3, 2), nullable=True)
    parking_availability = Column(Integer, nullable=True)  # Number of spaces
    delivery_accessibility = Column(Numeric(3, 2), nullable=True)
    
    # Cost factors
    estimated_rent_per_sqm = Column(Numeric(10, 2), nullable=True)
    property_size_sqm = Column(Numeric(8, 2), nullable=True)
    renovation_cost_estimate = Column(Numeric(12, 2), nullable=True)
    utility_cost_estimate = Column(Numeric(8, 2), nullable=True)
    
    # Market opportunity
    estimated_daily_customers = Column(Integer, nullable=True)
    estimated_monthly_revenue = Column(Numeric(12, 2), nullable=True)
    break_even_timeline_months = Column(Integer, nullable=True)
    roi_projection_percentage = Column(Numeric(5, 2), nullable=True)
    
    # Risk factors
    risk_factors = Column(JSON, nullable=True)  # Array of identified risks
    risk_score = Column(Numeric(3, 2), nullable=True)  # 0-10, lower is better
    mitigation_strategies = Column(JSON, nullable=True)
    
    # Analysis metadata
    analysis_date = Column(DateTime, nullable=False)
    analysis_type = Column(String(50), nullable=False)  # new_location, expansion, relocation
    requested_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    cuisine_type = Column(String(100), nullable=True)
    target_price_range = Column(String(10), nullable=True)  # $, $$, $$$, $$$$
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    requested_by_user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_site_scores_coords', 'latitude', 'longitude'),
        Index('idx_site_scores_analysis', 'analysis_id'),
        Index('idx_site_scores_overall', 'overall_score'),
        Index('idx_site_scores_date', 'analysis_date'),
        Index('idx_site_scores_recommendation', 'recommendation'),
    )


class DeliveryHotspot(Base):
    """Identify and track delivery/pickup hotspots"""
    __tablename__ = "delivery_hotspots"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Hotspot location (center point)
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    radius_meters = Column(Integer, nullable=False, default=500)
    
    # Hotspot characteristics
    hotspot_type = Column(String(20), nullable=False)  # delivery, pickup, both
    intensity_score = Column(Numeric(5, 2), nullable=False)  # 0-100
    order_density = Column(Numeric(8, 2), nullable=False)  # Orders per km²
    
    # Time-based patterns
    peak_hours = Column(JSON, nullable=True)  # Array of peak hour ranges
    peak_days = Column(JSON, nullable=True)  # Array of peak days
    seasonal_variation = Column(Numeric(3, 2), nullable=True)  # Seasonal multiplier
    
    # Performance metrics
    total_orders = Column(Integer, nullable=False, default=0)
    total_revenue = Column(Numeric(12, 2), nullable=False, default=0)
    average_order_value = Column(Numeric(10, 2), nullable=True)
    average_delivery_time = Column(Integer, nullable=True)  # Minutes
    customer_satisfaction_score = Column(Numeric(3, 2), nullable=True)  # 0-5
    
    # Optimization recommendations
    recommended_delivery_radius = Column(Integer, nullable=True)
    optimal_delivery_time_slots = Column(JSON, nullable=True)
    staffing_recommendations = Column(JSON, nullable=True)
    marketing_opportunities = Column(JSON, nullable=True)
    
    # Analysis period
    analysis_start_date = Column(DateTime, nullable=False)
    analysis_end_date = Column(DateTime, nullable=False)
    data_points_count = Column(Integer, nullable=False)
    confidence_level = Column(Numeric(3, 2), nullable=True)  # 0-1
    
    # Status
    is_active = Column(Boolean, default=True)
    last_updated = Column(DateTime, nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="delivery_hotspots")
    
    # Indexes
    __table_args__ = (
        Index('idx_delivery_hotspots_restaurant', 'restaurant_id'),
        Index('idx_delivery_hotspots_coords', 'latitude', 'longitude'),
        Index('idx_delivery_hotspots_type', 'hotspot_type'),
        Index('idx_delivery_hotspots_intensity', 'intensity_score'),
        Index('idx_delivery_hotspots_active', 'is_active'),
    )


class TrafficPattern(Base):
    """Track foot traffic and vehicle patterns around restaurants"""
    __tablename__ = "traffic_patterns"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(String(36), ForeignKey("restaurants.id"), nullable=False)
    
    # Location and time
    measurement_point_lat = Column(Numeric(10, 8), nullable=False)
    measurement_point_lng = Column(Numeric(11, 8), nullable=False)
    measurement_date = Column(DateTime, nullable=False)
    hour_of_day = Column(Integer, nullable=False)  # 0-23
    day_of_week = Column(Integer, nullable=False)  # 0-6 (Monday=0)
    
    # Traffic metrics
    foot_traffic_count = Column(Integer, nullable=False, default=0)
    vehicle_traffic_count = Column(Integer, nullable=False, default=0)
    pedestrian_dwell_time = Column(Integer, nullable=True)  # Average seconds
    
    # Demographics (if available)
    age_group_distribution = Column(JSON, nullable=True)
    gender_distribution = Column(JSON, nullable=True)
    group_size_distribution = Column(JSON, nullable=True)
    
    # Weather and external factors
    weather_condition = Column(String(50), nullable=True)
    temperature = Column(Numeric(4, 1), nullable=True)
    is_holiday = Column(Boolean, default=False)
    special_events = Column(JSON, nullable=True)
    
    # Data source and quality
    data_source = Column(String(50), nullable=False)  # manual, camera, sensor, api
    data_quality_score = Column(Numeric(3, 2), nullable=True)  # 0-1
    confidence_interval = Column(Numeric(5, 2), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    restaurant = relationship("Restaurant", back_populates="traffic_patterns")
    
    # Indexes
    __table_args__ = (
        Index('idx_traffic_patterns_restaurant', 'restaurant_id'),
        Index('idx_traffic_patterns_datetime', 'measurement_date', 'hour_of_day'),
        Index('idx_traffic_patterns_coords', 'measurement_point_lat', 'measurement_point_lng'),
        Index('idx_traffic_patterns_day_hour', 'day_of_week', 'hour_of_day'),
    )
