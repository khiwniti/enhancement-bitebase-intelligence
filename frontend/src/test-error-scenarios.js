// Error testing scenarios for manual testing
// Run this in browser console or create a test page

// 1. Test Network Error Scenario
async function testNetworkError() {
  console.log('Testing network error...')
  try {
    const response = await fetch('https://invalid-domain-that-does-not-exist.com/api/data')
    console.log('Response:', response)
  } catch (error) {
    console.error('Network error caught:', error)
    return error
  }
}

// 2. Test API Error Scenario (404, 500, etc.)
async function testApiError() {
  console.log('Testing API error...')
  try {
    const response = await fetch('http://localhost:50513/api/nonexistent-endpoint')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  } catch (error) {
    console.error('API error caught:', error)
    return error
  }
}

// 3. Test JavaScript Runtime Error
function testJSError() {
  console.log('Testing JavaScript runtime error...')
  try {
    // This will throw a ReferenceError
    nonExistentFunction()
  } catch (error) {
    console.error('JS error caught:', error)
    return error
  }
}

// 4. Test Async Error
async function testAsyncError() {
  console.log('Testing async error...')
  try {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Simulated async operation failed'))
      }, 1000)
    })
  } catch (error) {
    console.error('Async error caught:', error)
    return error
  }
}

// 5. Test JSON Parse Error
function testJSONError() {
  console.log('Testing JSON parse error...')
  try {
    JSON.parse('{ invalid json }')
  } catch (error) {
    console.error('JSON error caught:', error)
    return error
  }
}

// 6. Test Timeout Error
async function testTimeoutError() {
  console.log('Testing timeout error...')
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 2000)
  
  try {
    const response = await fetch('https://httpbin.org/delay/5', {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    console.error('Timeout error caught:', error)
    return error
  }
}

// Run all tests
async function runAllErrorTests() {
  console.log('=== Running Error Handling Tests ===')
  
  const tests = [
    { name: 'Network Error', test: testNetworkError },
    { name: 'API Error', test: testApiError },
    { name: 'JavaScript Error', test: testJSError },
    { name: 'Async Error', test: testAsyncError },
    { name: 'JSON Parse Error', test: testJSONError },
    { name: 'Timeout Error', test: testTimeoutError }
  ]
  
  const results = []
  
  for (const { name, test } of tests) {
    console.log(`\n--- Testing ${name} ---`)
    try {
      const result = await test()
      results.push({ name, success: true, result })
    } catch (error) {
      results.push({ name, success: false, error })
    }
  }
  
  console.log('\n=== Test Results ===')
  results.forEach(({ name, success, result, error }) => {
    console.log(`${name}: ${success ? '✅ PASS' : '❌ FAIL'}`)
    if (error) console.log(`  Error: ${error.message}`)
  })
  
  return results
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testNetworkError,
    testApiError,
    testJSError,
    testAsyncError,
    testJSONError,
    testTimeoutError,
    runAllErrorTests
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('Error testing scenarios loaded. Run runAllErrorTests() to test error handling.')
}