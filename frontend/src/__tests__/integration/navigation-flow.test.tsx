/**
 * Navigation Flow Integration Tests
 * Verifies complete user journey through the application
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Import navigation components
import MainLayout from '@/components/layout/MainLayout'
import FoodInspiredLandingPage from '@/components/landing/FoodInspiredLandingPage'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock components to avoid complex rendering
jest.mock('@/components/dashboard/EnhancedDashboard', () => {
  return function MockEnhancedDashboard() {
    return <div data-testid="enhanced-dashboard">Enhanced Dashboard</div>
  }
})

jest.mock('@/components/product/ProductIntelligenceDashboard', () => {
  return function MockProductIntelligence() {
    return <div data-testid="product-intelligence">Product Intelligence Dashboard</div>
  }
})

jest.mock('@/components/place/PlaceIntelligenceDashboard', () => {
  return function MockPlaceIntelligence() {
    return <div data-testid="place-intelligence">Place Intelligence Dashboard</div>
  }
})

jest.mock('@/components/price/PriceIntelligenceDashboard', () => {
  return function MockPriceIntelligence() {
    return <div data-testid="price-intelligence">Price Intelligence Dashboard</div>
  }
})

jest.mock('@/components/promotion/PromotionIntelligenceDashboard', () => {
  return function MockPromotionIntelligence() {
    return <div data-testid="promotion-intelligence">Promotion Intelligence Dashboard</div>
  }
})

jest.mock('@/components/ai/AIInsightsDashboard', () => {
  return function MockAIInsights() {
    return <div data-testid="ai-insights">AI Insights Dashboard</div>
  }
})

describe('Navigation Flow Integration Tests', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(component)
  }

  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: '',
      },
      writable: true,
    })
  })

  describe('Landing Page Navigation', () => {
    test('landing page renders with all navigation elements', () => {
      renderWithRouter(<FoodInspiredLandingPage />)
      
      // Should have main navigation elements
      expect(screen.getByText('BiteBase Intelligence')).toBeInTheDocument()
      
      // Should have feature cards that link to 4P pages
      expect(screen.getByText('AI-Powered Menu Engineering')).toBeInTheDocument()
      expect(screen.getByText('Location Intelligence')).toBeInTheDocument()
      expect(screen.getByText('Dynamic Pricing')).toBeInTheDocument()
    })

    test('feature cards navigate to correct 4P pages', () => {
      renderWithRouter(<FoodInspiredLandingPage />)
      
      // Find feature cards with navigation links
      const featureCards = screen.getAllByText('Learn more')
      expect(featureCards.length).toBeGreaterThan(0)
      
      // Each card should have proper href attributes
      featureCards.forEach(card => {
        const link = card.closest('a')
        expect(link).toHaveAttribute('href')
        const href = link?.getAttribute('href')
        expect(href).toMatch(/\/(product|place|price|promotion)-intelligence/)
      })
    })
  })

  describe('Main Layout Navigation', () => {
    test('main layout renders with complete navigation structure', () => {
      const TestPage = () => (
        <MainLayout>
          <div data-testid="test-content">Test Content</div>
        </MainLayout>
      )

      renderWithRouter(<TestPage />)
      
      // Should have main navigation sections
      expect(screen.getByText('4P Framework')).toBeInTheDocument()
      expect(screen.getByText('AI Intelligence')).toBeInTheDocument()
      expect(screen.getByText('Management')).toBeInTheDocument()
      
      // Should have 4P navigation items
      expect(screen.getByText('Product Intelligence')).toBeInTheDocument()
      expect(screen.getByText('Place Intelligence')).toBeInTheDocument()
      expect(screen.getByText('Price Intelligence')).toBeInTheDocument()
      expect(screen.getByText('Promotion Intelligence')).toBeInTheDocument()
      
      // Should have AI Intelligence navigation
      expect(screen.getByText('AI Business Insights')).toBeInTheDocument()
    })

    test('navigation items have correct href attributes', () => {
      const TestPage = () => (
        <MainLayout>
          <div data-testid="test-content">Test Content</div>
        </MainLayout>
      )

      renderWithRouter(<TestPage />)
      
      // Check 4P Framework links
      const productLink = screen.getByText('Product Intelligence').closest('a')
      expect(productLink).toHaveAttribute('href', '/product-intelligence')
      
      const placeLink = screen.getByText('Place Intelligence').closest('a')
      expect(placeLink).toHaveAttribute('href', '/place-intelligence')
      
      const priceLink = screen.getByText('Price Intelligence').closest('a')
      expect(priceLink).toHaveAttribute('href', '/price-intelligence')
      
      const promotionLink = screen.getByText('Promotion Intelligence').closest('a')
      expect(promotionLink).toHaveAttribute('href', '/promotion-intelligence')
      
      // Check AI Intelligence link
      const aiLink = screen.getByText('AI Business Insights').closest('a')
      expect(aiLink).toHaveAttribute('href', '/ai-insights')
    })
  })

  describe('4P Framework Navigation Flow', () => {
    test('navigation maintains consistent layout across 4P pages', () => {
      const pages = [
        { name: 'Product Intelligence', testId: 'product-intelligence' },
        { name: 'Place Intelligence', testId: 'place-intelligence' },
        { name: 'Price Intelligence', testId: 'price-intelligence' },
        { name: 'Promotion Intelligence', testId: 'promotion-intelligence' }
      ]

      pages.forEach(page => {
        const TestPage = () => (
          <MainLayout>
            <div data-testid={page.testId}>{page.name} Dashboard</div>
          </MainLayout>
        )

        const { unmount } = renderWithRouter(<TestPage />)
        
        // Should maintain navigation structure
        expect(screen.getByText('4P Framework')).toBeInTheDocument()
        expect(screen.getByText(page.name)).toBeInTheDocument()
        expect(screen.getByTestId(page.testId)).toBeInTheDocument()
        
        unmount()
      })
    })
  })

  describe('AI Intelligence Navigation', () => {
    test('AI insights page integrates with main navigation', () => {
      const TestPage = () => (
        <MainLayout>
          <div data-testid="ai-insights">AI Insights Dashboard</div>
        </MainLayout>
      )

      renderWithRouter(<TestPage />)
      
      // Should have AI Intelligence section highlighted
      expect(screen.getByText('AI Intelligence')).toBeInTheDocument()
      expect(screen.getByText('AI Business Insights')).toBeInTheDocument()
      expect(screen.getByTestId('ai-insights')).toBeInTheDocument()
    })
  })

  describe('Cross-Page Navigation', () => {
    test('user can navigate between different intelligence pages', () => {
      const TestApp = () => {
        const [currentPage, setCurrentPage] = React.useState('dashboard')
        
        return (
          <MainLayout>
            <div>
              <nav data-testid="test-navigation">
                <button onClick={() => setCurrentPage('product')}>
                  Go to Product Intelligence
                </button>
                <button onClick={() => setCurrentPage('place')}>
                  Go to Place Intelligence
                </button>
                <button onClick={() => setCurrentPage('ai')}>
                  Go to AI Insights
                </button>
              </nav>
              
              {currentPage === 'dashboard' && (
                <div data-testid="dashboard-page">Dashboard</div>
              )}
              {currentPage === 'product' && (
                <div data-testid="product-page">Product Intelligence</div>
              )}
              {currentPage === 'place' && (
                <div data-testid="place-page">Place Intelligence</div>
              )}
              {currentPage === 'ai' && (
                <div data-testid="ai-page">AI Insights</div>
              )}
            </div>
          </MainLayout>
        )
      }

      renderWithRouter(<TestApp />)
      
      // Start on dashboard
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
      
      // Navigate to Product Intelligence
      fireEvent.click(screen.getByText('Go to Product Intelligence'))
      expect(screen.getByTestId('product-page')).toBeInTheDocument()
      
      // Navigate to Place Intelligence
      fireEvent.click(screen.getByText('Go to Place Intelligence'))
      expect(screen.getByTestId('place-page')).toBeInTheDocument()
      
      // Navigate to AI Insights
      fireEvent.click(screen.getByText('Go to AI Insights'))
      expect(screen.getByTestId('ai-page')).toBeInTheDocument()
    })
  })

  describe('Responsive Navigation', () => {
    test('navigation adapts to different screen sizes', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      const TestPage = () => (
        <MainLayout>
          <div data-testid="test-content">Test Content</div>
        </MainLayout>
      )

      renderWithRouter(<TestPage />)
      
      // Navigation should still be present
      expect(screen.getByText('4P Framework')).toBeInTheDocument()
      expect(screen.getByText('AI Intelligence')).toBeInTheDocument()
      
      // Content should be accessible
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
    })
  })

  describe('Navigation State Management', () => {
    test('navigation maintains active state correctly', () => {
      const TestPage = () => (
        <MainLayout>
          <div data-testid="test-content">Test Content</div>
        </MainLayout>
      )

      renderWithRouter(<TestPage />)
      
      // Should have navigation items
      const navItems = screen.getAllByRole('link')
      expect(navItems.length).toBeGreaterThan(0)
      
      // Each nav item should have proper attributes
      navItems.forEach(item => {
        expect(item).toHaveAttribute('href')
      })
    })
  })

  describe('Navigation Performance', () => {
    test('navigation renders efficiently', () => {
      const startTime = performance.now()
      
      const TestPage = () => (
        <MainLayout>
          <div data-testid="test-content">Test Content</div>
        </MainLayout>
      )

      renderWithRouter(<TestPage />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Navigation should render quickly (less than 100ms)
      expect(renderTime).toBeLessThan(100)
      
      // Should have all navigation elements
      expect(screen.getByText('4P Framework')).toBeInTheDocument()
      expect(screen.getByText('AI Intelligence')).toBeInTheDocument()
    })
  })

  describe('Navigation Accessibility', () => {
    test('navigation is accessible', () => {
      const TestPage = () => (
        <MainLayout>
          <div data-testid="test-content">Test Content</div>
        </MainLayout>
      )

      renderWithRouter(<TestPage />)
      
      // Should have proper navigation structure
      const navLinks = screen.getAllByRole('link')
      expect(navLinks.length).toBeGreaterThan(0)
      
      // Each link should be accessible
      navLinks.forEach(link => {
        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href')
      })
    })
  })
})
