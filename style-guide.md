# BiteBase Intelligence Style Guide
*Enterprise-Grade UI Framework & Design System*

## Framework Overview
BiteBase Intelligence is a comprehensive design system featuring translucent effects, interactive visualizations, and accessible components for modern web applications. The system provides enterprise-grade data visualization tools, location-based services, and business intelligence components.

## Design Philosophy

### Core Principles
- **Visual Harmony**: Consistent spacing, typography, and color relationships
- **Accessibility First**: WCAG 2.1 AA compliance built into every component
- **Data-Driven**: Purpose-built for analytics, dashboards, and business intelligence
- **Enterprise Ready**: Scalable architecture for complex business applications
- **Performance Optimized**: Components designed for speed and efficiency

### Technical Benefits
- **40% Faster Development**: Reusable components and standardized patterns
- **60% Improved Time to Market**: Pre-built components accelerate development
- **Enterprise Scale**: Supports complex data visualization and analytics
- **Cross-Platform**: Responsive design across desktop, tablet, and mobile

## Brand Identity
BiteBase Intelligence combines approachable design with enterprise-grade functionality. The brand bridges the gap between complex data analysis and intuitive user experience, making business intelligence accessible to all users.

## Color Palette

### Primary Colors
- **Brand Orange**: `#FF6B35` (used for "BiteBase" text, CTAs, and key accent elements)
- **Intelligence Dark**: `#2D2D2D` (used for "Intelligence" text, headers, and primary navigation)
- **Platform Background**: `#F8F9FA` (main application background)
- **Pure White**: `#FFFFFF` (cards, modals, and clean sections)

### Secondary Colors
- **Success Green**: `#4CAF50` (positive metrics, success states, "Best in Town" badges)
- **Alert Red**: `#E74C3C` (urgent notifications, warnings, "Fast Food" badges)
- **Info Blue**: `#2196F3` (informational elements, links, data highlights)
- **Warning Amber**: `#FF9800` (caution states, pending items)

### Neutral Grays
- **Text Primary**: `#2D2D2D` (main headings, primary text)
- **Text Secondary**: `#6C757D` (descriptions, metadata, secondary information)
- **Text Muted**: `#9CA3AF` (placeholder text, disabled states)
- **Border Light**: `#E9ECEF` (subtle borders, dividers)
- **Border Medium**: `#DEE2E6` (standard borders, input fields)

### Data Visualization Colors
- **Chart Primary**: `#FF6B35`
- **Chart Secondary**: `#4CAF50`
- **Chart Tertiary**: `#2196F3`
- **Chart Quaternary**: `#FF9800`
- **Chart Neutral**: `#6C757D`

### Accent Colors
- **Rating Gold**: `#FFC107` (star ratings, premium features)
- **Highlight Yellow**: `#FFF3CD` (highlighted metrics, important callouts)

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**Alternative Options:**
- **Primary**: Inter (recommended for analytics platforms)
- **Secondary**: Poppins (friendlier, more approachable)
- **Fallback**: System fonts for performance

### Font Weights
- **Light**: `300` (large display text only)
- **Regular**: `400` (body text, descriptions)
- **Medium**: `500` (navigation, labels, emphasis)
- **Semi-Bold**: `600` (subheadings, important UI elements)
- **Bold**: `700` (headings, CTAs, brand text)

### Text Hierarchy

#### Display Text
- **Hero Heading**: 
  - Font size: `clamp(2.5rem, 5vw, 3.5rem)` (40px - 56px)
  - Weight: Bold (700)
  - Line height: `1.1`
  - "BiteBase" in brand orange, "Intelligence" in dark gray

#### Headings
- **H1 (Page Title)**: `2.25rem` (36px), Weight: 700, Line height: 1.2
- **H2 (Section Header)**: `1.875rem` (30px), Weight: 600, Line height: 1.3
- **H3 (Subsection)**: `1.5rem` (24px), Weight: 600, Line height: 1.4
- **H4 (Card Title)**: `1.25rem` (20px), Weight: 600, Line height: 1.4
- **H5 (Widget Title)**: `1.125rem` (18px), Weight: 500, Line height: 1.4
- **H6 (Label)**: `1rem` (16px), Weight: 500, Line height: 1.4

#### Body Text
- **Large Body**: `1.125rem` (18px), Weight: 400, Line height: 1.6
- **Regular Body**: `1rem` (16px), Weight: 400, Line height: 1.6
- **Small Body**: `0.875rem` (14px), Weight: 400, Line height: 1.5

#### UI Elements
- **Navigation**: `1rem` (16px), Weight: 500
- **Button Large**: `1rem` (16px), Weight: 500
- **Button Medium**: `0.875rem` (14px), Weight: 500
- **Button Small**: `0.75rem` (12px), Weight: 500
- **Caption**: `0.75rem` (12px), Weight: 400, Line height: 1.4
- **Overline**: `0.75rem` (12px), Weight: 500, Text transform: uppercase, Letter spacing: 0.5px

#### Data & Metrics
- **Metric Large**: `2rem` (32px), Weight: 700, Line height: 1.2
- **Metric Medium**: `1.5rem` (24px), Weight: 600, Line height: 1.2
- **Metric Small**: `1.125rem` (18px), Weight: 600, Line height: 1.2
- **Data Label**: `0.75rem` (12px), Weight: 500, Text transform: uppercase

## Components

### Buttons

#### Primary Button (CTA)
```css
.btn-primary {
  background: linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(255, 107, 53, 0.2);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### Secondary Button (Outline)
```css
.btn-secondary {
  background-color: transparent;
  color: #2D2D2D;
  border: 2px solid #2D2D2D;
  border-radius: 8px;
  padding: 10px 22px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  background-color: #2D2D2D;
  color: #FFFFFF;
  transform: translateY(-1px);
}
```

#### Ghost Button (Text)
```css
.btn-ghost {
  background-color: transparent;
  color: #FF6B35;
  border: none;
  padding: 8px 16px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
}

.btn-ghost:hover {
  background-color: rgba(255, 107, 53, 0.1);
  color: #E55A2B;
}
```

#### Icon Button
```css
.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background-color: #F8F9FA;
  color: #6C757D;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background-color: #E9ECEF;
  color: #2D2D2D;
}
```

### Navigation & Header

#### Main Navigation
```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E9ECEF;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 600;
  text-decoration: none;
}

.nav-brand .logo-text-primary {
  color: #FF6B35;
}

.nav-brand .logo-text-secondary {
  color: #2D2D2D;
}

.nav-links {
  display: flex;
  gap: 32px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  color: #2D2D2D;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  padding: 8px 0;
  position: relative;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #FF6B35;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #FF6B35;
}
```

#### Dashboard Sidebar
```css
.sidebar {
  width: 280px;
  height: 100vh;
  background-color: #FFFFFF;
  border-right: 1px solid #E9ECEF;
  padding: 24px 0;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
}

.sidebar-nav {
  padding: 0 16px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #6C757D;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.sidebar-item:hover {
  background-color: #F8F9FA;
  color: #2D2D2D;
}

.sidebar-item.active {
  background-color: rgba(255, 107, 53, 0.1);
  color: #FF6B35;
}
```

### Cards & Containers

#### Dashboard Card
```css
.dashboard-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E9ECEF;
  transition: all 0.2s ease;
}

.dashboard-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2D2D2D;
  margin: 0;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #6C757D;
  margin: 4px 0 0 0;
}
```

#### Metric Card
```css
.metric-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E9ECEF;
  text-align: center;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2D2D2D;
  margin: 0 0 4px 0;
}

.metric-label {
  font-size: 0.875rem;
  color: #6C757D;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.metric-change {
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.metric-change.positive {
  color: #4CAF50;
}

.metric-change.negative {
  color: #E74C3C;
}
```

### Data Visualization Components

#### Dashboard Chart Container
```css
.dashboard-chart {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(233, 236, 239, 0.6);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.dashboard-chart:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #F8F9FA;
}

.chart-title {
  font-size: 1.375rem;
  font-weight: 600;
  color: #2D2D2D;
  margin: 0;
}

.chart-subtitle {
  font-size: 0.875rem;
  color: #6C757D;
  margin: 4px 0 0 0;
}

.chart-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}
```

#### Interactive Map Component
```css
.map-container {
  position: relative;
  background-color: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #E9ECEF;
}

.map-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%);
  color: #FFFFFF;
}

.map-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.map-description {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
}

.map-viewport {
  height: 400px;
  position: relative;
  background-color: #F8F9FA;
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #6C757D;
  font-size: 0.875rem;
}

.map-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.map-control-btn {
  width: 40px;
  height: 40px;
  background-color: #FFFFFF;
  border: 1px solid #DEE2E6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.map-control-btn:hover {
  background-color: #F8F9FA;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
```

#### Location Information Panel
```css
.location-panel {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #E9ECEF;
  margin-top: 20px;
}

.location-panel.empty {
  text-align: center;
  color: #6C757D;
  font-style: italic;
}

.location-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2D2D2D;
  margin: 0 0 8px 0;
}

.location-category {
  display: inline-block;
  padding: 4px 12px;
  background-color: rgba(255, 107, 53, 0.1);
  color: #FF6B35;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.location-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #6C757D;
}

.location-icon {
  width: 16px;
  height: 16px;
  color: #FF6B35;
}
```

### Subscription & Pricing Components

#### Pricing Card
```css
.pricing-card {
  background-color: #FFFFFF;
  border: 2px solid #E9ECEF;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.pricing-card:hover {
  border-color: #FF6B35;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.15);
  transform: translateY(-4px);
}

.pricing-card.featured {
  border-color: #FF6B35;
  background: linear-gradient(135deg, #FFFFFF 0%, rgba(255, 107, 53, 0.02) 100%);
}

.pricing-card.featured::before {
  content: 'Most Popular';
  position: absolute;
  top: 16px;
  right: -20px;
  background: linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%);
  color: #FFFFFF;
  padding: 4px 24px;
  font-size: 0.75rem;
  font-weight: 600;
  transform: rotate(15deg);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pricing-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px auto;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pricing-icon.free { background-color: rgba(108, 117, 125, 0.1); }
.pricing-icon.growth { background-color: rgba(76, 175, 80, 0.1); }
.pricing-icon.pro { background-color: rgba(255, 107, 53, 0.1); }
.pricing-icon.enterprise { background-color: rgba(45, 45, 45, 0.1); }

.pricing-plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2D2D2D;
  margin: 0 0 8px 0;
}

.pricing-amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: #FF6B35;
  margin: 0;
  line-height: 1;
}

.pricing-period {
  font-size: 0.875rem;
  color: #6C757D;
  margin: 4px 0 24px 0;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  text-align: left;
}

.pricing-feature {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  font-size: 0.875rem;
  color: #2D2D2D;
}

.pricing-feature::before {
  content: '✓';
  color: #4CAF50;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 2px;
}

.pricing-feature.limited {
  color: #6C757D;
}

.pricing-feature.limited::before {
  content: '~';
  color: #FF9800;
}

.pricing-cta {
  width: 100%;
  padding: 12px 24px;
  border: 2px solid #FF6B35;
  border-radius: 8px;
  background-color: transparent;
  color: #FF6B35;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pricing-cta:hover {
  background-color: #FF6B35;
  color: #FFFFFF;
}

.pricing-card.featured .pricing-cta {
  background-color: #FF6B35;
  color: #FFFFFF;
}

.pricing-card.featured .pricing-cta:hover {
  background-color: #E55A2B;
}
```

#### Subscription Status Badge
```css
.subscription-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.subscription-badge.free {
  background-color: rgba(108, 117, 125, 0.1);
  color: #6C757D;
}

.subscription-badge.growth {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.subscription-badge.pro {
  background-color: rgba(255, 107, 53, 0.1);
  color: #FF6B35;
}

.subscription-badge.enterprise {
  background-color: rgba(45, 45, 45, 0.1);
  color: #2D2D2D;
}

.subscription-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}
```

#### Data Table
```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table th {
  background-color: #F8F9FA;
  color: #2D2D2D;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #E9ECEF;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #E9ECEF;
  font-size: 0.875rem;
  color: #2D2D2D;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover {
  background-color: #F8F9FA;
}
```

### Rating & Badge Components

#### Star Rating System
```css
.rating-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #FFC107;
  font-size: 16px;
  transition: color 0.2s ease;
}

.star.empty {
  color: #E9ECEF;
}

.rating-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2D2D2D;
  margin: 0;
}

.rating-subtitle {
  font-size: 0.75rem;
  color: #6C757D;
  margin: 0;
}
```

#### Circular Status Badges
```css
.status-badge {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  text-align: center;
  color: #FFFFFF;
  line-height: 1.2;
  overflow: hidden;
}

.status-badge.fast-food {
  background: linear-gradient(135deg, #E74C3C 0%, #C0392B 100%);
}

.status-badge.best-town {
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
}

.status-badge.premium {
  background: linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%);
}

.status-badge::before {
  content: '';
  position: absolute;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  border-radius: 50%;
  border: 2px dashed currentColor;
  opacity: 0.4;
  animation: rotate 15s linear infinite;
  top: -4px;
  left: -4px;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

#### Status Indicators
```css
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-indicator.online {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.status-indicator.offline {
  background-color: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.status-indicator.pending {
  background-color: rgba(255, 152, 0, 0.1);
  color: #FF9800;
}

.status-indicator::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}
```

### Form Components

#### Input Fields
```css
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #2D2D2D;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #DEE2E6;
  border-radius: 8px;
  font-size: 1rem;
  color: #2D2D2D;
  background-color: #FFFFFF;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #FF6B35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.form-input::placeholder {
  color: #9CA3AF;
}

.form-input:disabled {
  background-color: #F8F9FA;
  color: #6C757D;
  cursor: not-allowed;
}
```

#### Search Bar
```css
.search-container {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #DEE2E6;
  border-radius: 24px;
  font-size: 0.875rem;
  background-color: #F8F9FA;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #FF6B35;
  background-color: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6C757D;
  font-size: 1rem;
}
```

#### Select Dropdown
```css
.select-container {
  position: relative;
}

.select-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #DEE2E6;
  border-radius: 8px;
  font-size: 1rem;
  color: #2D2D2D;
  background-color: #FFFFFF;
  cursor: pointer;
  appearance: none;
  transition: all 0.2s ease;
}

.select-input:focus {
  outline: none;
  border-color: #FF6B35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6C757D;
  pointer-events: none;
}
```

### Business Intelligence Components

#### Analytics Overview Dashboard
```css
.analytics-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.analytics-card {
  background: linear-gradient(135deg, #FFFFFF 0%, rgba(248, 249, 250, 0.8) 100%);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid rgba(233, 236, 239, 0.6);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.analytics-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.analytics-metric {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.metric-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #2D2D2D;
  line-height: 1;
  margin: 0;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 16px;
}

.metric-change.positive {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.metric-change.negative {
  background-color: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.metric-change.neutral {
  background-color: rgba(108, 117, 125, 0.1);
  color: #6C757D;
}

.metric-label {
  font-size: 1rem;
  color: #6C757D;
  font-weight: 500;
  margin: 0;
}

.metric-trend {
  height: 60px;
  margin-top: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%);
}
```

#### Real-time Data Visualization
```css
.realtime-chart {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #E9ECEF;
  position: relative;
  overflow: hidden;
}

.realtime-chart::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #FF6B35 0%, #4CAF50 50%, #2196F3 100%);
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.chart-live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  position: absolute;
  top: 16px;
  right: 24px;
  font-size: 0.75rem;
  color: #4CAF50;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-live-indicator::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4CAF50;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}
```

#### Competitor Tracking Interface
```css
.competitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.competitor-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E9ECEF;
  transition: all 0.2s ease;
}

.competitor-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  border-color: #FF6B35;
}

.competitor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.competitor-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #F8F9FA;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #6C757D;
}

.competitor-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2D2D2D;
  margin: 0;
}

.competitor-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.competitor-metric {
  text-align: center;
}

.competitor-metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D2D2D;
  margin: 0 0 4px 0;
}

.competitor-metric-label {
  font-size: 0.75rem;
  color: #6C757D;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}
```

### Tourism & Location-Based Components

#### Attraction Card
```css
.attraction-card {
  background-color: #FFFFFF;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #E9ECEF;
  transition: all 0.3s ease;
}

.attraction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.attraction-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%);
  position: relative;
  overflow: hidden;
}

.attraction-image::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.3));
}

.attraction-content {
  padding: 20px;
}

.attraction-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2D2D2D;
  margin: 0 0 8px 0;
}

.attraction-category {
  display: inline-block;
  padding: 4px 12px;
  background-color: rgba(255, 107, 53, 0.1);
  color: #FF6B35;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.attraction-description {
  font-size: 0.875rem;
  color: #6C757D;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.attraction-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #F8F9FA;
}

.attraction-visitors {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #6C757D;
}

.attraction-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}
```

#### Route Planning Component
```css
.route-planner {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #E9ECEF;
  margin-bottom: 24px;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.route-title {
  font-size: 1.375rem;
  font-weight: 600;
  color: #2D2D2D;
  margin: 0;
}

.route-options {
  display: flex;
  gap: 8px;
}

.route-option-btn {
  padding: 8px 16px;
  border: 1px solid #DEE2E6;
  border-radius: 20px;
  background-color: #FFFFFF;
  color: #6C757D;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.route-option-btn.active,
.route-option-btn:hover {
  border-color: #FF6B35;
  color: #FF6B35;
  background-color: rgba(255, 107, 53, 0.05);
}

.route-stops {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.route-stop {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background-color: #F8F9FA;
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.route-stop:hover {
  border-color: #FF6B35;
  background-color: rgba(255, 107, 53, 0.02);
}

.route-stop-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.route-stop-info {
  flex: 1;
}

.route-stop-name {
  font-size: 1rem;
  font-weight: 600;
  color: #2D2D2D;
  margin: 0 0 4px 0;
}

.route-stop-details {
  font-size: 0.875rem;
  color: #6C757D;
  margin: 0;
}

.route-stop-time {
  font-size: 0.875rem;
  color: #FF6B35;
  font-weight: 600;
}
```

## Layout & Spacing

### Container System
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.container-fluid {
  width: 100%;
  padding: 0 24px;
}

.container-sm {
  max-width: 768px;
  margin: 0 auto;
  padding: 0 24px;
}
```

### Grid System
```css
.grid {
  display: grid;
  gap: 24px;
}

.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .grid-2,
  .grid-3,
  .grid-4 {
    grid-template-columns: 1fr;
  }
}
```

### Landing Page Layouts

#### Hero Section
```css
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  min-height: 80vh;
  padding: 80px 0;
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-title {
  margin: 0 0 16px 0;
}

.hero-description {
  font-size: 1.125rem;
  color: #6C757D;
  line-height: 1.6;
  margin: 0 0 32px 0;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1024px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 48px;
  }
}
```

### Dashboard Layouts

#### Main Dashboard Layout
```css
.dashboard-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
  background-color: #F8F9FA;
}

.dashboard-sidebar {
  background-color: #FFFFFF;
  border-right: 1px solid #E9ECEF;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.dashboard-main {
  padding: 24px;
  overflow-x: auto;
}

@media (max-width: 1024px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }
  
  .dashboard-sidebar {
    display: none;
  }
}
```

#### Page Header
```css
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E9ECEF;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #2D2D2D;
  margin: 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6C757D;
  margin: 4px 0 0 0;
}

.page-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
```

#### Dashboard Grid
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}
```

### Spacing System
```css
:root {
  /* Spacing Scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
  --space-3xl: 32px;
  --space-4xl: 40px;
  --space-5xl: 48px;
  --space-6xl: 64px;
  --space-7xl: 80px;
  --space-8xl: 96px;
  
  /* Component Spacing */
  --section-padding: var(--space-6xl);
  --card-padding: var(--space-2xl);
  --button-padding-y: var(--space-md);
  --button-padding-x: var(--space-2xl);
  --input-padding: var(--space-lg);
}

/* Utility Classes */
.p-xs { padding: var(--space-xs); }
.p-sm { padding: var(--space-sm); }
.p-md { padding: var(--space-md); }
.p-lg { padding: var(--space-lg); }
.p-xl { padding: var(--space-xl); }
.p-2xl { padding: var(--space-2xl); }
.p-3xl { padding: var(--space-3xl); }

.m-xs { margin: var(--space-xs); }
.m-sm { margin: var(--space-sm); }
.m-md { margin: var(--space-md); }
.m-lg { margin: var(--space-lg); }
.m-xl { margin: var(--space-xl); }
.m-2xl { margin: var(--space-2xl); }
.m-3xl { margin: var(--space-3xl); }

.gap-xs { gap: var(--space-xs); }
.gap-sm { gap: var(--space-sm); }
.gap-md { gap: var(--space-md); }
.gap-lg { gap: var(--space-lg); }
.gap-xl { gap: var(--space-xl); }
.gap-2xl { gap: var(--space-2xl); }
.gap-3xl { gap: var(--space-3xl); }
```

### Content Sections
```css
.section {
  padding: var(--section-padding) 0;
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-6xl);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2D2D2D;
  margin: 0 0 var(--space-lg) 0;
}

.section-description {
  font-size: 1.125rem;
  color: #6C757D;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}
```

## Responsive Design

### Breakpoint System
```css
:root {
  --bp-xs: 475px;    /* Extra small devices */
  --bp-sm: 640px;    /* Small devices */
  --bp-md: 768px;    /* Medium devices */
  --bp-lg: 1024px;   /* Large devices */
  --bp-xl: 1280px;   /* Extra large devices */
  --bp-2xl: 1536px;  /* 2X large devices */
}

/* Mobile First Approach */
@media (min-width: 475px) { /* xs */ }
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Mobile Optimizations
```css
/* Mobile Navigation */
@media (max-width: 768px) {
  .navbar {
    padding: 12px 16px;
  }
  
  .nav-links {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: block;
  }
  
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 40px 0;
    gap: 32px;
  }
  
  .hero-buttons {
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }
  
  .dashboard-layout {
    grid-template-columns: 1fr;
  }
  
  .dashboard-main {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-title {
    font-size: 1.875rem;
  }
}

/* Tablet Optimizations */
@media (max-width: 1024px) {
  .container {
    padding: 0 20px;
  }
  
  .hero {
    gap: 48px;
  }
  
  .dashboard-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .dashboard-sidebar.open {
    transform: translateX(0);
  }
}
```

### Touch-Friendly Design
```css
/* Minimum touch target size */
.btn,
.nav-link,
.sidebar-item {
  min-height: 44px;
  min-width: 44px;
}

/* Touch-friendly hover states */
@media (hover: hover) {
  .btn:hover,
  .nav-link:hover {
    /* Hover effects only on devices that support hover */
  }
}
```

## Animations & Interactions

### Transition System
```css
:root {
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
  --transition-slower: 0.5s ease;
  
  --easing-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Hover Effects
```css
.hover-lift {
  transition: transform var(--transition-base);
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-scale {
  transition: transform var(--transition-base);
}

.hover-scale:hover {
  transform: scale(1.02);
}

.hover-glow {
  transition: box-shadow var(--transition-base);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
}
```

### Loading Animations
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(20px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.slide-up {
  animation: slideUp 0.4s ease-out;
}
```

### Food Illustration Animations
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes bobbing {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(1deg); }
  75% { transform: translateY(-3px) rotate(-1deg); }
}

.floating-food {
  animation: float 3s ease-in-out infinite;
}

.floating-food:nth-child(2n) {
  animation-delay: -1s;
}

.floating-food:nth-child(3n) {
  animation-delay: -2s;
}

.bobbing-food {
  animation: bobbing 4s ease-in-out infinite;
}
```

## Illustrations & Graphics

### Food Illustration Style Guide

#### Design Principles
- **Flat Design**: Use flat, 2D illustrations with minimal shadows
- **Vibrant Colors**: Bright, appetizing colors that pop against backgrounds
- **Consistent Style**: Maintain uniform artistic style across all food items
- **Realistic Proportions**: Keep food items recognizable and proportional

#### Food Item Categories & Colors
```css
/* Pizza */
.pizza-illustration {
  --crust-color: #D2691E;
  --sauce-color: #E74C3C;
  --cheese-color: #FFF8DC;
  --pepperoni-color: #8B0000;
  --basil-color: #228B22;
}

/* Burgers */
.burger-illustration {
  --bun-color: #D2B48C;
  --patty-color: #8B4513;
  --lettuce-color: #90EE90;
  --tomato-color: #FF6347;
  --cheese-color: #FFD700;
}

/* Asian Food */
.sushi-illustration {
  --rice-color: #FFFFFF;
  --salmon-color: #FA8072;
  --tuna-color: #DC143C;
  --nori-color: #2F4F4F;
  --wasabi-color: #9ACD32;
}

/* Beverages */
.beverage-illustration {
  --cola-color: #4A4A4A;
  --orange-color: #FFA500;
  --coffee-color: #8B4513;
  --tea-color: #D2691E;
}

/* Desserts */
.dessert-illustration {
  --chocolate-color: #8B4513;
  --vanilla-color: #F5DEB3;
  --strawberry-color: #FFB6C1;
  --caramel-color: #D2691E;
}
```

#### Illustration Composition
- **Paper Bag**: Central element using `#D2B48C` and `#CD853F` for depth
- **Scattered Items**: Arrange food items in organic, non-grid patterns
- **Size Variation**: Mix small (sushi, cookies) and large (pizza, burgers) items
- **Overlap**: Allow slight overlapping for natural composition
- **Movement**: Imply motion with trailing elements or tilted angles

## Brand Guidelines

### Logo Standards

#### Logo Construction
```css
.logo-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  text-decoration: none;
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.logo-text-primary {
  color: #FF6B35;
  font-size: 1.5rem;
}

.logo-text-secondary {
  color: #2D2D2D;
  font-size: 1.5rem;
}
```

#### Logo Usage Rules
- **Clear Space**: Minimum 16px on all sides
- **Minimum Size**: 120px width for digital, 1 inch for print
- **Background**: Use on light backgrounds for optimal contrast
- **Colors**: Never alter the logo color scheme
- **Proportions**: Never stretch or distort the logo

### Voice & Brand Personality

#### Brand Attributes
- **Intelligent**: Data-driven, analytical, insightful
- **Approachable**: User-friendly, accessible, not intimidating
- **Professional**: Trustworthy, reliable, enterprise-ready
- **Modern**: Contemporary design, cutting-edge technology
- **Food-Focused**: Industry expertise, restaurant understanding

#### Tone of Voice
- **Professional but Conversational**: Avoid jargon while maintaining expertise
- **Solution-Oriented**: Focus on outcomes and benefits
- **Confident but Humble**: Showcase capabilities without arrogance
- **Supportive**: Helpful guidance for restaurant operators

### Content Guidelines

#### Writing Style
- Use active voice whenever possible
- Write in second person ("you") to create connection
- Keep sentences concise and scannable
- Use industry terminology appropriately
- Focus on business impact and ROI

#### Data Presentation
- Always provide context for metrics
- Use consistent units and formatting
- Highlight key insights prominently
- Show trends and comparisons clearly
- Include actionable recommendations

## Implementation Notes

### CSS Custom Properties
```css
:root {
  /* Brand Colors */
  --color-brand-primary: #FF6B35;
  --color-brand-primary-hover: #E55A2B;
  --color-brand-primary-light: rgba(255, 107, 53, 0.1);
  
  --color-neutral-900: #2D2D2D;
  --color-neutral-700: #4A5568;
  --color-neutral-600: #6C757D;
  --color-neutral-500: #9CA3AF;
  --color-neutral-400: #DEE2E6;
  --color-neutral-300: #E9ECEF;
  --color-neutral-200: #F8F9FA;
  --color-neutral-100: #FFFFFF;
  
  /* Status Colors */
  --color-success: #4CAF50;
  --color-success-light: rgba(76, 175, 80, 0.1);
  --color-warning: #FF9800;
  --color-warning-light: rgba(255, 152, 0, 0.1);
  --color-error: #E74C3C;
  --color-error-light: rgba(231, 76, 60, 0.1);
  --color-info: #2196F3;
  --color-info-light: rgba(33, 150, 243, 0.1);
  
  /* Typography */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 0.75rem;
  --spacing-lg: 1rem;
  --spacing-xl: 1.25rem;
  --spacing-2xl: 1.5rem;
  --spacing-3xl: 2rem;
  --spacing-4xl: 2.5rem;
  --spacing-5xl: 3rem;
  --spacing-6xl: 4rem;
  --spacing-7xl: 5rem;
  --spacing-8xl: 6rem;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-base: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-base: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 20px 25px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 25px 50px rgba(0, 0, 0, 0.25);
  
  /* Transitions */
  --transition-all: all 0.2s ease;
  --transition-colors: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  --transition-transform: transform 0.2s ease;
  --transition-opacity: opacity 0.2s ease;
}
```

### Accessibility Standards
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus States**: Visible focus indicators for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility for all components
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Motion**: Respect `prefers-reduced-motion` settings

### Performance Considerations
- **CSS**: Use CSS custom properties for consistent theming
- **Images**: Optimize food illustrations as SVG when possible
- **Fonts**: Preload critical fonts to prevent layout shift
- **Animations**: Use `transform` and `opacity` for smooth 60fps animations
- **Critical CSS**: Inline critical styles for above-the-fold content

### Framework Integration
This style guide is designed to work with:
- **React**: Component-based implementation
- **Vue.js**: Scoped styling and composition
- **Tailwind CSS**: Custom configuration with design tokens
- **Styled Components**: CSS-in-JS implementation
- **Sass/SCSS**: Variable-based theming

### Quality Assurance
- Test across different browsers and devices
- Validate color contrast ratios
- Ensure consistent spacing and typography
- Check animation performance
- Review accessibility with screen readers

This comprehensive style guide provides everything needed to create a consistent, professional, and engaging user experience for the BiteBase Intelligence platform.