# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Development Commands
- `yarn dev` - Start frontend + backend (recommended for most development)
- `yarn dev:all` - Start all services: frontend, backend, and workers
- `yarn dev:web` - Start Next.js frontend only (port 5000)
- `yarn dev:backend` - Start FastAPI backend only (port 8000)  
- `yarn dev:workers` - Start background workers (port 8001)

### Alternative Commands
- `make dev` - Alternative to yarn dev using Makefile
- `make run-all` - Start all services using Makefile
- `make install` - Install all dependencies (frontend + backend + workers)

### Build and Test Commands
- `yarn build` - Build Next.js frontend for production
- `yarn test` - Run frontend tests
- `yarn test:backend` - Run backend tests with pytest (`cd backend && python -m pytest`)
- `yarn lint` - Run ESLint on frontend
- `yarn lint:fix` - Fix ESLint issues automatically
- `yarn type-check` - Run TypeScript type checking

### Utility Commands
- `yarn status` - Check which services are running
- `yarn stop` - Stop all running services
- `yarn clear-ports` - Force kill processes on ports 3000, 5000, 8000, 8001

## Architecture Overview

### Monorepo Structure
This is a full-stack restaurant analytics platform with three main services:
- **Frontend**: Next.js 15 with App Router (TypeScript, Tailwind CSS)
- **Backend**: FastAPI with SQLAlchemy (Python 3.11+)
- **Workers**: Background task processing (Python, may be Cloudflare Workers)

### Key Directories
- `frontend/src/app/` - Next.js App Router pages and layouts
- `frontend/src/features/` - Feature-based React components and logic
- `frontend/src/shared/` - Shared utilities and reusable components
- `backend/app/api/` - FastAPI REST endpoints
- `backend/app/models/` - SQLAlchemy database models
- `backend/app/services/` - Business logic services (AI, POS, menu, campaign, Wongnai integration)

### Service Ports
- Frontend: http://localhost:5000 (Next.js development server)
- Backend API: http://localhost:8000 (FastAPI with auto-docs at /docs)
- Workers: http://localhost:8001 (Background tasks)

## Framework-Specific Notes

### Frontend (Next.js 15)
- Uses App Router with internationalization (English and Thai supported)
- Workspace name is "web" in package.json
- Development server runs on port 5000 (not standard 3000)
- Uses TypeScript, Tailwind CSS, and Framer Motion
- API calls handled by axios with React Query (@tanstack/react-query)

### Backend (FastAPI)
- Main entry point: `backend/run_backend.py` (runs on port 8000)
- Database: SQLite for development, PostgreSQL for production
- Includes comprehensive dependencies for AI/ML, geospatial analysis, and monitoring
- Uses Pydantic v2 for data validation
- WebSocket support included

### Dependencies Installation
- Frontend: `cd frontend && yarn install`
- Backend: `cd backend && pip install -r requirements.txt`  
- Workers: `cd backend-workers && pip install -r requirements.txt`
- All at once: `yarn install:all`

## Key Features to Understand

### Business Domain
This is a restaurant intelligence platform with:
- AI-powered market report generation
- Interactive location analytics with mapping
- Unified analytics dashboard
- Multilingual support (English/Thai)
- Real-time data streaming
- Restaurant performance analytics

### Integration Services
- Wongnai API integration (Thai restaurant platform)
- POS system integrations
- AI/ML services for analytics
- Campaign management
- Menu analysis services

## Development Environment Setup

1. Install Node.js >=18.0.0, Python >=3.11, and Yarn >=1.22.0
2. Run `yarn install:all` to install all dependencies
3. Copy environment files:
   - `cp frontend/.env.example frontend/.env.local`
   - `cp backend/.env.example backend/.env`
4. Initialize database: `cd backend && python init_database.py`
5. Start development: `yarn dev`

Access the application at http://localhost:5000 with API documentation at http://localhost:8000/docs.