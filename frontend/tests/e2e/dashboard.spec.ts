/**
 * End-to-End Tests for BiteBase Intelligence Dashboard
 * Tests the complete user journey and functionality
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8000';

// Test user credentials
const TEST_USER = {
  email: 'e2e-test@example.com',
  password: 'testpassword123',
  fullName: 'E2E Test User',
  restaurantName: 'E2E Test Restaurant'
};

test.describe('BiteBase Intelligence Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(BASE_URL);
  });

  test('should display landing page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/BiteBase Intelligence/);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('BiteBase Intelligence');
    
    // Check navigation elements
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign Up' })).toBeVisible();
  });

  test('should allow user registration', async ({ page }) => {
    // Click sign up
    await page.getByRole('link', { name: 'Sign Up' }).click();
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', TEST_USER.email);
    await page.fill('[data-testid="password-input"]', TEST_USER.password);
    await page.fill('[data-testid="full-name-input"]', TEST_USER.fullName);
    await page.fill('[data-testid="restaurant-name-input"]', TEST_USER.restaurantName);
    
    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Check for success message or redirect
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
  });

  test('should allow user login', async ({ page }) => {
    // Click login
    await page.getByRole('link', { name: 'Login' }).click();
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', TEST_USER.email);
    await page.fill('[data-testid="password-input"]', TEST_USER.password);
    
    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Check for successful login
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should display dashboard with key metrics', async ({ page }) => {
    // Login first
    await loginUser(page);
    
    // Check dashboard elements
    await expect(page.locator('[data-testid="revenue-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="orders-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="customers-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="profit-card"]')).toBeVisible();
    
    // Check charts
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="orders-chart"]')).toBeVisible();
  });

  test('should navigate to Product Intelligence', async ({ page }) => {
    await loginUser(page);
    
    // Navigate to Product Intelligence
    await page.getByRole('link', { name: 'Product' }).click();
    
    // Check URL and page content
    await expect(page).toHaveURL(/\/product/);
    await expect(page.locator('h1')).toContainText('Product Intelligence');
    
    // Check menu engineering section
    await expect(page.locator('[data-testid="menu-engineering-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="cost-analysis-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="pricing-optimization-section"]')).toBeVisible();
  });

  test('should navigate to Place Intelligence', async ({ page }) => {
    await loginUser(page);
    
    // Navigate to Place Intelligence
    await page.getByRole('link', { name: 'Place' }).click();
    
    // Check URL and page content
    await expect(page).toHaveURL(/\/place/);
    await expect(page.locator('h1')).toContainText('Place Intelligence');
    
    // Check sections
    await expect(page.locator('[data-testid="customer-density-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="site-selection-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="delivery-hotspots-section"]')).toBeVisible();
  });

  test('should navigate to Price Intelligence', async ({ page }) => {
    await loginUser(page);
    
    // Navigate to Price Intelligence
    await page.getByRole('link', { name: 'Price' }).click();
    
    // Check URL and page content
    await expect(page).toHaveURL(/\/price/);
    await expect(page.locator('h1')).toContainText('Price Intelligence');
    
    // Check sections
    await expect(page.locator('[data-testid="revenue-forecast-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="spending-analysis-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="price-elasticity-section"]')).toBeVisible();
  });

  test('should navigate to Promotion Intelligence', async ({ page }) => {
    await loginUser(page);
    
    // Navigate to Promotion Intelligence
    await page.getByRole('link', { name: 'Promotion' }).click();
    
    // Check URL and page content
    await expect(page).toHaveURL(/\/promotion/);
    await expect(page.locator('h1')).toContainText('Promotion Intelligence');
    
    // Check sections
    await expect(page.locator('[data-testid="customer-segments-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="campaign-automation-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="loyalty-analytics-section"]')).toBeVisible();
  });

  test('should create and manage menu items', async ({ page }) => {
    await loginUser(page);
    
    // Navigate to Product Intelligence
    await page.getByRole('link', { name: 'Product' }).click();
    
    // Click add menu item button
    await page.getByRole('button', { name: 'Add Menu Item' }).click();
    
    // Fill menu item form
    await page.fill('[data-testid="item-name-input"]', 'Test Pizza');
    await page.fill('[data-testid="item-description-input"]', 'Delicious test pizza');
    await page.fill('[data-testid="item-price-input"]', '15.99');
    await page.selectOption('[data-testid="item-category-select"]', 'Main Course');
    await page.fill('[data-testid="item-cost-input"]', '6.50');
    
    // Submit form
    await page.getByRole('button', { name: 'Create Item' }).click();
    
    // Check for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Check item appears in list
    await expect(page.locator('[data-testid="menu-items-list"]')).toContainText('Test Pizza');
  });

  test('should display real-time analytics', async ({ page }) => {
    await loginUser(page);
    
    // Navigate to Analytics
    await page.getByRole('link', { name: 'Analytics' }).click();
    
    // Check real-time indicators
    await expect(page.locator('[data-testid="live-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-updated"]')).toBeVisible();
    
    // Check for data updates (wait for WebSocket connection)
    await page.waitForTimeout(2000);
    
    // Verify charts are loading data
    await expect(page.locator('[data-testid="real-time-chart"]')).toBeVisible();
  });

  test('should handle AI insights', async ({ page }) => {
    await loginUser(page);
    
    // Navigate to AI Insights
    await page.getByRole('link', { name: 'AI Insights' }).click();
    
    // Check AI sections
    await expect(page.locator('[data-testid="forecasting-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="anomaly-detection-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommendations-section"]')).toBeVisible();
    
    // Generate forecast
    await page.getByRole('button', { name: 'Generate Forecast' }).click();
    
    // Wait for AI processing
    await expect(page.locator('[data-testid="forecast-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="forecast-results"]')).toBeVisible({ timeout: 10000 });
  });

  test('should manage multiple locations', async ({ page }) => {
    await loginUser(page);
    
    // Navigate to Locations
    await page.getByRole('link', { name: 'Locations' }).click();
    
    // Add new location
    await page.getByRole('button', { name: 'Add Location' }).click();
    
    // Fill location form
    await page.fill('[data-testid="location-name-input"]', 'Downtown Branch');
    await page.fill('[data-testid="location-address-input"]', '123 Main St, City, State');
    await page.fill('[data-testid="location-phone-input"]', '(555) 123-4567');
    
    // Submit form
    await page.getByRole('button', { name: 'Create Location' }).click();
    
    // Check location appears in list
    await expect(page.locator('[data-testid="locations-list"]')).toContainText('Downtown Branch');
    
    // Check comparative analytics
    await expect(page.locator('[data-testid="location-comparison-chart"]')).toBeVisible();
  });

  test('should handle security features', async ({ page }) => {
    await loginUser(page);
    
    // Navigate to Settings
    await page.getByRole('button', { name: 'User Menu' }).click();
    await page.getByRole('link', { name: 'Settings' }).click();
    
    // Check security section
    await page.getByRole('tab', { name: 'Security' }).click();
    
    // Check security features
    await expect(page.locator('[data-testid="change-password-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="two-factor-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-log-section"]')).toBeVisible();
  });

  test('should export data', async ({ page }) => {
    await loginUser(page);
    
    // Navigate to Analytics
    await page.getByRole('link', { name: 'Analytics' }).click();
    
    // Click export button
    await page.getByRole('button', { name: 'Export Data' }).click();
    
    // Select export options
    await page.selectOption('[data-testid="export-format-select"]', 'csv');
    await page.selectOption('[data-testid="export-period-select"]', '30days');
    
    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download' }).click();
    
    // Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/.*\.csv$/);
  });

  test('should handle responsive design', async ({ page }) => {
    await loginUser(page);
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Open mobile menu
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check layout adapts
    await expect(page.locator('[data-testid="dashboard-grid"]')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Check full navigation is visible
    await expect(page.locator('[data-testid="desktop-navigation"]')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    await loginUser(page);
    
    // Simulate network error by intercepting API calls
    await page.route('**/api/v1/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // Navigate to a page that makes API calls
    await page.getByRole('link', { name: 'Product' }).click();
    
    // Check error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    
    // Test retry functionality
    await page.unroute('**/api/v1/**');
    await page.getByRole('button', { name: 'Retry' }).click();
    
    // Check data loads after retry
    await expect(page.locator('[data-testid="product-content"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await loginUser(page);
    
    // Open user menu
    await page.getByRole('button', { name: 'User Menu' }).click();
    
    // Click logout
    await page.getByRole('button', { name: 'Logout' }).click();
    
    // Check redirect to login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });
});

// Helper function to login user
async function loginUser(page: Page) {
  // Navigate to login page
  await page.goto(`${BASE_URL}/login`);
  
  // Fill login form
  await page.fill('[data-testid="email-input"]', TEST_USER.email);
  await page.fill('[data-testid="password-input"]', TEST_USER.password);
  
  // Submit form
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Wait for dashboard to load
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
}

// Performance tests
test.describe('Performance Tests', () => {
  
  test('should load dashboard within performance budget', async ({ page }) => {
    await loginUser(page);
    
    // Measure page load time
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Assert load time is under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await loginUser(page);
    
    // Navigate to analytics with large dataset
    await page.goto(`${BASE_URL}/analytics?period=1year`);
    
    // Measure rendering time
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="analytics-chart"]');
    const renderTime = Date.now() - startTime;
    
    // Assert rendering time is reasonable
    expect(renderTime).toBeLessThan(5000);
  });
});

// Accessibility tests
test.describe('Accessibility Tests', () => {
  
  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Navigate through main elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await loginUser(page);
    
    // Check for ARIA labels on interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      // Button should have either aria-label or text content
      expect(ariaLabel || textContent).toBeTruthy();
    }
  });
});
