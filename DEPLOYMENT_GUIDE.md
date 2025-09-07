# 🚀 BiteBase Operations Platform - Production Deployment Guide

## Overview
This guide covers deploying the complete BiteBase Operations platform (Phase 1 MVP) to production. The platform transforms restaurant operations from reactive to proactive with real-time operational control.

## 🏗️ Architecture Summary

### Backend (FastAPI)
- **Core API**: Restaurant data, analytics, AI recommendations
- **Operations API**: Real-time KPIs, checklists, FOH/BOH communication
- **Database**: SQLite (development) → PostgreSQL (production)
- **Authentication**: JWT-based with role-based access control

### Frontend (Next.js 14)
- **Intelligence Dashboard**: Analytics, market insights, AI recommendations
- **Operations Command Center**: Real-time operational control
- **Manager Dashboard**: Live KPI monitoring and team coordination
- **Mobile-Optimized**: Staff checklist execution and communication

## 🚦 Pre-Deployment Checklist

### Environment Requirements
- [ ] Node.js 20.x or higher
- [ ] Python 3.11+ with pip
- [ ] PostgreSQL 14+ (production database)
- [ ] Redis (for real-time features - optional Phase 2)
- [ ] SSL certificates for HTTPS
- [ ] Domain/subdomain configured

### Security Checklist
- [ ] Environment variables secured (no secrets in code)
- [ ] JWT signing keys generated
- [ ] Database credentials secured
- [ ] CORS origins configured properly
- [ ] Rate limiting implemented
- [ ] Input validation comprehensive

## 🔧 Backend Deployment

### 1. Database Setup (PostgreSQL)

```sql
-- Create production database
CREATE DATABASE bitebase_operations;
CREATE USER bitebase_admin WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE bitebase_operations TO bitebase_admin;
```

### 2. Environment Configuration

```bash
# Create production .env file
cat > backend/.env << EOF
DATABASE_URL=postgresql://bitebase_admin:secure_password@localhost/bitebase_operations
JWT_SECRET_KEY=your-256-bit-secret-key-here
ENVIRONMENT=production
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
POS_API_KEY=your-pos-integration-key
EMAIL_SERVICE_KEY=your-email-service-key
EOF
```

### 3. Production Database Migration

```bash
cd backend
pip install -r requirements.txt
python -c "
import asyncio
from sqlalchemy import create_engine
from models.operational import Base
from app.core.config import get_settings

settings = get_settings()
engine = create_engine(settings.database_url)
Base.metadata.create_all(bind=engine)
print('✅ Production database schema created')
"
```

### 4. Production Server Setup (Gunicorn)

```bash
# Install production server
pip install gunicorn uvicorn[standard]

# Create systemd service
sudo tee /etc/systemd/system/bitebase-api.service << EOF
[Unit]
Description=BiteBase Operations API
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/path/to/your/backend
Environment="PATH=/path/to/your/venv/bin"
ExecStart=/path/to/your/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 simple_main:app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable bitebase-api.service
sudo systemctl start bitebase-api.service
```

### 5. Nginx Configuration

```nginx
# /etc/nginx/sites-available/bitebase-api
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🎨 Frontend Deployment

### 1. Build Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://api.yourdomain.com' 
      : 'http://localhost:8000',
    NEXT_PUBLIC_APP_URL: 'https://app.yourdomain.com'
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL}/api/:path*`,
      },
    ]
  }
}

module.exports = nextConfig
```

### 2. Production Build

```bash
cd frontend
npm install --production
npm run build
npm start # or use PM2 for production process management
```

### 3. PM2 Production Process Manager

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'bitebase-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/frontend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Frontend Nginx Configuration

```nginx
# /etc/nginx/sites-available/bitebase-frontend
server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets caching
    location /_next/static {
        alias /path/to/frontend/.next/static;
        expires 365d;
        access_log off;
    }
}
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

```bash
# Backend health check endpoint
curl https://api.yourdomain.com/health

# Operations API status
curl https://api.yourdomain.com/api/v1/operations/kpis/live/rest_001
```

### 2. Log Management

```bash
# Backend logs
journalctl -u bitebase-api.service -f

# Frontend logs  
pm2 logs bitebase-frontend

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 3. Performance Monitoring

```javascript
// Add to frontend for performance tracking
// pages/_app.tsx
export function reportWebVitals(metric) {
  console.log(metric)
  // Send to analytics service
}
```

## 🔐 Security Hardening

### 1. Firewall Configuration

```bash
# UFW setup
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Block direct access to application ports
sudo ufw deny 3000
sudo ufw deny 8000
```

### 2. SSL/TLS Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d api.yourdomain.com -d app.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### 3. Environment Security

```bash
# Secure environment files
chmod 600 backend/.env
chown www-data:www-data backend/.env

# Regular security updates
sudo apt update && sudo apt upgrade
```

## 🚀 Deployment Verification

### 1. Backend API Tests

```bash
# Health check
curl -i https://api.yourdomain.com/health

# Authentication test
curl -i -X POST https://api.yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Operations endpoints
curl -i https://api.yourdomain.com/api/v1/operations/dashboard/rest_001
```

### 2. Frontend Verification

```bash
# Page load tests
curl -i https://app.yourdomain.com/
curl -i https://app.yourdomain.com/en/dashboard
curl -i https://app.yourdomain.com/en/operations
```

### 3. Integration Tests

```bash
# End-to-end operational flow
curl -X POST https://api.yourdomain.com/api/v1/operations/checklists/assign \
  -H "Content-Type: application/json" \
  -d '{"restaurant_id":"rest_001","user_id":"user_001","shift_phase":"pre_opening"}'
```

## 📈 Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_restaurant_id ON checklists(restaurant_id);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_created_at ON communications(created_at);
```

### 2. Caching Strategy

```bash
# Redis for session caching (Phase 2)
sudo apt install redis-server
sudo systemctl enable redis-server

# Nginx caching for static assets
# Already configured in nginx config above
```

### 3. CDN Configuration

```javascript
// next.config.js - for static assets
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.yourdomain.com' : '',
  images: {
    domains: ['cdn.yourdomain.com'],
  },
}
```

## 🔄 Backup & Recovery

### 1. Database Backups

```bash
# Daily automated backups
cat > /usr/local/bin/backup-bitebase.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U bitebase_admin bitebase_operations > /backups/bitebase_$DATE.sql
find /backups -name "bitebase_*.sql" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-bitebase.sh

# Add to crontab
echo "0 2 * * * /usr/local/bin/backup-bitebase.sh" | crontab -
```

### 2. Application Backups

```bash
# Code backup
tar -czf /backups/bitebase-app-$(date +%Y%m%d).tar.gz /path/to/application

# Configuration backup
cp -r /etc/nginx/sites-available /backups/nginx-$(date +%Y%m%d)
```

## 🎯 Go-Live Checklist

- [ ] Backend API deployed and healthy
- [ ] Frontend application deployed and accessible
- [ ] Database created with proper migrations
- [ ] SSL certificates installed and working
- [ ] Monitoring and logging configured
- [ ] Backup systems in place
- [ ] Security hardening completed
- [ ] Performance optimization applied
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team training completed

## 📞 Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Check logs for errors, monitor performance metrics
2. **Monthly**: Security updates, backup verification, performance review
3. **Quarterly**: Full security audit, disaster recovery testing

### Emergency Contacts

- **Technical Lead**: [contact information]
- **DevOps**: [contact information]  
- **Database Admin**: [contact information]

---

## 🎉 Congratulations!

Your BiteBase Operations platform is now live and ready to transform restaurant operations from reactive to proactive management. The platform provides real-time operational control, seamless team coordination, and immediate decision-making capabilities.

**Next Steps**: Monitor initial usage, gather user feedback, and prepare for Phase 2 advanced features including comprehensive POS integration and advanced analytics.