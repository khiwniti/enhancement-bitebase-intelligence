# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Essential Commands

| Task | Command | Notes |
|------|---------|-------|
| **Development** | `make dev` OR `yarn dev` | Start web app + FastAPI backend |
| **Install All** | `make install` OR `yarn install:all` | Install all dependencies (frontend + backend + workers) |
| **Build** | `yarn build` | Build all workspaces |
| **Test** | `yarn test` | Run tests across all workspaces |
| **Lint** | `yarn lint` | Lint all workspaces |
| **Type Check** | `yarn type-check` | TypeScript validation |
| **Clean** | `yarn clean` | Clean all build artifacts |
| **Stop Services** | `make stop` OR `yarn stop` | Stop all running services |
| **Check Status** | `make status` OR `yarn status` | Check service status |

### Backend Commands

| Task | Command | Notes |
|------|---------|-------|
| **Start Backend** | `yarn dev:backend` | FastAPI backend only |
| **Start Workers** | `yarn dev:workers` | Backend workers only |
| **Start All** | `yarn dev:all` | All services (web + backend + workers) |
| **Test Backend** | `yarn test:backend` | Run backend tests |

### Individual App Commands

```bash
# Web app (Next.js 15)
cd frontend
yarn dev          # Development server (port 5000)
yarn build        # Production build
yarn lint         # ESLint validation
yarn type-check   # TypeScript checking

# FastAPI Backend
cd backend
python run_backend.py    # Local development server
python -m pytest        # Run tests

# Backend Workers
cd backend-workers
python -m uvicorn main:app --reload --port 8001
```

## 🏗️ Architecture Overview

### Monorepo Structure
```
enhancement-bitebase-intelligence/
├── 📁 frontend/                # Next.js 15 frontend
├── 📁 backend/                 # FastAPI backend
├── 📁 backend-workers/         # Background workers
├── 📁 legacy/                  # Legacy code (deprecated)
├── 📁 tools/                   # Development tools & scripts
└── 📁 docs/                    # Documentation
```

### Frontend Architecture (frontend/)
- **Framework**: Next.js 15 with App Router, TypeScript strict mode
- **UI**: Tailwind CSS v3, Radix UI components, Framer Motion
- **State**: TanStack Query for server state, React Hook Form for forms
- **Maps**: Leaflet with React wrappers for location intelligence
- **Structure**: Feature-based organization in `src/features/`

### Backend Architecture
- **Primary**: FastAPI with Python in `backend/`
- **Workers**: Background processing in `backend-workers/`
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT-based authentication

### Key Frontend Features Organization
```
frontend/src/
├── 📁 app/                     # Next.js App Router pages
├── 📁 features/                # Feature-based components
│   ├── 📁 ai-assistant/        # AI chat and research agent
│   ├── 📁 analytics/           # Analytics dashboards
│   ├── 📁 dashboard/           # Main dashboard
│   ├── 📁 location-intelligence/ # Interactive maps & location analysis
│   └── 📁 restaurant-management/ # Restaurant tools
├── 📁 shared/                  # Shared components & utilities
│   ├── 📁 components/          # Reusable UI components
│   ├── 📁 hooks/               # Custom React hooks
│   ├── 📁 lib/                 # Utilities & configurations
│   └── 📁 types/               # TypeScript definitions
```

## 🔧 Development Environment

### Port Configuration
- **Web App**: http://localhost:5000 (Next.js dev server)
- **FastAPI Backend**: http://localhost:8000 (FastAPI server)
- **Backend Workers**: http://localhost:8001 (Workers API)

### Key Technologies
- **Frontend**: Next.js 15, React 18, TypeScript 5.6, Tailwind CSS 3.4
- **Backend**: FastAPI, Python 3.9+, SQLAlchemy, PostgreSQL
- **Build**: Yarn workspaces, Turbopack (dev)
- **Testing**: Jest + React Testing Library (frontend), pytest (backend)

### API Integration Pattern
```
Next.js App ←→ Axios/Fetch ←→ FastAPI Backend
                              ├── PostgreSQL Database
                              ├── Background Workers
                              └── External APIs
```

## 🎯 Key Development Patterns

### Workspace Commands
- Use **yarn** (not npm) for consistency with workspace configuration
- Root-level commands affect all workspaces: `yarn lint`, `yarn build`, `yarn test`
- App-specific commands: `yarn workspace web dev`, `cd backend && python run_backend.py`

### File Organization
- **Feature-first**: Components organized by business domain, not technical layers
- **Shared utilities**: Common code in `frontend/src/shared/`
- **API integration**: Axios client in `frontend/src/shared/lib/`
- **Type safety**: Comprehensive TypeScript with strict mode enabled

### Backend Development
- **FastAPI**: RESTful APIs with automatic OpenAPI documentation
- **Database**: SQLAlchemy ORM with PostgreSQL
- **Workers**: Background processing with Celery or similar
- **Testing**: pytest for comprehensive backend testing

### Component Patterns
- **UI Components**: Radix UI primitives with Tailwind styling
- **State Management**: TanStack Query for server state, local state for UI
- **Forms**: React Hook Form with Zod validation schemas
- **Error Handling**: Error boundaries and toast notifications

## 🚨 Important Notes

### Migration Status
- **Active Development**: New features go in `frontend/` and `backend/`
- **Legacy Backend**: FastAPI code in `legacy/` is deprecated, do not modify
- **FastAPI-First**: Use FastAPI backend over other implementations

### Common Issues & Solutions
- **Port conflicts**: Run `make clear-ports` to free development ports
- **Backend startup**: Ensure Python virtual environment is activated
- **Build errors**: Clear Next.js cache with `yarn workspace web clean`
- **Workspace issues**: Reinstall dependencies with `yarn install:all`

### Quality Gates
- **TypeScript**: Strict mode enabled, no `any` types allowed
- **Linting**: ESLint + Prettier, enforced in CI/CD
- **Testing**: Jest for unit tests, pytest for backend tests
- **API Documentation**: FastAPI auto-generates OpenAPI docs

### External Integrations
- **Production API**: https://api.bitebase.app for restaurant data
- **Maps**: Uses Leaflet for interactive location intelligence
- **AI Services**: Integrated via backend with external AI APIs
- **Analytics**: Real-time data streaming and visualization

This codebase follows modern monorepo patterns with FastAPI-first architecture. Use `make dev` to start the full development environment with both frontend and FastAPI backend.