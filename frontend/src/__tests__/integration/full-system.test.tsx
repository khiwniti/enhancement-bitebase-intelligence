/**
 * Full System Integration Tests
 * Verifies all components work together seamlessly
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Import all major components
import { RealtimeMetricsWidget } from '@/components/realtime/RealtimeMetricsWidget'
import { MenuEngineeringMatrix } from '@/components/product/MenuEngineeringMatrix'
import { CustomerDensityMap } from '@/components/place/CustomerDensityMap'
import { RevenueForecastDashboard } from '@/components/price/RevenueForecastDashboard'
import { CustomerSegmentationDashboard } from '@/components/promotion/CustomerSegmentationDashboard'
import { AIInsightsDashboard } from '@/components/ai/AIInsightsDashboard'
import { AdvancedRevenueChart } from '@/components/charts/AdvancedRevenueChart'
import { MapboxHeatmap } from '@/components/maps/MapboxHeatmap'

// Mock services
jest.mock('@/services/realtime/RealtimeDataService', () => ({
  realtimeDataService: {
    subscribe: jest.fn(() => 'mock-subscription-id'),
    unsubscribe: jest.fn(),
    getConnectionStatus: jest.fn(() => true),
    generateMockRealtimeData: jest.fn(() => ({
      current_revenue: 45000,
      orders_today: 120,
      active_customers: 25,
      peak_hour_indicator: true,
      trending_items: [
        { item_name: 'Burger', orders_count: 23, trend: 'up' },
        { item_name: 'Salad', orders_count: 18, trend: 'stable' }
      ]
    })),
    startMockDataStream: jest.fn(() => setInterval(() => {}, 1000))
  }
}))

jest.mock('@/services/export/ExportService', () => ({
  exportService: {
    exportMenuEngineering: jest.fn(),
    exportRevenueForecasting: jest.fn(),
    exportCustomerSegmentation: jest.fn(),
    exportDashboard: jest.fn(),
    generateReportData: jest.fn(() => ({
      title: 'Test Report',
      data: [],
      metadata: { generated_at: new Date().toISOString() }
    }))
  }
}))

jest.mock('@/services/ai/AIInsightsEngine', () => ({
  aiInsightsEngine: {
    generateInsights: jest.fn(() => Promise.resolve([
      {
        id: 'test-insight-1',
        type: 'opportunity',
        priority: 'high',
        category: 'revenue',
        title: 'Test Revenue Opportunity',
        description: 'Test description',
        impact: {
          revenue_potential: 5000,
          confidence: 85,
          timeframe: '2-4 weeks'
        },
        actions: [
          {
            action: 'Test action',
            effort: 'medium',
            expected_outcome: 'Test outcome'
          }
        ],
        data_points: ['test data'],
        created_at: new Date().toISOString()
      }
    ]))
  }
}))

describe('Full System Integration Tests', () => {
  const mockRestaurantId = 'test-restaurant-123'

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()
    
    // Mock fetch for API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          data: {
            summary: {
              total_items: 10,
              health_score: 85,
              counts: { star: 3, dog: 1, plow_horse: 4, puzzle: 2 }
            },
            classifications: [
              {
                item_id: '1',
                item_name: 'Test Burger',
                classification: 'star',
                popularity_score: 85,
                profitability_score: 90,
                recommendations: ['Promote heavily']
              }
            ]
          }
        })
      })
    ) as jest.Mock
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Real-time Components Integration', () => {
    test('RealtimeMetricsWidget initializes and displays data', async () => {
      render(<RealtimeMetricsWidget restaurantId={mockRestaurantId} />)
      
      await waitFor(() => {
        expect(screen.getByText('Live Metrics')).toBeInTheDocument()
      })
      
      // Should show connection status
      expect(screen.getByText('Live')).toBeInTheDocument()
      
      // Should display metrics
      expect(screen.getByText("Today's Revenue")).toBeInTheDocument()
      expect(screen.getByText('Orders Today')).toBeInTheDocument()
      expect(screen.getByText('Active Customers')).toBeInTheDocument()
    })
  })

  describe('4P Framework Integration', () => {
    test('Product Intelligence components work together', async () => {
      render(<MenuEngineeringMatrix restaurantId={mockRestaurantId} />)
      
      await waitFor(() => {
        expect(screen.getByText('Menu Engineering Matrix')).toBeInTheDocument()
      })
      
      // Should load and display data
      await waitFor(() => {
        expect(screen.getByText('Test Burger')).toBeInTheDocument()
      })
      
      // Export functionality should be available
      const exportButton = screen.getByText('Export')
      expect(exportButton).toBeInTheDocument()
    })

    test('Place Intelligence components integrate properly', async () => {
      const mockHeatmapData = [
        {
          coordinates: { lat: 40.7128, lng: -74.0060 },
          intensity: 75,
          customer_count: 25,
          time_period: '12:00',
          demographic_info: {
            age_group: '25-35',
            income_level: 'Medium',
            visit_frequency: 3.5
          }
        }
      ]

      render(<CustomerDensityMap restaurantId={mockRestaurantId} />)
      
      await waitFor(() => {
        expect(screen.getByText('Customer Density Heatmap')).toBeInTheDocument()
      })
      
      // Should show metrics
      expect(screen.getByText('Total Customers')).toBeInTheDocument()
      expect(screen.getByText('Avg Density')).toBeInTheDocument()
    })

    test('Price Intelligence forecasting works', async () => {
      const mockForecastData = [
        {
          period: '2024-01-01',
          predicted_revenue: 45000,
          confidence_interval: { lower: 40000, upper: 50000 },
          actual_revenue: 44000
        }
      ]

      render(<RevenueForecastDashboard restaurantId={mockRestaurantId} />)
      
      await waitFor(() => {
        expect(screen.getByText('Revenue Forecasting')).toBeInTheDocument()
      })
      
      // Should show forecast metrics
      expect(screen.getByText('Current Month')).toBeInTheDocument()
      expect(screen.getByText('Next Month Forecast')).toBeInTheDocument()
    })

    test('Promotion Intelligence segmentation functions', async () => {
      render(<CustomerSegmentationDashboard restaurantId={mockRestaurantId} />)
      
      await waitFor(() => {
        expect(screen.getByText('Customer Segmentation')).toBeInTheDocument()
      })
      
      // Should show segmentation metrics
      expect(screen.getByText('Total Customers')).toBeInTheDocument()
      expect(screen.getByText('Active Customers')).toBeInTheDocument()
    })
  })

  describe('AI Intelligence Integration', () => {
    test('AI Insights Dashboard loads and displays insights', async () => {
      render(<AIInsightsDashboard restaurantId={mockRestaurantId} />)
      
      await waitFor(() => {
        expect(screen.getByText('AI Business Insights')).toBeInTheDocument()
      })
      
      // Should show AI-generated insights
      await waitFor(() => {
        expect(screen.getByText('Test Revenue Opportunity')).toBeInTheDocument()
      })
      
      // Should have export functionality
      const exportButton = screen.getByText('Export')
      expect(exportButton).toBeInTheDocument()
    })
  })

  describe('Advanced Visualization Integration', () => {
    test('AdvancedRevenueChart renders with data', () => {
      const mockChartData = [
        {
          date: '2024-01-01',
          actual_revenue: 45000,
          predicted_revenue: 46000,
          confidence_upper: 50000,
          confidence_lower: 42000,
          orders_count: 120,
          avg_order_value: 375
        }
      ]

      render(
        <AdvancedRevenueChart
          data={mockChartData}
          title="Test Revenue Chart"
          showPredictions={true}
          showConfidenceBands={true}
        />
      )
      
      expect(screen.getByText('Test Revenue Chart')).toBeInTheDocument()
      expect(screen.getByText('Interactive revenue analysis')).toBeInTheDocument()
    })

    test('MapboxHeatmap initializes correctly', () => {
      const mockHeatmapData = [
        {
          id: 'point-1',
          lat: 40.7128,
          lng: -74.0060,
          intensity: 75,
          customer_count: 25,
          time_period: '12:00'
        }
      ]

      render(
        <MapboxHeatmap
          restaurantLocation={{ lat: 40.7128, lng: -74.0060 }}
          heatmapData={mockHeatmapData}
        />
      )
      
      expect(screen.getByText('Geographic Intelligence')).toBeInTheDocument()
      expect(screen.getByText('Real-time customer density')).toBeInTheDocument()
    })
  })

  describe('Cross-Component Data Flow', () => {
    test('Components can share restaurant ID and maintain state', async () => {
      const TestWrapper = () => (
        <div>
          <RealtimeMetricsWidget restaurantId={mockRestaurantId} />
          <MenuEngineeringMatrix restaurantId={mockRestaurantId} />
          <AIInsightsDashboard restaurantId={mockRestaurantId} />
        </div>
      )

      render(<TestWrapper />)
      
      // All components should initialize with the same restaurant ID
      await waitFor(() => {
        expect(screen.getByText('Live Metrics')).toBeInTheDocument()
        expect(screen.getByText('Menu Engineering Matrix')).toBeInTheDocument()
        expect(screen.getByText('AI Business Insights')).toBeInTheDocument()
      })
      
      // Verify API calls were made with correct restaurant ID
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(mockRestaurantId)
      )
    })
  })

  describe('Export System Integration', () => {
    test('Export functionality works across components', async () => {
      const { exportService } = require('@/services/export/ExportService')
      
      render(<MenuEngineeringMatrix restaurantId={mockRestaurantId} />)
      
      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument()
      })
      
      // Click export button
      fireEvent.click(screen.getByText('Export'))
      
      // Should call export service
      await waitFor(() => {
        expect(exportService.exportMenuEngineering).toHaveBeenCalledWith(
          expect.any(Array),
          mockRestaurantId,
          'pdf'
        )
      })
    })
  })

  describe('Error Handling Integration', () => {
    test('Components handle API failures gracefully', async () => {
      // Mock API failure
      global.fetch = jest.fn(() => Promise.reject(new Error('API Error')))

      render(<MenuEngineeringMatrix restaurantId={mockRestaurantId} />)
      
      await waitFor(() => {
        expect(screen.getByText('Menu Engineering Matrix')).toBeInTheDocument()
      })
      
      // Component should still render without crashing
      expect(screen.getByText('BCG-style classification')).toBeInTheDocument()
    })
  })

  describe('Performance Integration', () => {
    test('Multiple components render efficiently', () => {
      const startTime = performance.now()
      
      render(
        <div>
          <RealtimeMetricsWidget restaurantId={mockRestaurantId} />
          <MenuEngineeringMatrix restaurantId={mockRestaurantId} />
          <CustomerDensityMap restaurantId={mockRestaurantId} />
          <RevenueForecastDashboard restaurantId={mockRestaurantId} />
          <CustomerSegmentationDashboard restaurantId={mockRestaurantId} />
        </div>
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000)
    })
  })
})
