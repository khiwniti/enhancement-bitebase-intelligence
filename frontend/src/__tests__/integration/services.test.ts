/**
 * Services Integration Tests
 * Verifies all services work together and handle data flow correctly
 */

import { realtimeDataService } from '@/services/realtime/RealtimeDataService'
import { exportService } from '@/services/export/ExportService'
import { aiInsightsEngine } from '@/services/ai/AIInsightsEngine'

// Mock WebSocket for testing
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  constructor(url: string) {
    // Simulate connection opening
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      if (this.onopen) {
        this.onopen(new Event('open'))
      }
    }, 100)
  }

  send(data: string) {
    // Mock send functionality
    console.log('Mock WebSocket send:', data)
  }

  close() {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close'))
    }
  }
}

// Mock global WebSocket
global.WebSocket = MockWebSocket as any

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock URL.createObjectURL for export tests
global.URL.createObjectURL = jest.fn(() => 'mock-blob-url')
global.URL.revokeObjectURL = jest.fn()

// Mock document methods for export tests
Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName: string) => {
    if (tagName === 'a') {
      return {
        href: '',
        download: '',
        click: jest.fn(),
        style: {}
      }
    }
    if (tagName === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: jest.fn(() => ({
          fillStyle: '',
          fillRect: jest.fn(),
          fillText: jest.fn(),
          font: ''
        })),
        toBlob: jest.fn((callback) => {
          callback(new Blob(['mock canvas data'], { type: 'image/png' }))
        })
      }
    }
    return {
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      click: jest.fn()
    }
  })
})

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn()
})

Object.defineProperty(document.body, 'removeChild', {
  value: jest.fn()
})

describe('Services Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: { test: 'data' }
      })
    })
  })

  describe('Real-time Data Service Integration', () => {
    test('real-time service initializes and handles subscriptions', async () => {
      const mockCallback = jest.fn()
      
      // Subscribe to real-time data
      const subscriptionId = realtimeDataService.subscribe(
        'test-restaurant',
        ['revenue_update', 'order_placed'],
        mockCallback
      )
      
      expect(subscriptionId).toBeDefined()
      expect(typeof subscriptionId).toBe('string')
      
      // Generate mock data
      const mockData = realtimeDataService.generateMockRealtimeData('test-restaurant')
      
      expect(mockData).toHaveProperty('current_revenue')
      expect(mockData).toHaveProperty('orders_today')
      expect(mockData).toHaveProperty('active_customers')
      expect(mockData).toHaveProperty('trending_items')
      
      // Unsubscribe
      realtimeDataService.unsubscribe(subscriptionId)
    })

    test('real-time service handles connection status', () => {
      const connectionStatus = realtimeDataService.getConnectionStatus()
      expect(typeof connectionStatus).toBe('boolean')
    })

    test('real-time service generates consistent mock data', () => {
      const data1 = realtimeDataService.generateMockRealtimeData('restaurant-1')
      const data2 = realtimeDataService.generateMockRealtimeData('restaurant-1')
      
      // Should have same structure
      expect(Object.keys(data1)).toEqual(Object.keys(data2))
      
      // Should have reasonable values
      expect(data1.current_revenue).toBeGreaterThan(0)
      expect(data1.orders_today).toBeGreaterThan(0)
      expect(data1.active_customers).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(data1.trending_items)).toBe(true)
    })
  })

  describe('Export Service Integration', () => {
    test('export service generates report data correctly', () => {
      const mockData = [
        { item: 'Burger', sales: 100, profit: 50 },
        { item: 'Salad', sales: 80, profit: 40 }
      ]
      
      const reportData = exportService.generateReportData(
        'Test Report',
        mockData,
        'test-restaurant',
        'menu_analysis'
      )
      
      expect(reportData).toHaveProperty('title', 'Test Report')
      expect(reportData).toHaveProperty('data')
      expect(reportData).toHaveProperty('metadata')
      expect(reportData.metadata).toHaveProperty('restaurant_id', 'test-restaurant')
      expect(reportData.metadata).toHaveProperty('report_type', 'menu_analysis')
    })

    test('export service handles different formats', async () => {
      const mockData = [{ test: 'data' }]
      const reportData = exportService.generateReportData(
        'Test Report',
        mockData,
        'test-restaurant',
        'test'
      )
      
      // Test CSV export
      await expect(
        exportService.exportDashboard(reportData, { format: 'csv' })
      ).resolves.not.toThrow()
      
      // Test PDF export
      await expect(
        exportService.exportDashboard(reportData, { format: 'pdf' })
      ).resolves.not.toThrow()
      
      // Test Excel export
      await expect(
        exportService.exportDashboard(reportData, { format: 'excel' })
      ).resolves.not.toThrow()
    })

    test('export service quick methods work', async () => {
      const mockData = [
        { item_name: 'Test Item', sales: 100, profit_margin: 50 }
      ]
      
      // Test menu engineering export
      await expect(
        exportService.exportMenuEngineering(mockData, 'test-restaurant', 'csv')
      ).resolves.not.toThrow()
      
      // Test revenue forecasting export
      await expect(
        exportService.exportRevenueForecasting(mockData, 'test-restaurant', 'pdf')
      ).resolves.not.toThrow()
      
      // Test customer segmentation export
      await expect(
        exportService.exportCustomerSegmentation(mockData, 'test-restaurant', 'excel')
      ).resolves.not.toThrow()
    })
  })

  describe('AI Insights Engine Integration', () => {
    test('AI engine generates insights from business metrics', async () => {
      const mockMetrics = {
        revenue: {
          current: 125000,
          previous: 118000,
          trend: 'up' as const,
          forecast: [125000, 128000, 132000]
        },
        customers: {
          total: 2450,
          new: 380,
          returning: 2070,
          churn_rate: 12.5
        },
        menu: {
          items: [
            { name: 'Burger', sales: 450, profit_margin: 75, popularity_score: 85 },
            { name: 'Salad', sales: 320, profit_margin: 68, popularity_score: 72 }
          ],
          performance: 'good' as const
        },
        operations: {
          peak_hours: ['12:00', '13:00', '18:00', '19:00'],
          staff_efficiency: 78,
          cost_ratios: {
            food_cost: 32,
            labor_cost: 28,
            overhead: 15
          }
        }
      }
      
      const insights = await aiInsightsEngine.generateInsights(mockMetrics)
      
      expect(Array.isArray(insights)).toBe(true)
      expect(insights.length).toBeGreaterThan(0)
      
      // Check insight structure
      insights.forEach(insight => {
        expect(insight).toHaveProperty('id')
        expect(insight).toHaveProperty('type')
        expect(insight).toHaveProperty('priority')
        expect(insight).toHaveProperty('category')
        expect(insight).toHaveProperty('title')
        expect(insight).toHaveProperty('description')
        expect(insight).toHaveProperty('impact')
        expect(insight).toHaveProperty('actions')
        expect(insight).toHaveProperty('created_at')
        
        // Check impact structure
        expect(insight.impact).toHaveProperty('revenue_potential')
        expect(insight.impact).toHaveProperty('confidence')
        expect(insight.impact).toHaveProperty('timeframe')
        
        // Check actions structure
        expect(Array.isArray(insight.actions)).toBe(true)
        insight.actions.forEach(action => {
          expect(action).toHaveProperty('action')
          expect(action).toHaveProperty('effort')
          expect(action).toHaveProperty('expected_outcome')
        })
      })
    })

    test('AI engine handles scenario-specific insights', async () => {
      const mockMetrics = {
        revenue: { current: 50000, previous: 60000, trend: 'down' as const, forecast: [48000, 45000] },
        customers: { total: 1000, new: 50, returning: 950, churn_rate: 25 },
        menu: { items: [], performance: 'needs_improvement' as const },
        operations: { peak_hours: [], staff_efficiency: 60, cost_ratios: { food_cost: 40, labor_cost: 35, overhead: 20 } }
      }
      
      const insights = await aiInsightsEngine.generateScenarioInsights(
        'declining_performance',
        mockMetrics
      )
      
      expect(Array.isArray(insights)).toBe(true)
      
      // Should focus on warnings and high priority items for declining performance
      insights.forEach(insight => {
        expect(['warning', 'recommendation']).toContain(insight.type)
      })
    })
  })

  describe('Cross-Service Integration', () => {
    test('services can work together in data pipeline', async () => {
      // 1. Generate real-time data
      const realtimeData = realtimeDataService.generateMockRealtimeData('test-restaurant')
      
      // 2. Convert to business metrics for AI analysis
      const businessMetrics = {
        revenue: {
          current: realtimeData.current_revenue,
          previous: realtimeData.current_revenue * 0.9,
          trend: 'up' as const,
          forecast: [realtimeData.current_revenue * 1.1, realtimeData.current_revenue * 1.2]
        },
        customers: {
          total: realtimeData.active_customers * 50,
          new: realtimeData.active_customers * 5,
          returning: realtimeData.active_customers * 45,
          churn_rate: 10
        },
        menu: {
          items: realtimeData.trending_items.map(item => ({
            name: item.item_name,
            sales: item.orders_count * 10,
            profit_margin: 70,
            popularity_score: item.orders_count * 3
          })),
          performance: 'good' as const
        },
        operations: {
          peak_hours: ['12:00', '18:00'],
          staff_efficiency: 80,
          cost_ratios: { food_cost: 30, labor_cost: 25, overhead: 15 }
        }
      }
      
      // 3. Generate AI insights
      const insights = await aiInsightsEngine.generateInsights(businessMetrics)
      
      // 4. Export insights as report
      const reportData = exportService.generateReportData(
        'AI Insights Report',
        insights,
        'test-restaurant',
        'ai_insights'
      )
      
      // Verify the pipeline worked
      expect(realtimeData).toBeDefined()
      expect(insights.length).toBeGreaterThan(0)
      expect(reportData.title).toBe('AI Insights Report')
      expect(reportData.data).toEqual(insights)
    })

    test('services handle errors gracefully in integration', async () => {
      // Test with invalid data
      const invalidMetrics = {
        revenue: { current: -1000, previous: 0, trend: 'down' as const, forecast: [] },
        customers: { total: 0, new: 0, returning: 0, churn_rate: 100 },
        menu: { items: [], performance: 'needs_improvement' as const },
        operations: { peak_hours: [], staff_efficiency: 0, cost_ratios: { food_cost: 100, labor_cost: 0, overhead: 0 } }
      }
      
      // AI engine should handle invalid data gracefully
      const insights = await aiInsightsEngine.generateInsights(invalidMetrics)
      expect(Array.isArray(insights)).toBe(true)
      
      // Export service should handle empty insights
      const reportData = exportService.generateReportData(
        'Empty Report',
        [],
        'test-restaurant',
        'test'
      )
      expect(reportData).toBeDefined()
      expect(reportData.data).toEqual([])
    })
  })

  describe('Service Performance Integration', () => {
    test('services perform efficiently together', async () => {
      const startTime = performance.now()
      
      // Simulate typical service usage
      const realtimeData = realtimeDataService.generateMockRealtimeData('test-restaurant')
      
      const businessMetrics = {
        revenue: { current: 100000, previous: 95000, trend: 'up' as const, forecast: [105000, 110000] },
        customers: { total: 2000, new: 200, returning: 1800, churn_rate: 10 },
        menu: { items: [{ name: 'Test', sales: 100, profit_margin: 70, popularity_score: 80 }], performance: 'good' as const },
        operations: { peak_hours: ['12:00'], staff_efficiency: 80, cost_ratios: { food_cost: 30, labor_cost: 25, overhead: 15 } }
      }
      
      const insights = await aiInsightsEngine.generateInsights(businessMetrics)
      const reportData = exportService.generateReportData('Test', insights, 'test', 'test')
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      
      // Should complete within reasonable time (less than 1 second)
      expect(totalTime).toBeLessThan(1000)
      
      // Should produce valid results
      expect(realtimeData).toBeDefined()
      expect(insights.length).toBeGreaterThan(0)
      expect(reportData).toBeDefined()
    })
  })
})
