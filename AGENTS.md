# BiteBase Intelligence 2.0 - AI Agent Rules

## Project Overview
BiteBase Intelligence 2.0 is an interactive analytics platform designed for restaurant intelligence and business insights. The system combines real-time data processing, advanced analytics, natural language querying, and interactive visualizations.

## Technology Stack
- **Backend**: FastAPI (Python) with SQLAlchemy ORM
- **Frontend**: Next.js (TypeScript) with React
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **Charts**: Custom visualization engine with D3.js/Recharts
- **Real-time**: WebSocket connections
- **AI/ML**: Custom NLP and insights engines

## Code Standards

### General Principles
- Follow clean architecture patterns
- Implement comprehensive error handling
- Use type safety throughout (TypeScript/Python type hints)
- Write self-documenting code with clear naming
- Implement proper logging and monitoring

### Backend Standards
- Use async/await for all I/O operations
- Implement dependency injection with FastAPI
- Use Pydantic models for validation
- Follow repository pattern for data access
- Implement service layer for business logic
- Add comprehensive error handling
- Use pytest for testing

### Frontend Standards
- Use TypeScript strict mode
- Implement proper component prop types
- Use React hooks for state management
- Follow Next.js App Router conventions
- Implement error boundaries
- Use Tailwind CSS utilities
- Write component tests

### Database Standards
- Use migrations for schema changes
- Implement proper indexing
- Use connection pooling
- Optimize queries for performance
- Implement soft deletes where appropriate

## Project Structure

### Backend Structure
```
backend/app/
├── api/v1/           # API endpoints
├── models/           # Database models
├── schemas/          # Pydantic schemas
├── services/         # Business logic
└── core/            # Configuration
```

### Frontend Structure
```
frontend/src/
├── app/             # Next.js app router
├── components/      # React components
├── lib/            # Utilities
└── types/          # TypeScript types
```

## Key Features

### Natural Language Query Interface
- Intent classification and entity extraction
- Natural language to SQL conversion
- Confidence scoring and query suggestions
- Voice input support

### Automated Insights Engine
- Real-time anomaly detection
- Pattern analysis and trend identification
- Automated notification system
- Predictive analytics

### Enhanced Dashboard Builder
- Drag-and-drop interface
- Real-time collaboration
- Custom widget development
- Advanced visualization options

### Data Connector Framework
- Multiple data source support
- Data transformation pipelines
- Real-time synchronization
- Schema exploration tools

## Development Guidelines

### When Adding New Features
1. Design the API endpoints first
2. Implement backend models and services
3. Create frontend components
4. Add comprehensive tests
5. Update documentation

### When Debugging Issues
1. Check logs for error patterns
2. Verify database queries and performance
3. Test API endpoints individually
4. Check frontend state management
5. Verify data flow end-to-end

### When Optimizing Performance
1. Profile database queries
2. Analyze bundle sizes
3. Implement caching strategies
4. Monitor real-time metrics
5. Optimize component rendering

## Testing Strategy
- Unit tests for all service functions
- Integration tests for API endpoints
- Component tests for React components
- E2E tests for critical user flows
- Performance tests for high-load scenarios

## Security Considerations
- JWT-based authentication
- Role-based access control
- API rate limiting
- Input validation and sanitization
- Secure database connections

## Deployment Requirements
- Docker containerization
- Environment-specific configurations
- Health check endpoints
- Monitoring and logging
- Automated CI/CD pipelines

## AI Assistant Behavior
When working on this project:
- Always consider the restaurant intelligence domain
- Focus on data accuracy and performance
- Implement user-friendly interfaces
- Ensure scalability and maintainability
- Follow existing code patterns and conventions
- Add proper error handling and logging
- Write comprehensive tests
- Update documentation as needed