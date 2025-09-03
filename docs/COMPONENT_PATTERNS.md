# Component Consistency Patterns

This document outlines the design system and component consistency patterns for BiteBase Intelligence features.

## Design System Principles

### 1. Visual Hierarchy
- **Primary Actions**: Gradient buttons with primary-to-secondary color scheme
- **Secondary Actions**: Outline buttons with subtle borders
- **Destructive Actions**: Red gradient buttons for delete/remove operations
- **Neutral Actions**: Ghost buttons for less important actions

### 2. Spacing System
```typescript
const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
}
```

### 3. Typography Scale
- **Headings**: 3xl (features), 2xl (sections), xl (cards), lg (items)
- **Body Text**: Base size with appropriate line-height
- **Captions**: Small size for metadata and descriptions
- **Labels**: Medium weight for form labels and UI controls

## Component Architecture

### 1. Layout Components

#### Page Layout
```typescript
// Standard page structure
<motion.div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/50">
  <div className="container mx-auto px-6 py-8 space-y-8">
    <FeatureHeader />
    <FeatureContent />
  </div>
</motion.div>
```

#### Card Structure
```typescript
// Consistent card styling
<Card className="bg-white/90 backdrop-blur-xl border border-gray-200 hover:border-primary-300 transition-all duration-300">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### 2. Interactive Components

#### Button Variants
```typescript
// Primary action
<Button variant="default" size="default">
  Primary Action
</Button>

// Secondary action
<Button variant="outline" size="default">
  Secondary Action
</Button>

// Destructive action
<Button variant="destructive" size="default">
  Delete
</Button>

// Subtle action
<Button variant="ghost" size="sm">
  Cancel
</Button>
```

#### Loading States
```typescript
// Consistent loading pattern
{isLoading ? (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
) : (
  // Content
)}
```

#### Error States
```typescript
// Consistent error handling
{error && (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="text-destructive">Error</CardTitle>
      <CardDescription>{error.message}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button onClick={retry} variant="outline" className="w-full">
        Try Again
      </Button>
    </CardContent>
  </Card>
)}
```

### 3. Animation Patterns

#### Page Transitions
```typescript
// Standard page animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
```

#### List Item Animations
```typescript
// Staggered list animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.1 * index }}
  whileHover={{ scale: 1.02, y: -5 }}
>
```

#### Micro-interactions
```typescript
// Hover effects for interactive elements
className="hover:border-primary-300 transition-all duration-300"
whileHover={{ scale: 1.02, y: -5 }}
```

## Color System

### Primary Colors
```css
--primary-50: #eff6ff
--primary-500: #3b82f6
--primary-600: #2563eb
--primary-900: #1e3a8a
```

### Secondary Colors
```css
--secondary-50: #fdf4ff
--secondary-500: #a855f7
--secondary-600: #9333ea
--secondary-900: #581c87
```

### Status Colors
```css
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

### Neutral Colors
```css
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-600: #4b5563
--gray-900: #111827
```

## Responsive Design Patterns

### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}
```

### Grid Patterns
```css
/* Responsive grid layouts */
.grid-responsive {
  grid-template-columns: repeat(1, 1fr);
}

@media (min-width: 768px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .grid-responsive {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Accessibility Standards

### 1. Keyboard Navigation
- All interactive elements must be keyboard accessible
- Clear focus indicators using `focus-visible:ring-2 focus-visible:ring-primary-500`
- Logical tab order through the interface

### 2. Screen Reader Support
- Semantic HTML elements (header, main, section, article)
- Proper ARIA labels and descriptions
- Alternative text for images and icons

### 3. Color Contrast
- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text
- Color is not the only way to convey information

### 4. Motion Preferences
```typescript
// Respect user motion preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const animation = prefersReducedMotion ? {} : { 
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}
```

## Performance Guidelines

### 1. Component Optimization
```typescript
// Memoize expensive components
const MemoizedComponent = React.memo(Component)

// Optimize re-renders with useMemo and useCallback
const memoizedValue = useMemo(() => expensiveCalculation(data), [data])
const memoizedCallback = useCallback(() => handleAction(), [dependency])
```

### 2. Image Optimization
```typescript
// Use Next.js Image component with optimization
<Image
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  priority={false}
  loading="lazy"
/>
```

### 3. Bundle Optimization
```typescript
// Dynamic imports for large components
const LazyComponent = dynamic(() => import('./LazyComponent'), {
  loading: () => <ComponentSkeleton />
})
```

## Testing Patterns

### 1. Component Testing
```typescript
// Standard test structure
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<Component />)
    expect(screen.getByRole('...')).toBeInTheDocument()
  })

  it('should handle user interactions', () => {
    const handleClick = jest.fn()
    render(<Component onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### 2. Accessibility Testing
```typescript
// Include accessibility tests
it('should be accessible', async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Implementation Checklist

When creating new components, ensure:

- [ ] Follows design system colors and spacing
- [ ] Implements consistent hover and focus states
- [ ] Includes proper loading and error states
- [ ] Uses semantic HTML elements
- [ ] Has appropriate ARIA labels
- [ ] Supports keyboard navigation
- [ ] Includes comprehensive tests
- [ ] Optimized for performance
- [ ] Responsive across breakpoints
- [ ] Follows TypeScript best practices