# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Full Stack Development
```bash
# Start both frontend and backend (recommended for development)
# Frontend will start on port 50513 (Next.js with Turbopack)
# Backend should be started separately on port 8000 (FastAPI)

# Frontend Development (from /frontend)
npm run dev          # Next.js dev server on port 50513 with Turbopack
npm run build        # Production build with optimizations  
npm run start        # Production server on port 52580
npm run staging      # Staging server on port 12001

# Backend Development (from /backend)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Or using the main file directly:
python -m app.main

# Testing
npm run test         # Frontend Jest tests with 10s timeout
npm run test:watch   # Frontend tests in watch mode
npm run test:coverage # Frontend coverage report
pytest               # Backend tests (from /backend directory)

# Code Quality
npm run lint         # Frontend ESLint validation
npm run lint:fix     # Auto-fix ESLint issues
npm run check-types  # TypeScript type checking
npm run clean        # Clean build artifacts and cache

# Docker Development (full stack)
docker-compose up -d  # Start all services (frontend, backend, postgres, redis, monitoring)
docker-compose up -d --profile logging  # Include ELK stack for logging
```

## Architecture Overview

This is a full-stack AI-powered restaurant intelligence platform with microservices architecture:

### Frontend Architecture (Next.js 15)
- **Framework**: Next.js 15 with App Router, Turbopack, and TypeScript
- **State Management**: Zustand for global state, TanStack Query for server state  
- **UI Framework**: Radix UI primitives with Tailwind CSS
- **Visualization**: Chart.js, Recharts, D3.js for different chart types
- **Mapping**: Mapbox GL (primary) and Leaflet (fallback) with React wrappers
- **Real-time**: Socket.io for WebSocket connections
- **Forms**: React Hook Form with Zod validation

### Backend Architecture (FastAPI)
- **Framework**: FastAPI with async/await patterns and Pydantic v2
- **Database**: SQLAlchemy 2.0 with PostgreSQL/SQLite, Redis for caching
- **Authentication**: JWT-based with python-jose and passlib
- **Geospatial**: GeoAlchemy2 and Shapely for location intelligence
- **AI/ML**: Scikit-learn, Pandas, NumPy for analytics
- **Monitoring**: Prometheus metrics, structured logging

### Infrastructure & DevOps
- **Containerization**: Docker Compose with multi-service orchestration
- **Database**: PostgreSQL with PostGIS for geospatial data
- **Caching**: Redis for session/query caching
- **Monitoring**: Prometheus + Grafana for metrics and monitoring
- **Logging**: Optional ELK stack (Elasticsearch, Logstash, Kibana)

## Key System Architecture Patterns

### API Communication Flow
```
Frontend (Next.js) → API Client → FastAPI Backend → Services Layer → Database/External APIs
                                                 → AI/ML Pipeline → Analytics
                                                 → Redis Cache → Performance
```

### Core Service Categories

#### AI & Intelligence Services
- **AI Analytics** (`/api/v1/ai`): Market analysis, chat interface, predictions
- **Advanced AI** (`/api/v1/advanced-ai`): ML pipeline, pattern recognition
- **Natural Language Query** (`/api/v1/nl-query`): NL processing, SQL generation
- **Insights Engine** (`/api/v1/insights`): Anomaly detection, pattern analysis

#### Location Intelligence
- **Location Intelligence** (`/api/v1/location-intelligence`): Geospatial analysis
- **Place Intelligence** (`/api/v1/place-intelligence`): Location scoring
- **Multi-Location** (`/api/v1/multi-location`): Chain management

#### Restaurant Business Intelligence (4P Framework)
- **Product Intelligence** (`/api/v1/product-intelligence`): Menu optimization
- **Place Intelligence** (`/api/v1/place-intelligence`): Location analysis
- **Price Intelligence** (`/api/v1/price-intelligence`): Pricing optimization
- **Promotion Intelligence** (`/api/v1/promotion-intelligence`): Marketing analytics

#### Operational Services
- **Restaurant Management** (`/api/v1/restaurant-management`): Operations
- **POS Integration** (`/api/v1/pos-integration`): Point-of-sale systems
- **Campaign Management** (`/api/v1/campaign-management`): Marketing campaigns
- **Real-time Analytics** (`/api/v1/realtime-analytics`): Live metrics

### Frontend Component Architecture

#### Core Dashboard System (`src/components/dashboard/`)
- **BusinessIntelligenceHub**: Main BI dashboard with real-time metrics
- **EnhancedDashboard**: Customizable dashboard with widgets
- **DashboardBuilder**: Drag-and-drop dashboard construction
- **Specialized Tabs**: AI Insights, Market Analysis, Location Intelligence

#### Chart & Visualization System (`src/components/charts/`)
- **Unified Chart Registry**: Centralized chart type management
- **Core Components**: BaseChart, ChartContainer for consistent behavior
- **Chart Types**: Line, Bar, Pie, Doughnut, Area, TreeMap
- **Advanced Features**: CrossFilter, responsive theming, performance optimization

#### AI & Interaction (`src/components/ai/`)
- **EnhancedBiteBaseAI**: Main AI chat interface with context
- **AIResearchAgentPage**: Market research and competitive analysis
- **FloatingChatbot**: Persistent chat widget with session management

#### Location & Mapping (`src/components/location/`, `src/components/maps/`)
- **InteractiveMap**: Mapbox-based restaurant mapping with clustering
- **LocationIntelligencePage**: Geospatial analysis dashboard
- **CustomerDensityMap**: Heat map overlays for customer data

## Database & Data Architecture

### Core Data Models
- **Restaurants**: Business profiles, locations, operational data
- **Analytics**: Performance metrics, KPIs, time-series data
- **Users**: Authentication, roles, preferences
- **Insights**: AI-generated insights, patterns, recommendations
- **Campaigns**: Marketing campaign data and performance
- **POS Integration**: Transaction data, menu items, inventory

### Geospatial Data Handling
- Uses PostGIS extensions for spatial queries
- GeoAlchemy2 for spatial column types and operations
- Shapely for geometry manipulation
- Geopy for geocoding services

### Caching Strategy
- **Redis**: Session data, query results, AI model outputs
- **Application Cache**: TanStack Query for client-side caching
- **Database**: Query result caching with TTL

## API Integration Patterns

### Authentication Flow
1. JWT tokens generated via `/api/v1/auth/login`
2. Tokens include user roles and permissions
3. Protected routes validate JWT middleware
4. Frontend stores tokens in secure storage

### Real-time Data Flow
1. WebSocket connections established via Socket.io
2. Real-time updates pushed for analytics, notifications
3. Optimistic UI updates with error recovery
4. Background synchronization for data consistency

### External API Integration
- **Google Maps/Places**: Location data, geocoding
- **Weather APIs**: Environmental factors for analytics
- **Social Media APIs**: Sentiment analysis data
- **Payment Processors**: Transaction data integration

## Testing Strategy

### Frontend Testing (Jest + Testing Library)
- **Component Tests**: React Testing Library for UI components
- **Hook Tests**: Custom hook testing with renderHook
- **Integration Tests**: API client and service integration
- **E2E Tests**: Playwright for critical user journeys

### Backend Testing (pytest)
- **Unit Tests**: Individual service and function testing
- **Integration Tests**: Database and API endpoint testing
- **Performance Tests**: Load testing and benchmarking
- **Security Tests**: Authentication and authorization validation

### Test Configuration
- **Frontend**: Jest with jsdom, 10s timeout, coverage reporting
- **Backend**: pytest with asyncio, coverage, multiple test markers
- **Database**: Test database isolation and cleanup

## Development Environment Setup

### Local Development Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 15+ (optional, SQLite fallback)
- Redis (optional, in-memory fallback)

### Environment Configuration
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here

# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost/bitebase_intelligence
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
```

### Docker Development
The `docker-compose.yml` provides a complete development environment:
- **PostgreSQL**: Database with PostGIS
- **Redis**: Caching and session storage
- **Backend**: FastAPI application
- **Frontend**: Next.js application with Nginx
- **Monitoring**: Prometheus and Grafana
- **Optional**: ELK stack for logging (use `--profile logging`)

## Performance & Monitoring

### Performance Optimizations
- **Frontend**: Turbopack, code splitting, lazy loading, image optimization
- **Backend**: Async operations, connection pooling, query optimization
- **Caching**: Multi-layer caching (Redis, application, browser)
- **Database**: Indexed queries, connection pooling, query optimization

### Monitoring & Observability
- **API Monitoring**: Custom middleware for request/response metrics
- **Health Checks**: `/health` endpoints with dependency checking
- **Metrics**: Prometheus metrics collection
- **Logging**: Structured logging with correlation IDs
- **Error Tracking**: Comprehensive error handling and reporting

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with role-based access
- **Rate Limiting**: API endpoint rate limiting with Redis
- **CORS**: Configurable cross-origin resource sharing
- **Security Headers**: Comprehensive security header middleware

### Data Protection
- **Input Validation**: Pydantic models for API validation
- **SQL Injection**: SQLAlchemy ORM with parameterized queries
- **XSS Protection**: Content Security Policy and input sanitization
- **Audit Logging**: Security event logging and monitoring

## Deployment Considerations

### Production Deployment
- **Frontend**: Vercel, Netlify, or static hosting with CDN
- **Backend**: Docker containers with Kubernetes or cloud services
- **Database**: Managed PostgreSQL with connection pooling
- **Monitoring**: Production monitoring with alerting

### Scaling Patterns
- **Horizontal Scaling**: Stateless API design for load balancing
- **Database Scaling**: Read replicas, connection pooling
- **Caching**: Redis cluster for distributed caching
- **CDN**: Static asset delivery optimization