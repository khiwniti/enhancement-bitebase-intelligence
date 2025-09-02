# 🔄 BiteBase Intelligence - Migration Guide

## 📋 Overview

This guide documents the comprehensive codebase reorganization from a traditional structure to a modern, feature-based monorepo architecture. The migration improves maintainability, scalability, and developer experience.

## 🎯 What Changed

### Directory Structure Changes

#### Before (Old Structure)
```
enhancement-bitebase-intelligence/
├── frontend/                   # Next.js app
├── backend/                    # FastAPI backend
├── functions/                  # Firebase functions
├── dataconnect/               # Data Connect
├── docs/                      # Mixed documentation
├── scripts/                   # Build scripts
├── *.log                      # Debug logs (removed)
├── test_*.py                  # Test files (removed)
└── Various config files       # Scattered configs
```

#### After (New Structure)
```
bitebase-intelligence/
├── 📁 apps/                    # Applications
│   ├── 📁 web/                 # Next.js frontend (reorganized)
│   └── 📁 functions/           # Firebase Functions (enhanced)
├── 📁 packages/                # Shared packages
├── 📁 services/                # External services & integrations
├── 📁 tools/                   # Development tools & scripts
├── 📁 docs/                    # Organized documentation
├── 📁 legacy/                  # Legacy backend (deprecated)
└── Clean root directory       # Essential files only
```

### Frontend Reorganization

#### Before
```
frontend/src/
├── components/
│   ├── analytics/
│   ├── layout/
│   └── ui/
├── hooks/
├── lib/
└── types/
```

#### After (Feature-Based)
```
apps/web/src/
├── features/                   # Feature-based organization
│   ├── analytics/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── dashboard/
│   ├── location-intelligence/
│   ├── restaurant-management/
│   └── ai-assistant/
├── shared/                     # Shared across features
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # Common hooks
│   ├── lib/                    # Utilities & configs
│   └── types/                  # Shared types
└── app/                        # Next.js pages
```

### Backend Consolidation

#### Changes Made
- **Legacy Backend**: Moved to `legacy/backend/` (deprecated)
- **Firebase Functions**: Enhanced with proper structure
- **Shared Utilities**: Created common utilities and middleware
- **Domain Organization**: Functions organized by business domain

## 🚀 Migration Benefits

### Developer Experience
- ✅ **Intuitive Navigation**: Find code by feature, not technical layer
- ✅ **Reduced Cognitive Load**: Clear separation of concerns
- ✅ **Faster Development**: Co-located related code
- ✅ **Better Testing**: Feature-specific test organization

### Maintainability
- ✅ **Single Source of Truth**: Eliminated duplicate functionality
- ✅ **Modular Architecture**: Independent feature development
- ✅ **Clear Dependencies**: Explicit package relationships
- ✅ **Easier Refactoring**: Isolated feature boundaries

### Performance
- ✅ **Better Tree-Shaking**: Improved bundle optimization
- ✅ **Code Splitting**: Feature-based chunks
- ✅ **Workspace Benefits**: Shared dependencies and caching

## 🔧 Updated Commands

### Before
```bash
# Old commands
cd frontend && npm run dev
cd functions && npm run serve
cd backend && ./run.sh
```

### After
```bash
# New workspace commands
npm run dev                     # Start web app + Firebase emulators
npm run dev:web                 # Start web app only
npm run dev:functions           # Start functions only
npm run install:all             # Install all workspace dependencies
```

## 📦 Import Path Changes

### Frontend Imports

#### Before
```typescript
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ApiClient } from '@/lib/api-client';
```

#### After
```typescript
import { Button } from '@/shared/components/button';
import { useAnalytics } from '@/features/analytics/hooks';
import { ApiClient } from '@/shared/lib/api-client';
```

### New Path Aliases
```typescript
// Available path aliases
'@/features/*'     // Feature-specific code
'@/shared/*'       // Shared utilities and components
'@/app/*'          // Next.js app router pages
'@/components/*'   // Alias to shared/components
'@/lib/*'          // Alias to shared/lib
'@/hooks/*'        // Alias to shared/hooks
'@/types/*'        // Alias to shared/types
```

## 🔄 Configuration Updates

### Package.json Changes
- **Workspaces**: Added npm workspaces configuration
- **Scripts**: Updated to use workspace commands
- **Dependencies**: Consolidated shared dependencies

### Firebase Configuration
- **Hosting**: Updated to point to `apps/web`
- **Functions**: Updated to point to `apps/functions`
- **Data Connect**: Moved to `services/database/dataconnect`

### TypeScript Configuration
- **Path Mapping**: Updated to reflect new structure
- **Feature Aliases**: Added feature-specific path aliases

## 🚨 Breaking Changes

### Import Statements
All import statements need to be updated to use the new paths. Use find-and-replace or automated refactoring tools.

### Build Scripts
Update any custom build scripts to use the new directory structure.

### Environment Variables
Update any hardcoded paths in environment variables.

## 🛠️ Migration Checklist

### For Developers
- [ ] Update local development setup
- [ ] Update import statements in your code
- [ ] Test feature-specific functionality
- [ ] Update any custom scripts or tools
- [ ] Review and update documentation

### For CI/CD
- [ ] Update build pipelines
- [ ] Update deployment scripts
- [ ] Update environment configurations
- [ ] Test automated deployments

## 📚 Additional Resources

- [Codebase Reorganization Plan](./CODEBASE_REORGANIZATION_PLAN.md)
- [Architecture Documentation](./docs/architecture/)
- [Development Guide](./docs/development/)
- [API Documentation](./docs/api/)

## 🆘 Troubleshooting

### Common Issues

#### Import Errors
**Problem**: Module not found errors after migration
**Solution**: Update import paths to use new aliases

#### Build Failures
**Problem**: Build fails due to path issues
**Solution**: Clear build cache and reinstall dependencies

#### Development Server Issues
**Problem**: Dev server won't start
**Solution**: Use new workspace commands (`npm run dev`)

### Getting Help
- Check the [troubleshooting guide](./docs/development/troubleshooting.md)
- Review the [FAQ](./docs/development/faq.md)
- Open an issue with detailed error information

---

*This migration represents a significant improvement in code organization and developer experience. The new structure will support the platform's growth and make development more efficient.*
