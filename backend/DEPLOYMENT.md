# BiteBase Intelligence Backend - Serverless Deployment Guide

This guide covers deploying the Python FastAPI backend to various serverless platforms.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js (for deployment tools)
- Platform-specific CLI tools

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your production values
nano .env
```

### 2. Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
./deploy.sh vercel
```

### 3. Deploy to AWS Lambda
```bash
# Install Serverless Framework
npm i -g serverless

# Configure AWS credentials
aws configure

# Deploy
./deploy.sh aws
```

### 4. Deploy to Google Cloud Functions
```bash
# Install Google Cloud CLI
# Follow: https://cloud.google.com/sdk/docs/install

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy
./deploy.sh gcp
```

## 📋 Deployment Configurations

### Vercel Configuration
File: `vercel.json`
- ✅ Already configured
- Uses `@vercel/python` runtime
- Python 3.11 runtime
- Automatic route handling

### AWS Lambda Configuration
Create `serverless.yml`:
```yaml
service: bitebase-api
runtime: python3.11
provider:
  name: aws
  region: us-east-1
functions:
  api:
    handler: app.main.app
    events:
      - http:
          path: /{proxy+}
          method: ANY
```

### Google Cloud Configuration
Uses `gcloud functions deploy` with:
- Python 3.11 runtime
- HTTP trigger
- Public access

## 🔧 Environment Variables

Required environment variables for production:

### Database & Storage
- `DATABASE_URL` - PostgreSQL connection string
- `MONGODB_URL` - MongoDB connection string
- `REDIS_URL` - Redis connection string

### Security
- `SECRET_KEY` - JWT secret key
- `ALGORITHM` - JWT algorithm (HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration

### API Keys
- `GEMINI_API_KEY` - Google Gemini AI
- `OPENAI_API_KEY` - OpenAI API
- `GOOGLE_PLACES_API_KEY` - Google Places API
- `STRIPE_SECRET_KEY` - Stripe payments

### CORS
- `ALLOWED_ORIGINS` - JSON array of allowed origins

## 🔄 Frontend Integration

### Update Frontend API URL
After deployment, update your frontend environment:

```bash
# Frontend .env.production
NEXT_PUBLIC_API_URL=https://your-backend-domain.vercel.app/api
```

### Next.js Proxy (Development)
For local development, the Next.js proxy is already configured in `next.config.js`:
```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8000/api/:path*'
    }
  ]
}
```

## 🧪 Testing Deployment

### Health Check
```bash
curl https://your-backend-domain.vercel.app/health
```

### API Documentation
```bash
# Visit your deployed API docs
https://your-backend-domain.vercel.app/docs
```

## 📊 Monitoring & Observability

### Vercel
- Built-in function logs
- Performance metrics
- Error tracking

### AWS Lambda
- CloudWatch logs
- X-Ray tracing
- Custom metrics

### Google Cloud
- Cloud Logging
- Cloud Monitoring
- Error Reporting

## 🔍 Troubleshooting

### Common Issues

1. **Cold Start Performance**
   - Solution: Use Vercel for better cold start performance
   - AWS: Provision concurrency for Lambda

2. **Package Size Limits**
   - Vercel: 50MB limit
   - AWS Lambda: 250MB unzipped
   - Solution: Optimize dependencies in requirements.txt

3. **Database Connections**
   - Use connection pooling
   - Consider serverless databases (PlanetScale, Supabase)

4. **CORS Issues**
   - Update `ALLOWED_ORIGINS` environment variable
   - Check frontend domain configuration

### Logs & Debugging

```bash
# Vercel logs
vercel logs

# AWS logs
serverless logs -f api

# Google Cloud logs
gcloud functions logs read bitebase-api
```

## 🚦 Production Checklist

- [ ] Environment variables configured
- [ ] Database connections tested
- [ ] CORS origins updated
- [ ] API documentation accessible
- [ ] Health checks passing
- [ ] Frontend integration tested
- [ ] Error monitoring setup
- [ ] SSL/TLS certificates valid

## 🔄 Continuous Deployment

### GitHub Actions (Vercel)
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

For deployment issues:
1. Check the deployment logs
2. Verify environment variables
3. Test API endpoints
4. Review platform-specific documentation

Happy deploying! 🚀