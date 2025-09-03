# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Essential Commands

| Task | Command | Notes |
|------|---------|-------|
| **Development** | `make dev` OR `yarn dev` | Start web app + Firebase emulators |
| **Install All** | `make install` OR `yarn install:all` | Install all dependencies (workspace + apps) |
| **Build** | `yarn build` | Build all workspaces |
| **Test** | `yarn test` | Run tests across all workspaces |
| **Lint** | `yarn lint` | Lint all workspaces |
| **Type Check** | `yarn type-check` | TypeScript validation |
| **Clean** | `yarn clean` | Clean all build artifacts |
| **Stop Services** | `make stop` OR `yarn stop` | Stop all running services |
| **Check Status** | `make status` OR `yarn status` | Check service status |

### Firebase Commands

| Task | Command | Notes |
|------|---------|-------|
| **Setup Firebase** | `yarn firebase:setup` | Initial Firebase configuration |
| **Start Emulators** | `yarn dev:firebase` | Firebase emulators only |
| **Deploy All** | `yarn firebase:deploy` | Deploy to production |
| **Deploy Functions** | `yarn firebase:functions` | Deploy functions only |
| **Data Connect** | `yarn dataconnect:generate` | Generate SDK from schema |

### Individual App Commands

```bash
# Web app (Next.js 15)
cd apps/web
yarn dev          # Development server (port 5000)
yarn build        # Production build
yarn lint         # ESLint validation
yarn type-check   # TypeScript checking

# Firebase Functions
cd apps/functions
yarn serve        # Local emulator
yarn deploy       # Deploy to Firebase
```

## 🏗️ Architecture Overview

### Monorepo Structure
```
enhancement-bitebase-intelligence/
├── 📁 apps/                    # Applications
│   ├── 📁 web/                 # Next.js 15 frontend
│   └── 📁 functions/           # Firebase Functions
├── 📁 packages/                # Shared packages (future)
├── 📁 services/                # External services
│   └── 📁 database/            # Firebase Data Connect + PostgreSQL
├── 📁 tools/                   # Development tools & scripts
├── 📁 docs/                    # Documentation
├── 📁 legacy/                  # Legacy FastAPI backend (deprecated)
└── Root configs (package.json, firebase.json, Makefile)
```

### Frontend Architecture (apps/web/)
- **Framework**: Next.js 15 with App Router, TypeScript strict mode
- **UI**: Tailwind CSS v3, Radix UI components, Framer Motion
- **State**: TanStack Query for server state, React Hook Form for forms
- **Firebase**: Authentication, Firestore, Functions integration
- **Maps**: Leaflet with React wrappers for location intelligence
- **Structure**: Feature-based organization in `src/features/`

### Backend Architecture
- **Primary**: Firebase Functions (Node.js 20) in `apps/functions/`
- **Database**: Firebase Firestore + PostgreSQL via Data Connect
- **Authentication**: Firebase Auth with social providers
- **Legacy**: FastAPI backend in `legacy/` (being phased out)

### Key Frontend Features Organization
```
apps/web/src/
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
- **Firebase Functions**: http://localhost:5001 (emulator)
- **Firebase UI**: http://localhost:4001 (emulator dashboard)
- **Firebase Auth**: http://localhost:9099 (emulator)
- **Firestore**: http://localhost:8081 (emulator)
- **Data Connect**: http://localhost:9399 (emulator)

### Key Technologies
- **Frontend**: Next.js 15, React 18, TypeScript 5.6, Tailwind CSS 3.4
- **Backend**: Firebase Functions (Node.js 20), Firebase Firestore
- **Database**: PostgreSQL via Firebase Data Connect
- **Build**: Yarn workspaces, Turbopack (dev), Firebase CLI
- **Testing**: Jest + React Testing Library

### Firebase Integration Pattern
```
Next.js App ←→ Firebase SDK ←→ Firebase Services
                              ├── Authentication
                              ├── Firestore
                              ├── Functions
                              └── Data Connect (PostgreSQL)
```

## 🎯 Key Development Patterns

### Workspace Commands
- Use **yarn** (not npm) for consistency with workspace configuration
- Root-level commands affect all workspaces: `yarn lint`, `yarn build`, `yarn test`
- App-specific commands: `yarn workspace web dev`, `yarn workspace functions serve`

### File Organization
- **Feature-first**: Components organized by business domain, not technical layers
- **Shared utilities**: Common code in `apps/web/src/shared/`
- **API integration**: Firebase SDK + REST API client in `apps/web/src/shared/lib/`
- **Type safety**: Comprehensive TypeScript with strict mode enabled

### Firebase Development
- **Emulators**: Always use emulators for local development via `make dev`
- **Functions**: Write in TypeScript, auto-compiled to JavaScript
- **Data Connect**: Use GraphQL schema-first approach with generated SDK
- **Firestore**: Real-time listeners for live data updates

### Component Patterns
- **UI Components**: Radix UI primitives with Tailwind styling
- **State Management**: TanStack Query for server state, local state for UI
- **Forms**: React Hook Form with Zod validation schemas
- **Error Handling**: Error boundaries and toast notifications

## 🚨 Important Notes

### Migration Status
- **Active Development**: New features go in `apps/web/` and `apps/functions/`
- **Legacy Backend**: FastAPI code in `legacy/` is deprecated, do not modify
- **Firebase-First**: Use Firebase services over custom backend implementations

### Common Issues & Solutions
- **Port conflicts**: Run `make clear-ports` to free development ports
- **Emulator startup**: Firebase emulators use 127.0.0.1 (not localhost) to avoid IPv6 issues
- **Build errors**: Clear Next.js cache with `yarn workspace web clean`
- **Workspace issues**: Reinstall dependencies with `yarn install:all`

### Quality Gates
- **TypeScript**: Strict mode enabled, no `any` types allowed
- **Linting**: ESLint + Prettier, enforced in CI/CD
- **Testing**: Jest for unit tests, coverage reports generated
- **Firebase**: Security rules for Firestore and Storage

### External Integrations
- **Production API**: https://api.bitebase.app for restaurant data
- **Maps**: Uses Leaflet for interactive location intelligence
- **AI Services**: Integrated via Firebase Functions with external AI APIs
- **Analytics**: Real-time data streaming and visualization

This codebase follows modern monorepo patterns with Firebase-first architecture. Use `make dev` to start the full development environment with both frontend and Firebase emulators.