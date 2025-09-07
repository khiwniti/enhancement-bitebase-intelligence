# BiteBase Intelligence - Project Structure

## 📁 Project Overview

BiteBase Intelligence is a comprehensive restaurant analytics and management platform built as a full-stack application with modern architecture. This document provides a detailed breakdown of the project structure and organization.

---

## 🏗️ Root Directory Structure

```
enhancement-bitebase-intelligence/
├── 📁 frontend/                 # Next.js React frontend application
├── 📁 backend/                  # FastAPI Python backend application  
├── 📁 backend-workers/          # Cloudflare Workers edge computing
├── 📁 docs/                     # Documentation and guides
├── 📁 tools/                    # Development tools and scripts
├── 📁 .github/                  # GitHub workflows and templates
├── 📄 README.md                 # Main project documentation
├── 📄 Makefile                  # Build and deployment commands
├── 📄 docker-compose.yaml       # Multi-container orchestration
├── 📄 package.json              # Project metadata and scripts
└── 📄 rundev                    # Development environment script
```

---

## 🎨 Frontend Architecture (`/frontend/`)

### Core Configuration
```
frontend/
├── 📄 package.json              # Dependencies and build scripts
├── 📄 tsconfig.json             # TypeScript configuration
├── 📄 postcss.config.js         # PostCSS styling configuration
├── 📄 next.config.js            # Next.js framework configuration
└── 📄 tailwind.config.js        # Tailwind CSS utility configuration
```

### Application Structure
```
frontend/src/
├── 📁 app/                      # Next.js App Router pages
│   ├── 📁 [locale]/            # Internationalized routes
│   │   ├── 📁 auth/            # Authentication pages
│   │   │   ├── login/          # User login interface
│   │   │   ├── signup/         # User registration
│   │   │   └── forgot-password/ # Password recovery
│   │   ├── 📁 dashboard/        # Main dashboard interface
│   │   ├── 📁 analytics/        # Analytics and reporting
│   │   ├── 📁 ai-center/        # AI-powered features
│   │   ├── 📁 location-center/  # Location management
│   │   ├── 📁 growth-studio/    # Business growth tools
│   │   ├── 📁 restaurant-management/ # Restaurant operations
│   │   ├── 📁 reports/          # Report generation and viewing
│   │   └── 📁 settings/         # User and system settings
│   └── 📁 api/                  # API routes and endpoints
│       ├── 📁 ai/              # AI service integrations
│       ├── 📁 location/        # Location services
│       └── 📁 restaurants/     # Restaurant data management
```

### Feature Modules
```
frontend/src/features/
├── 📁 ai-assistant/            # AI chatbot and assistance
├── 📁 analytics/               # Data visualization and metrics
│   └── 📁 components/         # Reusable analytics components
├── 📁 dashboard/               # Main dashboard functionality
├── 📁 location-intelligence/   # Geographic and location features
└── 📁 restaurant-management/   # Restaurant operational tools
```

### Internationalization (i18n)
```
frontend/src/i18n/
├── 📄 config.ts               # i18n configuration and setup
├── 📄 hooks.ts                # Translation hooks and utilities
├── 📄 types.ts                # TypeScript type definitions
├── 📄 validation.ts           # Language validation logic
├── 📄 lazy-loader.ts          # Dynamic translation loading
├── 📁 components/             # Internationalization UI components
└── 📁 locales/                # Translation files by language
    ├── 📁 en/                 # English translations
    ├── 📁 th/                 # Thai translations  
    ├── 📁 zh/                 # Chinese translations
    ├── 📁 ja/                 # Japanese translations
    ├── 📁 ko/                 # Korean translations
    ├── 📁 fr/                 # French translations
    ├── 📁 de/                 # German translations
    ├── 📁 es/                 # Spanish translations
    ├── 📁 it/                 # Italian translations
    ├── 📁 pt/                 # Portuguese translations
    └── 📁 ar/                 # Arabic translations
```

### Shared Libraries
```
frontend/src/shared/
├── 📁 components/             # Reusable UI components
│   ├── 📁 ui/                # Base UI component library
│   └── 📁 map/               # Map and geographic components
├── 📁 hooks/                 # Custom React hooks
├── 📁 lib/                   # Core utilities and libraries
│   ├── 📁 ai/               # AI integration utilities
│   ├── 📁 api/              # API client and request handling
│   ├── 📁 data/             # Data processing and management
│   ├── 📁 maps/             # Map services and utilities
│   └── 📁 providers/        # React context providers
├── 📁 types/                # TypeScript type definitions
└── 📁 services/             # External service integrations
```

---

## 🔧 Backend Architecture (`/backend/`)

### Core Application Structure
```
backend/
├── 📄 main.py                 # FastAPI application entry point
├── 📄 requirements.txt        # Python dependencies
├── 📄 pytest.ini            # Test configuration
└── 📁 app/                   # Main application package
```

### API Layer
```
backend/app/api/
├── 📁 auth/                  # Authentication and authorization
│   ├── admin.py             # Admin authentication
│   └── auth.py              # User authentication
└── 📁 v1/                    # API version 1 endpoints
    ├── api.py               # Main API router
    └── 📁 endpoints/        # Individual endpoint modules
        ├── admin.py         # Administrative operations
        ├── advanced_ai.py   # AI-powered features
        ├── ai.py            # Basic AI services
        ├── analytics.py     # Data analytics endpoints
        ├── api_proxy.py     # External API proxying
        ├── campaign_management.py # Marketing campaigns
        ├── collaboration.py # Team collaboration features
        ├── connectors.py    # Data source connections
        ├── dashboards.py    # Dashboard management
        ├── enhanced_dashboards.py # Advanced dashboard features
        ├── insights.py      # Business insights generation
        ├── location_intelligence.py # Location-based analytics
        ├── locations.py     # Location management
        ├── menu.py          # Menu management
        ├── multi_location.py # Multi-location operations
        ├── nl_query.py      # Natural language queries
        ├── notifications.py # Notification system
        ├── payments.py      # Payment processing
        ├── performance.py   # Performance monitoring
        ├── place_intelligence.py # Place-based insights
        ├── pos_integration.py # POS system integration
        ├── price_intelligence.py # Pricing analytics
        ├── product_intelligence.py # Product insights
        ├── promotion_intelligence.py # Promotional analytics
        ├── realtime_analytics.py # Real-time data processing
        ├── reports.py       # Report generation
        ├── restaurant_management.py # Restaurant operations
        ├── restaurants.py   # Restaurant data management
        ├── search.py        # Search functionality
        ├── security.py      # Security operations
        └── websocket.py     # WebSocket connections
```

### Core Services
```
backend/app/core/
├── auth.py                   # Authentication logic
├── config.py                 # Application configuration
├── database.py               # Database connections
├── dependencies.py           # FastAPI dependencies
├── enhanced_auth.py          # Advanced authentication
├── enhanced_dependencies.py  # Enhanced dependency injection
├── exceptions.py             # Custom exception handling
├── logging.py                # Logging configuration
├── monitoring.py             # Application monitoring
└── security.py               # Security utilities
```

### Business Logic Services
```
backend/app/services/
├── 📁 ai/                    # AI and machine learning services
├── 📁 analytics/             # Data analytics processing
├── 📁 cache/                 # Caching layer services
├── 📁 campaign/              # Campaign management logic
├── 📁 collaboration/         # Team collaboration features
├── 📁 connectors/            # External data connectors
│   ├── 📁 base/             # Base connector interfaces
│   ├── 📁 management/       # Connection management
│   ├── 📁 nosql/            # NoSQL database connectors
│   ├── 📁 registry/         # Connector registry
│   └── 📁 sql/              # SQL database connectors
├── 📁 dashboard/             # Dashboard services
├── 📁 insights/              # Business insights engine
├── 📁 location/              # Location-based services
├── 📁 menu/                  # Menu management services
├── 📁 monitoring/            # System monitoring
├── 📁 multi_location/        # Multi-location management
├── 📁 nl_query/              # Natural language processing
├── 📁 optimization/          # Performance optimization
├── 📁 performance/           # Performance monitoring
├── 📁 pos/                   # POS system integration
├── 📁 product/               # Product management
├── 📁 realtime/              # Real-time processing
├── 📁 restaurant/            # Restaurant operations
├── 📁 security/              # Security services
├── 📁 visualization/         # Data visualization
└── 📁 wongnai/               # Wongnai API integration
```

### Data Models and Schemas
```
backend/app/models/           # SQLAlchemy database models
backend/app/schemas/          # Pydantic data validation schemas
backend/app/utils/            # Utility functions and helpers
```

### Testing
```
backend/tests/
├── 📁 integration/          # Integration test suites
├── test_api_endpoints.py    # API endpoint testing
└── test_services.py         # Service layer testing
```

---

## ☁️ Edge Computing (`/backend-workers/`)

### Cloudflare Workers Structure
```
backend-workers/
├── 📄 wrangler.toml          # Cloudflare Workers configuration
├── 📄 package.json           # Worker dependencies
├── 📁 src/                   # Worker source code
│   ├── 📁 auth/             # Authentication middleware
│   ├── 📁 routes/           # API route handlers
│   └── 📁 services/         # Edge computing services
├── 📁 migrations/            # Database migration scripts
└── 📁 bitebase-intelligence/ # Worker application
    ├── 📁 src/              # Main application code
    ├── 📁 test/             # Test suites
    └── 📁 public/           # Static assets
```

---

## 📚 Documentation (`/docs/`)

### Organized Documentation Structure
```
docs/
├── 📄 README.md                           # Documentation index
├── 📄 BiteBase_Accessibility_Architecture.md # Accessibility guidelines
├── 📄 COMPONENT_PATTERNS.md               # UI component patterns
├── 📄 PRODUCTION_READY_CHECKLIST.md       # Production deployment checklist
├── 📁 api/                                # API documentation
│   ├── README.md                         # API overview
│   └── API_DESIGN.md                     # API design principles
├── 📁 backend/                            # Backend documentation
│   └── routing_analysis.md               # Backend routing analysis
├── 📁 deployment/                         # Deployment guides
│   └── DEPLOYMENT.md                     # Deployment instructions
├── 📁 development/                        # Development guides
│   └── getting-started.md                # Development setup
└── 📁 security/                           # Security documentation
    └── SECURITY_ANALYSIS.md              # Security analysis and best practices
```

---

## 🛠️ Development Tools (`/tools/`)

### Development Utilities
```
tools/
├── 📁 configs/               # Configuration templates
└── 📁 scripts/               # Development and deployment scripts
    ├── create-feature.js     # Feature scaffold generator
    └── load_testing.py       # Performance testing tools
```

---

## 🔧 DevOps and CI/CD (`/.github/`)

### GitHub Automation
```
.github/
└── 📁 workflows/            # GitHub Actions workflows
    └── (workflow files)     # Automated testing and deployment
```

---

## 📋 Key Technologies and Architecture Decisions

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for utility-first styling
- **Internationalization**: Custom i18n implementation with 11 languages
- **State Management**: React hooks and context
- **UI Components**: Custom component library

### Backend Stack
- **Framework**: FastAPI for high-performance API
- **Language**: Python 3.9+ with type hints
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT-based authentication
- **API Documentation**: OpenAPI/Swagger auto-generation
- **Testing**: Pytest for comprehensive testing

### Edge Computing
- **Platform**: Cloudflare Workers for global edge deployment
- **Database**: Cloudflare D1 for edge data storage
- **Performance**: Sub-100ms response times globally

### Development Tools
- **Package Management**: npm/yarn for frontend, pip for backend
- **Code Quality**: TypeScript, Python type hints, linting
- **Testing**: Jest for frontend, pytest for backend
- **Documentation**: Markdown with automated generation

---

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/khiwniti/enhancement-bitebase-intelligence.git
   cd enhancement-bitebase-intelligence
   ```

2. **Development setup**
   ```bash
   # Install dependencies
   make install
   
   # Start development environment
   make dev
   ```

3. **Production deployment**
   ```bash
   # Build and deploy
   make deploy
   ```

---

## 📝 Notes

- This structure follows modern full-stack development best practices
- The monorepo approach allows for shared configurations and dependencies
- Internationalization is built-in with support for 11 languages
- Edge computing provides global performance optimization
- Comprehensive documentation ensures maintainability

For more detailed information about specific components, refer to the individual README files in each directory.