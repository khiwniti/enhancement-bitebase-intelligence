# BiteBase Intelligence API Documentation

## Overview

BiteBase Intelligence provides a comprehensive REST API for restaurant intelligence and analytics. The API enables access to the complete 4P framework (Product, Place, Price, Promotion) along with enterprise-grade features including real-time analytics, AI/ML insights, and multi-location management.

## Base URL

- **Development**: `http://localhost:8000`
- **Staging**: `https://staging-api.bitebase-intelligence.com`
- **Production**: `https://api.bitebase-intelligence.com`

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Standard Users**: 100 requests per minute
- **Premium Users**: 500 requests per minute
- **Enterprise Users**: 2000 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## API Endpoints

### Authentication & Users

#### Login
```http
POST /api/v1/auth/login
```

#### Register
```http
POST /api/v1/auth/register
```

#### Get Current User
```http
GET /api/v1/auth/me
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
```

### Product Intelligence

#### Menu Engineering Dashboard
```http
GET /api/v1/product/menu-engineering
```
Get menu engineering analysis with star classification.

#### Cost Analysis
```http
GET /api/v1/product/cost-analysis
POST /api/v1/product/cost-analysis
```
Retrieve and update cost analysis data.

#### Pricing Optimization
```http
GET /api/v1/product/pricing-optimization
POST /api/v1/product/pricing-optimization/calculate
```
Get pricing recommendations and calculate optimal prices.

#### Menu Items
```http
GET /api/v1/product/menu-items
POST /api/v1/product/menu-items
GET /api/v1/product/menu-items/{item_id}
PUT /api/v1/product/menu-items/{item_id}
DELETE /api/v1/product/menu-items/{item_id}
```
Full CRUD operations for menu items.

### Place Intelligence

#### Customer Density Analysis
```http
GET /api/v1/place/customer-density
```
Get customer density heatmaps and analytics.

#### Site Selection
```http
GET /api/v1/place/site-selection
POST /api/v1/place/site-selection/analyze
```
Site selection analysis and recommendations.

#### Delivery Hotspots
```http
GET /api/v1/place/delivery-hotspots
```
Delivery demand analysis and hotspot identification.

#### Location Analytics
```http
GET /api/v1/place/locations
POST /api/v1/place/locations
GET /api/v1/place/locations/{location_id}
PUT /api/v1/place/locations/{location_id}
```
Location management and analytics.

### Price Intelligence

#### Revenue Forecasting
```http
GET /api/v1/price/revenue-forecast
POST /api/v1/price/revenue-forecast/generate
```
Revenue forecasting and predictions.

#### Spending Analysis
```http
GET /api/v1/price/spending-analysis
```
Customer spending pattern analysis.

#### Price Elasticity
```http
GET /api/v1/price/elasticity
POST /api/v1/price/elasticity/calculate
```
Price elasticity analysis and calculations.

#### Financial Analytics
```http
GET /api/v1/price/financial-summary
GET /api/v1/price/profit-margins
```
Financial performance metrics and profit analysis.

### Promotion Intelligence

#### Customer Segmentation
```http
GET /api/v1/promotion/customer-segments
POST /api/v1/promotion/customer-segments
```
Customer segmentation analysis and management.

#### Campaign Automation
```http
GET /api/v1/promotion/campaigns
POST /api/v1/promotion/campaigns
GET /api/v1/promotion/campaigns/{campaign_id}
PUT /api/v1/promotion/campaigns/{campaign_id}
DELETE /api/v1/promotion/campaigns/{campaign_id}
```
Marketing campaign management and automation.

#### Loyalty Analytics
```http
GET /api/v1/promotion/loyalty-analytics
POST /api/v1/promotion/loyalty-programs
```
Loyalty program analytics and management.

### Real-time Analytics

#### Live Dashboard Data
```http
GET /api/v1/analytics/live-dashboard
```
Real-time dashboard metrics.

#### WebSocket Connection
```
WS /api/v1/analytics/ws
```
WebSocket endpoint for real-time updates.

#### Performance Metrics
```http
GET /api/v1/analytics/performance
GET /api/v1/analytics/kpis
```
Performance metrics and KPI tracking.

### AI/ML Services

#### Forecasting
```http
POST /api/v1/ai/forecast
```
Generate AI-powered forecasts.

#### Anomaly Detection
```http
GET /api/v1/ai/anomalies
POST /api/v1/ai/anomalies/detect
```
Anomaly detection and alerts.

#### Predictive Analytics
```http
POST /api/v1/ai/predict
```
Predictive analytics and insights.

### Multi-location Management

#### Locations
```http
GET /api/v1/locations
POST /api/v1/locations
GET /api/v1/locations/{location_id}
PUT /api/v1/locations/{location_id}
DELETE /api/v1/locations/{location_id}
```
Multi-location management.

#### Comparative Analytics
```http
GET /api/v1/locations/compare
GET /api/v1/locations/{location_id}/performance
```
Cross-location performance comparison.

### Enterprise Security

#### RBAC Management
```http
GET /api/v1/security/enterprise/roles
POST /api/v1/security/enterprise/roles
GET /api/v1/security/enterprise/permissions
```
Role-based access control management.

#### Audit Logs
```http
GET /api/v1/security/enterprise/audit-logs
GET /api/v1/security/enterprise/compliance-report
```
Security audit logs and compliance reporting.

#### Vulnerability Scanning
```http
POST /api/v1/security/enterprise/vulnerability-scan
GET /api/v1/security/enterprise/vulnerability-scan/{scan_id}
GET /api/v1/security/enterprise/vulnerability-scans
```
Security vulnerability scanning and reporting.

### API Monitoring

#### Metrics
```http
GET /api/v1/monitoring/metrics
GET /api/v1/monitoring/performance
```
API performance metrics and monitoring.

#### Rate Limiting Status
```http
GET /api/v1/monitoring/rate-limits
```
Current rate limiting status and quotas.

#### Health Checks
```http
GET /health
GET /api/v1/monitoring/health
```
System health and status checks.

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_123456789"
  }
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_123456789"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |

## Pagination

List endpoints support pagination using query parameters:

```http
GET /api/v1/product/menu-items?page=1&limit=20&sort=name&order=asc
```

Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field
- `order`: Sort order (`asc` or `desc`)

Response includes pagination metadata:
```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

## Filtering and Search

Many endpoints support filtering and search:

```http
GET /api/v1/product/menu-items?search=pizza&category=main&price_min=10&price_max=25
```

## WebSocket Events

Real-time updates are available via WebSocket connection:

### Connection
```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/analytics/ws');
```

### Event Types
- `dashboard_update`: Live dashboard data
- `alert`: System alerts and notifications
- `performance_update`: Performance metrics
- `anomaly_detected`: Anomaly detection alerts

### Event Format
```json
{
  "type": "dashboard_update",
  "data": {
    // Event data
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## SDKs and Libraries

Official SDKs are available for:
- Python: `pip install bitebase-intelligence-sdk`
- JavaScript/Node.js: `npm install bitebase-intelligence-sdk`
- PHP: `composer require bitebase/intelligence-sdk`

## Support

- **Documentation**: https://docs.bitebase-intelligence.com
- **API Status**: https://status.bitebase-intelligence.com
- **Support Email**: api-support@bitebase-intelligence.com
- **Developer Portal**: https://developers.bitebase-intelligence.com
