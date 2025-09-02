# 🔥 Firebase Setup Guide - BiteBase Intelligence

Complete guide to set up and deploy BiteBase Intelligence using Firebase services.

## 🚀 Quick Start

### 1. **Automated Setup** (Recommended)
```bash
# Run the automated setup script
npm run firebase:setup

# Start development with Firebase emulators
npm run dev
```

### 2. **Manual Setup**
If you prefer manual setup, follow the detailed steps below.

---

## 📋 Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm or yarn** - Package manager
- **Firebase Account** - [Create account](https://firebase.google.com/)
- **Firebase CLI** - Will be installed automatically

---

## 🏗️ Firebase Services Used

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **🔐 Authentication** | User login/signup | Email, Google, social auth |
| **📊 Firestore** | User data, sessions | Real-time database |
| **🔗 Data Connect** | Restaurant data | PostgreSQL with GraphQL |
| **⚡ Functions** | Backend APIs | Node.js serverless functions |
| **🌐 Hosting** | Frontend deployment | Next.js static hosting |
| **📁 Storage** | File uploads | Images, reports, exports |

---

## 🛠️ Setup Steps

### Step 1: Install Dependencies
```bash
# Install all project dependencies
npm run install:all

# Or install individually
npm install                    # Root dependencies
cd frontend && npm install     # Frontend dependencies  
cd functions && npm install    # Functions dependencies
```

### Step 2: Firebase CLI Setup
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# List available projects
firebase projects:list
```

### Step 3: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `enhancement-bitebase-intelligence`
4. Enable Google Analytics (optional)
5. Create project

### Step 4: Initialize Firebase
```bash
# Initialize Firebase in project root
firebase init

# Select services:
# ✅ Firestore
# ✅ Functions  
# ✅ Hosting
# ✅ Storage
# ✅ Data Connect

# Follow prompts and use these settings:
# - Firestore rules: firestore.rules
# - Functions language: TypeScript
# - Hosting directory: frontend/out
# - Data Connect location: us-central1
```

### Step 5: Configure Environment Variables
```bash
# Copy environment template
cp frontend/.env.example frontend/.env.local

# Get Firebase config from console
# https://console.firebase.google.com/project/YOUR_PROJECT/settings/general
```

Update `frontend/.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 6: Setup Data Connect
```bash
# Enable Data Connect API
gcloud services enable dataconnect.googleapis.com

# Create Cloud SQL instance (for Data Connect)
# This will be done automatically during first deployment
```

---

## 🚀 Development

### Start Development Environment
```bash
# Start all services (backend + frontend + Firebase emulators)
npm run dev

# Or start individually
npm run dev:backend          # FastAPI backend
npm run dev:frontend         # Next.js frontend  
npm run dev:firebase         # Firebase emulators
```

### Firebase Emulators
```bash
# Start Firebase emulators
npm run firebase:emulators

# Access emulator UI
open http://localhost:4000
```

**Emulator Ports:**
- **UI**: http://localhost:4000
- **Auth**: http://localhost:9099
- **Firestore**: http://localhost:8080
- **Functions**: http://localhost:5001
- **Storage**: http://localhost:9199
- **Data Connect**: http://localhost:9399

---

## 📦 Deployment

### Quick Deploy Commands
```bash
# Deploy to development
npm run firebase:deploy:dev

# Deploy to staging  
npm run firebase:deploy:staging

# Deploy to production
npm run firebase:deploy:prod
```

### Selective Deployment
```bash
# Deploy only frontend
npm run firebase:hosting

# Deploy only functions
npm run firebase:functions

# Deploy only Data Connect
npm run firebase:dataconnect

# Deploy specific service
./scripts/firebase-deploy.sh development functions
```

### Manual Deployment
```bash
# Build and deploy all services
npm run build
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore
firebase deploy --only storage
firebase deploy --only dataconnect
```

---

## 🔧 Configuration Files

### Core Configuration
- **`firebase.json`** - Main Firebase configuration
- **`.firebaserc`** - Project aliases and targets
- **`firestore.rules`** - Database security rules
- **`storage.rules`** - Storage security rules

### Data Connect
- **`dataconnect/dataconnect.yaml`** - Service configuration
- **`dataconnect/schema/schema.gql`** - Database schema
- **`dataconnect/example/queries.gql`** - GraphQL queries
- **`dataconnect/example/mutations.gql`** - GraphQL mutations

### Functions
- **`functions/src/index.ts`** - Main functions entry
- **`functions/src/api/`** - API endpoint handlers
- **`functions/package.json`** - Functions dependencies

---

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Test specific services
npm run test:frontend
npm run test:functions
```

### Test Firebase Integration
```bash
# Test with emulators
firebase emulators:exec "npm test"

# Test deployed functions
curl https://us-central1-YOUR_PROJECT.cloudfunctions.net/api/health
```

---

## 🔍 Monitoring & Debugging

### Firebase Console
- **Authentication**: Monitor user signups/logins
- **Firestore**: View database collections
- **Functions**: Check function logs and performance
- **Hosting**: Monitor deployment status
- **Storage**: Manage uploaded files

### Logs
```bash
# View function logs
firebase functions:log

# Stream real-time logs
firebase functions:log --follow

# View specific function logs
firebase functions:log --only functionName
```

### Performance
- **Hosting**: Automatic CDN and caching
- **Functions**: Auto-scaling based on demand
- **Firestore**: Real-time updates with offline support
- **Data Connect**: Optimized PostgreSQL queries

---

## 🚨 Troubleshooting

### Common Issues

**1. Authentication Errors**
```bash
# Re-login to Firebase
firebase logout
firebase login
```

**2. Permission Denied**
```bash
# Check project permissions
firebase projects:list
firebase use YOUR_PROJECT_ID
```

**3. Build Failures**
```bash
# Clear caches and reinstall
npm run clean
npm run install:all
```

**4. Emulator Connection Issues**
```bash
# Kill existing processes
pkill -f firebase
npm run firebase:emulators
```

### Getting Help
- **Firebase Documentation**: https://firebase.google.com/docs
- **Firebase Support**: https://firebase.google.com/support
- **Project Issues**: Create GitHub issue

---

## 📚 Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Data Connect Documentation](https://firebase.google.com/docs/data-connect)
- [Next.js Firebase Integration](https://firebase.google.com/docs/hosting/nextjs)

---

## 🎯 Next Steps

1. **Complete Setup**: Follow this guide to set up Firebase
2. **Customize Schema**: Modify Data Connect schema for your needs
3. **Add Features**: Implement additional Firebase services
4. **Deploy**: Use deployment scripts for production
5. **Monitor**: Set up alerts and monitoring

---

**🚀 Ready to deploy your restaurant intelligence platform with Firebase!**
