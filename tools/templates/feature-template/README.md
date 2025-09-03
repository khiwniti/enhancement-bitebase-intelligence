# Feature Template System

This directory contains templates for creating new features in the BiteBase Intelligence platform.

## Feature Structure

Every feature follows this standardized structure:

```
src/features/[feature-name]/
├── components/              # Feature-specific React components
│   ├── [FeatureName]Page.tsx   # Main feature page component
│   ├── [FeatureName]Header.tsx # Feature header component
│   ├── [FeatureName]Content.tsx # Main content component
│   └── index.ts               # Component exports
├── hooks/                   # Feature-specific custom hooks
│   ├── use[FeatureName]Data.ts    # Data fetching hook
│   ├── use[FeatureName]State.ts   # State management hook
│   └── index.ts               # Hook exports
├── services/                # API integration and business logic
│   ├── [featureName]Api.ts       # API client methods
│   ├── [featureName]Cache.ts     # Caching strategy
│   └── index.ts               # Service exports
├── types/                   # Feature-specific TypeScript definitions
│   ├── [featureName].types.ts    # Core types
│   └── index.ts               # Type exports
├── utils/                   # Feature-specific utilities
│   ├── [featureName]Utils.ts     # Utility functions
│   └── index.ts               # Utility exports
├── tests/                   # Feature tests
│   ├── [FeatureName].test.tsx    # Component tests
│   ├── [featureName]Api.test.ts  # API tests
│   └── hooks.test.ts            # Hook tests
├── config.ts                # Feature configuration
├── index.ts                 # Feature public API
└── README.md                # Feature documentation
```

## Usage

1. Use the CLI tool to generate a new feature:
   ```bash
   yarn create-feature my-new-feature
   ```

2. Or manually copy the template and replace placeholders:
   - `[FeatureName]` → PascalCase name (e.g., `MyNewFeature`)
   - `[featureName]` → camelCase name (e.g., `myNewFeature`)
   - `[feature-name]` → kebab-case name (e.g., `my-new-feature`)

## Development Patterns

### 1. Feature-First Development
- Keep all feature-related code within the feature directory
- Minimize dependencies on other features
- Use the shared components from `src/shared/components/` for common UI

### 2. API Integration
- All API calls should go through the feature's service layer
- Use TanStack Query for server state management
- Implement proper error handling and loading states

### 3. Type Safety
- Define all feature-specific types in the `types/` directory
- Export types through the feature's main index.ts file
- Use strict TypeScript configuration

### 4. Testing Strategy
- Component tests for UI behavior
- Hook tests for custom hook logic
- API tests for service integration
- Integration tests for complete feature workflows

### 5. Performance
- Use React.memo for expensive components
- Implement proper memoization with useMemo and useCallback
- Consider code splitting for large features