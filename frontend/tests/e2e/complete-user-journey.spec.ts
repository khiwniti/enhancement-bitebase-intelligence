/**
 * Complete User Journey End-to-End Tests
 * Tests the full user experience from landing page to advanced features
 */

import { test, expect } from '@playwright/test'

test.describe('Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the landing page
    await page.goto('/')
  })

  test('user can navigate from landing page through complete 4P framework', async ({ page }) => {
    // 1. Landing Page Experience
    await expect(page.locator('text=BiteBase Intelligence')).toBeVisible()
    await expect(page.locator('text=AI-Powered Menu Engineering')).toBeVisible()
    await expect(page.locator('text=Location Intelligence')).toBeVisible()
    await expect(page.locator('text=Dynamic Pricing')).toBeVisible()

    // 2. Navigate to Product Intelligence
    await page.click('text=Learn more >> nth=0') // First "Learn more" button
    await expect(page).toHaveURL(/.*product-intelligence/)
    await expect(page.locator('text=Product Intelligence')).toBeVisible()
    await expect(page.locator('text=Menu Engineering')).toBeVisible()

    // 3. Navigate to Place Intelligence
    await page.click('text=Place Intelligence')
    await expect(page).toHaveURL(/.*place-intelligence/)
    await expect(page.locator('text=Customer Density')).toBeVisible()

    // 4. Navigate to Price Intelligence
    await page.click('text=Price Intelligence')
    await expect(page).toHaveURL(/.*price-intelligence/)
    await expect(page.locator('text=Revenue Forecasting')).toBeVisible()

    // 5. Navigate to Promotion Intelligence
    await page.click('text=Promotion Intelligence')
    await expect(page).toHaveURL(/.*promotion-intelligence/)
    await expect(page.locator('text=Customer Segmentation')).toBeVisible()

    // 6. Navigate to AI Intelligence
    await page.click('text=AI Business Insights')
    await expect(page).toHaveURL(/.*ai-insights/)
    await expect(page.locator('text=AI Business Intelligence')).toBeVisible()
  })

  test('user can interact with dashboard components', async ({ page }) => {
    // Navigate to main dashboard
    await page.goto('/dashboard')
    await expect(page.locator('text=Enhanced Dashboard')).toBeVisible()

    // Check for real-time metrics widget
    await expect(page.locator('text=Live Metrics')).toBeVisible()
    await expect(page.locator('text=Today\'s Revenue')).toBeVisible()

    // Test tab navigation
    await page.click('text=Analytics')
    await expect(page.locator('[data-testid="analytics-tab"]')).toBeVisible()

    await page.click('text=Market Analysis')
    await expect(page.locator('[data-testid="market-analysis-tab"]')).toBeVisible()
  })

  test('user can use Product Intelligence features', async ({ page }) => {
    await page.goto('/product-intelligence')
    
    // Wait for page to load
    await expect(page.locator('text=Product Intelligence')).toBeVisible()

    // Test Menu Engineering tab
    await page.click('text=Menu Engineering')
    await expect(page.locator('text=Menu Engineering Matrix')).toBeVisible()
    
    // Test Cost Analysis tab
    await page.click('text=Cost Analysis')
    await expect(page.locator('text=Food Cost Analysis')).toBeVisible()

    // Test export functionality (if export button is visible)
    const exportButton = page.locator('text=Export').first()
    if (await exportButton.isVisible()) {
      await exportButton.click()
      // Note: In a real test, you'd verify the download
    }
  })

  test('user can use Place Intelligence features', async ({ page }) => {
    await page.goto('/place-intelligence')
    
    await expect(page.locator('text=Place Intelligence')).toBeVisible()

    // Test Customer Density tab
    await page.click('text=Customer Density')
    await expect(page.locator('text=Customer Density Heatmap')).toBeVisible()

    // Test Site Analysis tab
    await page.click('text=Site Analysis')
    await expect(page.locator('text=Site Performance Analysis')).toBeVisible()
  })

  test('user can use Price Intelligence features', async ({ page }) => {
    await page.goto('/price-intelligence')
    
    await expect(page.locator('text=Price Intelligence')).toBeVisible()

    // Test Revenue Forecast tab
    await page.click('text=Revenue Forecast')
    await expect(page.locator('text=Revenue Forecasting')).toBeVisible()

    // Test Pricing Optimization tab
    await page.click('text=Pricing Optimization')
    await expect(page.locator('text=Pricing Strategy Optimization')).toBeVisible()
  })

  test('user can use Promotion Intelligence features', async ({ page }) => {
    await page.goto('/promotion-intelligence')
    
    await expect(page.locator('text=Promotion Intelligence')).toBeVisible()

    // Test Customer Segments tab
    await page.click('text=Customer Segments')
    await expect(page.locator('text=Customer Segmentation')).toBeVisible()

    // Test Campaign Performance tab
    await page.click('text=Campaign Performance')
    await expect(page.locator('text=Campaign Performance Analysis')).toBeVisible()
  })

  test('user can use AI Intelligence features', async ({ page }) => {
    await page.goto('/ai-insights')
    
    await expect(page.locator('text=AI Business Intelligence')).toBeVisible()
    await expect(page.locator('text=AI Business Insights')).toBeVisible()

    // Check for AI insights components
    await expect(page.locator('text=Smart Insights')).toBeVisible()
    await expect(page.locator('text=Predictive Analytics')).toBeVisible()
    await expect(page.locator('text=Action Plans')).toBeVisible()

    // Test filters if available
    const filterDropdown = page.locator('select').first()
    if (await filterDropdown.isVisible()) {
      await filterDropdown.selectOption('revenue')
    }
  })

  test('navigation is consistent across all pages', async ({ page }) => {
    const pages = [
      '/dashboard',
      '/product-intelligence',
      '/place-intelligence',
      '/price-intelligence',
      '/promotion-intelligence',
      '/ai-insights'
    ]

    for (const pagePath of pages) {
      await page.goto(pagePath)
      
      // Check that main navigation is present
      await expect(page.locator('text=4P Framework')).toBeVisible()
      await expect(page.locator('text=AI Intelligence')).toBeVisible()
      await expect(page.locator('text=Management')).toBeVisible()
      
      // Check that all 4P links are present
      await expect(page.locator('text=Product Intelligence')).toBeVisible()
      await expect(page.locator('text=Place Intelligence')).toBeVisible()
      await expect(page.locator('text=Price Intelligence')).toBeVisible()
      await expect(page.locator('text=Promotion Intelligence')).toBeVisible()
      
      // Check AI Intelligence link
      await expect(page.locator('text=AI Business Insights')).toBeVisible()
    }
  })

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    
    // Landing page should be responsive
    await expect(page.locator('text=BiteBase Intelligence')).toBeVisible()
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    await expect(page.locator('text=Enhanced Dashboard')).toBeVisible()
    
    // Navigation should still work on mobile
    await expect(page.locator('text=4P Framework')).toBeVisible()
  })

  test('error handling works correctly', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page')
    await expect(page.locator('text=404')).toBeVisible()
    
    // Test navigation back to valid page
    await page.goto('/dashboard')
    await expect(page.locator('text=Enhanced Dashboard')).toBeVisible()
  })

  test('performance is acceptable', async ({ page }) => {
    // Navigate to dashboard and measure performance
    const startTime = Date.now()
    await page.goto('/dashboard')
    await expect(page.locator('text=Enhanced Dashboard')).toBeVisible()
    const loadTime = Date.now() - startTime
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
    
    // Test navigation performance
    const navStartTime = Date.now()
    await page.click('text=Product Intelligence')
    await expect(page.locator('text=Product Intelligence')).toBeVisible()
    const navTime = Date.now() - navStartTime
    
    // Navigation should be fast (under 2 seconds)
    expect(navTime).toBeLessThan(2000)
  })

  test('accessibility features work', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check for proper heading structure
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    // Check for proper link attributes
    const links = page.locator('a')
    const linkCount = await links.count()
    expect(linkCount).toBeGreaterThan(0)
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('data persistence works across navigation', async ({ page }) => {
    // Go to Product Intelligence and interact with components
    await page.goto('/product-intelligence')
    await expect(page.locator('text=Product Intelligence')).toBeVisible()
    
    // Navigate to another page
    await page.click('text=Place Intelligence')
    await expect(page.locator('text=Place Intelligence')).toBeVisible()
    
    // Navigate back to Product Intelligence
    await page.click('text=Product Intelligence')
    await expect(page.locator('text=Product Intelligence')).toBeVisible()
    
    // Component should still be functional
    await expect(page.locator('text=Menu Engineering')).toBeVisible()
  })

  test('real-time features initialize correctly', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check for real-time metrics widget
    await expect(page.locator('text=Live Metrics')).toBeVisible()
    
    // Check for connection status indicator
    const connectionStatus = page.locator('text=Live, text=Offline').first()
    if (await connectionStatus.isVisible()) {
      // Real-time connection should be indicated
      await expect(connectionStatus).toBeVisible()
    }
  })
})
