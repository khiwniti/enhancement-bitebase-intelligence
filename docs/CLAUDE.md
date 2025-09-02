# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Project Setup & Development
```bash
# Full stack development using Makefile (recommended)
make install          # Install all dependencies (frontend + functions + Firebase)
make dev              # Start frontend + Firebase emulators
make stop             # Stop all running services
make status           # Check service status

# Alternative: using npm scripts from root
npm run dev           # Start frontend + Firebase emulators
npm run install:all   # Install all dependencies (root + frontend + functions)

# Individual services
make run-frontend     # Start frontend only (Next.js on port 5000)
make run-functions    # Start Firebase functions emulator only (port 5001)
npm run dev:firebase  # Start Firebase emulators only
```

### Frontend Commands (Next.js 15)
```bash
cd frontend
npm run dev           # Development server on port 5000
npm run build         # Production build  
npm run start         # Production server
npm run lint          # ESLint validation
npm run lint:fix      # Auto-fix ESLint issues
npm run type-check    # TypeScript type checking
npm test              # Run Jest tests
npm run test:coverage # Generate test coverage report
npm run clean         # Clean build artifacts
npm run analyze       # Bundle analysis
```

### Firebase Functions Commands
```bash
cd functions
npm install           # Install functions dependencies
npm run serve         # Start functions emulator locally
npm run deploy        # Deploy functions to Firebase
npm run logs          # View function logs
npm run build         # Build functions for deployment
```

### Backend Commands (FastAPI - Legacy)
```bash
cd backend
./run.sh              # Start development server
python -m app.main    # Alternative way to start server
python -m pytest     # Run backend tests
./install.sh          # Install dependencies
```

### Firebase Development
```bash
# Firebase setup and deployment
npm run firebase:setup      # Automated Firebase project setup
npm run firebase:emulators  # Start Firebase emulators
npm run firebase:deploy     # Deploy all services to production

# Environment-specific deployments
npm run firebase:deploy:dev      # Deploy to development
npm run firebase:deploy:staging  # Deploy to staging  
npm run firebase:deploy:prod     # Deploy to production

# Service-specific deployments
npm run firebase:functions    # Deploy functions only
npm run firebase:hosting      # Deploy hosting only
npm run firebase:dataconnect # Deploy Data Connect only

# Data Connect
npm run dataconnect:generate  # Generate SDK from GraphQL schema
```

## Architecture Overview

### Full Stack Architecture
This is a **monorepo** containing frontend and Firebase services:

- **Frontend**: Next.js 15 with TypeScript in `frontend/` directory
- **Firebase Services**: Authentication, Firestore, Functions, Hosting, Data Connect
- **Database**: Firebase Firestore + PostgreSQL via Data Connect
- **Functions**: Node.js serverless functions in `functions/` directory
- **Legacy Backend**: FastAPI with Python in `backend/` directory (being transitioned to Firebase Functions)
- **API Integration**: Connected to production BiteBase API at `https://api.bitebase.app`

### Frontend Architecture (Next.js 15)
- **Framework**: Next.js 15 with App Router, TypeScript strict mode
- **UI Framework**: Tailwind CSS v4 with Radix UI components
- **State Management**: Zustand for global state, TanStack Query for server state
- **Charts**: Chart.js, Recharts, D3.js for data visualization
- **Maps**: Mapbox GL and Leaflet with React wrappers
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest + React Testing Library

### Backend Architecture (FastAPI)
- **Framework**: FastAPI with async/await patterns
- **Database**: SQLAlchemy 2.0 with PostgreSQL/SQLite support
- **Authentication**: JWT-based with bcrypt password hashing
- **API Structure**: Modular endpoint organization in `app/api/v1/endpoints/`
- **Services**: Business logic separated into `app/services/`
- **Models**: SQLAlchemy models in `app/models/`
- **Schemas**: Pydantic schemas in `app/schemas/`

### Firebase Architecture
- **Authentication**: Email/password, Google, social providers
- **Firestore**: User data, sessions, application state
- **Data Connect**: PostgreSQL with GraphQL API for restaurant data
- **Functions**: Node.js serverless functions in `functions/` directory
- **Hosting**: Static hosting for frontend with automatic CDN
- **Storage**: File uploads and user-generated content

### Key Component Structure

#### Frontend Component Organization (`frontend/src/components/`)
- **ai/**: AI chat interfaces, research agents, floating chatbot
- **analytics/**: Analytics dashboards and workbenches  
- **charts/**: Comprehensive chart system with providers and hooks
- **dashboard/**: Business intelligence hub and dashboard builder
- **location/**: Interactive maps and location intelligence
- **nl-query/**: Natural language query interfaces
- **auth/**: Authentication components and route protection
- **ui/**: Reusable UI components (Radix-based)

#### Backend API Structure (`backend/app/api/v1/endpoints/`)
- **ai.py**: AI services and market analysis
- **analytics.py**: Data analytics and insights
- **locations.py**: Location-based services
- **restaurants.py**: Restaurant data management
- **nl_query.py**: Natural language query processing
- **dashboard.py**: Dashboard management
- **auth/**: Authentication endpoints

### Database & Data Flow

#### API Communication Pattern
```
Frontend (Next.js) → Firebase SDK → Firebase Services (Auth, Firestore, Functions)
                  ↗ API Client → Firebase Functions → Data Connect (PostgreSQL)
                  ↗ External APIs (BiteBase production)
```

#### Key API Client (`frontend/src/lib/api-client.ts`)
Provides methods for:
- **Restaurants**: CRUD operations, search, location filtering
- **Locations**: Analysis, scoring, geographical operations
- **AI Services**: Market analysis, chat interface, insights
- **Natural Language**: Query processing and suggestions
- **Analytics**: Dashboard data and metrics

### Development Environment

#### Port Configuration
- **Frontend**: http://localhost:5000 (Next.js development)
- **Firebase Functions**: http://localhost:5001 (emulator)
- **Firebase UI**: http://localhost:4001 (emulator dashboard)
- **Firebase Auth**: http://localhost:9099 (emulator)
- **Firestore**: http://localhost:8081 (emulator)
- **Firebase Hosting**: http://localhost:5010 (emulator)
- **Firebase Storage**: http://localhost:9199 (emulator)
- **Data Connect**: http://localhost:9399 (emulator)
- **Firebase Hub**: http://localhost:4402 (emulator)
- **Firebase Logging**: http://localhost:4502 (emulator)
- **PostgreSQL**: port 5432 (Data Connect)
- **Production API**: https://api.bitebase.app (external)
- **Legacy Backend**: http://localhost:8000 (FastAPI - deprecated)

#### Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here

# Legacy Backend (deprecated)
DATABASE_URL=postgresql://user:pass@localhost:5432/bitebase_intelligence
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
```

#### Firebase Integration
Next.js integrates directly with Firebase SDK for authentication, Firestore operations, and function calls. Firebase hosting handles static serving and API routing automatically.

### Testing Strategy

#### Frontend Testing (Jest + React Testing Library)
- **Component Tests**: UI component behavior and rendering
- **Hook Tests**: Custom hooks with renderHook utility
- **Integration Tests**: API client and service integration
- **Coverage**: Components, hooks, utilities (excluding type definitions)

#### Backend Testing (Pytest)
- **API Tests**: Endpoint behavior and response validation
- **Service Tests**: Business logic verification
- **Database Tests**: Model and query testing
- **Authentication Tests**: JWT and security validation

### Performance & Optimization

#### Frontend Optimizations
- **Turbopack**: Enabled for faster development builds
- **Bundle Splitting**: Vendor, charts, UI, and maps chunks
- **Lazy Loading**: Components and routes loaded on demand
- **Image Optimization**: AVIF/WebP with Next.js optimization
- **Caching**: TanStack Query for intelligent server state caching

#### Firebase Optimizations
- **Auto-scaling**: Firebase Functions scale automatically based on demand
- **Global CDN**: Firebase Hosting with automatic edge caching
- **Real-time Updates**: Firestore real-time listeners for live data
- **Connection Pooling**: Data Connect optimized PostgreSQL connections
- **Caching**: Firebase Functions caching and Firestore offline support

### Key Development Patterns

#### Code Organization
- **Feature-based Structure**: Components organized by domain
- **Shared Components**: Reusable UI in `frontend/src/components/ui/`
- **Custom Hooks**: Domain-specific hooks co-located with components
- **Service Layer**: Business logic separated from API endpoints
- **Type Safety**: Comprehensive TypeScript with strict mode

#### State Management Patterns
- **Local State**: useState/useReducer for component state
- **Global State**: Zustand stores for application-wide state
- **Server State**: TanStack Query for API data with caching
- **Form State**: React Hook Form for complex form management

#### Error Handling
- **API Errors**: Centralized error handling in API client
- **Form Validation**: Zod schemas with React Hook Form integration
- **Boundary Components**: Error boundaries for graceful failures
- **Toast Notifications**: User-friendly error and success messaging

### External Integrations

#### Mapping & Location Services
- **Mapbox GL**: Primary mapping with custom styling
- **Leaflet**: Fallback mapping solution
- **Geospatial APIs**: Location intelligence and geocoding

#### AI & Analytics
- **Backend AI Services**: Chat, market analysis, predictions
- **Chart Libraries**: Multiple libraries for different visualization needs
- **Real-time Analytics**: WebSocket connections for live updates

### Production Deployment

#### Firebase Deployment
The project uses Firebase for production deployment:
- **Hosting**: Automatic CDN and global edge caching
- **Functions**: Auto-scaling serverless execution
- **Database**: Managed Firestore and Data Connect PostgreSQL
- **Monitoring**: Built-in Firebase console monitoring and logging
- **Security**: Firebase security rules and IAM

#### Deployment Commands
```bash
# Deploy all services
npm run firebase:deploy

# Environment-specific deployments
npm run firebase:deploy:dev
npm run firebase:deploy:staging
npm run firebase:deploy:prod

# Service-specific deployments
npm run firebase:functions
npm run firebase:hosting
npm run firebase:dataconnect
```

#### Legacy Docker Setup (Deprecated)
The project includes legacy Docker setup for FastAPI backend:
- **Application Stack**: Frontend (Nginx) + Backend (FastAPI) + Database (PostgreSQL)
- **Monitoring**: Prometheus + Grafana for metrics
- **Caching**: Redis for session and data caching

### Troubleshooting

#### Firebase Emulator Issues
```bash
# IPv6 connectivity warnings (fixed in firebase.json)
# If you see "address not available ::1" errors, emulators are now configured to use 127.0.0.1

# Clear ports if emulators won't start
make clear-ports

# Restart emulators
make stop
make dev

# Check Firebase CLI version (should be latest)
firebase --version
npm install -g firebase-tools@latest
```

#### Port Conflicts
```bash
# Check what's using specific ports
lsof -i :5000 -i :5001 -i :4001 -i :8081 -i :5010
make status

# Force kill processes on development ports
make clear-ports

# Note: Port assignments avoid conflicts:
# - Firebase UI: 4001 (was 4000 - conflicted)
# - Firestore: 8081 (was 8080 - conflicted)  
# - Firebase hosting: 5010 (avoids Next.js dev server on 5000)
```

#### Build Issues
```bash
# Clear Next.js cache
cd frontend && npm run clean

# Reinstall all dependencies
make install

# Type check frontend
cd frontend && npm run type-check
```

### Important Notes
- **Firebase-First Architecture**: Project is transitioning from FastAPI backend to Firebase Functions
- **Development Workflow**: Use `make dev` for full Firebase + frontend development environment
- **Port Conflicts**: Firebase emulators may show IPv6 warnings (use 127.0.0.1 instead of localhost if needed)
- **Legacy Backend**: FastAPI backend in `backend/` directory is being phased out
- **Component Architecture**: The `frontend/CLAUDE.md` contains detailed component architecture for frontend work
- **Environment Setup**: Follow `FIREBASE_SETUP.md` for complete Firebase configuration
- **Use the Makefile**: Consistent development workflow with Firebase integration