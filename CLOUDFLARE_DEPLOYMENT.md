# 🚀 Cloudflare Workers Deployment Guide

Complete guide to deploy the BiteBase Intelligence backend to Cloudflare Workers.

## 📋 Prerequisites

1. **Cloudflare Account** - [Sign up here](https://cloudflare.com)
2. **Node.js 18+** - Already installed
3. **Wrangler CLI** - Already installed (v4.33.2)

## 🔑 Authentication Setup

### Option 1: API Token (Recommended for CI/CD)

1. **Create API Token**
   - Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Click "Create Token"
   - Use "Workers:Edit" template or create custom token with:
     - **Account** - `Cloudflare Workers:Edit`
     - **Zone** - `Zone:Read` (if using custom domains)
     - **Account Resources** - Include: All accounts

2. **Set Environment Variable**
   ```bash
   export CLOUDFLARE_API_TOKEN=your_token_here
   ```

### Option 2: Interactive Login

```bash
cd backend-workers
npx wrangler login
```

## 🏗️ Infrastructure Setup

The backend uses several Cloudflare services that need to be configured:

### 1. D1 Database
```bash
cd backend-workers

# Create D1 database (if not exists)
npx wrangler d1 create bitebase-intelligence-db

# Apply database migrations
npx wrangler d1 migrations apply bitebase-intelligence-db --env production
```

### 2. KV Namespaces
```bash
# Create KV namespaces (if not exist)
npx wrangler kv:namespace create CACHE --env production
npx wrangler kv:namespace create SESSIONS --env production
npx wrangler kv:namespace create ANALYTICS --env production
```

### 3. Environment Variables

Set these secrets in Cloudflare Dashboard or via CLI:

```bash
# Set JWT secret for authentication
npx wrangler secret put JWT_SECRET --env production
# Enter a strong random string (32+ characters)

# Set database URL (if using external DB)
npx wrangler secret put DATABASE_URL --env production
# Enter your database URL if using external database
```

## 🚀 Deployment Commands

### Development Deployment
```bash
cd backend-workers

# Deploy to development (default environment)
npm run deploy
# or
npx wrangler deploy
```

### Production Deployment
```bash
cd backend-workers

# Deploy to production environment
npm run deploy:prod
# or
npx wrangler deploy --env production
```

### Development Mode (Local Testing)
```bash
cd backend-workers

# Start local development server
npm run dev
# API available at http://localhost:8787
```

## 🔧 Configuration Files

### Current Configuration

The deployment is configured with:

- **Worker Name**: `bitebase-intelligence`
- **Runtime**: Cloudflare Workers with Node.js compatibility
- **Database**: D1 (SQLite) with comprehensive schema
- **Storage**: 3 KV namespaces (Cache, Sessions, Analytics)
- **Account ID**: `dc95c232d76cc4df23a5ca452a4046ab`

### Environment Variables

**Production Environment:**
```toml
[env.production.vars]
ENVIRONMENT = "production"
DATABASE_URL = "env:DATABASE_URL"
JWT_SECRET = "env:JWT_SECRET"
CORS_ORIGINS = "http://localhost:3000,https://bitebase-intelligence.vercel.app"
```

## 🌐 API Endpoints

After deployment, your API will be available at:
- **Production**: `https://bitebase-intelligence.your-subdomain.workers.dev`
- **Custom Domain**: Configure in Cloudflare Dashboard

### Core Endpoints
- `GET /` - API health and version info
- `GET /health` - Service health check
- `GET /test-db` - Database connectivity test
- `GET /test-kv` - KV storage test

### Authentication Endpoints
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User login
- `POST /v1/auth/refresh` - Token refresh
- `POST /v1/auth/logout` - User logout
- `GET /v1/auth/me` - Get current user

### Business Endpoints
- `/v1/restaurants/*` - Restaurant management
- `/v1/analytics/*` - Analytics and reporting
- `/v1/ai/*` - AI-powered insights
- `/v1/4p/*` - Marketing mix analysis
- `/v1/management/*` - Business management
- `/v1/integrations/*` - Third-party integrations

## 🛠️ Database Schema

The D1 database includes comprehensive tables:

### Core Tables
- **users** - User authentication and profiles
- **restaurants** - Restaurant data and metadata
- **user_sessions** - Session management
- **refresh_tokens** - JWT token management
- **api_keys** - API access management

### Analytics Tables
- **market_analysis** - Market insights and analysis
- **location_analysis** - Geospatial analytics
- **customer_segments** - Customer segmentation data
- **revenue_projections** - Financial projections
- **operational_metrics** - Restaurant performance metrics

## 📊 Monitoring and Logs

### Real-time Logs
```bash
# Stream worker logs
npm run tail
# or
npx wrangler tail --env production
```

### Cloudflare Dashboard
- **Analytics**: Worker performance metrics
- **Logs**: Real-time request logging
- **Errors**: Exception tracking
- **Usage**: Compute and storage usage

## 🔐 Security Features

### Authentication
- JWT-based authentication with refresh tokens
- Session management with automatic cleanup
- Password hashing with SHA-256
- Role-based access control (admin, manager, user, viewer)

### Request Security
- CORS protection
- Rate limiting via middleware
- API key validation
- Input validation with Zod schemas

### Data Protection
- Foreign key constraints
- Data encryption at rest (D1)
- Secure environment variable handling
- Automatic session expiration

## 🚧 Troubleshooting

### Common Issues

**1. Authentication Errors**
```bash
# Check if logged in
npx wrangler whoami

# Re-authenticate
npx wrangler login
```

**2. Database Connection Issues**
```bash
# Test database connectivity
curl https://your-worker.workers.dev/test-db

# Check migrations
npx wrangler d1 migrations list bitebase-intelligence-db
```

**3. Environment Variable Issues**
```bash
# List current secrets
npx wrangler secret list --env production

# Update secret
npx wrangler secret put SECRET_NAME --env production
```

**4. KV Storage Issues**
```bash
# Test KV connectivity
curl https://your-worker.workers.dev/test-kv

# List KV namespaces
npx wrangler kv:namespace list
```

### Performance Optimization

**Database**
- Use prepared statements (already implemented)
- Add database indexes for frequent queries
- Implement connection pooling
- Monitor query performance

**Caching**
- Implement KV caching for frequently accessed data
- Use edge caching for static responses
- Cache authentication tokens
- Implement cache invalidation strategies

**Worker Optimization**
- Minimize bundle size
- Use tree-shaking
- Implement lazy loading
- Optimize JSON serialization

## 🎯 Next Steps

1. **Deploy**: Follow the authentication and deployment steps above
2. **Configure Domain**: Set up custom domain in Cloudflare
3. **Monitoring**: Set up alerting and monitoring
4. **Scale**: Configure auto-scaling and performance optimization
5. **Security**: Implement additional security measures
6. **Integration**: Connect frontend applications

## 📚 Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [D1 Database Documentation](https://developers.cloudflare.com/d1/)
- [KV Storage Documentation](https://developers.cloudflare.com/kv/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Hono Framework Documentation](https://hono.dev/)

---

**🚀 Your BiteBase Intelligence backend is ready for Cloudflare deployment!**