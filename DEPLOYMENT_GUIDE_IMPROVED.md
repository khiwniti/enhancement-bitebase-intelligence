# 🚀 BiteBase Intelligence 2.0 - Deployment Guide

## 📋 **Overview**

This guide provides comprehensive instructions for deploying the improved BiteBase Intelligence dashboard to production environments. The dashboard is built with Next.js 15 and can be deployed to various platforms.

---

## 🏗️ **Pre-Deployment Checklist**

### **✅ Code Quality**
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Components properly tested
- [ ] Error boundaries implemented
- [ ] Loading states configured
- [ ] Mobile responsiveness verified

### **✅ Environment Configuration**
- [ ] Production API endpoints configured
- [ ] Environment variables set
- [ ] API keys secured
- [ ] CORS settings configured
- [ ] SSL certificates ready

### **✅ Performance Optimization**
- [ ] Bundle size optimized
- [ ] Images compressed
- [ ] Code splitting implemented
- [ ] Caching strategies configured
- [ ] CDN setup (if applicable)

---

## 🌐 **Deployment Options**

### **1. Vercel (Recommended)**

**Why Vercel?**
- ✅ Built specifically for Next.js
- ✅ Automatic deployments from Git
- ✅ Global CDN with edge functions
- ✅ Built-in analytics and monitoring
- ✅ Zero-config deployment

**Deployment Steps:**

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy from Project Directory**
```bash
cd /workspace/enhancement-bitebase-intelligence/frontend
vercel
```

4. **Configure Environment Variables**
```bash
# In Vercel Dashboard or via CLI
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

5. **Production Deployment**
```bash
vercel --prod
```

**Vercel Configuration (`vercel.json`)**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1", "sfo1", "lhr1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY": "@maps-api-key"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

### **2. Netlify**

**Deployment Steps:**

1. **Build Configuration (`netlify.toml`)**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  NODE_ENV = "production"
```

2. **Deploy via Git**
```bash
# Connect repository to Netlify
# Automatic deployments on push to main branch
```

3. **Environment Variables**
```bash
# In Netlify Dashboard
NEXT_PUBLIC_API_URL=https://api.bitebase.app
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
NODE_ENV=production
```

### **3. AWS Amplify**

**Deployment Steps:**

1. **Amplify Configuration (`amplify.yml`)**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

2. **Environment Variables**
```bash
# In AWS Amplify Console
NEXT_PUBLIC_API_URL=https://api.bitebase.app
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
NODE_ENV=production
```

### **4. Docker Deployment**

**Dockerfile**
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**Docker Compose (`docker-compose.yml`)**
```yaml
version: '3.8'
services:
  bitebase-dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.bitebase.app
      - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Build and Deploy**
```bash
# Build the image
docker build -t bitebase-dashboard .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.bitebase.app \
  -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key \
  bitebase-dashboard

# Or use docker-compose
docker-compose up -d
```

---

## 🔧 **Environment Configuration**

### **Production Environment Variables**
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.bitebase.app
NEXT_PUBLIC_API_VERSION=v1

# Google Maps Integration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_api_key

# Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_VERSION=2.0.0

# Analytics (Optional)
NEXT_PUBLIC_GA_TRACKING_ID=GA_TRACKING_ID
NEXT_PUBLIC_HOTJAR_ID=HOTJAR_ID

# Security
NEXT_PUBLIC_CSP_NONCE=random_nonce_value
```

### **Development Environment Variables**
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1

# Google Maps Integration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_development_api_key

# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_VERSION=2.0.0-dev

# Debug Settings
NEXT_PUBLIC_DEBUG_MODE=true
```

---

## 🔒 **Security Configuration**

### **Content Security Policy (CSP)**
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https: blob:;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://api.bitebase.app https://maps.googleapis.com;
      frame-src 'none';
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

### **API Security**
```typescript
// lib/api-client.ts
const apiClient = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Version': process.env.NEXT_PUBLIC_API_VERSION || 'v1',
    'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0'
  },
  
  // Request interceptor for authentication
  interceptors: {
    request: (config) => {
      const token = localStorage.getItem('auth-token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    }
  }
}
```

---

## 📊 **Performance Optimization**

### **Next.js Configuration**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@radix-ui/react-icons']
  },
  
  // Image optimization
  images: {
    domains: ['api.bitebase.app', 'maps.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30 // 30 days
  },
  
  // Compression
  compress: true,
  
  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
          openAnalyzer: true,
        })
      )
      return config
    }
  }),
  
  // Output configuration for Docker
  output: 'standalone',
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

### **Bundle Optimization**
```bash
# Analyze bundle size
npm run build
npm run analyze

# Key optimizations implemented:
# - Tree shaking for unused code
# - Code splitting for route-based chunks
# - Dynamic imports for heavy components
# - Image optimization with WebP/AVIF
# - CSS purging with Tailwind
```

---

## 🔍 **Monitoring & Analytics**

### **Application Monitoring**
```typescript
// lib/monitoring.ts
export const monitoring = {
  // Performance monitoring
  trackPageLoad: (pageName: string, loadTime: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_load_time', {
        page_name: pageName,
        load_time: loadTime
      })
    }
  },
  
  // Error tracking
  trackError: (error: Error, context?: string) => {
    console.error('Application Error:', error, context)
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        context
      })
    }
  },
  
  // User interaction tracking
  trackInteraction: (action: string, category: string, label?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label
      })
    }
  }
}
```

### **Health Check Endpoint**
```typescript
// pages/api/health.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  }
  
  res.status(200).json(healthCheck)
}
```

---

## 🚀 **CI/CD Pipeline**

### **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run tests
        run: npm run test
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_API_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📋 **Post-Deployment Checklist**

### **✅ Functionality Testing**
- [ ] All 9 dashboard tabs load correctly
- [ ] Real-time monitoring is active
- [ ] Settings save and load properly
- [ ] Data export/import functions work
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested

### **✅ Performance Verification**
- [ ] Page load times < 2 seconds
- [ ] Tab switching < 200ms
- [ ] Real-time updates functioning
- [ ] Memory usage within limits
- [ ] No console errors

### **✅ Security Validation**
- [ ] HTTPS enabled and working
- [ ] CSP headers configured
- [ ] API endpoints secured
- [ ] Environment variables protected
- [ ] Authentication working

### **✅ Monitoring Setup**
- [ ] Analytics tracking active
- [ ] Error monitoring configured
- [ ] Performance monitoring enabled
- [ ] Health check endpoint responding
- [ ] Alerts configured

---

## 🔧 **Troubleshooting**

### **Common Issues**

**1. Build Failures**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**2. Environment Variable Issues**
```bash
# Verify environment variables
echo $NEXT_PUBLIC_API_URL
echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Check in browser console
console.log(process.env.NEXT_PUBLIC_API_URL)
```

**3. API Connection Issues**
```typescript
// Test API connectivity
const testAPI = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
    console.log('API Status:', response.status)
  } catch (error) {
    console.error('API Connection Failed:', error)
  }
}
```

**4. Performance Issues**
```bash
# Analyze bundle size
npm run build
npm run analyze

# Check for memory leaks
# Use browser dev tools Performance tab
```

---

## 📞 **Support & Maintenance**

### **Monitoring Dashboards**
- **Vercel Analytics**: Real-time performance metrics
- **Google Analytics**: User behavior tracking
- **Sentry**: Error tracking and monitoring
- **Uptime Robot**: Service availability monitoring

### **Maintenance Schedule**
- **Daily**: Monitor error rates and performance
- **Weekly**: Review analytics and user feedback
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Performance optimization review

### **Emergency Contacts**
- **Development Team**: dev@bitebase.app
- **DevOps Team**: devops@bitebase.app
- **Support Team**: support@bitebase.app

---

## 🎉 **Conclusion**

The BiteBase Intelligence 2.0 dashboard is now ready for production deployment. This guide provides comprehensive instructions for deploying to various platforms while maintaining security, performance, and reliability standards.

**Key Deployment Features:**
- ✅ **Multiple Platform Support**: Vercel, Netlify, AWS, Docker
- ✅ **Security Hardened**: CSP, HTTPS, secure headers
- ✅ **Performance Optimized**: Bundle splitting, caching, CDN
- ✅ **Monitoring Ready**: Analytics, error tracking, health checks
- ✅ **CI/CD Enabled**: Automated testing and deployment

The dashboard is production-ready and will provide users with an exceptional restaurant intelligence experience.

---

*For additional support or questions, please contact the development team at dev@bitebase.app*