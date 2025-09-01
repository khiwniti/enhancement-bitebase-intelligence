// Theme Types and Interfaces
// BiteBase Intelligence 2.0 - Advanced Chart Library

// Color Palette Types
export interface ColorPalette {
  primary: string[]
  secondary: string[]
  accent: string[]
  neutral: string[]
  semantic: {
    success: string[]
    warning: string[]
    error: string[]
    info: string[]
  }
}

// Typography Configuration
export interface TypographyConfig {
  fontFamily: {
    primary: string
    secondary: string
    monospace: string
  }
  fontSize: {
    xs: number
    sm: number
    base: number
    lg: number
    xl: number
    '2xl': number
    '3xl': number
  }
  fontWeight: {
    light: number
    normal: number
    medium: number
    semibold: number
    bold: number
  }
  lineHeight: {
    tight: number
    normal: number
    relaxed: number
  }
}

// Spacing System
export interface SpacingConfig {
  padding: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  margin: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  gap: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
}

// Border and Radius Configuration
export interface BorderConfig {
  width: {
    thin: number
    normal: number
    thick: number
  }
  radius: {
    none: number
    sm: number
    md: number
    lg: number
    full: number
  }
  style: {
    solid: string
    dashed: string
    dotted: string
  }
}

// Shadow Configuration
export interface ShadowConfig {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  inner: string
  glow: string
}

// Animation Configuration
export interface AnimationConfig {
  duration: {
    fast: number
    normal: number
    slow: number
  }
  easing: {
    linear: string
    easeIn: string
    easeOut: string
    easeInOut: string
  }
  transition: {
    all: string
    colors: string
    transform: string
    opacity: string
  }
}

// Chart-Specific Theme
export interface ChartThemeConfig {
  background: {
    primary: string
    secondary: string
    transparent: string
  }
  foreground: {
    primary: string
    secondary: string
    muted: string
  }
  border: {
    primary: string
    secondary: string
    muted: string
  }
  grid: {
    primary: string
    secondary: string
    subtle: string
  }
  axis: {
    line: string
    text: string
    title: string
  }
  legend: {
    background: string
    text: string
    border: string
  }
  tooltip: {
    background: string
    text: string
    border: string
    shadow: string
  }
}

// Complete Theme Configuration
export interface ThemeConfig {
  name: string
  mode: 'light' | 'dark' | 'auto'
  colors: ColorPalette
  typography: TypographyConfig
  spacing: SpacingConfig
  borders: BorderConfig
  shadows: ShadowConfig
  animations: AnimationConfig
  charts: ChartThemeConfig
}

// Theme Variant
export interface ThemeVariant {
  name: string
  baseTheme: string
  overrides: Partial<ThemeConfig>
  description: string
}

// Theme Context
export interface ThemeContextValue {
  theme: ThemeConfig
  variant?: ThemeVariant
  setTheme: (theme: ThemeConfig) => void
  setVariant: (variant: ThemeVariant) => void
  toggleMode: () => void
  resetTheme: () => void
}

// Theme Hook Return Type
export interface UseThemeReturn {
  theme: ThemeConfig
  variant?: ThemeVariant
  mode: 'light' | 'dark' | 'auto'
  colors: ColorPalette
  typography: TypographyConfig
  spacing: SpacingConfig
  setTheme: (theme: ThemeConfig) => void
  setVariant: (variant: ThemeVariant) => void
  toggleMode: () => void
  getChartColors: (count: number) => string[]
  getCSSVariables: () => Record<string, string>
}

// Responsive Theme Configuration
export interface ResponsiveThemeConfig {
  breakpoints: {
    sm: number
    md: number
    lg: number
    xl: number
    '2xl': number
  }
  responsive: {
    typography: Partial<Record<keyof ResponsiveThemeConfig['breakpoints'], Partial<TypographyConfig>>>
    spacing: Partial<Record<keyof ResponsiveThemeConfig['breakpoints'], Partial<SpacingConfig>>>
    charts: Partial<Record<keyof ResponsiveThemeConfig['breakpoints'], Partial<ChartThemeConfig>>>
  }
}

// Theme Customization Options
export interface ThemeCustomization {
  allowUserCustomization: boolean
  customizableProperties: (keyof ThemeConfig)[]
  presets: ThemeVariant[]
  exportEnabled: boolean
  importEnabled: boolean
}

// BiteBase Specific Theme Extensions
export interface BiteBaseThemeExtensions {
  brand: {
    primary: string
    secondary: string
    accent: string
    dark: string
    darker: string
    light: string
  }
  dashboard: {
    background: string
    cardBackground: string
    headerBackground: string
    sidebarBackground: string
  }
  charts: {
    restaurant: string[]
    analytics: string[]
    location: string[]
    performance: string[]
  }
  status: {
    online: string
    offline: string
    processing: string
    error: string
    success: string
  }
}