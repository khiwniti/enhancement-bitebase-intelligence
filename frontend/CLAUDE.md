# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend Development (Next.js 15)
```bash
# Development
npm run dev          # Start dev server on port 50513 with turbopack
npm run build        # Production build with optimizations
npm run start        # Production server on port 52580
npm run staging      # Staging server on port 12001

# Code Quality
npm run lint         # ESLint validation
npm run lint:fix     # Auto-fix ESLint issues
npm run check-types  # TypeScript type checking
npm run clean        # Clean build artifacts and cache

# Testing
npm test             # Run Jest tests with 10s timeout
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Deployment
npm run deploy       # Deploy to Vercel production
npm run deploy:beta  # Deploy to beta environment
npm run preview      # Preview deployment
```

### Backend Development (FastAPI)
The backend is located in `../backend/` and uses FastAPI with Python. Key commands:
```bash
# From backend directory
pip install -r requirements.txt  # Install dependencies
python -m app.main              # Run FastAPI server on port 8000
pytest                          # Run backend tests
```

## Architecture Overview

### Frontend Architecture (Next.js 15)
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict type checking
- **State Management**: Zustand for global state, TanStack Query for server state
- **UI Components**: Radix UI primitives with Tailwind CSS
- **Charts & Visualization**: Chart.js, Recharts, D3.js with custom chart components
- **Maps**: Mapbox GL and Leaflet with React wrappers
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Custom AuthContext with JWT tokens

### Backend Architecture (FastAPI)
- **Framework**: FastAPI with async/await patterns
- **Database**: SQLAlchemy with PostgreSQL/SQLite support
- **Authentication**: JWT-based authentication system
- **Location Services**: GeoAlchemy2 for geospatial operations
- **AI Integration**: Various AI/ML services for restaurant intelligence

### Key Component Categories

#### Dashboard Components (`src/components/dashboard/`)
- **BusinessIntelligenceHub**: Main BI dashboard with real-time metrics
- **DashboardBuilder**: Drag-and-drop dashboard construction
- **Tabs**: Specialized analysis tabs (AI Insights, Analytics, Location Intelligence, etc.)

#### Charts System (`src/components/charts/`)
- **Core**: BaseChart, ChartRegistry, ChartContainer for unified chart handling
- **Basic Charts**: LineChart, BarChart, PieChart, DoughnutChart, AreaChart
- **Advanced Charts**: TreeMapChart for hierarchical data
- **Providers**: Theme and CrossFilter providers for chart coordination
- **Hooks**: useChart hook for chart state management

#### AI Components (`src/components/ai/`)
- **EnhancedBiteBaseAI**: Main AI chat interface
- **AIResearchAgentPage**: Market research and analysis interface
- **FloatingChatbot**: Persistent chat widget

#### Location Intelligence (`src/components/location/`)
- **InteractiveMap**: Mapbox-based restaurant mapping
- **LocationIntelligencePage**: Geospatial analysis dashboard
- **MarketResearchPanel**: Location-based market analysis

#### Natural Language Query (`src/components/nl-query/`)
- **NaturalLanguageQueryInterface**: Main NL query processing
- **Components**: VoiceInput, QueryResults, ConfidenceIndicator, QuerySuggestions
- **Hooks**: useNLQuery for query state management

### Data Flow Architecture

#### API Communication
- **Frontend**: Next.js → API Client (`src/lib/api-client.ts`) → Backend FastAPI
- **Backend**: FastAPI → Services → Database/External APIs
- **Real-time**: WebSocket connections for live updates

#### API Client Structure
The `apiClient` in `src/lib/api-client.ts` provides methods for:
- **Restaurants**: CRUD operations, nearby search, location-based filtering
- **Locations**: Analysis, scoring, comparison of locations
- **AI**: Market analysis, chat interface, predictions, insights generation
- **NL Query**: Natural language processing, suggestions, validation
- **Data Sources**: External integrations management
- **Reports**: Template-based and custom report generation

### Configuration & Environment

#### Development Configuration
- **API Proxy**: Next.js rewrites `/api/*` to backend at `http://localhost:56223` or `NEXT_PUBLIC_API_URL`
- **Performance**: Turbopack enabled with optimized package imports
- **Bundle Optimization**: Custom webpack config with vendor, charts, UI, and maps chunk splitting
- **Security Headers**: Strict security headers including CSP, HSTS, XSS protection

#### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:56223           # Backend API URL
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here       # Google Maps integration
```

### Testing Strategy

#### Jest Configuration
- **Environment**: jsdom for React component testing
- **Setup**: `jest.setup.js` with testing library extensions
- **Coverage**: Components, hooks, and lib files with detailed reporting
- **Module Mapping**: `@/*` aliases resolved to `src/*`
- **Timeout**: 10 second default timeout for complex operations

#### Test Categories
- **Component Tests**: React Testing Library for UI components
- **Hook Tests**: Custom hook testing with renderHook
- **Integration Tests**: API client and service integration
- **Coverage Targets**: Components, hooks, utilities, excluding type definitions

### Performance Optimizations

#### Next.js Optimizations
- **Turbopack**: Enabled for faster development builds
- **Package Imports**: Optimized imports for major UI and visualization libraries
- **Image Optimization**: AVIF/WebP formats with caching and CDN support
- **Bundle Splitting**: Strategic code splitting for vendor, charts, UI, and maps
- **Compression**: GZip middleware with size thresholds

#### Runtime Performance
- **Lazy Loading**: Components and routes loaded on demand
- **Memoization**: React.memo and useMemo for expensive computations
- **Virtual Scrolling**: React Virtualized for large data sets
- **Caching**: TanStack Query for intelligent server state caching

### Important Technical Patterns

#### Component Architecture
- **Compound Components**: Complex components broken into sub-components (e.g., charts, dashboards)
- **Provider Pattern**: Context providers for theme, auth, and global state
- **Hook Pattern**: Custom hooks for reusable logic (useChart, useNLQuery, etc.)
- **Render Props**: Flexible component composition patterns

#### Type Safety
- **Strict TypeScript**: Strict mode enabled with comprehensive type definitions
- **API Types**: Centralized type definitions in `src/types/` for API responses
- **Form Validation**: Zod schemas for runtime type validation
- **Component Props**: Detailed prop type definitions with JSDoc

#### Error Handling
- **API Errors**: Centralized error handling in API client with custom APIError class
- **Form Errors**: React Hook Form integration with validation error display
- **Boundary Components**: Error boundaries for graceful failure handling
- **Toast Notifications**: User-friendly error and success messaging

### External Integrations

#### Mapping & Location
- **Mapbox GL**: Primary mapping library with custom styling
- **Leaflet**: Fallback mapping solution with React integration
- **Geospatial APIs**: Location intelligence and geocoding services

#### AI & Analytics
- **Backend AI Services**: Chat, market analysis, predictions, insights generation
- **Chart Libraries**: Chart.js, Recharts, D3.js for different visualization needs
- **Real-time Analytics**: WebSocket connections for live data updates

#### Payment & Business
- **Stripe Integration**: Payment processing with React components
- **Form Handling**: React Hook Form with Zod validation
- **File Processing**: Upload and export capabilities for reports

### Development Guidelines

#### Code Organization
- **Feature-based Structure**: Components organized by domain (dashboard, ai, location, etc.)
- **Shared Components**: Reusable UI components in `src/components/ui/`
- **Custom Hooks**: Domain-specific hooks in component directories
- **Utilities**: Shared utilities in `src/lib/` and `src/utils/`

#### Styling Patterns
- **Tailwind CSS**: Utility-first CSS framework with custom theme
- **CSS Modules**: Component-specific styles when needed
- **Responsive Design**: Mobile-first responsive patterns
- **Theme System**: Consistent color, typography, and spacing systems

#### State Management
- **Local State**: useState and useReducer for component state
- **Global State**: Zustand for application-wide state
- **Server State**: TanStack Query for API data caching and synchronization
- **Form State**: React Hook Form for complex form management