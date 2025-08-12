# AGENTS.md - BiteBase Intelligence Development Guide

## Build/Test Commands

### Full Stack
- `npm run dev` - Start full development stack (frontend + backend)
- `npm run build` - Build frontend for production
- `npm run test` - Run all tests (frontend + backend)
- `npm run lint` - Lint frontend code

### Frontend (from /frontend)
- `npm run dev` - Next.js dev server on port 50513
- `npm run test` - Jest tests with 10s timeout
- `npm run test:watch` - Watch mode for tests
- `npm run test -- --testNamePattern="ComponentName"` - Run single test
- `npm run lint` - ESLint validation
- `npm run check-types` - TypeScript type checking

### Backend (from /backend)
- `python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` - Dev server
- `pytest` - Run all tests
- `pytest tests/test_specific.py::test_function` - Run single test
- `pytest -m unit` - Run unit tests only

## Code Style Guidelines

### TypeScript/React Frontend
- Use strict TypeScript mode with explicit types for all functions
- Components: PascalCase, hooks: camelCase starting with 'use'
- Import order: React, external libraries, internal (@/), relative
- Use @/ path mapping: `@/components`, `@/lib`, `@/types`, `@/app`
- Error boundaries for all major components
- Tailwind CSS for styling with design system variables
- 44px minimum touch targets for accessibility

### Python/FastAPI Backend
- Use async/await for all database operations and API endpoints
- Type hints required for all function parameters and return values
- FastAPI dependencies for dependency injection
- Pydantic models for request/response validation
- Custom exceptions from app.core.exceptions for structured error handling
- SQLAlchemy ORM with async sessions
- Follow service layer pattern: routes → services → repositories

### Testing Standards
- Frontend: Jest + React Testing Library, 70% coverage minimum
- Backend: pytest with async support, test markers: unit, integration, api
- Mock external dependencies and API calls
- Test file naming: `test_*.py` (backend), `*.test.ts` (frontend)