# 🚀 BiteBase Intelligence 2.0

> **AI-Powered Restaurant Analytics & Location Intelligence Platform**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?style=for-the-badge&logo=python)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 🎯 **Overview**

BiteBase Intelligence 2.0 is a comprehensive restaurant analytics platform that leverages artificial intelligence to provide actionable insights for restaurant owners, investors, and industry professionals. Built with modern architecture principles and featuring a robust monorepo structure, it delivers real-time analytics, location intelligence, and multilingual support.

### **🌟 Key Features**

- **🤖 AI Market Report Agent**: Generate comprehensive market reports using natural language queries
- **🗺️ Interactive Location Analytics**: Click-to-analyze mapping with real-time business insights  
- **📊 Unified Analytics Dashboard**: Customizable interface with live data streaming and KPI tracking
- **🌐 Multilingual Support**: Full internationalization (i18n) with 10+ languages supported
- **📱 Mobile-First Design**: Responsive across all devices with touch-optimized interactions
- **⚡ Real-Time Data**: WebSocket-powered live updates and notifications
- **🔒 Enterprise Security**: Role-based access control with comprehensive audit logging

### **💼 Business Intelligence Features**

- **Restaurant Performance Analytics**: Revenue trends, customer analytics, operational metrics
- **Location Intelligence**: Market analysis, competitor insights, demographic data
- **Growth Studio**: Expansion planning, ROI analysis, market opportunity identification
- **AI-Powered Insights**: Automated report generation, predictive analytics, recommendation engine

## 📁 **Project Structure**

```
bitebase-intelligence/
├── 📁 frontend/                 # Next.js 15 frontend application
│   ├── 📁 src/
│   │   ├── 📁 app/             # App Router pages & layouts
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 features/        # Feature-based modules
│   │   ├── 📁 i18n/           # Internationalization
│   │   ├── 📁 shared/         # Shared utilities & components
│   │   └── 📁 services/       # API services & integrations
│   └── 📁 public/             # Static assets & branding
├── 📁 backend/                  # FastAPI backend services
│   ├── 📁 app/
│   │   ├── 📁 api/            # REST API endpoints
│   │   ├── 📁 core/           # Core business logic
│   │   ├── 📁 models/         # Database models
│   │   ├── 📁 schemas/        # Pydantic schemas
│   │   └── 📁 services/       # Business services
│   └── 📁 tests/              # Backend test suites
├── 📁 backend-workers/          # Background task workers
├── 📁 docs/                     # Documentation
│   ├── 📁 api/                # API documentation
│   ├── 📁 deployment/         # Deployment guides
│   ├── 📁 development/        # Development guides
│   └── 📁 security/           # Security documentation
├── 📁 tools/                    # Development utilities & scripts
└── 📄 docker-compose.yaml     # Multi-service orchestration
```

## 🚀 **Quick Start**

### **Prerequisites**

- **Node.js** >= 18.0.0
- **Python** >= 3.11
- **Yarn** >= 1.22.0
- **Docker** (optional, for containerized development)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/khiwniti/enhancement-bitebase-intelligence.git
   cd enhancement-bitebase-intelligence
   ```

2. **Install dependencies**
   ```bash
   yarn install:all
   ```

3. **Environment setup**
   ```bash
   # Frontend environment
   cp frontend/.env.example frontend/.env.local
   
   # Backend environment  
   cp backend/.env.example backend/.env
   ```

4. **Initialize database**
   ```bash
   cd backend && python init_database.py
   ```

### **Development**

Choose your preferred development mode:

**🔥 Full Stack Development**
```bash
yarn dev:all          # Frontend + Backend + Workers
```

**⚡ Quick Frontend-Only**
```bash
yarn dev               # Frontend + Backend only
```

**🎯 Individual Services**
```bash
yarn dev:web           # Frontend only
yarn dev:backend       # Backend only  
yarn dev:workers       # Workers only
```

**🐳 Docker Development**
```bash
docker-compose up --build
```

### **Available Services**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main web application |
| **Backend API** | http://localhost:8000 | REST API & Documentation |
| **Workers** | http://localhost:8001 | Background task services |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |

## 🛠️ **Technology Stack**

### **Frontend**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **State Management**: React Hooks + Context API
- **UI Components**: Custom component library with Radix UI primitives
- **Maps**: Leaflet with custom overlays
- **Charts**: Recharts + Custom visualization components
- **Internationalization**: next-intl with 10+ languages

### **Backend**
- **Framework**: FastAPI with async/await
- **Language**: Python 3.11+
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT-based with refresh tokens
- **API Documentation**: OpenAPI 3.0 with Swagger UI
- **Background Tasks**: Celery with Redis
- **WebSockets**: FastAPI WebSocket support

### **Infrastructure**
- **Containerization**: Docker & Docker Compose
- **Process Management**: PM2 for production
- **Reverse Proxy**: Nginx (production)
- **Monitoring**: Custom health checks + logging
- **Deployment**: Cloudflare Workers (optional)

## 🌐 **Internationalization**

BiteBase Intelligence supports 10+ languages with full RTL support:

- **English** (en) - Default
- **Spanish** (es) - Español  
- **French** (fr) - Français
- **German** (de) - Deutsch
- **Italian** (it) - Italiano
- **Portuguese** (pt) - Português
- **Japanese** (ja) - 日本語
- **Korean** (ko) - 한국어
- **Chinese** (zh) - 中文
- **Thai** (th) - ไทย
- **Arabic** (ar) - العربية

## 📊 **API Documentation**

The API is fully documented using OpenAPI 3.0. Access interactive documentation at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### **Key API Endpoints**

```
GET    /api/v1/restaurants/          # List restaurants with filtering
POST   /api/v1/restaurants/          # Create new restaurant
GET    /api/v1/restaurants/{id}/     # Get restaurant details
PUT    /api/v1/restaurants/{id}/     # Update restaurant
DELETE /api/v1/restaurants/{id}/     # Delete restaurant

GET    /api/v1/analytics/dashboard/  # Dashboard analytics
GET    /api/v1/analytics/reports/    # Generate reports
POST   /api/v1/ai/query/             # Natural language queries
GET    /api/v1/locations/search/     # Location intelligence
```

## 🧪 **Testing**

### **Frontend Testing**
```bash
yarn test:web          # Run frontend tests
yarn lint              # ESLint check
yarn type-check        # TypeScript validation
```

### **Backend Testing**
```bash
yarn test:backend      # Run backend tests with pytest
cd backend && python -m pytest --cov=app tests/
```

## 📦 **Deployment**

### **Production Build**
```bash
yarn build             # Build frontend for production
```

### **Docker Production**
```bash
docker-compose -f docker-compose.prod.yml up --build
```

### **Manual Deployment**
See [docs/deployment/](docs/deployment/) for detailed deployment guides:
- [Cloudflare Workers](docs/deployment/cloudflare.md)
- [Traditional VPS](docs/deployment/vps.md)
- [Docker Deployment](docs/deployment/docker.md)

## 🔐 **Security**

BiteBase Intelligence implements enterprise-grade security features:

- **Authentication**: JWT with refresh token rotation
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: AES-256 encryption for sensitive data
- **API Security**: Rate limiting, CORS, and request validation
- **Audit Logging**: Comprehensive activity tracking
- **Input Validation**: Strict schema validation on all endpoints

See [docs/security/](docs/security/) for detailed security documentation.

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](docs/development/contributing.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests and ensure they pass
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📋 **Scripts Reference**

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development servers (frontend + backend) |
| `yarn dev:all` | Start all services including workers |
| `yarn build` | Build production frontend |
| `yarn test` | Run all tests |
| `yarn lint` | Run code linting |
| `yarn clean` | Clean all build artifacts and dependencies |
| `yarn status` | Check running services status |
| `yarn stop` | Stop all running services |

## 📈 **Performance**

- **Frontend**: Lighthouse Score 95+ (Performance, Accessibility, SEO)
- **Backend**: <100ms average response time for API endpoints
- **Database**: Optimized queries with proper indexing
- **Caching**: Redis-based caching for frequently accessed data
- **CDN**: Static assets served via CDN with edge caching

## 🛣️ **Roadmap**

- [ ] **Q4 2024**: Mobile app development (React Native)
- [ ] **Q1 2025**: Advanced ML models for predictive analytics  
- [ ] **Q2 2025**: Integration with major POS systems
- [ ] **Q3 2025**: Franchise management features
- [ ] **Q4 2025**: API marketplace for third-party integrations

## 📞 **Support**

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/khiwniti/enhancement-bitebase-intelligence/issues)
- **Discussions**: [GitHub Discussions](https://github.com/khiwniti/enhancement-bitebase-intelligence/discussions)

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ by the BiteBase Team</strong><br>
  <em>Empowering restaurants with intelligent analytics</em>
</p>

<p align="center">
  <img src="./frontend/public/logo.png" alt="BiteBase Intelligence" width="120" height="120">
</p>

