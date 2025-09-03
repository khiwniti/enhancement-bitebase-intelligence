-- BiteBase Intelligence Database Schema for Cloudflare D1
-- Migration 001: Initial tables for users, restaurants, and analytics

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table with authentication and profile data
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    
    -- Profile information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    avatar_url TEXT,
    
    -- Role and permissions
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending_verification')),
    
    -- Account settings
    is_email_verified INTEGER NOT NULL DEFAULT 0,
    is_two_factor_enabled INTEGER NOT NULL DEFAULT 0,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    language TEXT NOT NULL DEFAULT 'en',
    
    -- Timestamps
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at TEXT,
    email_verified_at TEXT
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Refresh tokens for JWT authentication
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    
    -- Token metadata
    device_info TEXT,
    ip_address TEXT,
    user_agent TEXT,
    
    -- Timestamps
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    revoked_at TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User sessions for tracking active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    
    -- Session metadata
    ip_address TEXT,
    user_agent TEXT,
    device_info TEXT,
    location_data TEXT, -- JSON string
    
    -- Timestamps
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_accessed_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- API keys for programmatic access
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Permissions and access control
    permissions TEXT, -- JSON string of permissions array
    rate_limit_per_hour INTEGER DEFAULT 1000,
    allowed_ips TEXT, -- JSON string of IP addresses
    
    -- Status and timestamps
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_used_at TEXT,
    expires_at TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Restaurants table with comprehensive restaurant data
CREATE TABLE IF NOT EXISTS restaurants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    
    -- Location data
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT NOT NULL DEFAULT 'Thailand',
    postal_code TEXT,
    latitude REAL,
    longitude REAL,
    district TEXT,
    
    -- Contact information
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Business details
    cuisine_type TEXT CHECK (cuisine_type IN ('thai', 'chinese', 'japanese', 'korean', 'italian', 'american', 'french', 'indian', 'mexican', 'mediterranean', 'fusion', 'international', 'seafood', 'vegetarian', 'fast_food', 'cafe', 'bakery', 'dessert', 'street_food')),
    business_type TEXT CHECK (business_type IN ('restaurant', 'cafe', 'bar', 'food_truck', 'catering', 'delivery_only', 'bakery', 'fast_food')),
    price_range TEXT CHECK (price_range IN ('budget', 'mid_range', 'high_end', 'luxury')),
    
    -- Operational data
    opening_hours TEXT, -- JSON string
    capacity INTEGER,
    avg_rating REAL DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    
    -- Business metrics
    monthly_revenue REAL DEFAULT 0.0,
    avg_order_value REAL DEFAULT 0.0,
    total_orders INTEGER DEFAULT 0,
    
    -- Status and timestamps
    is_active INTEGER NOT NULL DEFAULT 1,
    verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for restaurant lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);

-- Market analysis table for analytical insights
CREATE TABLE IF NOT EXISTS market_analysis (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('competitor', 'location', 'market_trend', 'revenue_projection', 'customer_segment')),
    
    -- Analysis data
    title TEXT NOT NULL,
    description TEXT,
    analysis_data TEXT, -- JSON string with analysis results
    insights TEXT, -- JSON string with key insights
    recommendations TEXT, -- JSON string with recommendations
    
    -- Metadata
    confidence_score REAL DEFAULT 0.0,
    data_sources TEXT, -- JSON string of data sources used
    analysis_period_start TEXT,
    analysis_period_end TEXT,
    
    -- Status and timestamps
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Location analytics for geospatial insights
CREATE TABLE IF NOT EXISTS location_analysis (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT,
    
    -- Location metrics
    foot_traffic_score REAL DEFAULT 0.0,
    competition_density REAL DEFAULT 0.0,
    demographic_score REAL DEFAULT 0.0,
    accessibility_score REAL DEFAULT 0.0,
    parking_availability REAL DEFAULT 0.0,
    
    -- Nearby amenities (within radius)
    nearby_schools INTEGER DEFAULT 0,
    nearby_offices INTEGER DEFAULT 0,
    nearby_shopping INTEGER DEFAULT 0,
    nearby_transport INTEGER DEFAULT 0,
    
    -- Analysis metadata
    analysis_radius_km REAL DEFAULT 1.0,
    analysis_date TEXT NOT NULL DEFAULT (datetime('now')),
    data_sources TEXT, -- JSON string
    
    -- Timestamps
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Customer segments for market analysis
CREATE TABLE IF NOT EXISTS customer_segments (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT,
    
    -- Segment details
    segment_name TEXT NOT NULL,
    description TEXT,
    age_range TEXT,
    income_level TEXT CHECK (income_level IN ('low', 'medium', 'high', 'premium')),
    lifestyle_tags TEXT, -- JSON string
    
    -- Behavior metrics
    avg_visit_frequency TEXT,
    avg_spend_per_visit REAL DEFAULT 0.0,
    preferred_dining_times TEXT, -- JSON string
    popular_menu_items TEXT, -- JSON string
    
    -- Segment size and value
    estimated_size INTEGER DEFAULT 0,
    revenue_contribution_percent REAL DEFAULT 0.0,
    growth_potential TEXT CHECK (growth_potential IN ('low', 'medium', 'high')),
    
    -- Timestamps
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Revenue projections for financial planning
CREATE TABLE IF NOT EXISTS revenue_projections (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT,
    
    -- Projection details
    projection_type TEXT NOT NULL CHECK (projection_type IN ('monthly', 'quarterly', 'yearly')),
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,
    
    -- Financial projections
    projected_revenue REAL NOT NULL,
    projected_orders INTEGER DEFAULT 0,
    projected_avg_order_value REAL DEFAULT 0.0,
    confidence_level REAL DEFAULT 0.0,
    
    -- Factors considered
    seasonality_factor REAL DEFAULT 1.0,
    market_trend_factor REAL DEFAULT 1.0,
    competition_factor REAL DEFAULT 1.0,
    economic_factor REAL DEFAULT 1.0,
    
    -- Model metadata
    model_version TEXT,
    calculation_method TEXT,
    data_points_used INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Operational metrics for restaurant performance
CREATE TABLE IF NOT EXISTS operational_metrics (
    id TEXT PRIMARY KEY,
    restaurant_id TEXT NOT NULL,
    
    -- Time period for metrics
    metric_date TEXT NOT NULL,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('daily', 'weekly', 'monthly')),
    
    -- Sales metrics
    total_revenue REAL DEFAULT 0.0,
    total_orders INTEGER DEFAULT 0,
    avg_order_value REAL DEFAULT 0.0,
    total_customers INTEGER DEFAULT 0,
    
    -- Operational metrics
    table_turnover_rate REAL DEFAULT 0.0,
    avg_service_time_minutes INTEGER DEFAULT 0,
    customer_satisfaction_score REAL DEFAULT 0.0,
    staff_efficiency_score REAL DEFAULT 0.0,
    
    -- Cost metrics
    food_cost_percentage REAL DEFAULT 0.0,
    labor_cost_percentage REAL DEFAULT 0.0,
    overhead_cost REAL DEFAULT 0.0,
    profit_margin REAL DEFAULT 0.0,
    
    -- Timestamps
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_market_analysis_restaurant ON market_analysis(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_market_analysis_type ON market_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_location_analysis_restaurant ON location_analysis(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_restaurant ON customer_segments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_revenue_projections_restaurant ON revenue_projections(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_revenue_projections_period ON revenue_projections(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_operational_metrics_restaurant ON operational_metrics(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_operational_metrics_date ON operational_metrics(metric_date);

-- Triggers to update timestamps
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_restaurants_timestamp 
    AFTER UPDATE ON restaurants
    BEGIN
        UPDATE restaurants SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_market_analysis_timestamp 
    AFTER UPDATE ON market_analysis
    BEGIN
        UPDATE market_analysis SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_location_analysis_timestamp 
    AFTER UPDATE ON location_analysis
    BEGIN
        UPDATE location_analysis SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_customer_segments_timestamp 
    AFTER UPDATE ON customer_segments
    BEGIN
        UPDATE customer_segments SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_revenue_projections_timestamp 
    AFTER UPDATE ON revenue_projections
    BEGIN
        UPDATE revenue_projections SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_operational_metrics_timestamp 
    AFTER UPDATE ON operational_metrics
    BEGIN
        UPDATE operational_metrics SET updated_at = datetime('now') WHERE id = NEW.id;
    END;