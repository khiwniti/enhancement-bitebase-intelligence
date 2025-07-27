# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Next.js 15)
```bash
cd frontend
npm run dev          # Start development server (with Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint checking
```

### Backend (FastAPI)
```bash
cd backend
python -m uvicorn app.main:app --reload        # Development server
python start_services.py                       # Full orchestrated startup with testing
```

### Testing
```bash
# Frontend tests
cd frontend
npm test                    # Run Jest tests
npm run test:coverage      # Run tests with coverage

# Backend tests  
cd backend
pytest                     # Run all tests
pytest -m unit            # Run only unit tests
pytest -m integration     # Run only integration tests
pytest -m "not slow"      # Skip slow tests
```

### Service Orchestration
```bash
python start_services.py   # Starts Redis, FastAPI backend, and Next.js frontend in sequence
                           # Includes health checks and integration testing
```

## Architecture Overview

### Frontend Structure
- **Framework**: Next.js 15 with App Router and TypeScript
- **Styling**: Tailwind CSS v4 with dark theme
- **State Management**: TanStack Query for server state
- **Component Library**: Radix UI primitives with custom components
- **Key Features**:
  - Interactive dashboard builder with drag-and-drop
  - Natural language query interface with voice input
  - Real-time collaboration with presence indicators
  - Advanced charting with Chart.js and custom visualizations
  - Interactive map analytics with Leaflet

### Backend Structure
- **Framework**: FastAPI with SQLAlchemy ORM
- **Database**: SQLite for development, PostgreSQL for production
- **Architecture**: Service layer pattern with domain separation
- **Key Services**:
  - `nl_query/`: Natural language processing with confidence scoring
  - `insights/`: Automated insights engine with anomaly detection
  - `collaboration/`: Real-time collaboration and presence tracking
  - `connectors/`: Data connector framework (SQL, NoSQL, APIs)
  - `dashboard/`: Dashboard engine with visualization optimization
  - `performance/`: Caching and query optimization
  - `security/`: RBAC and audit logging

### API Structure
All endpoints are versioned under `/api/v1/`:
- `/dashboards/` - Enhanced dashboard management
- `/nl-query/` - Natural language query processing
- `/insights/` - Automated insights and analytics
- `/connectors/` - Data source connections
- `/collaboration/` - Real-time collaboration features
- `/performance/` - Performance optimization and caching
- `/security/` - Security and audit endpoints

## Key Components

### Natural Language Query System
- **Location**: `backend/app/services/nl_query/`
- **Frontend**: `frontend/src/components/nl-query/`
- Multi-stage pipeline: intent classification → entity extraction → SQL generation
- Confidence scoring and query suggestions
- Voice input support with speech-to-text

### Dashboard Builder
- **Location**: `frontend/src/components/dashboard/`
- **Backend**: `backend/app/services/dashboard/`
- Drag-and-drop widget builder with React DnD Kit
- Grid-based layouts with auto-save functionality
- Real-time collaboration support

### Data Connector Framework
- **Location**: `backend/app/services/connectors/`
- Plugin architecture supporting SQL (PostgreSQL, MySQL) and NoSQL (MongoDB)
- Schema discovery and data preview
- Connection pooling and query optimization

### Real-time Collaboration
- **Location**: `backend/app/services/collaboration/`
- **Frontend**: `frontend/src/components/collaboration/`
- WebSocket-based presence tracking
- Real-time cursor positions and user indicators
- Comment system and version history

## Development Patterns

### Component Organization
- Each major feature has its own directory under `frontend/src/components/`
- Components include: main component, hooks, types, and sub-components
- Use `index.ts` files for clean imports

### Backend Services
- Each service is self-contained in `backend/app/services/`
- Follow dependency injection pattern
- Use Pydantic models for data validation
- Implement proper error handling and logging

### API Client Pattern
- Frontend uses centralized API client in `frontend/src/lib/api-client.ts`
- TanStack Query for caching and optimistic updates
- Consistent error handling across all API calls

### Testing Strategy
- Frontend: Jest with React Testing Library, 70% coverage threshold
- Backend: Pytest with markers for test categorization
- Integration tests validate end-to-end functionality
- Use `start_services.py` for full integration testing

## Production Considerations

### Environment Variables
```bash
# Backend
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SECRET_KEY=...

# Frontend
NEXT_PUBLIC_API_URL=https://api.bitebase.app
```

### Performance
- Frontend uses Turbopack for fast development builds
- Backend implements caching via Redis
- Query optimization in `performance/query_optimizer.py`
- Chart rendering optimization in `visualization/chart_optimizer.py`

### Security
- RBAC implementation in `security/rbac_service.py`
- Audit logging in `security/audit_service.py`
- CORS and security headers configured in FastAPI