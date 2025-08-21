# BiteBase Intelligence - Component Structure

## Overview
This document outlines the improved component architecture following real-world best practices.

## Directory Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── dashboard/
│   │   ├── analytics-center/
│   │   ├── ai-center/
│   │   ├── location-center/
│   │   ├── operations-center/
│   │   ├── admin-center/
│   │   └── layout.tsx
│   ├── (public)/                 # Public pages
│   │   ├── about/
│   │   ├── pricing/
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/
│   ├── common/                  # Reusable components
│   │   ├── data-display/
│   │   │   ├── DataTable.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── index.ts
│   │   ├── feedback/
│   │   │   ├── LoadingState.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   └── index.ts
│   │   ├── forms/
│   │   │   ├── FormField.tsx
│   │   │   ├── PasswordInput.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── PageHeader.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── features/                # Feature-specific components
│   │   ├── analytics/
│   │   ├── dashboard/
│   │   ├── ai/
│   │   ├── location/
│   │   └── auth/
│   ├── layout/                  # Layout components
│   │   ├── AppLayout.tsx
│   │   ├── TopNavbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   ├── navigation/              # Navigation components
│   │   ├── MainNavigation.tsx
│   │   ├── HubNavigation.tsx
│   │   └── index.ts
│   └── ui/                      # Base UI components (shadcn/ui)
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts
│   ├── useLocalStorage.ts
│   └── index.ts
├── lib/                         # Utilities and configurations
│   ├── api-client.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── validations.ts
├── contexts/                    # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── styles/                      # Global styles
│   └── globals.css
└── types/                       # TypeScript type definitions
    ├── api.ts
    ├── auth.ts
    └── index.ts
```

## Component Categories

### 1. Common Components (`/components/common/`)
Reusable components used across multiple features:

- **Data Display**: DataTable, StatsCard, Charts
- **Feedback**: Loading, Empty, Error states
- **Forms**: Input components, validation, file uploads
- **Layout**: PageHeader, Breadcrumbs, containers

### 2. Feature Components (`/components/features/`)
Feature-specific components grouped by domain:

- **Analytics**: Charts, reports, metrics
- **Dashboard**: Widgets, builders, layouts
- **AI**: Chat interfaces, research tools
- **Location**: Maps, intelligence tools
- **Auth**: Login, registration, onboarding

### 3. Layout Components (`/components/layout/`)
High-level layout and navigation:

- **AppLayout**: Main application wrapper
- **TopNavbar**: Global navigation bar
- **Footer**: Site footer
- **Sidebar**: Dashboard navigation

### 4. UI Components (`/components/ui/`)
Base design system components (shadcn/ui):

- Button, Input, Card, Modal, etc.
- Primitive components with consistent styling

## Usage Patterns

### Layout Hierarchy
```tsx
// Root Layout (app/layout.tsx)
<html>
  <body>
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  </body>
</html>

// Dashboard Layout (app/(dashboard)/layout.tsx)
<DashboardLayout>
  {children}
</DashboardLayout>

// Page Implementation
<PageHeader 
  title="Analytics"
  breadcrumbs={[...]}
  actions={[...]}
/>
<StatsGrid stats={[...]} />
<DataTable data={[...]} columns={[...]} />
```

### Component Composition
```tsx
// Feature Page Example
import { 
  PageHeader, 
  StatsGrid, 
  DataTable,
  LoadingState 
} from '@/components/common'

export function AnalyticsPage() {
  const { data, loading } = useAnalytics()
  
  if (loading) return <LoadingState />
  
  return (
    <>
      <PageHeader 
        title="Analytics Dashboard"
        subtitle="Real-time business insights"
      />
      <StatsGrid stats={metrics} />
      <DataTable data={reports} columns={columns} />
    </>
  )
}
```

## Benefits

1. **Consistency**: Unified design language across the app
2. **Maintainability**: Clear separation of concerns
3. **Reusability**: DRY principle with shared components
4. **Scalability**: Easy to add new features and pages
5. **Developer Experience**: Predictable structure and imports
6. **Performance**: Code splitting by feature and route groups