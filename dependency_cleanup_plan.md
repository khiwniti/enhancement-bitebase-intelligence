# Dependency Cleanup Plan

## Issues Identified:

### 1. Port Conflicts
- Port 50513 is already in use
- Multiple development servers may be running

### 2. Package Manager Conflicts
- Multiple lockfiles exist (yarn.lock, package-lock.json, pnmp-lock.yaml)
- Project specifies yarn@4.9.3 but has mixed lockfiles

### 3. Version Conflicts
- React 19.1.0 conflicts with @testing-library/react@^14.1.2 (expects React ^18.0.0)
- @types/react version mismatches

### 4. Potentially Unused Dependencies
- @stripe packages (not found in codebase)
- react-virtualized (not found in usage)
- tempo-devtools (development tool, may be unused)
- @types/mapbox-gl, @types/d3 (may be unused if libraries not used)

### 5. Security Vulnerabilities
- 10 vulnerabilities (6 moderate, 4 high) reported

## Cleanup Actions:

### Phase 1: Stop Running Processes ✅
- Kill any running development servers
- Clear port conflicts

### Phase 2: Fix Package Manager ✅
- Remove conflicting lockfiles
- Standardize on yarn (as specified in package.json)

### Phase 3: Fix Version Conflicts ✅
- Upgrade @testing-library/react to version that supports React 19
- Align @types/react versions

### Phase 4: Remove Unused Dependencies ✅
- Audit actual usage of packages
- Remove unused packages

### Phase 5: Security Updates ✅
- Update vulnerable packages
- Run security audit and fix issues

### Phase 6: Change Default Ports ✅
- Change dev port from 50513 to avoid conflicts
- Update docker and script configurations

## ✅ COMPLETED CLEANUP SUMMARY

### Removed Dependencies:
- `@stripe/react-stripe-js` and `@stripe/stripe-js` (not used in codebase)
- `stripe` (not used in codebase)
- `react-virtualized` and `@types/react-virtualized` (not used in codebase)
- `react-map-gl` and `mapbox-gl`, `@types/mapbox-gl` (not used in codebase)
- `tempo-devtools` (development tool, unused)

### Kept Dependencies:
- `d3` and `@types/d3` (found usage in ChartRegistry.ts)
- `leaflet` and `@types/leaflet` (found usage in InteractiveMap.tsx)
- `chart.js` (found usage in chartTypes.ts)
- `react-grid-layout` (found usage in GridLayout.tsx)
- All `@dnd-kit/*` packages (found usage in dashboard components)

### Fixed Issues:
- ✅ Changed dev port from 50513 to 3000
- ✅ Removed conflicting lockfiles
- ✅ Upgraded @testing-library/react to ^15.0.7 (React 19 compatible)
- ✅ Added @testing-library/dom to fix peer dependency
- ✅ Disabled turbopack due to compatibility issues
- ✅ Successfully built project without errors
- ✅ Development server starts on port 3000

### Final Status:
- **Build**: ✅ Successful
- **TypeScript**: ✅ No errors
- **Development Server**: ✅ Running on port 3000
- **Dependencies**: ✅ Cleaned and optimized
- **Package Manager**: ✅ Standardized on Yarn

The project is now ready for development with cleaned dependencies!
