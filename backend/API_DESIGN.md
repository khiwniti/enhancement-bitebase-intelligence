# BiteBase Intelligence REST API Design v2.1

## API Overview

BiteBase Intelligence provides a comprehensive REST API for restaurant business intelligence, analytics, and management. The API is designed with performance, security, and scalability in mind.

### Base URL
- Development: `http://localhost:56223`
- Staging: `https://api-staging.bitebase.app`
- Production: `https://api.bitebase.app`

### API Version
Current version: `v1`
All endpoints are prefixed with `/api/v1/`

## Authentication

### JWT-based Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/auth/register  
Register new user account
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Restaurant Co"
}
```

#### POST /api/auth/refresh
Refresh JWT token
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST /api/auth/logout
Logout and invalidate token

## Core API Endpoints

### 1. Dashboard Management

#### GET /api/v1/dashboards
Get all dashboards for authenticated user
- Query params: `page`, `limit`, `search`, `category`
- Response: Paginated list of dashboards

#### POST /api/v1/dashboards
Create new dashboard
```json
{
  "name": "Revenue Analytics",
  "description": "Daily revenue tracking",
  "layout": { ... },
  "widgets": [ ... ],
  "isPublic": false,
  "category": "analytics"
}
```

#### GET /api/v1/dashboards/{id}
Get dashboard by ID

#### PUT /api/v1/dashboards/{id}
Update dashboard

#### DELETE /api/v1/dashboards/{id}
Delete dashboard

#### POST /api/v1/dashboards/{id}/duplicate
Duplicate dashboard

#### GET /api/v1/dashboards/{id}/export
Export dashboard (PDF, PNG, JSON)

### 2. Restaurant Management

#### GET /api/v1/restaurants
Get restaurants with filtering and search
- Query params: `location`, `cuisine`, `rating`, `price_range`, `radius`

#### POST /api/v1/restaurants
Add new restaurant
```json
{
  "name": "The Great Restaurant",
  "address": "123 Main St",
  "coordinates": [lat, lng],
  "cuisine": "Italian",
  "priceRange": "$$",
  "phone": "+1234567890",
  "hours": { ... }
}
```

#### GET /api/v1/restaurants/{id}
Get restaurant details

#### PUT /api/v1/restaurants/{id}
Update restaurant information

#### GET /api/v1/restaurants/{id}/analytics
Get restaurant performance analytics
```json
{
  "period": "30d",
  "metrics": ["revenue", "orders", "ratings", "traffic"]
}
```

#### GET /api/v1/restaurants/{id}/competitors
Get competitive analysis

### 3. Analytics & Insights

#### GET /api/v1/analytics/overview
Get analytics overview dashboard

#### GET /api/v1/analytics/revenue
Revenue analytics with time series data
- Query params: `period`, `granularity`, `restaurant_id`

#### GET /api/v1/analytics/customers
Customer analytics and segmentation

#### GET /api/v1/analytics/menu
Menu performance analytics

#### GET /api/v1/analytics/operations
Operational efficiency metrics

#### POST /api/v1/analytics/custom-query
Execute custom analytics query
```json
{
  "query": "SELECT * FROM orders WHERE date >= ?",
  "parameters": ["2024-01-01"],
  "format": "json"
}
```

### 4. AI-Powered Insights

#### GET /api/v1/insights
Get AI-generated insights
- Query params: `category`, `priority`, `date_range`

#### POST /api/v1/insights/generate
Generate new insights for specific data
```json
{
  "data_source": "sales_data",
  "analysis_type": "trend_analysis",
  "time_range": "30d"
}
```

#### GET /api/v1/insights/{id}
Get specific insight details

#### POST /api/v1/insights/{id}/feedback
Provide feedback on insight accuracy
```json
{
  "rating": 5,
  "comment": "Very helpful insight",
  "action_taken": true
}
```

### 5. Natural Language Query

#### POST /api/v1/nl-query
Process natural language query
```json
{
  "query": "Show me revenue trends for the last 30 days",
  "context": {
    "restaurant_id": "123",
    "user_preferences": { ... }
  }
}
```

#### GET /api/v1/nl-query/suggestions
Get query suggestions based on context

#### POST /api/v1/nl-query/validate
Validate query before execution
```json
{
  "query": "SELECT revenue FROM sales WHERE date > '2024-01-01'",
  "safety_check": true
}
```

### 6. Location Intelligence

#### GET /api/v1/locations/search
Search locations with geocoding
- Query params: `q`, `lat`, `lng`, `radius`, `type`

#### POST /api/v1/locations/analyze
Analyze location for business potential
```json
{
  "address": "123 Main St, City, State",
  "business_type": "restaurant",
  "analysis_depth": "comprehensive"
}
```

#### GET /api/v1/locations/{id}/demographics
Get location demographics data

#### GET /api/v1/locations/{id}/foot-traffic
Get foot traffic analytics

### 7. Menu Intelligence

#### GET /api/v1/menu/items
Get menu items with performance data

#### POST /api/v1/menu/analyze
Analyze menu performance
```json
{
  "restaurant_id": "123",
  "analysis_type": "profitability",
  "time_range": "30d"
}
```

#### GET /api/v1/menu/recommendations
Get AI-powered menu recommendations

#### POST /api/v1/menu/optimize
Optimize menu layout and pricing
```json
{
  "goals": ["increase_profit", "reduce_complexity"],
  "constraints": { ... }
}
```

### 8. Data Connectors

#### GET /api/v1/connectors
Get available data connector types

#### POST /api/v1/connectors
Create new data connection
```json
{
  "type": "postgresql",
  "name": "POS System",
  "config": {
    "host": "localhost",
    "database": "pos_db",
    "credentials": { ... }
  }
}
```

#### GET /api/v1/connectors/{id}/test
Test data connector connection

#### GET /api/v1/connectors/{id}/schema
Get data schema from connector

#### POST /api/v1/connectors/{id}/sync
Sync data from connector

### 9. Real-time Collaboration

#### GET /api/v1/collaboration/sessions
Get active collaboration sessions

#### POST /api/v1/collaboration/sessions
Create collaboration session
```json
{
  "dashboard_id": "123",
  "permissions": ["read", "write", "comment"]
}
```

#### WebSocket: /ws/collaboration/{session_id}
Real-time collaboration WebSocket endpoint

#### GET /api/v1/collaboration/comments
Get comments for dashboard/widget

#### POST /api/v1/collaboration/comments
Add comment
```json
{
  "dashboard_id": "123",
  "widget_id": "456",
  "content": "This chart needs updating",
  "position": { "x": 100, "y": 200 }
}
```

### 10. Performance & Monitoring

#### GET /api/v1/performance/metrics
Get API performance metrics

#### GET /api/v1/performance/cache-stats
Get caching statistics

#### POST /api/v1/performance/optimize
Trigger performance optimization

### 11. Security & Audit

#### GET /api/v1/security/audit-log
Get security audit log
- Query params: `start_date`, `end_date`, `user_id`, `action`

#### POST /api/v1/security/report-incident
Report security incident

#### GET /api/v1/security/permissions
Get user permissions

#### POST /api/v1/security/permissions
Update user permissions

## Enhanced Features from BiteBase Backend Express

### 12. AI Chat & Intelligence

#### POST /api/v1/ai/chat
Chat with AI assistant for business insights
```json
{
  "message": "Analyze my restaurant's performance",
  "context": {
    "restaurant_id": "123",
    "conversation_id": "conv_456"
  }
}
```

#### POST /api/v1/ai/market-analysis
Generate comprehensive market analysis
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "businessType": "restaurant",
  "radius": 1000,
  "restaurantId": "rest_123"
}
```

#### POST /api/v1/ai/predictions
Generate AI-powered business predictions
```json
{
  "type": "revenue_forecast",
  "timeHorizon": "90d",
  "factors": ["seasonality", "trends", "external_events"],
  "restaurantId": "rest_123"
}
```

#### POST /api/v1/ai/insights/generate
Generate AI insights from data
```json
{
  "dataSource": "sales_data",
  "analysisType": "trend_analysis",
  "timeRange": "30d",
  "restaurantId": "rest_123"
}
```

#### GET /api/v1/ai/agents/status
Get AI agents and services status

### 13. Payments Integration

#### GET /api/v1/payments/plans
Get available pricing plans

#### POST /api/v1/payments/create-customer
Create Stripe customer
```json
{
  "email": "customer@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "metadata": {}
}
```

#### POST /api/v1/payments/payment-intent
Create payment intent
```json
{
  "amount": 2999,
  "currency": "usd",
  "subscription_plan": "professional",
  "customer_id": "cus_123"
}
```

#### POST /api/v1/payments/subscribe
Create subscription
```json
{
  "customer_id": "cus_123",
  "price_id": "price_123",
  "payment_method": "pm_123",
  "trial_days": 14
}
```

#### GET /api/v1/payments/subscriptions
Get user subscriptions

#### GET /api/v1/payments/history
Get payment history

#### POST /api/v1/payments/webhook
Stripe webhook handler

### 14. Admin Management

#### GET /api/v1/admin/dashboard
Comprehensive admin dashboard with system statistics

#### GET /api/v1/admin/users
Get all users with filtering and pagination
- Query params: `page`, `limit`, `search`, `role`, `status`

#### GET /api/v1/admin/analytics
Get platform-wide analytics and metrics
- Query params: `period`, `metrics`

#### POST /api/v1/admin/maintenance
Trigger maintenance operations
```json
{
  "operation": "database_cleanup",
  "parameters": {},
  "notify_users": false
}
```

#### GET /api/v1/admin/health
Get comprehensive system health status

## JWT Authentication Implementation

### Authentication Flow
All endpoints use JWT Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

### Auth Endpoints
- **POST /api/auth/login** - User login with email/password
- **POST /api/auth/register** - New user registration  
- **POST /api/auth/refresh** - Refresh access token
- **POST /api/auth/logout** - Logout and invalidate token
- **GET /api/auth/me** - Get current user info
- **POST /api/auth/verify** - Verify token validity

### Role-Based Access Control
- **User**: Standard restaurant owner/manager access
- **Admin**: Full platform administration access
- **Moderator**: Limited administrative functions

### Security Features
- JWT access tokens (7-day expiry)
- Refresh tokens (30-day expiry)
- Password hashing with bcrypt
- Role-based endpoint protection
- Optional authentication for public endpoints

## Response Formats

### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

- Public endpoints: 100 requests/minute
- Authenticated endpoints: 1000 requests/minute
- Premium users: 5000 requests/minute
- AI endpoints: 50 requests/minute

## WebSocket Events

### Collaboration Events
- `user_joined`
- `user_left`
- `cursor_moved`
- `widget_updated`
- `comment_added`
- `dashboard_shared`

### Real-time Data Events
- `data_updated`
- `alert_triggered`
- `sync_completed`
- `error_occurred`

## Security Features

1. **JWT Authentication** with refresh tokens
2. **Rate limiting** per endpoint and user
3. **Input validation** and sanitization
4. **SQL injection** protection
5. **CORS** configuration
6. **Security headers** (HSTS, CSP, etc.)
7. **Audit logging** for all operations
8. **Role-based access control** (RBAC)
9. **Data encryption** at rest and in transit
10. **GDPR compliance** features

## Performance Optimizations

1. **Response caching** with Redis
2. **Database query optimization**
3. **Connection pooling**
4. **Lazy loading** for large datasets
5. **Compression** for API responses
6. **CDN integration** for static assets
7. **Background job processing**
8. **Real-time metrics** monitoring
9. **Auto-scaling** capabilities
10. **Circuit breaker** pattern implementation